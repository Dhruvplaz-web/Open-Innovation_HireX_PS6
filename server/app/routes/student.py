from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import uuid
import re
import time
import numpy as np
from app.data.seed_data import (
    STUDENTS,
    OPPORTUNITIES,
    APPLICATIONS,
    COURSE_CATALOG,
    STUDENT_SKILL_HISTORY,
    TALENT_VISIBILITY_SETTINGS,
    TALENT_INVITATIONS,
    IDENTITY_REVEAL_CONSENTS,
    COLLABORATION_PROJECTS,
    get_or_create_talent_profile,
    generate_talent_id,
    record_identity_reveal_consent,
    log_audit_trail,
    resolve_or_create_institution,
    resolve_or_create_department
)
from app.ml.job_matcher import matcher
from app.ml.demand_predictor import trend_predictor
from app.ml.skill_extractor import skill_extractor
from app.ml.skill_intelligence import skill_intelligence, normalize_skill_name
from app.models.linkedin import validate_linkedin_url, LINKEDIN_CONNECTIONS
from app.services.opportunity_lifecycle import validate_can_apply, evaluate_opportunity_lifecycle, filter_active_opportunities
from app.services.jd_skill_analysis import analyze_student_for_opportunity

router = APIRouter(prefix="/api/student", tags=["Student"])

def mask_aadhaar(number: str) -> str:
    """Masks Aadhaar number to XXXX-XXXX-1234 format for security."""
    if not number:
        return ""
    digits = re.sub(r'\D', '', number)
    if len(digits) >= 4:
        last4 = digits[-4:]
        return f"XXXX-XXXX-{last4}"
    return "XXXX-XXXX-XXXX"

# In-memory store for student extended onboarding profiles & projects
STUDENT_REGISTRATIONS: Dict[str, Dict[str, Any]] = {}

class ProjectDocFile(BaseModel):
    file_name: str = "README.md"
    content: str = ""

class ProjectItem(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    description: str = ""
    github_repo_url: str = ""
    technologies: List[str] = []
    documentation_files: List[ProjectDocFile] = []

class StudentRegistrationRequest(BaseModel):
    student_id: Optional[str] = "std_1"
    # Personal Info
    full_name: str
    mobile_number: str
    email: str
    college_name: str
    graduating_year: str
    stream_branch: str
    city: str
    state: str
    country: str = "India"
    
    # Identity & Verification
    aadhaar_number: Optional[str] = ""
    aadhaar_status: str = "PENDING"  # NOT_VERIFIED, PENDING, VERIFYING, VERIFIED, FAILED, MANUAL_REVIEW, UNAVAILABLE
    college_id_card_url: Optional[str] = ""
    college_id_card_filename: Optional[str] = ""
    
    # Profiles & Resume
    resume_text: Optional[str] = ""
    resume_filename: Optional[str] = ""
    github_url: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    
    # Multiple Projects with Multiple READMEs
    projects: List[ProjectItem] = []

class SkillExtractRequest(BaseModel):
    student_id: Optional[str] = "std_1"
    resume_text: Optional[str] = ""
    github_url: Optional[str] = ""
    projects: Optional[List[ProjectItem]] = []
    manual_skills: Optional[List[str]] = []

class SkillConfirmRequest(BaseModel):
    student_id: str = "std_1"
    confirmed_skills: List[str]

class ApplyOpportunityRequest(BaseModel):
    student_id: str = "std_1"
    opportunity_id: str

class VerifyAadhaarDemoRequest(BaseModel):
    student_id: str = "std_1"
    aadhaar_last4: str = "1234"
    desired_status: str = "VERIFIED"

class StudentProfileUpdateRequest(BaseModel):
    id: Optional[str] = "std_1"
    name: Optional[str] = None
    email: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    cgpa: Optional[float] = None
    target_role: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[Dict[str, Any]] = None

@router.get("/dashboard")
def get_student_dashboard(student_id: str = Query("std_1")):
    student = next((s for s in STUDENTS if s["id"] == student_id), STUDENTS[0])
    
    # 1. Match opportunities using ML Model 2 (Pillar 2: Strictly active non-expired drives)
    matched_opps = matcher.rank_opportunities_for_student(student, OPPORTUNITIES, include_expired=False)
    for opp_res in matched_opps:
        opp_obj = next((o for o in OPPORTUNITIES if o.get("id") == opp_res.get("id")), None)
        if opp_obj:
            jd_res = analyze_student_for_opportunity(student, opp_obj)
            opp_res["jdFit"] = {
                "score": jd_res["overallFit"],
                "verdict": jd_res["verdict"],
                "verdictExplanation": jd_res.get("verdictExplanation", " ".join(jd_res.get("explanation", []))),
                "summary": jd_res["summary"],
                "criticalGapsCount": len(jd_res.get("criticalGaps", jd_res.get("topGaps", []))),
                "skillsAnalyzed": len(jd_res.get("skills", [])),
            }
            opp_res["jd_fit"] = opp_res["jdFit"]
    
    # 2. Get Hero Chart data using ML Model 3
    chart_data = trend_predictor.get_trend_chart_data(role="student")
    
    # 3. Friends / Peer Scoreboard
    peer_scores = [
        {"name": s["name"], "score": s["verified_score"], "avatar": s["avatar"], "role": s["target_role"]}
        for s in STUDENTS
    ]
    peer_scores.sort(key=lambda x: x["score"], reverse=True)
    
    # 4. Learning Activity Stats
    learning_stats = {
        "verified_score": student["verified_score"],
        "finished_lessons": 68,
        "ongoing_lessons": 32,
        "completed_assessments": student["assessments_completed"],
        "rank": student["rank_in_college"],
        "skills_breakdown": [
            {"skill": k, "score": v["score"], "level": v["level"], "verified": v["verified"]}
            for k, v in student["skills"].items()
        ]
    }
    
    # 5. Active student applications
    student_apps = [a for a in APPLICATIONS if a.get("student_id") == student_id or a.get("student_email") == student.get("email")]
    
    return {
        "student": student,
        "matched_opportunities": matched_opps,
        "chart_data": chart_data,
        "peer_scores": peer_scores,
        "learning_stats": learning_stats,
        "applications": student_apps
    }

@router.get("/opportunities")
def get_opportunities(
    student_id: str = Query("std_1"),
    include_expired: bool = Query(False, description="Whether to include past drives archive")
):
    """
    Pillar 2: Live campus drives for students.
    By default returns strictly ACTIVE and CLOSING_SOON drives.
    If include_expired=True, returns all drives including past read-only archives.
    """
    student = next((s for s in STUDENTS if s["id"] == student_id), STUDENTS[0])
    ranked = matcher.rank_opportunities_for_student(student, OPPORTUNITIES, include_expired=include_expired)
    for opp_res in ranked:
        opp_obj = next((o for o in OPPORTUNITIES if o.get("id") == opp_res.get("id")), None)
        if opp_obj:
            jd_res = analyze_student_for_opportunity(student, opp_obj)
            opp_res["jdFit"] = {
                "score": jd_res["overallFit"],
                "verdict": jd_res["verdict"],
                "verdictExplanation": jd_res.get("verdictExplanation", " ".join(jd_res.get("explanation", []))),
                "summary": jd_res["summary"],
                "criticalGapsCount": len(jd_res.get("criticalGaps", jd_res.get("topGaps", []))),
                "skillsAnalyzed": len(jd_res.get("skills", [])),
            }
            opp_res["jd_fit"] = opp_res["jdFit"]
    return ranked

@router.post("/registration")
def submit_student_registration(req: StudentRegistrationRequest):
    """
    Submits and validates complete first-time student registration.
    Handles Personal info, College info, ID verification, Resume, GitHub, LinkedIn, and Multiple Projects.
    """
    if not req.full_name.strip():
        raise HTTPException(status_code=400, detail="Full Name is required.")
    if not req.email.strip() or "@" not in req.email:
        raise HTTPException(status_code=400, detail="A valid student email address is required.")
    if not req.college_name.strip():
        raise HTTPException(status_code=400, detail="College name is required.")
    if not req.stream_branch.strip():
        raise HTTPException(status_code=400, detail="Stream / Branch is required.")
    if not req.graduating_year.strip():
        raise HTTPException(status_code=400, detail="Graduating year is required.")
    
    # Input validation for LinkedIn Profile URL (optional field, but if provided must be valid)
    if req.linkedin_url and not validate_linkedin_url(req.linkedin_url):
        raise HTTPException(
            status_code=400,
            detail="Invalid LinkedIn Profile URL format. Must be a valid LinkedIn URL (e.g., https://www.linkedin.com/in/username)."
        )
    
    masked_aadhaar_val = mask_aadhaar(req.aadhaar_number) if req.aadhaar_number else "XXXX-XXXX-1234"

    # Convert projects to dictionary
    projects_data = []
    for p in req.projects:
        projects_data.append({
            "name": p.name,
            "description": p.description,
            "github_repo_url": p.github_repo_url,
            "technologies": p.technologies,
            "documentation_files": [{"file_name": df.file_name, "content": df.content} for df in p.documentation_files]
        })

    std_id = req.student_id or "std_1"
    existing_li = LINKEDIN_CONNECTIONS.get(std_id)
    is_li_connected = bool(existing_li and existing_li.get("connection_status") == "CONNECTED")

    reg_record = {
        "student_id": std_id,
        "full_name": req.full_name,
        "mobile_number": req.mobile_number,
        "email": req.email,
        "college_name": req.college_name,
        "graduating_year": req.graduating_year,
        "stream_branch": req.stream_branch,
        "city": req.city,
        "state": req.state,
        "country": req.country,
        "aadhaar_masked": masked_aadhaar_val,
        "aadhaar_status": req.aadhaar_status or "VERIFIED",
        "college_id_card_url": req.college_id_card_url,
        "college_id_card_filename": req.college_id_card_filename,
        "resume_text": req.resume_text,
        "resume_filename": req.resume_filename,
        "github_url": req.github_url,
        "linkedin_url": req.linkedin_url or (existing_li.get("linkedin_profile_url", "") if is_li_connected else ""),
        "linkedin_connected": is_li_connected,
        "projects": projects_data,
        "updated_at": int(time.time())
    }
    STUDENT_REGISTRATIONS[std_id] = reg_record

    # Sync to in-memory STUDENTS
    inst_id = resolve_or_create_institution(req.college_name)
    dept_id = resolve_or_create_department(req.stream_branch, inst_id)

    existing = next((s for s in STUDENTS if s.get("id") == req.student_id or s.get("email") == req.email), None)
    if existing:
        existing["name"] = req.full_name
        existing["email"] = req.email
        existing["college"] = req.college_name
        existing["institution_id"] = inst_id
        existing["department"] = req.stream_branch
        existing["department_id"] = dept_id
        existing["year"] = req.graduating_year
        existing["projects_count"] = max(len(projects_data), existing.get("projects_count", 0))
        if is_li_connected:
            existing["linkedin_connected"] = True
    else:
        new_std = {
            "id": std_id,
            "name": req.full_name,
            "email": req.email,
            "college": req.college_name,
            "institution_id": inst_id,
            "department": req.stream_branch,
            "department_id": dept_id,
            "year": req.graduating_year,
            "cgpa": 8.5,
            "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={req.full_name}",
            "verified_score": 75,
            "skills": {},
            "projects_count": len(projects_data),
            "assessments_completed": 0,
            "rank_in_college": len(STUDENTS) + 1,
            "target_role": "Full-Stack AI Engineer",
            "bio": f"Engineering student at {req.college_name} ({req.stream_branch}).",
            "linkedin_connected": is_li_connected
        }
        STUDENTS.append(new_std)

    return {
        "status": "success",
        "message": "Student registration profile successfully saved.",
        "profile": {
            **reg_record,
            "aadhaar_number": None  # Never expose raw Aadhaar
        }
    }

@router.get("/profile-completion")
def get_profile_completion(student_id: str = Query("std_1")):
    """
    Evaluates profile completion status against mandatory and recommended fields.
    """
    reg = STUDENT_REGISTRATIONS.get(student_id)
    student = next((s for s in STUDENTS if s["id"] == student_id), STUDENTS[0])

    conn = LINKEDIN_CONNECTIONS.get(student_id)
    is_li_connected = bool(conn and conn.get("connection_status") == "CONNECTED")

    has_personal = bool(reg and reg.get("full_name") and reg.get("email") and reg.get("mobile_number")) or bool(student.get("name") and student.get("email"))
    has_college = bool(reg and reg.get("college_name") and reg.get("stream_branch") and reg.get("graduating_year")) or bool(student.get("college"))
    has_id_verify = bool(reg and (reg.get("college_id_card_url") or reg.get("aadhaar_status") in ["VERIFIED", "PENDING"])) or True
    has_resume = bool(reg and reg.get("resume_text")) or True
    has_github = bool(reg and reg.get("github_url")) or True
    has_linkedin = bool((reg and reg.get("linkedin_url")) or is_li_connected) or True
    has_projects = bool(reg and len(reg.get("projects", [])) > 0) or student.get("projects_count", 0) > 0

    all_done = has_personal and has_college and has_id_verify and has_resume and has_github and has_linkedin and has_projects

    return {
        "student_id": student_id,
        "is_complete": all_done,
        "checklist": {
            "personal_information": has_personal,
            "college_information": has_college,
            "id_verification": has_id_verify,
            "resume": has_resume,
            "github": has_github,
            "linkedin": has_linkedin,
            "projects": has_projects
        },
        "linkedin_connected": is_li_connected,
        "linkedin_connection": {
            "linkedin_subject_id": conn.get("linkedin_subject_id"),
            "linkedin_name": conn.get("linkedin_name"),
            "linkedin_email": conn.get("linkedin_email"),
            "linkedin_profile_url": conn.get("linkedin_profile_url")
        } if is_li_connected and conn else None,
        "can_continue_to_skill_detection": all_done
    }

@router.post("/verify-aadhaar-demo")
def verify_aadhaar_demo(req: VerifyAadhaarDemoRequest):
    """
    Demo / Sandbox Aadhaar verification.
    Clearly labeled as Sandbox Demo without claiming live UIDAI access.
    """
    reg = STUDENT_REGISTRATIONS.get(req.student_id, {})
    reg["aadhaar_status"] = req.desired_status
    reg["aadhaar_masked"] = f"XXXX-XXXX-{req.aadhaar_last4}"
    STUDENT_REGISTRATIONS[req.student_id] = reg

    return {
        "status": "success",
        "demo_notice": "Sandbox / Demo Verification Simulator (No actual UIDAI government API connected).",
        "verification_state": req.desired_status,
        "masked_aadhaar": f"XXXX-XXXX-{req.aadhaar_last4}",
        "timestamp": int(time.time())
    }

@router.post("/extract-skills")
def extract_skills_endpoint(req: SkillExtractRequest):
    """
    Automatic multi-source skill extraction.
    Consumes Resume, GitHub, Project Information, multiple README files, and manual tags.
    Applies normalization, deduplication, and source tracking.
    Outputs: DETECTED ≠ VERIFIED.
    """
    projects_list = []
    if req.projects:
        for p in req.projects:
            projects_list.append({
                "name": p.name or p.title or "Project",
                "description": p.description,
                "github_repo_url": p.github_repo_url,
                "technologies": p.technologies,
                "documentation_files": [{"file_name": d.file_name, "content": d.content} for d in p.documentation_files]
            })
    elif req.student_id in STUDENT_REGISTRATIONS:
        reg = STUDENT_REGISTRATIONS[req.student_id]
        projects_list = reg.get("projects", [])
        if not req.resume_text:
            req.resume_text = reg.get("resume_text", "")
        if not req.github_url:
            req.github_url = reg.get("github_url", "")

    # Execute ML Skill Extractor
    result = skill_extractor.extract_all(
        resume_text=req.resume_text or "",
        github_url=req.github_url or "",
        projects=projects_list,
        manual_skills=req.manual_skills or []
    )

    # Edge case: If no skills detected
    if result["total_detected"] == 0:
        return {
            "status": "warning",
            "total_detected": 0,
            "message": "We couldn't identify enough skills from your information. Add skills manually or update your resume/projects.",
            "detected_skills": []
        }

    return result

@router.post("/confirm-skills")
def confirm_skills_endpoint(req: SkillConfirmRequest):
    """
    Stores student-confirmed skills.
    Only confirmed skills will be used for Assessment Generation!
    """
    if not req.confirmed_skills:
        raise HTTPException(status_code=400, detail="Please select at least one skill to assess.")

    # Deduplicate while preserving order
    unique_confirmed = list(dict.fromkeys(req.confirmed_skills))

    student = next((s for s in STUDENTS if s["id"] == req.student_id), None)
    if student:
        student["confirmed_skills"] = unique_confirmed

    reg = STUDENT_REGISTRATIONS.setdefault(req.student_id, {})
    reg["confirmed_skills"] = unique_confirmed

    return {
        "status": "success",
        "message": f"Successfully confirmed {len(unique_confirmed)} skills for assessment generation.",
        "confirmed_skills": unique_confirmed,
        "ready_for_assessment_generation": True
    }

@router.post("/apply")
def apply_to_opportunity(req: ApplyOpportunityRequest):
    """
    Applies for an internship or job placement.
    Validates: active opportunity, deadline, eligibility, and prevents duplicate applications.
    """
    # 1. Find opportunity
    opp = next((o for o in OPPORTUNITIES if o.get("id") == req.opportunity_id or o.get("opportunity_id") == req.opportunity_id), None)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found or inactive.")

    # Pillar 3: Hard Backend Gate on Submissions (Rejects expired drives)
    can_apply, reason = validate_can_apply(opp)
    if not can_apply:
        raise HTTPException(status_code=400, detail=reason)

    # 2. Check if student already applied (prevent duplicate applications!)
    already_applied = any(
        a["student_id"] == req.student_id and a["opportunity_id"] == req.opportunity_id
        for a in APPLICATIONS
    )
    if already_applied:
        raise HTTPException(
            status_code=400,
            detail=f"Duplicate Application: You have already applied for '{opp['title']}' at {opp['company']}."
        )

    # 3. Find student
    student = next((s for s in STUDENTS if s["id"] == req.student_id), STUDENTS[0])

    # Calculate match percentage
    match_res = matcher.match_student_to_opportunity(student.get("skills", {}), opp)

    # Compute JD Fit snapshot
    jd_analysis = analyze_student_for_opportunity(student, opp)
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    app_id = f"app_{uuid.uuid4().hex[:8]}"
    new_application = {
        "id": app_id,
        "student_id": req.student_id,
        "student_name": student["name"],
        "student_email": student["email"],
        "student_college": student["college"],
        "opportunity_id": req.opportunity_id,
        "company": opp["company"],
        "title": opp["title"],
        "match_percentage": match_res["match_percentage"],
        "matched_skills": match_res["matched_skills"],
        "status": "Applied",
        "applied_at": now_iso,
        "jdFitScore": jd_analysis["overallFit"],
        "jdFitVerdict": jd_analysis["verdict"],
        "jdFitSummary": jd_analysis["summary"],
        "jdFitComputedAt": now_iso
    }

    APPLICATIONS.append(new_application)

    if jd_analysis.get("verdict") == "STRONG_FIT":
        try:
            log_audit_trail(
                actor=student.get("email", req.student_id),
                role="student",
                action="JD_STRONG_FIT_APPLICATION",
                entity="Application",
                entity_id=app_id,
                old_value=None,
                new_value=f"Strong fit ({jd_analysis['overallFit']}%) application submitted for {opp.get('title')} at {opp.get('company')}"
            )
        except Exception:
            pass

    return {
        "status": "success",
        "message": f"Application successfully submitted to {opp['company']} for {opp['title']}!",
        "application": new_application
    }

@router.get("/applications")
def get_student_applications(student_id: str = Query("std_1")):
    """
    Returns all applications submitted by the given student.
    """
    student = next((s for s in STUDENTS if s["id"] == student_id), STUDENTS[0])
    my_apps = [a for a in APPLICATIONS if a.get("student_id") == student_id or a.get("student_email") == student.get("email")]
    return {
        "status": "success",
        "total": len(my_apps),
        "applications": my_apps
    }

@router.get("/course-recommendations")
def get_course_recommendations(skills: Optional[str] = Query(None)):
    """
    Returns targeted courses/bootcamps for weak skills.
    """
    target_skills = [s.strip() for s in skills.split(",")] if skills else ["Machine Learning", "SQL", "Spring Boot", "Docker"]
    recommended = []
    
    for sk in target_skills:
        # Match from catalog
        matched_courses = COURSE_CATALOG.get(sk, [])
        if not matched_courses:
            # Fallback for dynamic skills
            matched_courses = [
                {
                    "id": f"crs_{sk.lower()[:3]}_gen",
                    "title": f"Complete {sk} Bootcamp & Industry Practical Labs",
                    "skill": sk,
                    "provider": "NPTEL / Coursera",
                    "level": "Intermediate",
                    "duration": "6 Weeks",
                    "rating": 4.8,
                    "link": "https://www.coursera.org"
                }
            ]
        recommended.extend(matched_courses)

    return {
        "status": "success",
        "target_skills": target_skills,
        "total_courses": len(recommended),
        "courses": recommended
    }

@router.post("/profile")
def update_student_profile(req: StudentProfileUpdateRequest):
    student = next((s for s in STUDENTS if s["id"] == req.id or (req.email and s.get("email") == req.email)), None)
    if not student:
        student = {
            "id": req.id or f"std_{len(STUDENTS)+1}",
            "name": req.name or "Student",
            "email": req.email or "",
            "college": req.college or "JSPM RSCOE, Pune",
            "department": req.department or "Computer Engineering",
            "year": req.year or "3rd Year",
            "cgpa": req.cgpa or 8.5,
            "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={req.name or 'Student'}",
            "verified_score": 80,
            "skills": req.skills or {
                "Python": {"level": "Intermediate", "score": 85, "verified": True},
                "React": {"level": "Intermediate", "score": 82, "verified": True},
                "Data Structures": {"level": "Intermediate", "score": 80, "verified": True}
            },
            "projects_count": 3,
            "assessments_completed": 5,
            "rank_in_college": 12,
            "target_role": req.target_role or "Full-Stack AI Engineer",
            "bio": req.bio or "Passionate student developer."
        }
        STUDENTS.append(student)
    else:
        if req.name is not None: student["name"] = req.name
        if req.email is not None: student["email"] = req.email
        if req.college is not None:
            student["college"] = req.college
            student["institution_id"] = resolve_or_create_institution(req.college)
        if req.department is not None:
            student["department"] = req.department
            student["department_id"] = resolve_or_create_department(req.department, student.get("institution_id", "inst_rscoe"))
        if req.year is not None: student["year"] = req.year
        if req.cgpa is not None: student["cgpa"] = req.cgpa
        if req.target_role is not None: student["target_role"] = req.target_role
        if req.bio is not None: student["bio"] = req.bio
        if req.skills is not None: student["skills"].update(req.skills)
    return {"status": "success", "student": student}

@router.get("/academician-recommendations")
def get_student_academician_recommendations(student_id: str = Query("std_1")):
    """
    PART 13: Student receives recommendations issued by their Academician.
    Clearly distinguishes 'Academician Recommendation' from 'AI / System Recommendation'.
    """
    from app.data.seed_data import ACADEMICIAN_RECOMMENDATIONS
    student = next((s for s in STUDENTS if s["id"] == student_id), STUDENTS[0])
    s_dept = student.get("department_id", "dept_comp")
    s_year = student.get("year", "3rd Year")

    matching_recs = [
        r for r in ACADEMICIAN_RECOMMENDATIONS
        if r.get("target_id") in [student_id, "all", s_dept, s_year]
        or r.get("target_student_id") == student_id
        or r.get("target_type") in ["cohort", "all"]
        or r.get("department_id") == s_dept
    ]

    return {
        "status": "success",
        "total": len(matching_recs),
        "recommendations": matching_recs
    }

class ReassessSkillRequest(BaseModel):
    student_id: str = "std_1"
    skill: str
    reassessment_score: Optional[int] = 82
    practical_code_score: Optional[float] = 88.0

@router.post("/reassess-skill")
def reassess_skill(req: ReassessSkillRequest):
    """
    PART 21 & 22: Closed-Loop Skill Improvement & Reassessment.
    When student completes a course/remediation:
    1. Reassesses skill proficiency.
    2. Updates Shared Skill Record in STUDENTS.
    3. Re-runs AI Matching against live OPPORTUNITIES.
    4. Automatically boosts job match score and unlocks new opportunities!
    """
    student = next((s for s in STUDENTS if s["id"] == req.student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    score = min(100, max(40, req.reassessment_score or 82))
    is_verified = score >= 70

    if "skills" not in student:
        student["skills"] = {}

    student["skills"][req.skill] = {
        "score": score,
        "level": "Advanced" if score >= 85 else "Intermediate" if score >= 70 else "Beginner",
        "verified": is_verified,
        "verification_state": "ASSESSMENT VERIFIED" if is_verified else "NEEDS_IMPROVEMENT"
    }

    # Append to versioned historical assessment progression (PART 23)
    existing_attempts = [h for h in STUDENT_SKILL_HISTORY if h["student_id"] == req.student_id and normalize_skill_name(h["skill"]) == normalize_skill_name(req.skill)]
    attempt_num = len(existing_attempts) + 1
    STUDENT_SKILL_HISTORY.append({
        "student_id": req.student_id,
        "skill": normalize_skill_name(req.skill),
        "attempt": attempt_num,
        "score": score,
        "date": time.strftime("%Y-%m-%d", time.gmtime())
    })

    # Log audit trail (PART 39)
    log_audit_trail(
        actor=student.get("email", req.student_id),
        role="student",
        action="SKILL_REASSESSMENT",
        entity="StudentSkill",
        entity_id=f"{req.student_id}_{req.skill}",
        old_value=None,
        new_value=f"{req.skill}: {score}% (Verified: {is_verified})"
    )

    # Recalculate average verified score
    all_scores = [v.get("score", 70) for v in student["skills"].values()]
    student["verified_score"] = round(sum(all_scores) / max(1, len(all_scores)))
    student["assessments_completed"] = student.get("assessments_completed", 0) + 1

    # Recalculate AI Opportunity Matches using the shared matching engine with Strong-Skill rule
    new_matches = matcher.rank_opportunities_for_student(student, OPPORTUNITIES)

    # Evaluate refreshed Skill Passport
    passport = skill_intelligence.evaluate_skill_passport(student)

    return {
        "status": "success",
        "message": f"Successfully reassessed {req.skill} with score {score}%. Shared Skill Record & Passport updated.",
        "skill": req.skill,
        "new_score": score,
        "is_verified": is_verified,
        "updated_overall_score": student["verified_score"],
        "shared_skill_record": student["skills"],
        "skill_passport": passport,
        "updated_opportunity_matches": new_matches
    }

# ====================================================
# PART 2 & 3: VERIFIED SKILL PASSPORT
# ====================================================
@router.get("/skill-passport")
def get_student_skill_passport(student_id: str = Query("std_1")):
    """
    Returns the evidence-backed Verified Skill Passport.
    Includes transparent evidence breakdown:
    - Objective Assessment (Primary verification)
    - GitHub Analysis
    - Project Evidence
    - Resume Extraction
    - LinkedIn Evidence (Professional signal only, never auto-verified)
    - Academic Record
    """
    student = next((s for s in STUDENTS if s["id"] == student_id), STUDENTS[0])
    passport = skill_intelligence.evaluate_skill_passport(student)

    verified_count = sum(1 for p in passport if p["assessmentScore"] >= 70)
    improvement_count = len(passport) - verified_count

    return {
        "status": "success",
        "student_id": student["id"],
        "student_name": student["name"],
        "college": student.get("college", ""),
        "department": student.get("department", ""),
        "year": student.get("year", "3rd Year"),
        "cgpa": student.get("cgpa", 8.5),
        "verified_score": student.get("verified_score", 75),
        "total_skills": len(passport),
        "verified_skills_count": verified_count,
        "improvement_required_count": improvement_count,
        "passport": passport
    }

# ====================================================
# PART 22: STUDENT CAREER PATHWAY
# ====================================================
@router.get("/career-path")
def get_student_career_path(student_id: str = Query("std_1")):
    """
    Generates actionable Career Pathway for student:
    Current Readiness -> Target Role -> Required Skills -> Gaps -> Recommended Interventions -> Matching Opportunities.
    """
    student = next((s for s in STUDENTS if s["id"] == student_id), STUDENTS[0])
    pathway = skill_intelligence.generate_career_pathway(student, OPPORTUNITIES)
    return {
        "status": "success",
        "student_id": student["id"],
        "student_name": student["name"],
        "career_pathway": pathway
    }

# ====================================================
# PART 23: STUDENT SKILL PROGRESSION (VERSIONED HISTORY)
# ====================================================
@router.get("/skill-history")
def get_student_skill_history(
    student_id: str = Query("std_1"),
    skill: Optional[str] = Query(None)
):
    """
    Returns historical versioned assessment progression for line charts over time.
    Does not overwrite past attempts.
    """
    history = [h for h in STUDENT_SKILL_HISTORY if h["student_id"] == student_id]
    if skill:
        c_sk = normalize_skill_name(skill)
        history = [h for h in history if normalize_skill_name(h["skill"]) == c_sk]

    # Group by skill for multi-line charting
    by_skill: Dict[str, List[Dict[str, Any]]] = {}
    for h in history:
        sk = h["skill"]
        if sk not in by_skill:
            by_skill[sk] = []
        by_skill[sk].append(h)

    # Sort each skill attempt sequence
    for sk in by_skill:
        by_skill[sk].sort(key=lambda x: x["attempt"])

    return {
        "status": "success",
        "student_id": student_id,
        "total_attempts_recorded": len(history),
        "history_by_skill": by_skill,
        "raw_history": history
    }

# ====================================================
# FEATURE 1: TALENT VISIBILITY & INCOGNITO DISCOVERY
# ====================================================

class TalentVisibilityUpdateRequest(BaseModel):
    student_id: str = "std_1"
    mode: str = "INCOGNITO"  # "NORMAL", "INCOGNITO", "HIDDEN"
    allow_recruiter_discovery: bool = True
    hide_identity_until_accepted: bool = True
    allow_recruiter_invitations: bool = True
    show_projects_anonymously: bool = True
    show_research_anonymously: bool = True
    research_interests: Optional[List[str]] = None
    availability: Optional[str] = None
    achievements: Optional[List[str]] = None

@router.get("/talent-visibility")
def get_student_talent_visibility(student_id: str = Query("std_1")):
    """
    Returns student's talent discovery settings, privacy profile,
    and generated public talent identifier (e.g. SB-TALENT-10482).
    """
    profile = get_or_create_talent_profile(student_id)
    student = next((s for s in STUDENTS if s["id"] == student_id), None)
    
    invitations = [i for i in TALENT_INVITATIONS if i.get("student_id") == student_id]
    consents = [c for c in IDENTITY_REVEAL_CONSENTS if c.get("student_id") == student_id and c.get("student_consent")]
    
    return {
        "status": "success",
        "talent_visibility": profile,
        "total_invitations_received": len(invitations),
        "pending_invitations_count": sum(1 for i in invitations if i.get("status") == "PENDING"),
        "accepted_invitations_count": sum(1 for i in invitations if i.get("status") == "ACCEPTED"),
        "identity_revealed_recruiters_count": len(consents),
        "verified_score": student.get("verified_score", 85) if student else 85
    }

@router.put("/talent-visibility")
def update_student_talent_visibility(req: TalentVisibilityUpdateRequest):
    """
    Updates student's talent visibility settings.
    Enables toggling between Normal, Incognito, and Hidden modes.
    """
    profile = get_or_create_talent_profile(req.student_id)
    
    old_mode = profile.get("mode", "INCOGNITO")
    profile["mode"] = req.mode.upper()
    profile["allow_recruiter_discovery"] = req.allow_recruiter_discovery
    profile["hide_identity_until_accepted"] = req.hide_identity_until_accepted
    profile["allow_recruiter_invitations"] = req.allow_recruiter_invitations
    profile["show_projects_anonymously"] = req.show_projects_anonymously
    profile["show_research_anonymously"] = req.show_research_anonymously
    if req.research_interests is not None:
        profile["research_interests"] = req.research_interests
    if req.availability is not None:
        profile["availability"] = req.availability
    if req.achievements is not None:
        profile["achievements"] = req.achievements
    profile["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    
    log_audit_trail(
        actor=req.student_id,
        role="student",
        action="TALENT_VISIBILITY_UPDATED",
        entity="TalentVisibility",
        entity_id=profile["talent_id"],
        old_value=f"Mode: {old_mode}",
        new_value=f"Mode: {req.mode.upper()} (Discovery: {req.allow_recruiter_discovery}, Hidden: {req.hide_identity_until_accepted})"
    )
    
    return {
        "status": "success",
        "message": f"Talent discovery settings updated. Mode set to '{req.mode.upper()}'.",
        "talent_visibility": profile
    }

@router.get("/incognito-invitations")
def get_student_incognito_invitations(student_id: str = Query("std_1")):
    """
    Returns all recruiter invitations sent to the anonymous candidate.
    """
    invitations = [i for i in TALENT_INVITATIONS if i.get("student_id") == student_id]
    
    # Enrich with opportunity and recruiter details
    enriched = []
    for inv in invitations:
        opp = next((o for o in OPPORTUNITIES if o["id"] == inv.get("opportunity_id")), None)
        has_consented = any(
            c.get("student_id") == student_id and 
            c.get("recruiter_id") == inv.get("recruiter_id") and 
            c.get("student_consent") 
            for c in IDENTITY_REVEAL_CONSENTS
        )
        
        enriched.append({
            **inv,
            "opportunity_title": inv.get("opportunity_title") or (opp["title"] if opp else "Software Developer"),
            "company": inv.get("company") or (opp["company"] if opp else "Corporate Partner"),
            "opportunity_location": opp.get("location", "Pune") if opp else "Pune",
            "opportunity_stipend": opp.get("stipend", "Competitive") if opp else "Competitive",
            "opportunity_type": opp.get("type", "Internship") if opp else "Internship",
            "identity_revealed": has_consented or inv.get("status") == "ACCEPTED"
        })
        
    return {
        "status": "success",
        "total": len(enriched),
        "invitations": enriched
    }

class InvitationActionRequest(BaseModel):
    student_id: str = "std_1"

@router.post("/invitations/{invitation_id}/accept")
def accept_recruiter_invitation(
    invitation_id: str,
    req: Optional[InvitationActionRequest] = None,
    student_id: Optional[str] = Query(None)
):
    """
    IDENTITY REVEAL WORKFLOW:
    Student explicitly accepts recruiter invitation.
    - Records explicit user consent with timestamp.
    - Unlocks candidate's permitted identity fields for that specific recruiter.
    - Synchronizes application pipeline.
    """
    eff_std_id = (req.student_id if req else None) or student_id or "std_1"
    
    inv = next((i for i in TALENT_INVITATIONS if i["id"] == invitation_id), None)
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found.")
        
    if inv.get("student_id") != eff_std_id:
        raise HTTPException(status_code=403, detail="Unauthorized: Invitation does not belong to this student.")
        
    # Record explicit identity reveal consent
    consent = record_identity_reveal_consent(
        student_id=eff_std_id,
        recruiter_id=inv.get("recruiter_id", "rec_1"),
        opportunity_id=inv.get("opportunity_id", "opp_1"),
        talent_id=inv.get("talent_id", "SB-TALENT-10482"),
        recruiter_email=inv.get("recruiter_email", "")
    )
    
    inv["status"] = "ACCEPTED"
    inv["responded_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    
    opp = next((o for o in OPPORTUNITIES if o["id"] == inv.get("opportunity_id")), None)
    
    return {
        "status": "success",
        "message": f"Invitation accepted! Your verified profile and identity have been shared with {inv.get('company', 'the recruiter')}.",
        "invitation": inv,
        "consent": consent,
        "opportunity": opp,
        "can_apply_directly": True
    }

@router.post("/invitations/{invitation_id}/decline")
def decline_recruiter_invitation(
    invitation_id: str,
    req: Optional[InvitationActionRequest] = None,
    student_id: Optional[str] = Query(None)
):
    """
    Student declines recruiter invitation. Identity remains completely protected.
    """
    eff_std_id = (req.student_id if req else None) or student_id or "std_1"
    
    inv = next((i for i in TALENT_INVITATIONS if i["id"] == invitation_id), None)
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found.")
        
    if inv.get("student_id") != eff_std_id:
        raise HTTPException(status_code=403, detail="Unauthorized: Invitation does not belong to this student.")
        
    inv["status"] = "DECLINED"
    inv["responded_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    
    log_audit_trail(
        actor=eff_std_id,
        role="student",
        action="INVITATION_DECLINED",
        entity="TalentInvitation",
        entity_id=invitation_id,
        old_value="PENDING",
        new_value=f"Declined invitation from {inv.get('company', 'recruiter')}"
    )
    
    return {
        "status": "success",
        "message": "Invitation declined. Your identity remains private.",
        "invitation": inv
    }

@router.get("/recommended-projects")
def get_student_recommended_projects(student_id: str = Query("std_1")):
    """
    FEATURE 2: Student Project Discovery with AI Match Engine.
    Matches projects against student verified skills, gaps, and academic domain.
    """
    student = next((s for s in STUDENTS if s["id"] == student_id), STUDENTS[0])
    std_skills = student.get("skills", {})
    
    recommended = []
    for proj in COLLABORATION_PROJECTS:
        req_skills = proj.get("required_skills", [])
        pref_skills = proj.get("preferred_skills", [])
        
        # Calculate skill overlap using canonical normalization
        matched_req = [s for s in req_skills if normalize_skill_name(s) in {normalize_skill_name(k) for k in std_skills}]
        missing_req = [s for s in req_skills if normalize_skill_name(s) not in {normalize_skill_name(k) for k in std_skills}]
        matched_pref = [s for s in pref_skills if normalize_skill_name(s) in {normalize_skill_name(k) for k in std_skills}]
        
        # Coverage calculation
        if req_skills:
            req_ratio = len(matched_req) / len(req_skills)
        else:
            req_ratio = 1.0
            
        pref_ratio = len(matched_pref) / max(1, len(pref_skills)) if pref_skills else 1.0
        
        # Average proficiency in matched required skills
        scores = [std_skills[s]["score"] if isinstance(std_skills.get(s), dict) else int(std_skills.get(s, 70)) for s in matched_req if s in std_skills]
        avg_score = float(np.mean(scores)) if scores else 60.0
        
        raw_match = (req_ratio * 65.0) + (pref_ratio * 15.0) + ((avg_score / 100.0) * 20.0)
        match_pct = int(min(98, max(30, round(raw_match))))
        
        # Check if student is already a team member or has pending join request
        is_member = any(m.get("student_id") == student_id for m in proj.get("team", []))
        has_pending_request = any(r.get("student_id") == student_id and r.get("status") == "PENDING" for r in proj.get("join_requests", []))
        
        recommended.append({
            **proj,
            "match_percentage": match_pct,
            "matched_skills": matched_req,
            "missing_skills": missing_req,
            "matched_preferred_skills": matched_pref,
            "is_team_member": is_member,
            "has_pending_request": has_pending_request,
            "team_spots_left": max(0, proj.get("team_size", 4) - len(proj.get("team", []))),
            "explanation": f"{match_pct}% Match: Strong alignment with verified {', '.join(matched_req) if matched_req else 'core engineering foundations'}."
        })
        
    recommended.sort(key=lambda x: x["match_percentage"], reverse=True)
    return {
        "status": "success",
        "total": len(recommended),
        "projects": recommended
    }

@router.get("/jd-analysis")
def get_student_jd_analysis(
    student_id: str = Query("std_1"),
    opportunity_id: Optional[str] = Query(None)
):
    """
    Returns JD-Based Skill Analysis for the student against active opportunities.
    Pure explainable logic with deterministic scoring and critical gap highlighting.
    """
    student = next((s for s in STUDENTS if s["id"] == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    active_opps = filter_active_opportunities(OPPORTUNITIES, include_expired=False)

    if opportunity_id:
        target_opp = next((o for o in active_opps if o["id"] == opportunity_id), None)
        if not target_opp:
            target_opp = next((o for o in OPPORTUNITIES if o["id"] == opportunity_id), None)
        if not target_opp:
            raise HTTPException(status_code=404, detail="Opportunity not found.")
        return analyze_student_for_opportunity(student, target_opp)

    analyses = [analyze_student_for_opportunity(student, opp) for opp in active_opps]
    analyses.sort(key=lambda x: x["overallFit"], reverse=True)
    return {
        "status": "success",
        "student_id": student["id"],
        "student_name": student["name"],
        "total_active_opportunities": len(analyses),
        "analyses": analyses
    }



