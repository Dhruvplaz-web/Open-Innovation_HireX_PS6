from fastapi import APIRouter, Depends, HTTPException, Query, Header
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import time
import uuid

from app.data.seed_data import (
    STUDENTS,
    OPPORTUNITIES,
    RECRUITER_PROFILE,
    RECRUITERS,
    APPLICATIONS,
    RECRUITMENT_OUTCOMES,
    TALENT_VISIBILITY_SETTINGS,
    TALENT_INVITATIONS,
    IDENTITY_REVEAL_CONSENTS,
    COLLABORATION_PROJECTS,
    has_identity_reveal_consent,
    get_student_id_from_talent_id,
    get_or_create_talent_profile,
    get_talent_id_for_student,
    generate_talent_id,
    log_audit_trail
)
from app.ml.job_matcher import matcher
from app.ml.demand_predictor import trend_predictor
from app.ml.skill_intelligence import skill_intelligence, normalize_skill_name
from app.routes.auth import require_roles
from app.services.opportunity_lifecycle import parse_deadline, get_current_platform_date, filter_active_opportunities
from app.services.jd_skill_analysis import analyze_student_for_opportunity, derive_requirements_from_opportunity

router = APIRouter(prefix="/api/recruiter", tags=["Recruiter"])

class ApplicationStatusUpdateRequest(BaseModel):
    application_id: str
    new_status: str  # Applied, Under Review, Shortlisted, Interview, Selected, Rejected
    note: Optional[str] = None

class RecruitmentOutcomeRequest(BaseModel):
    application_id: str
    outcome: str = "SELECTED"  # SELECTED, REJECTED, SHORTLISTED, OFFERED
    important_skills: List[str]
    skill_readiness: Optional[str] = "Strong performance across live technical assessment"
    interview_readiness: Optional[str] = "Clear algorithmic communication and engineering fundamentals"
    technical_gap: Optional[str] = ""
    notes: Optional[str] = ""

class PostJobRequest(BaseModel):
    title: str
    company: Optional[str] = None
    domain: Optional[str] = "Software Engineering"
    location: str = "Pune & Bengaluru (Hybrid)"
    work_mode: str = "Hybrid"
    experience: str = "Fresher / 0-1 yr"
    stipend: str = "₹45,000 / month"
    duration: str = "6 Months"
    type: str = "Internship to PPO"  # "Internship", "Full-Time Placement", "Internship to PPO"
    required_skills: List[str]
    min_skill_proficiencies: Optional[Dict[str, int]] = None  # e.g. {"Python": 70, "FastAPI": 65}
    good_to_have: Optional[List[str]] = []
    min_verified_score: int = 75
    openings: int = 3
    deadline: str = "2026-11-30"
    color_theme: str = "indigo"
    description: str
    eligible_streams: Optional[List[str]] = ["Computer Engineering", "Information Technology"]
    eligible_years: Optional[List[str]] = ["3rd Year", "4th Year"]
    skill_requirements: Optional[List[Dict[str, Any]]] = None
    skillRequirements: Optional[List[Dict[str, Any]]] = None

def resolve_current_recruiter(email: Optional[str] = None, rec_id: Optional[str] = None) -> Dict[str, Any]:
    """Resolves active recruiter from RECRUITERS or falls back to seed profile."""
    if rec_id:
        found = next((r for r in RECRUITERS if r.get("id") == rec_id), None)
        if found: return found
    if email:
        found = next((r for r in RECRUITERS if r.get("email", "").lower() == email.strip().lower()), None)
        if found: return found
    return RECRUITER_PROFILE

@router.get("/dashboard")
def get_recruiter_dashboard(
    email: Optional[str] = Query(None),
    rec_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    recruiter = resolve_current_recruiter(email, rec_id)
    is_verified = recruiter.get("is_email_verified", True)
    status = recruiter.get("status", "APPROVED")

    company_name = recruiter.get("company", "Barclays India Innovation Centre")
    company_jobs = [o for o in OPPORTUNITIES if company_name.lower() in o.get("company", "").lower() or o.get("id") in ["opp_1", "opp_2"]]
    if not company_jobs:
        company_jobs = OPPORTUNITIES[:2]

    # Rank candidates for primary opportunity using existing ML Job Matcher
    primary_opp = company_jobs[0] if company_jobs else OPPORTUNITIES[0]
    ranked_candidates = matcher.rank_candidates_for_recruiter(STUDENTS, primary_opp)
    chart_data = trend_predictor.get_trend_chart_data(role="recruiter")

    # Filter applications for this company
    company_apps = [
        a for a in APPLICATIONS 
        if company_name.lower() in a.get("company", "").lower() or a.get("opportunity_id") in [j["id"] for j in company_jobs]
    ]

    shortlisted = sum(1 for a in company_apps if "shortlist" in a.get("status", "").lower())
    interviews = sum(1 for a in company_apps if "interview" in a.get("status", "").lower())
    offers = sum(1 for a in company_apps if "select" in a.get("status", "").lower() or "offer" in a.get("status", "").lower())

    return {
        "profile": recruiter,
        "is_email_verified": is_verified,
        "verification_status": status,
        "email_verification_required": not is_verified,
        "active_jobs": company_jobs,
        "top_candidates": ranked_candidates,
        "applications": company_apps,
        "chart_data": chart_data,
        "hiring_funnel": {
            "applicants": len(company_apps),
            "verified_matched": len(ranked_candidates),
            "shortlisted": shortlisted,
            "interviews": interviews,
            "offers": offers
        }
    }

@router.get("/jobs")
def get_recruiter_jobs(
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """Returns active job postings for the recruiter's company or all platform opportunities."""
    recruiter = resolve_current_recruiter(email)
    comp_name = recruiter.get("company", "")
    if comp_name:
        matching = [o for o in OPPORTUNITIES if comp_name.lower() in o.get("company", "").lower()]
        if matching:
            return {"status": "success", "total": len(matching), "jobs": matching}
    return {
        "status": "success",
        "total": len(OPPORTUNITIES),
        "jobs": OPPORTUNITIES
    }

@router.post("/post-job")
def post_job(
    req: PostJobRequest,
    email: Optional[str] = Query(None),
    rec_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    PART 14 & 16: Recruiter posts a new Job or Internship.
    Strictly checks that the recruiter's official company email is VERIFIED.
    Unverified recruiters cannot publish jobs.
    Uses normalized skills.
    """
    recruiter = resolve_current_recruiter(email, rec_id)
    if not recruiter.get("is_email_verified", False):
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Official company email verification is compulsory before publishing job listings. Please verify your company email."
        )

    # Normalize skills
    norm_required = [normalize_skill_name(s) for s in req.required_skills if s.strip()]
    norm_good = [normalize_skill_name(s) for s in (req.good_to_have or []) if s.strip()]

    target_company = req.company or recruiter.get("company", "Barclays India Innovation Centre")
    new_id = f"opp_{uuid.uuid4().hex[:6]}"
    new_opp = {
        "id": new_id,
        "title": req.title,
        "company": target_company,
        "domain": req.domain or "Software Engineering",
        "logo_text": target_company.split()[0].upper(),
        "location": req.location,
        "work_mode": req.work_mode,
        "experience": req.experience,
        "stipend": req.stipend,
        "duration": req.duration,
        "type": req.type,
        "required_skills": norm_required,
        "min_skill_proficiencies": req.min_skill_proficiencies or {s: req.min_verified_score for s in norm_required},
        "good_to_have": norm_good,
        "min_verified_score": req.min_verified_score,
        "openings": req.openings,
        "deadline": req.deadline,
        "color_theme": req.color_theme,
        "description": req.description,
        "eligible_streams": req.eligible_streams or ["Computer Engineering", "Information Technology"],
        "eligible_years": req.eligible_years or ["3rd Year", "4th Year"],
        "posted_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    reqs = req.skillRequirements or req.skill_requirements
    if not reqs:
        reqs = derive_requirements_from_opportunity(new_opp)
    new_opp["skillRequirements"] = reqs

    # Add to central OPPORTUNITIES store
    OPPORTUNITIES.insert(0, new_opp)
    recruiter["active_listings"] = recruiter.get("active_listings", 0) + 1

    # Log audit trail (PART 39)
    log_audit_trail(
        actor=recruiter.get("email", "recruiter"),
        role="recruiter",
        action="JOB_POSTED",
        entity="Opportunity",
        entity_id=new_id,
        old_value=None,
        new_value=f"Posted {req.title} at {target_company} (Required: {', '.join(norm_required)})"
    )

    return {
        "status": "success",
        "message": f"Successfully published job '{req.title}'. It is now live for AI Matching and Campus Drives.",
        "opportunity": new_opp
    }

class ExtendDeadlineRequest(BaseModel):
    new_deadline: str

@router.post("/jobs/{job_id}/extend-deadline")
def extend_job_deadline(
    job_id: str,
    req: ExtendDeadlineRequest,
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    Recruiter Renewal: Extends the deadline of an opportunity, automatically
    reactivating it if previously expired and creating a tamper-evident audit record.
    """
    recruiter = resolve_current_recruiter(email)
    opp = next((o for o in OPPORTUNITIES if o.get("id") == job_id or o.get("opportunity_id") == job_id), None)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    parsed = parse_deadline(req.new_deadline)
    if not parsed or parsed <= get_current_platform_date():
        raise HTTPException(status_code=400, detail="New deadline must be a valid future date.")

    old_deadline = opp.get("deadline", "None")
    opp["deadline"] = req.new_deadline
    opp["is_expired"] = False
    
    log_audit_trail(
        actor=recruiter.get("email", "recruiter"),
        role="recruiter",
        action="JOB_DEADLINE_EXTENDED",
        entity="Opportunity",
        entity_id=job_id,
        old_value=old_deadline,
        new_value=req.new_deadline
    )
    
    return {
        "status": "success",
        "message": f"Successfully extended deadline for '{opp.get('title')}' to {req.new_deadline}. The drive is now active.",
        "opportunity": opp
    }

@router.get("/applicants")
def get_applicants(
    opportunity_id: Optional[str] = Query(None, description="Filter by opportunity ID"),
    status: Optional[str] = Query(None, description="Filter by application status"),
    email: Optional[str] = Query(None, description="Filter by recruiter email"),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    PART 18: Recruiter sees applicants for their jobs.
    Calculates explainable AI Match fit % from the Shared Skill Record with Strong-Skill rule.
    """
    apps = list(APPLICATIONS)

    if opportunity_id:
        apps = [a for a in apps if a.get("opportunity_id") == opportunity_id]
    elif email:
        recruiter = resolve_current_recruiter(email)
        comp_name = recruiter.get("company", "").lower()
        if comp_name:
            filtered = [a for a in apps if comp_name in a.get("company", "").lower()]
            if filtered:
                apps = filtered

    if status and status != "All":
        apps = [a for a in apps if a.get("status", "").lower() == status.lower()]

    # Enrich with real-time student shared skill records and AI Match
    enriched_applicants = []
    for a in apps:
        student = next((s for s in STUDENTS if s["id"] == a.get("student_id")), None)
        opp = next((o for o in OPPORTUNITIES if o["id"] == a.get("opportunity_id")), OPPORTUNITIES[0])

        if student:
            match_res = matcher.calculate_match(student, opp)
            match_pct = match_res.get("match_percentage", a.get("match_percentage", 85))
            matched_skills = match_res.get("matched_skills", a.get("matched_skills", []))
            missing_skills = match_res.get("missing_skills", [])
            proficiency_gaps = match_res.get("proficiency_gaps", [])
            evidence_strength = match_res.get("evidence_strength", "MODERATE")
            explanation = match_res.get("explanation", f"{match_pct}% fit for {opp['title']}")
        else:
            match_pct = a.get("match_percentage", 85)
            matched_skills = a.get("matched_skills", ["Python", "React"])
            missing_skills = []
            proficiency_gaps = []
            evidence_strength = "MODERATE"
            explanation = "Verified talent match."

        jd_score = a.get("jdFitScore")
        jd_verdict = a.get("jdFitVerdict")
        jd_summary = a.get("jdFitSummary")
        jd_computed_at = a.get("jdFitComputedAt")
        if jd_score is None and student and opp:
            jd_res = analyze_student_for_opportunity(student, opp)
            jd_score = jd_res["overallFit"]
            jd_verdict = jd_res["verdict"]
            jd_summary = jd_res["summary"]
            jd_computed_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            a["jdFitScore"] = jd_score
            a["jdFitVerdict"] = jd_verdict
            a["jdFitSummary"] = jd_summary
            a["jdFitComputedAt"] = jd_computed_at

        enriched_applicants.append({
            "id": a["id"],
            "student_id": a.get("student_id"),
            "student_name": a.get("student_name", "Student Candidate"),
            "student_email": a.get("student_email", ""),
            "college": a.get("college", student.get("college", "JSPM RSCOE, Pune") if student else "JSPM RSCOE, Pune"),
            "department": a.get("department", student.get("department", "Computer Engineering") if student else "Computer Engineering"),
            "year": student.get("year", "3rd Year") if student else "3rd Year",
            "cgpa": student.get("cgpa", 8.5) if student else 8.5,
            "opportunity_id": a.get("opportunity_id"),
            "company": a.get("company", opp.get("company")),
            "title": a.get("title", opp.get("title")),
            "match_percentage": match_pct,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "proficiency_gaps": proficiency_gaps,
            "evidence_strength": evidence_strength,
            "explanation": explanation,
            "status": a.get("status", "Applied"),
            "applied_at": a.get("applied_at", "2026-10-01T10:30:00Z"),
            "status_history": a.get("status_history", []),
            "jdFitScore": jd_score,
            "jdFitVerdict": jd_verdict,
            "jdFitSummary": jd_summary,
            "jdFitComputedAt": jd_computed_at
        })

    return {
        "status": "success",
        "total": len(enriched_applicants),
        "applicants": enriched_applicants
    }

@router.post("/update-application")
def update_application_status(
    req: ApplicationStatusUpdateRequest,
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    Status flow: APPLIED -> UNDER REVIEW -> SHORTLISTED -> INTERVIEW -> SELECTED / REJECTED.
    When recruiter updates status:
    - Application record updates.
    - Status history is appended.
    - Synchronizes immediately across Student Portal and Academician Placement Analytics!
    """
    app_item = next((a for a in APPLICATIONS if a["id"] == req.application_id), None)
    if not app_item:
        raise HTTPException(status_code=404, detail="Application record not found.")

    valid_statuses = ["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"]
    matched_status = next((vs for vs in valid_statuses if vs.lower() == req.new_status.lower()), req.new_status.title())

    old_status = app_item.get("status", "Applied")
    app_item["status"] = matched_status

    if "status_history" not in app_item:
        app_item["status_history"] = []

    history_entry = {
        "status": matched_status,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "note": req.note or f"Status updated to '{matched_status}' by {RECRUITER_PROFILE.get('name', 'Recruiter')}."
    }
    app_item["status_history"].append(history_entry)

    # Log audit trail (PART 39)
    log_audit_trail(
        actor=email or RECRUITER_PROFILE.get("email", "recruiter"),
        role="recruiter",
        action="APPLICATION_STATUS_UPDATED",
        entity="Application",
        entity_id=req.application_id,
        old_value=old_status,
        new_value=matched_status
    )

    return {
        "status": "success",
        "message": f"Updated application status to '{matched_status}'. Synchronized with Student and Academician portals.",
        "application": app_item
    }

# ====================================================
# PART 4: SKILL PASSPORT FOR RECRUITERS
# ====================================================
@router.get("/candidate-skill-passport/{student_id}")
def get_candidate_skill_passport(
    student_id: str,
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    Returns a privacy-preserving, evidence-backed Skill Passport for recruiters.
    Candidate identity is protected: displays only verified skills, assessment badges,
    evidence points, and project proof without exposing sensitive PII.
    """
    student = next((s for s in STUDENTS if s["id"] == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    passport = skill_intelligence.get_recruiter_candidate_passport(student)
    return {
        "status": "success",
        "candidate": passport
    }

# ====================================================
# PART 9: INDUSTRY DEMAND DASHBOARD
# ====================================================
@router.get("/industry-demand")
def get_industry_demand_analytics(
    auth_check = Depends(require_roles(["recruiter", "academician", "admin"]))
):
    """
    Returns aggregated skill demand calculated from actual active job postings.
    Zero fabricated numbers.
    """
    demand = skill_intelligence.aggregate_industry_demand(OPPORTUNITIES)
    return {
        "status": "success",
        "industry_demand": demand
    }

# ====================================================
# PART 15, 16, 17: RECRUITMENT OUTCOME FEEDBACK LOOP
# ====================================================
@router.post("/submit-outcome-feedback")
def submit_recruitment_outcome_feedback(
    req: RecruitmentOutcomeRequest,
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    Submits structured outcome feedback after interview/selection cycle.
    Updates application status, stores in RECRUITMENT_OUTCOMES, and feeds into Skill Intelligence.
    Guaranteed: avoids unsupported causal claims ('associated with outcome').
    """
    app_item = next((a for a in APPLICATIONS if a["id"] == req.application_id), None)
    if not app_item:
        raise HTTPException(status_code=404, detail="Application record not found.")

    opp = next((o for o in OPPORTUNITIES if o["id"] == app_item.get("opportunity_id")), None)
    recruiter = resolve_current_recruiter(email)

    outcome_id = f"out_{uuid.uuid4().hex[:6]}"
    canon_skills = [normalize_skill_name(s) for s in req.important_skills]

    outcome_record = {
        "id": outcome_id,
        "application_id": req.application_id,
        "opportunity_id": app_item.get("opportunity_id"),
        "candidate_id": app_item.get("student_id"),
        "candidate_name": app_item.get("student_name", "Student"),
        "recruiter_id": recruiter.get("id", "rec_1"),
        "recruiter_name": recruiter.get("name", "Recruiter"),
        "company": opp.get("company", recruiter.get("company", "Barclays")) if opp else "Barclays",
        "role": opp.get("title", "Software Engineer") if opp else "Software Engineer",
        "outcome": req.outcome.upper(),
        "important_skills": canon_skills,
        "skill_readiness": req.skill_readiness,
        "interview_readiness": req.interview_readiness,
        "technical_gap": req.technical_gap,
        "notes": req.notes or f"{', '.join(canon_skills)} were among the skills associated with this recruitment outcome.",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    RECRUITMENT_OUTCOMES.insert(0, outcome_record)

    # Sync status to application
    status_map = {
        "SELECTED": "Selected",
        "REJECTED": "Rejected",
        "SHORTLISTED": "Shortlisted",
        "OFFERED": "Selected"
    }
    new_status = status_map.get(req.outcome.upper(), "Selected")
    app_item["status"] = new_status
    if "status_history" not in app_item:
        app_item["status_history"] = []
    app_item["status_history"].append({
        "status": new_status,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "note": f"Recruitment outcome recorded: {req.outcome}. Feedback logged into Skill Intelligence Layer."
    })

    # Log audit trail (PART 39)
    log_audit_trail(
        actor=email or recruiter.get("email", "recruiter"),
        role="recruiter",
        action="OUTCOME_FEEDBACK_RECORDED",
        entity="RecruitmentOutcome",
        entity_id=outcome_id,
        old_value=None,
        new_value=f"Outcome: {req.outcome} for {app_item.get('student_name')} (Skills associated: {', '.join(canon_skills)})"
    )

    return {
        "status": "success",
        "message": f"Successfully recorded recruitment outcome '{req.outcome}'. Feedback seamlessly integrated into Skill Intelligence Layer.",
        "outcome": outcome_record
    }

# ====================================================
# FEATURE 1: INCOGNITO TALENT MATCHING & DISCOVERY
# ====================================================

class SendTalentInvitationRequest(BaseModel):
    talent_id: str
    opportunity_id: str
    message: Optional[str] = "We reviewed your verified skills and project contributions and would love to invite you to apply."

@router.get("/incognito-talents")
def get_incognito_talents(
    opportunity_id: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    min_skill_score: Optional[int] = Query(0),
    min_verified_score: Optional[int] = Query(0),
    domain: Optional[str] = Query(None),
    project_type: Optional[str] = Query(None),
    research_interest: Optional[str] = Query(None),
    availability: Optional[str] = Query(None),
    year: Optional[str] = Query(None),
    stream: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    min_match_score: Optional[int] = Query(0),
    search: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    FEATURE 1 — RECRUITER TALENT DISCOVERY:
    Discovers anonymous candidates whose talent visibility allows discovery.
    Strictly masks all personal PII (name, email, phone, Aadhaar, address) at the BACKEND.
    Identity is ONLY attached if candidate has explicitly accepted an invitation from this recruiter.
    """
    recruiter = resolve_current_recruiter(email)
    rec_id = recruiter.get("id", "rec_1")
    
    # Target opportunity for AI Match calculation
    if opportunity_id:
        target_opp = next((o for o in OPPORTUNITIES if o["id"] == opportunity_id), OPPORTUNITIES[0])
    else:
        comp_name = recruiter.get("company", "").lower()
        company_opps = [o for o in OPPORTUNITIES if comp_name in o.get("company", "").lower()]
        target_opp = company_opps[0] if company_opps else OPPORTUNITIES[0]

    discoverable_talents = []

    for student in STUDENTS:
        sid = student["id"]
        profile = get_or_create_talent_profile(sid)
        
        # Privacy check: If hidden or recruiter discovery disabled, do not expose
        if profile.get("mode") == "HIDDEN" or not profile.get("allow_recruiter_discovery", True):
            continue

        talent_id = profile.get("talent_id", generate_talent_id(sid))
        has_consent = has_identity_reveal_consent(sid, rec_id)

        # Calculate AI Match fit using existing matcher
        match_res = matcher.match_student_to_opportunity(student.get("skills", {}), target_opp)
        match_pct = match_res.get("match_percentage", 80)
        matched_skills = match_res.get("matched_skills", [])
        missing_skills = match_res.get("missing_skills", [])
        proficiency_gaps = match_res.get("proficiency_gaps", [])
        explanation = match_res.get("explanation", "Verified talent match.")

        # Skills breakdown
        skills_breakdown = []
        for sk_name, sk_val in student.get("skills", {}).items():
            if isinstance(sk_val, dict):
                score = sk_val.get("score", 70)
                level = sk_val.get("level", "Intermediate")
                verified = sk_val.get("verified", score >= 70)
                proj_ver = sk_val.get("project_verified", False)
            else:
                score = int(sk_val)
                level = "Advanced" if score >= 85 else "Intermediate" if score >= 70 else "Beginner"
                verified = score >= 70
                proj_ver = False
            skills_breakdown.append({
                "skill": sk_name,
                "score": score,
                "level": level,
                "verified": verified,
                "project_verified": proj_ver
            })

        # Anonymized project experience
        student_projects = []
        for p in COLLABORATION_PROJECTS:
            for member in p.get("team", []):
                if member.get("student_id") == sid:
                    student_projects.append({
                        "project_id": p["id"],
                        "project_title": p["title"],
                        "project_type": p.get("type", "Research Project"),
                        "domain": p.get("domain", "AI"),
                        "role": member.get("role", "Contributor"),
                        "contribution": member.get("contribution", "Project development"),
                        "verified_skills_awarded": member.get("verified_skills_awarded", []),
                        "status": p.get("status", "ACTIVE")
                    })

        # ----------------------------------------------------
        # FILTERING CRITERIA
        # ----------------------------------------------------
        if min_verified_score and student.get("verified_score", 0) < min_verified_score:
            continue
            
        if min_match_score and match_pct < min_match_score:
            continue

        if skill:
            c_sk = normalize_skill_name(skill)
            has_sk = any(normalize_skill_name(s["skill"]) == c_sk and s["score"] >= (min_skill_score or 0) for s in skills_breakdown)
            if not has_sk:
                continue

        if research_interest:
            r_ints = [r.lower() for r in profile.get("research_interests", [])]
            if not any(research_interest.lower() in r for r in r_ints):
                continue

        if year and year != "All":
            if year.lower() not in student.get("year", "").lower():
                continue

        if stream and stream != "All":
            if stream.lower() not in student.get("department", "").lower():
                continue

        if search:
            q = search.lower()
            matches_t_id = q in talent_id.lower()
            matches_skills = any(q in s["skill"].lower() for s in skills_breakdown)
            matches_dept = q in student.get("department", "").lower()
            matches_role = q in student.get("target_role", "").lower()
            matches_interest = any(q in r.lower() for r in profile.get("research_interests", []))
            if not (matches_t_id or matches_skills or matches_dept or matches_role or matches_interest):
                continue

        # Check existing invitation status
        invitation_sent = next((i for i in TALENT_INVITATIONS if i.get("student_id") == sid and i.get("recruiter_id") == rec_id and i.get("opportunity_id") == target_opp["id"]), None)

        talent_entry = {
            "talent_id": talent_id,
            "verified_score": student.get("verified_score", 85),
            "skills": skills_breakdown,
            "project_experience": student_projects,
            "research_interests": profile.get("research_interests", ["Machine Learning", "Software Systems"]),
            "education_level": f"{student.get('year', '3rd Year')} — {student.get('department', 'Computer Engineering')}",
            "stream": student.get("department", "Computer Engineering"),
            "year": student.get("year", "3rd Year"),
            "cgpa": student.get("cgpa", 8.5),
            "institution": student.get("college", "JSPM RSCOE, Pune"),
            "privacy_safe_location": student.get("city", "Pune"),
            "availability": profile.get("availability", "Immediate Internship (6 Months)"),
            "achievements": profile.get("achievements", ["Verified Assessment Score"]),
            "target_role": student.get("target_role", "Software Engineer"),
            "ai_match": {
                "opportunity_id": target_opp["id"],
                "opportunity_title": target_opp["title"],
                "company": target_opp["company"],
                "match_percentage": match_pct,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "proficiency_gaps": proficiency_gaps,
                "explanation": explanation
            },
            "invitation_status": invitation_sent.get("status") if invitation_sent else None,
            "invitation_id": invitation_sent.get("id") if invitation_sent else None,
            "identity_revealed": has_consent
        }

        # ONLY expose personal identity if candidate explicitly accepted invitation
        if has_consent:
            talent_entry["student_id"] = sid
            talent_entry["name"] = student.get("name")
            talent_entry["email"] = student.get("email")
            talent_entry["avatar"] = student.get("avatar")
        else:
            talent_entry["student_id"] = None
            talent_entry["name"] = None
            talent_entry["email"] = None
            talent_entry["avatar"] = None

        discoverable_talents.append(talent_entry)

    # Sort: Highest match score first
    discoverable_talents.sort(key=lambda x: x["ai_match"]["match_percentage"], reverse=True)

    return {
        "status": "success",
        "target_opportunity": {
            "id": target_opp["id"],
            "title": target_opp["title"],
            "company": target_opp["company"]
        },
        "total_talents_found": len(discoverable_talents),
        "talents": discoverable_talents
    }

@router.get("/incognito-talents/{talent_id}")
def get_incognito_talent_detail(
    talent_id: str,
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    Returns single anonymous talent profile detail.
    Protects candidate identity unless explicit consent has been granted.
    """
    sid = get_student_id_from_talent_id(talent_id)
    if not sid:
        raise HTTPException(status_code=404, detail="Anonymous talent profile not found.")
        
    student = next((s for s in STUDENTS if s["id"] == sid), None)
    if not student:
        raise HTTPException(status_code=404, detail="Candidate record not found.")
        
    profile = get_or_create_talent_profile(sid)
    recruiter = resolve_current_recruiter(email)
    rec_id = recruiter.get("id", "rec_1")
    has_consent = has_identity_reveal_consent(sid, rec_id)

    # Skills
    skills_list = []
    for k, v in student.get("skills", {}).items():
        if isinstance(v, dict):
            skills_list.append({
                "skill": k,
                "score": v.get("score", 70),
                "level": v.get("level", "Intermediate"),
                "verified": v.get("verified", True),
                "project_verified": v.get("project_verified", False)
            })
        else:
            sc = int(v)
            skills_list.append({
                "skill": k,
                "score": sc,
                "level": "Advanced" if sc >= 85 else "Intermediate",
                "verified": sc >= 70,
                "project_verified": False
            })

    # Projects
    projects_list = []
    for p in COLLABORATION_PROJECTS:
        for m in p.get("team", []):
            if m.get("student_id") == sid:
                projects_list.append({
                    "id": p["id"],
                    "title": p["title"],
                    "type": p.get("type", "Research Project"),
                    "domain": p.get("domain", "AI"),
                    "description": p.get("description", ""),
                    "role": m.get("role", "Contributor"),
                    "contribution": m.get("contribution", "Project development"),
                    "verified_skills_awarded": m.get("verified_skills_awarded", [])
                })

    detail_dossier = {
        "talent_id": talent_id,
        "verified_score": student.get("verified_score", 85),
        "education_level": f"{student.get('year', '3rd Year')} — {student.get('department', 'Computer Engineering')}",
        "department": student.get("department", "Computer Engineering"),
        "year": student.get("year", "3rd Year"),
        "cgpa": student.get("cgpa", 8.5),
        "institution": student.get("college", "JSPM RSCOE, Pune"),
        "privacy_safe_location": student.get("city", "Pune"),
        "availability": profile.get("availability", "Immediate Internship (6 Months)"),
        "research_interests": profile.get("research_interests", ["Machine Learning", "Software Systems"]),
        "achievements": profile.get("achievements", ["Verified Assessment Score"]),
        "target_role": student.get("target_role", "Software Engineer"),
        "skills": skills_list,
        "projects": projects_list,
        "identity_revealed": has_consent
    }

    if has_consent:
        detail_dossier["name"] = student.get("name")
        detail_dossier["email"] = student.get("email")
        detail_dossier["avatar"] = student.get("avatar")
        detail_dossier["student_id"] = sid
    else:
        detail_dossier["name"] = None
        detail_dossier["email"] = None
        detail_dossier["avatar"] = None
        detail_dossier["student_id"] = None

    return {
        "status": "success",
        "talent_profile": detail_dossier
    }

@router.post("/talent-invitations")
def send_talent_invitation(
    req: SendTalentInvitationRequest,
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    RECRUITER INVITATION WORKFLOW:
    Recruiter discovers anonymous talent and sends 'Invite to Apply'.
    Creates invitation record without revealing student's PII.
    """
    recruiter = resolve_current_recruiter(email)
    if not recruiter.get("is_email_verified", False):
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Official company email verification is compulsory before sending talent invitations."
        )

    sid = get_student_id_from_talent_id(req.talent_id)
    if not sid:
        raise HTTPException(status_code=404, detail="Candidate with this talent ID not found.")

    student = next((s for s in STUDENTS if s["id"] == sid), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found.")

    opp = next((o for o in OPPORTUNITIES if o["id"] == req.opportunity_id), None)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found.")

    # Prevent duplicate pending invitations for same opportunity
    dup = next((i for i in TALENT_INVITATIONS if i.get("student_id") == sid and i.get("opportunity_id") == req.opportunity_id and i.get("status") == "PENDING"), None)
    if dup:
        raise HTTPException(status_code=400, detail="An active invitation has already been sent to this talent for this opportunity.")

    # Calculate match
    match_res = matcher.match_student_to_opportunity(student.get("skills", {}), opp)

    inv_id = f"inv_{uuid.uuid4().hex[:8]}"
    new_inv = {
        "id": inv_id,
        "talent_id": req.talent_id,
        "student_id": sid,
        "recruiter_id": recruiter.get("id", "rec_1"),
        "recruiter_name": recruiter.get("name", "Recruiter"),
        "recruiter_email": recruiter.get("email", email or "recruiter@barclays.com"),
        "company": opp.get("company", recruiter.get("company", "Barclays")),
        "opportunity_id": req.opportunity_id,
        "opportunity_title": opp.get("title", "Software Developer"),
        "match_percentage": match_res.get("match_percentage", 88),
        "matched_skills": match_res.get("matched_skills", []),
        "message": req.message or f"Your verified skills match {opp.get('title')}. We invite you to apply!",
        "status": "PENDING",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "responded_at": None
    }

    TALENT_INVITATIONS.insert(0, new_inv)

    # Log audit trail
    log_audit_trail(
        actor=email or recruiter.get("email", "recruiter"),
        role="recruiter",
        action="TALENT_INVITATION_SENT",
        entity="TalentInvitation",
        entity_id=inv_id,
        old_value=None,
        new_value=f"Invited {req.talent_id} to apply for {opp.get('title')} at {opp.get('company')}"
    )

    return {
        "status": "success",
        "message": f"Invitation successfully sent to {req.talent_id}. Student will receive your invitation in their portal.",
        "invitation": new_inv
    }

@router.get("/talent-invitations")
def get_recruiter_talent_invitations(
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    Returns all talent invitations sent by this recruiter with real-time status.
    """
    recruiter = resolve_current_recruiter(email)
    rec_id = recruiter.get("id", "rec_1")
    rec_email = recruiter.get("email", "").lower()

    sent_invs = [
        i for i in TALENT_INVITATIONS 
        if i.get("recruiter_id") == rec_id or (rec_email and i.get("recruiter_email", "").lower() == rec_email)
    ]

    # Enrich with revealed identity if accepted
    enriched = []
    for inv in sent_invs:
        sid = inv.get("student_id")
        has_consent = has_identity_reveal_consent(sid, rec_id)
        student = next((s for s in STUDENTS if s["id"] == sid), None) if sid else None

        item = {
            **inv,
            "identity_revealed": has_consent or inv.get("status") == "ACCEPTED"
        }
        if has_consent and student:
            item["student_name"] = student.get("name")
            item["student_email"] = student.get("email")
            item["student_college"] = student.get("college")
        else:
            item["student_name"] = None
            item["student_email"] = None
            item["student_college"] = None
        enriched.append(item)

    return {
        "status": "success",
        "total": len(enriched),
        "invitations": enriched
    }

# ====================================================
# FEATURE 2: RECRUITER PROJECT SCOUTING & SPONSORSHIP
# ====================================================

class ProjectInterestRequest(BaseModel):
    type: str = "Industry Collaboration Request"  # "Interested in Sponsoring" / "Industry Collaboration Request"
    message: str

@router.get("/projects")
def get_recruiter_scouting_projects(
    skill: Optional[str] = Query(None),
    domain: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    FEATURE 2 — RECRUITER PROJECT SCOUTING ('Project Talent'):
    Recruiters discover active and completed projects, project skills,
    participating anonymous talent, and outcomes.
    """
    projects_list = []
    for p in COLLABORATION_PROJECTS:
        if status and status != "All" and p.get("status", "").lower() != status.lower():
            continue
        if domain and domain.lower() not in p.get("domain", "").lower() and domain.lower() not in p.get("research_area", "").lower():
            continue
        if skill:
            req_pref = p.get("required_skills", []) + p.get("preferred_skills", [])
            if not any(normalize_skill_name(skill) == normalize_skill_name(s) for s in req_pref):
                continue

        # Calculate progress from completed milestones
        milestones = p.get("milestones", [])
        completed_m = sum(1 for m in milestones if m.get("status") == "COMPLETED")
        progress_pct = round((completed_m / max(1, len(milestones))) * 100) if milestones else 50

        # Anonymized team contributors
        contributors = []
        for member in p.get("team", []):
            sid = member.get("student_id")
            talent_id = member.get("talent_id") or get_talent_id_for_student(sid)
            student = next((s for s in STUDENTS if s["id"] == sid), None)
            
            contributors.append({
                "talent_id": talent_id,
                "role": member.get("role", "ML Engineer"),
                "contribution": member.get("contribution", "Core development"),
                "verified_skills_awarded": member.get("verified_skills_awarded", []),
                "verified_score": student.get("verified_score", 85) if student else 85,
                "key_skills": [
                    {"skill": k, "score": v.get("score", 70) if isinstance(v, dict) else int(v)}
                    for k, v in (student.get("skills", {}) if student else {}).items()
                ][:3]
            })

        projects_list.append({
            "id": p["id"],
            "title": p["title"],
            "type": p.get("type", "Research Project"),
            "description": p.get("description", ""),
            "domain": p.get("domain", "AI & ML"),
            "research_area": p.get("research_area", "Edge Computing"),
            "college": p.get("college", "JSPM RSCOE, Pune"),
            "department": p.get("department", "Computer Engineering"),
            "required_skills": p.get("required_skills", []),
            "preferred_skills": p.get("preferred_skills", []),
            "progress_percentage": progress_pct,
            "total_team_members": len(p.get("team", [])),
            "max_team_size": p.get("team_size", 4),
            "status": p.get("status", "ACTIVE"),
            "anonymous_contributors": contributors,
            "sponsorship_interests": p.get("sponsorship_interests", []),
            "created_at": p.get("created_at")
        })

    return {
        "status": "success",
        "total": len(projects_list),
        "projects": projects_list
    }

@router.post("/projects/{project_id}/interest")
def express_project_sponsorship_interest(
    project_id: str,
    req: ProjectInterestRequest,
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    Recruiter submits Sponsorship or Industry Collaboration Request for a student project.
    """
    project = next((p for p in COLLABORATION_PROJECTS if p["id"] == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    recruiter = resolve_current_recruiter(email)

    interest_id = f"sp_{uuid.uuid4().hex[:8]}"
    interest_entry = {
        "id": interest_id,
        "recruiter_id": recruiter.get("id", "rec_1"),
        "company": recruiter.get("company", "Barclays India Innovation Centre"),
        "recruiter_name": recruiter.get("name", "Recruiter"),
        "recruiter_email": recruiter.get("email", email or "recruiter@barclays.com"),
        "type": req.type,
        "message": req.message,
        "status": "Under Review",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    project.setdefault("sponsorship_interests", []).insert(0, interest_entry)

    log_audit_trail(
        actor=email or recruiter.get("email", "recruiter"),
        role="recruiter",
        action="PROJECT_SPONSORSHIP_REQUESTED",
        entity="CollaborationProject",
        entity_id=project_id,
        old_value=None,
        new_value=f"Submitted {req.type} for '{project['title']}' at {project.get('college')}"
    )

    return {
        "status": "success",
        "message": f"Sponsorship / Collaboration request submitted to {project.get('academician_name', 'the Academician')}.",
        "interest": interest_entry
    }

@router.get("/opportunities/{opportunity_id}/applicants-fit")
def get_opportunity_applicants_fit(
    opportunity_id: str,
    sort: Optional[str] = Query("fit", description="Sort by: 'fit', 'date', 'name', 'match'"),
    verdict: Optional[str] = Query(None, description="Filter by verdict: STRONG_FIT, GOOD_FIT, PARTIAL_FIT, WEAK_FIT, ALL"),
    min_fit: Optional[int] = Query(None, description="Filter by minimum JD fit score"),
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    Returns applicants for a specific opportunity with explainable JD Fit metrics.
    Enforces incognito candidate privacy masking and deterministic sorting/filtering.
    """
    opp = next((o for o in OPPORTUNITIES if o.get("id") == opportunity_id or o.get("opportunity_id") == opportunity_id), None)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found.")

    recruiter = resolve_current_recruiter(email)
    recruiter_company = recruiter.get("company", opp.get("company", ""))

    target_apps = [a for a in APPLICATIONS if a.get("opportunity_id") == opportunity_id]

    items = []
    for a in target_apps:
        student = next((s for s in STUDENTS if s["id"] == a.get("student_id")), None)
        if not student:
            continue

        student_id = student["id"]
        vis_setting = TALENT_VISIBILITY_SETTINGS.get(student_id, {}) if isinstance(TALENT_VISIBILITY_SETTINGS, dict) else {}
        is_incognito = vis_setting.get("incognito_mode", False) if isinstance(vis_setting, dict) else False
        has_consent = has_identity_reveal_consent(student_id, recruiter_company) if is_incognito else True

        if is_incognito and not has_consent:
            candidate_name = f"Candidate #{student_id[-4:].upper()}"
            candidate_email = "Verified Candidate (Private)"
            candidate_college = "Top-Tier Accredited University"
            candidate_avatar = ""
            mask_active = True
        else:
            candidate_name = student.get("name", "Student")
            candidate_email = student.get("email", "")
            candidate_college = student.get("college", "JSPM RSCOE, Pune")
            candidate_avatar = student.get("avatar", "")
            mask_active = False

        analysis = analyze_student_for_opportunity(student, opp)

        # Sync snapshot
        a["jdFitScore"] = analysis["overallFit"]
        a["jdFitVerdict"] = analysis["verdict"]
        a["jdFitSummary"] = analysis["summary"]
        a["jdFitComputedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        if verdict and verdict.upper() != "ALL":
            if analysis["verdict"].upper() != verdict.upper():
                continue

        if min_fit is not None:
            if analysis["overallFit"] < min_fit:
                continue

        items.append({
            "applicationId": a["id"],
            "studentId": student_id,
            "studentName": candidate_name,
            "studentEmail": candidate_email,
            "college": candidate_college,
            "department": student.get("department", "Computer Engineering"),
            "year": student.get("year", "3rd Year"),
            "cgpa": student.get("cgpa", 8.5),
            "avatar": candidate_avatar,
            "isIncognito": mask_active,
            "status": a.get("status", "Applied"),
            "appliedAt": a.get("applied_at", ""),
            "matchPercentage": a.get("match_percentage", 85),
            "jdFitScore": analysis["overallFit"],
            "jdFitVerdict": analysis["verdict"],
            "jdFitVerdictExplanation": analysis["verdictExplanation"],
            "jdFitSummary": analysis["summary"],
            "criticalGaps": analysis.get("criticalGaps", []),
            "skills": analysis.get("skills", [])
        })

    if sort == "fit":
        items.sort(key=lambda x: x["jdFitScore"], reverse=True)
    elif sort == "date":
        items.sort(key=lambda x: x["appliedAt"], reverse=True)
    elif sort == "name":
        items.sort(key=lambda x: x["studentName"].lower())
    elif sort == "match":
        items.sort(key=lambda x: x["matchPercentage"], reverse=True)

    return {
        "status": "success",
        "opportunityId": opportunity_id,
        "opportunityTitle": opp.get("title"),
        "company": opp.get("company"),
        "total": len(items),
        "applicants": items
    }

@router.get("/opportunities/{opportunity_id}/applicants/{student_id}/skill-analysis")
def get_applicant_skill_analysis(
    opportunity_id: str,
    student_id: str,
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    Returns full explainable JD-skill breakdown for a candidate against an opportunity.
    Applies privacy masking if candidate is in incognito mode.
    """
    opp = next((o for o in OPPORTUNITIES if o.get("id") == opportunity_id or o.get("opportunity_id") == opportunity_id), None)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found.")

    student = next((s for s in STUDENTS if s["id"] == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    recruiter = resolve_current_recruiter(email)
    recruiter_company = recruiter.get("company", opp.get("company", ""))

    vis_setting = TALENT_VISIBILITY_SETTINGS.get(student_id, {}) if isinstance(TALENT_VISIBILITY_SETTINGS, dict) else {}
    is_incognito = vis_setting.get("incognito_mode", False) if isinstance(vis_setting, dict) else False
    has_consent = has_identity_reveal_consent(student_id, recruiter_company) if is_incognito else True

    analysis = analyze_student_for_opportunity(student, opp)

    if is_incognito and not has_consent:
        candidate_info = {
            "id": student_id,
            "name": f"Candidate #{student_id[-4:].upper()}",
            "email": "Verified Candidate (Private)",
            "college": "Top-Tier Accredited University",
            "department": student.get("department", "Computer Engineering"),
            "year": student.get("year", "3rd Year"),
            "cgpa": student.get("cgpa", 8.5),
            "isIncognito": True
        }
    else:
        candidate_info = {
            "id": student_id,
            "name": student.get("name"),
            "email": student.get("email"),
            "college": student.get("college"),
            "department": student.get("department", "Computer Engineering"),
            "year": student.get("year", "3rd Year"),
            "cgpa": student.get("cgpa", 8.5),
            "isIncognito": False
        }

    return {
        "status": "success",
        "opportunity": {
            "id": opp["id"],
            "title": opp.get("title"),
            "company": opp.get("company")
        },
        "candidate": candidate_info,
        "analysis": analysis
    }

@router.get("/opportunities/{opportunity_id}/fit-summary")
def get_opportunity_fit_summary(
    opportunity_id: str,
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["recruiter", "admin"]))
):
    """
    Returns aggregate fit distribution and most common missing skills across applicants for this opportunity.
    """
    opp = next((o for o in OPPORTUNITIES if o.get("id") == opportunity_id or o.get("opportunity_id") == opportunity_id), None)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found.")

    target_apps = [a for a in APPLICATIONS if a.get("opportunity_id") == opportunity_id]

    strong_count = 0
    good_count = 0
    partial_count = 0
    weak_count = 0
    scores = []
    missing_skill_counter: Dict[str, int] = {}

    for a in target_apps:
        student = next((s for s in STUDENTS if s["id"] == a.get("student_id")), None)
        if not student:
            continue
        analysis = analyze_student_for_opportunity(student, opp)
        verdict = analysis.get("verdict")
        score = analysis.get("overallFit", 0)
        scores.append(score)

        if verdict == "STRONG_FIT": strong_count += 1
        elif verdict == "GOOD_FIT": good_count += 1
        elif verdict == "PARTIAL_FIT": partial_count += 1
        elif verdict == "WEAK_FIT": weak_count += 1

        for gap in analysis.get("criticalGaps", []):
            sk = gap.get("skill")
            if sk:
                missing_skill_counter[sk] = missing_skill_counter.get(sk, 0) + 1

    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    top_missing = [
        {"skill": k, "count": v}
        for k, v in sorted(missing_skill_counter.items(), key=lambda x: x[1], reverse=True)
    ]

    return {
        "status": "success",
        "opportunityId": opportunity_id,
        "totalApplicants": len(target_apps),
        "avgFitScore": avg_score,
        "verdictDistribution": {
            "STRONG_FIT": strong_count,
            "GOOD_FIT": good_count,
            "PARTIAL_FIT": partial_count,
            "WEAK_FIT": weak_count
        },
        "topMissingSkills": top_missing
    }



