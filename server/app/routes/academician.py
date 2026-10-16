from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import time
import uuid

from app.data.seed_data import (
    COLLEGE_CURRICULUM,
    ACADEMICIAN_PROFILE,
    ACADEMICIANS,
    STUDENTS,
    OPPORTUNITIES,
    APPLICATIONS,
    ACADEMICIAN_RECOMMENDATIONS,
    COURSE_CATALOG,
    TRAINING_INTERVENTIONS,
    COLLABORATION_PROJECTS,
    evaluate_student_project_contribution,
    get_talent_id_for_student,
    log_audit_trail,
    resolve_or_create_institution,
    resolve_or_create_department
)
from app.ml.demand_predictor import trend_predictor
from app.ml.skill_intelligence import skill_intelligence, normalize_skill_name
from app.routes.auth import require_roles
from app.services.opportunity_lifecycle import filter_active_opportunities
from app.services.jd_skill_analysis import analyze_student_for_opportunity

router = APIRouter(prefix="/api/academician", tags=["Academician"])

class CreateInterventionRequest(BaseModel):
    skill: str
    course_title: str
    target_year: str = "3rd Year"
    provider: Optional[str] = "NPTEL / Coursera"
    target_students_count: Optional[int] = None
    note: Optional[str] = ""

class RecordReassessmentRequest(BaseModel):
    post_training_score: int
    evaluated_students_count: Optional[int] = None

class RecommendCourseRequest(BaseModel):
    target_type: str = "cohort"  # "individual", "year", "cohort"
    target_id: Optional[str] = "dept_comp"  # "std_1", "3rd Year", "dept_comp"
    target_student_id: Optional[str] = None
    target_label: Optional[str] = None
    skill: Optional[str] = None
    target_skill: Optional[str] = None
    course_id: Optional[str] = None
    course_title: Optional[str] = "Spring Boot Microservices Masterclass"
    provider: Optional[str] = "Coursera"
    duration: str = "6 Weeks"
    link: str = "https://www.coursera.org"
    note: Optional[str] = ""

def resolve_current_academician(email: Optional[str] = None, acad_id: Optional[str] = None) -> Dict[str, Any]:
    """Resolves active academician from ACADEMICIANS list or falls back to seed profile."""
    if acad_id:
        found = next((a for a in ACADEMICIANS if a.get("id") == acad_id), None)
        if found: return found
    if email:
        found = next((a for a in ACADEMICIANS if a.get("email", "").lower() == email.strip().lower()), None)
        if found: return found
    return ACADEMICIAN_PROFILE

def get_authorized_cohort_students(academician: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Enforces PART 8: Student <-> Academician Connection.
    Every student has institution_id and department_id.
    Every academician has institution_id and department_id.
    Students appear automatically when college and department match.
    If academician has college-wide TPO access, access spans multiple departments.
    PART 7 & 8: If official college email is unverified, access to student data is blocked.
    """
    if academician is None:
        academician = ACADEMICIAN_PROFILE

    # PART 7: Email verification barrier
    is_verified = academician.get("is_email_verified", True)
    status = academician.get("status", "APPROVED")
    if not is_verified or status in ["PENDING", "EMAIL_VERIFICATION_REQUIRED", "REJECTED", "SUSPENDED"]:
        return []

    inst_id = academician.get("institution_id", "inst_rscoe")
    dept_id = academician.get("department_id", "dept_comp")
    access_scope = academician.get("access_scope", "department")

    cohort = []
    for s in STUDENTS:
        s_inst = s.get("institution_id")
        if not s_inst and s.get("college"):
            s_inst = resolve_or_create_institution(s["college"])
            s["institution_id"] = s_inst

        s_dept = s.get("department_id")
        if not s_dept and s.get("department"):
            s_dept = resolve_or_create_department(s["department"], s_inst or inst_id)
            s["department_id"] = s_dept

        # Check institution match
        if s_inst == inst_id:
            # If department-level access, strictly check department
            if access_scope == "department":
                if s_dept == dept_id:
                    cohort.append(s)
            else:
                # College-wide TPO access
                cohort.append(s)
    return cohort

@router.get("/dashboard")
def get_academician_dashboard(
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    academician = resolve_current_academician(email, acad_id)
    is_verified = academician.get("is_email_verified", True)
    status = academician.get("status", "APPROVED")

    cohort_students = get_authorized_cohort_students(academician)
    chart_data = trend_predictor.get_trend_chart_data(role="academician")

    # Filter live applications for cohort students
    cohort_student_ids = {s["id"] for s in cohort_students}
    cohort_applications = [a for a in APPLICATIONS if a.get("student_id") in cohort_student_ids]

    # Calculate live verified skills and readiness
    total_cohort = len(cohort_students)
    verified_students = sum(1 for s in cohort_students if s.get("verified_score", 0) >= 70)
    avg_readiness = round(sum(s.get("verified_score", 0) for s in cohort_students) / max(1, total_cohort), 1) if total_cohort > 0 else 0

    return {
        "profile": academician,
        "is_email_verified": is_verified,
        "verification_status": status,
        "email_verification_required": not is_verified,
        "curriculum": COLLEGE_CURRICULUM,
        "chart_data": chart_data,
        "total_cohort_students": total_cohort,
        "verified_students_count": verified_students,
        "average_readiness_pct": avg_readiness,
        "live_applications": cohort_applications,
        "department_metrics": {
            "college": academician.get("college", "JSPM RSCOE, Pune"),
            "department": academician.get("department", "Computer Engineering"),
            "total_students": total_cohort,
            "skills_verified_pct": round((verified_students / max(1, total_cohort)) * 100, 1) if total_cohort > 0 else 0,
            "internship_readiness_pct": avg_readiness,
            "critical_skill_gaps_count": len(COLLEGE_CURRICULUM.get("missing_industry_skills", [])),
            "live_applications_count": len(cohort_applications)
        }
    }

@router.get("/students")
def get_registered_students(
    year: Optional[str] = Query(None, description="Filter by year: '2nd Year', '3rd Year', '4th Year'"),
    search: Optional[str] = Query(None, description="Search by name, email, or skill"),
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    Returns registered students automatically linked to the Academician's Institution and Department.
    Supports Year-wise filtering (2nd Year, 3rd Year, 4th Year), search, and pagination.
    """
    academician = resolve_current_academician(email, acad_id)
    is_verified = academician.get("is_email_verified", True)
    if not is_verified:
        return {
            "status": "verification_required",
            "message": "Official college email verification is required before accessing student records.",
            "is_email_verified": False,
            "institution": academician.get("college", "JSPM RSCOE, Pune"),
            "department": academician.get("department", "Computer Engineering"),
            "total": 0,
            "page": page,
            "limit": limit,
            "students": []
        }

    cohort = get_authorized_cohort_students(academician)

    # Apply year filter
    if year and year != "All":
        cohort = [s for s in cohort if s.get("year", "").lower() == year.lower()]

    # Apply search filter
    if search:
        s_query = search.strip().lower()
        filtered = []
        for s in cohort:
            name_match = s_query in s.get("name", "").lower()
            email_match = s_query in s.get("email", "").lower()
            skill_match = any(s_query in sk.lower() for sk in s.get("skills", {}).keys())
            if name_match or email_match or skill_match:
                filtered.append(s)
        cohort = filtered

    total_count = len(cohort)
    start_idx = (page - 1) * limit
    paginated_students = cohort[start_idx:start_idx + limit]

    # Structure student information (cannot modify student assessment score)
    student_records = []
    for s in paginated_students:
        skills_dict = s.get("skills", {})
        strong = [sk for sk, val in skills_dict.items() if val.get("score", 0) >= 70]
        weak = [sk for sk, val in skills_dict.items() if val.get("score", 0) < 60]

        student_apps = [a for a in APPLICATIONS if a.get("student_id") == s["id"]]
        app_status = student_apps[0]["status"] if student_apps else "Not Applied"

        student_records.append({
            "id": s["id"],
            "name": s["name"],
            "email": s.get("email", ""),
            "college": s.get("college", ""),
            "department": s.get("department", ""),
            "year": s.get("year", "3rd Year"),
            "cgpa": s.get("cgpa", 8.5),
            "avatar": s.get("avatar", ""),
            "verified_score": s.get("verified_score", 75),
            "assessments_completed": s.get("assessments_completed", 0),
            "projects_count": s.get("projects_count", 0),
            "skills": skills_dict,
            "strong_skills": strong,
            "weak_skills": weak,
            "application_status": app_status,
            "target_role": s.get("target_role", "Software Engineer")
        })

    return {
        "status": "success",
        "institution": ACADEMICIAN_PROFILE.get("college", "JSPM RSCOE, Pune"),
        "department": ACADEMICIAN_PROFILE.get("department", "Computer Engineering"),
        "total": total_count,
        "page": page,
        "limit": limit,
        "students": student_records
    }

@router.get("/student/{student_id}")
def get_student_detail(student_id: str, auth_check = Depends(require_roles(["academician", "admin"]))):
    """
    Returns authorized single student details.
    Academician can view verified skill record, projects, and applications.
    Cannot modify assessment answers or scores.
    """
    cohort = get_authorized_cohort_students()
    student = next((s for s in cohort if s["id"] == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found in your authorized cohort.")

    apps = [a for a in APPLICATIONS if a.get("student_id") == student_id]
    recs = [r for r in ACADEMICIAN_RECOMMENDATIONS if r.get("target_id") == student_id or r.get("target_type") == "cohort"]

    return {
        "status": "success",
        "student": student,
        "shared_skill_record": student.get("skills", {}),
        "applications": apps,
        "academician_recommendations": recs
    }

# ====================================================
# PART 7: INSTITUTIONAL SKILL READINESS INDEX
# ====================================================
@router.get("/institutional-readiness")
def get_institutional_readiness(
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    Computes transparent Institutional Skill Readiness Index with component weights:
    Assessment Verification (30%), Industry Alignment (25%), Project Evidence (20%),
    Skill Coverage (15%), Placement Outcomes (10%).
    Label: 'Calculated by SkillBridge based on available platform data.'
    """
    academician = resolve_current_academician(email, acad_id)
    cohort = get_authorized_cohort_students(academician)

    if not cohort:
        return {
            "status": "success",
            "has_sufficient_data": False,
            "message": "Insufficient data",
            "overall_index": None
        }

    readiness = skill_intelligence.compute_institutional_readiness_index(cohort, OPPORTUNITIES, APPLICATIONS)
    return {
        "status": "success",
        "institution": academician.get("college", "JSPM RSCOE, Pune"),
        "department": academician.get("department", "Computer Engineering"),
        "readiness_index": readiness
    }

# ====================================================
# PART 5: INSTITUTIONAL SKILL INTELLIGENCE
# ====================================================
@router.get("/cohort-skill-intelligence")
def get_cohort_skill_intelligence(
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    Analyzes actual student records and assessment data for the academician's institution & department.
    Calculates real skill readiness percentages. Zero hard-coding.
    If insufficient data exists, shows 'Insufficient data'.
    """
    academician = resolve_current_academician(email, acad_id)
    cohort = get_authorized_cohort_students(academician)

    if not cohort:
        return {
            "status": "success",
            "has_sufficient_data": False,
            "message": "Insufficient data",
            "total_students": 0,
            "skills_readiness": []
        }

    # Aggregate actual student skills and verified status
    skill_scores: Dict[str, List[int]] = {}
    for s in cohort:
        for raw_k, val in s.get("skills", {}).items():
            sk = normalize_skill_name(raw_k)
            score = val.get("score", 0) if isinstance(val, dict) else int(val)
            if sk not in skill_scores:
                skill_scores[sk] = []
            skill_scores[sk].append(score)

    results = []
    total_cohort = len(cohort)
    for sk, scores in skill_scores.items():
        avg_score = round(sum(scores) / len(scores))
        verified_count = sum(1 for sc in scores if sc >= 70)
        results.append({
            "skill": sk,
            "readiness_pct": avg_score,
            "students_assessed": len(scores),
            "verified_students": verified_count,
            "verification_rate_pct": round((verified_count / len(scores)) * 100),
            "status": "Ready" if avg_score >= 75 else "Moderate" if avg_score >= 60 else "Intervention Needed"
        })

    results.sort(key=lambda x: x["readiness_pct"], reverse=True)

    return {
        "status": "success",
        "has_sufficient_data": True,
        "institution": academician.get("college", "JSPM RSCOE, Pune"),
        "department": academician.get("department", "Computer Engineering"),
        "total_students": total_cohort,
        "skills_readiness": results
    }

# ====================================================
# PART 6: COHORT SKILL GAP ANALYSIS & YEAR-WISE COMPARISON
# ====================================================
@router.get("/cohort-skill-gaps")
def get_cohort_skill_gaps(
    year: Optional[str] = Query("All Years", description="All Years, 2nd Year, 3rd Year, 4th Year"),
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    Computes real aggregate skill gaps across students in authorized cohort.
    Supports Year-wise filtering (All Years, 2nd Year, 3rd Year, 4th Year).
    Includes strongest skills, weakest skills, intervention candidates, and year-wise progression matrix.
    """
    academician = resolve_current_academician(email, acad_id)
    cohort = get_authorized_cohort_students(academician)

    if not cohort:
        return {
            "status": "success",
            "has_sufficient_data": False,
            "message": "Insufficient data",
            "cohort_size": 0,
            "skill_gaps": []
        }

    analysis = skill_intelligence.compute_cohort_skill_analysis(cohort, year)
    return {
        "status": "success",
        "institution": academician.get("college", "JSPM RSCOE, Pune"),
        "department": academician.get("department", "Computer Engineering"),
        "analysis": analysis
    }

# ====================================================
# PART 10: INDUSTRY DEMAND VS STUDENT GAP
# ====================================================
@router.get("/industry-demand-gap")
def get_industry_demand_gap(
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    Compares live Industry Demand % against Student Readiness %.
    Calculates Gap percentage points and highlights largest gaps.
    Clearly labeled: 'Based on SkillBridge job-posting data.'
    """
    academician = resolve_current_academician(email, acad_id)
    cohort = get_authorized_cohort_students(academician)

    gap_analysis = skill_intelligence.compute_industry_vs_student_gap(cohort, OPPORTUNITIES)
    return {
        "status": "success",
        "institution": academician.get("college", "JSPM RSCOE, Pune"),
        "department": academician.get("department", "Computer Engineering"),
        "gap_analysis": gap_analysis
    }

# ====================================================
# PART 13 & 14: TRAINING INTERVENTIONS & BEFORE/AFTER TRACKING
# ====================================================
@router.get("/interventions")
def get_training_interventions(
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    Returns active and completed cohort interventions.
    Rule: Only displays improvement points when actual post-training reassessment exists!
    If no post-reassessment exists: shows 'Post-training evaluation pending.'
    """
    academician = resolve_current_academician(email, acad_id)
    inst_id = academician.get("institution_id", "inst_rscoe")

    matching = [i for i in TRAINING_INTERVENTIONS if i.get("institution_id") == inst_id]
    if not matching:
        matching = list(TRAINING_INTERVENTIONS)

    return {
        "status": "success",
        "total": len(matching),
        "interventions": matching
    }

@router.post("/interventions")
def create_training_intervention(
    req: CreateInterventionRequest,
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    Academician launches a targeted Cohort Training Intervention.
    Calculates actual baseline 'before_score' from current cohort student records.
    Sets 'after_score' to None until actual reassessment occurs (never fabricates).
    """
    academician = resolve_current_academician(email, acad_id)
    cohort = get_authorized_cohort_students(academician)

    canon_skill = normalize_skill_name(req.skill)

    # Calculate actual baseline before_score from cohort
    scores = []
    for s in cohort:
        for k, v in s.get("skills", {}).items():
            if normalize_skill_name(k) == canon_skill:
                scores.append(v.get("score", 0) if isinstance(v, dict) else int(v))
                break

    baseline_score = round(sum(scores) / len(scores)) if scores else 40
    enrolled = req.target_students_count or len(cohort)

    int_id = f"int_{uuid.uuid4().hex[:6]}"
    new_intervention = {
        "id": int_id,
        "institution_id": academician.get("institution_id", "inst_rscoe"),
        "college": academician.get("college", "JSPM RSCOE, Pune"),
        "department_id": academician.get("department_id", "dept_comp"),
        "department": academician.get("department", "Computer Engineering"),
        "target_year": req.target_year,
        "skill": canon_skill,
        "course_title": req.course_title,
        "provider": req.provider or "NPTEL / Coursera",
        "enrolled_students": enrolled,
        "before_score": baseline_score,
        "after_score": None,  # Post-training evaluation pending
        "improvement_points": None,
        "status": "IN_PROGRESS",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "completed_at": None,
        "note": req.note or f"Targeted cohort training intervention for {canon_skill}."
    }

    TRAINING_INTERVENTIONS.insert(0, new_intervention)

    # Log audit trail
    log_audit_trail(
        actor=academician.get("email", "academician"),
        role="academician",
        action="INTERVENTION_CREATED",
        entity="TrainingIntervention",
        entity_id=int_id,
        old_value=None,
        new_value=f"Created {req.course_title} for {canon_skill} (Baseline: {baseline_score}%)"
    )

    return {
        "status": "success",
        "message": f"Successfully initialized intervention for {canon_skill}. Baseline score: {baseline_score}%. Post-training evaluation pending.",
        "intervention": new_intervention
    }

@router.post("/interventions/{intervention_id}/record-reassessment")
def record_intervention_reassessment(
    intervention_id: str,
    req: RecordReassessmentRequest,
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    Records real post-training assessment data for an intervention.
    Calculates actual improvement points = after_score - before_score.
    """
    target = next((i for i in TRAINING_INTERVENTIONS if i["id"] == intervention_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Training intervention not found.")

    score = min(100, max(0, req.post_training_score))
    before = target.get("before_score", 40)
    improvement = score - before

    target["after_score"] = score
    target["improvement_points"] = improvement
    target["status"] = "COMPLETED"
    target["completed_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    # Log audit trail
    log_audit_trail(
        actor=email or "academician",
        role="academician",
        action="INTERVENTION_COMPLETED",
        entity="TrainingIntervention",
        entity_id=intervention_id,
        old_value=f"Before: {before}%",
        new_value=f"After: {score}% (+{improvement} points)"
    )

    return {
        "status": "success",
        "message": f"Recorded post-training evaluation: {score}% (+{improvement} points). Intervention completed.",
        "intervention": target
    }

@router.get("/industry-requirements")
def get_industry_requirement_analysis(
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    PART 12: Uses actual opportunity/job requirements in SkillBridge.
    Compares live industry demand against cohort proficiency to identify HIGH PRIORITY SKILL GAPS.
    """
    academician = resolve_current_academician(email, acad_id)
    cohort = get_authorized_cohort_students(academician)

    # Aggregate required skills from live OPPORTUNITIES
    demand_counts: Dict[str, int] = {}
    for opp in OPPORTUNITIES:
        for sk in opp.get("required_skills", []):
            demand_counts[sk] = demand_counts.get(sk, 0) + 1
        for sk in opp.get("good_to_have", []):
            demand_counts[sk] = demand_counts.get(sk, 0) + 1

    # Calculate average cohort proficiency for these skills
    industry_skills_analysis = []
    for sk, opp_count in demand_counts.items():
        scores = []
        for s in cohort:
            if sk in s.get("skills", {}):
                scores.append(s["skills"][sk].get("score", 65))

        avg_score = round(sum(scores) / len(scores)) if scores else 40
        demand_level = "High Demand" if opp_count >= 3 else "Moderate Demand"

        # High priority gap: High demand in jobs AND cohort proficiency is low (<70%)
        is_high_priority = (opp_count >= 2 and avg_score < 70) or avg_score < 55

        industry_skills_analysis.append({
            "skill": sk,
            "active_postings_requiring": opp_count,
            "demand_level": demand_level,
            "cohort_average_score": avg_score,
            "priority": "Critical Priority" if is_high_priority and avg_score < 60 else "High Priority" if is_high_priority else "Adequate",
            "is_high_priority_gap": is_high_priority
        })

    # Sort: highest demand and lowest score first
    industry_skills_analysis.sort(key=lambda x: (-x["active_postings_requiring"], x["cohort_average_score"]))

    return {
        "status": "success",
        "total_active_jobs_analyzed": len(OPPORTUNITIES),
        "skills_analysis": industry_skills_analysis,
        "high_priority_gaps": [s for s in industry_skills_analysis if s["is_high_priority_gap"]]
    }

@router.post("/recommend-course")
def recommend_course(
    req: RecommendCourseRequest,
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    PART 13: Academician Course Recommendation.
    Academician recommends a course to an individual student, selected year, or entire cohort.
    Student receives the recommendation in their Student Portal with the label 'Academician Recommendation'.
    """
    academician = resolve_current_academician(email, acad_id)
    rec_id = f"rec_c_{uuid.uuid4().hex[:8]}"
    eff_skill = req.skill or req.target_skill or "Spring Boot"
    eff_target_id = req.target_student_id or req.target_id

    new_rec = {
        "id": rec_id,
        "academician_id": academician.get("id", "acad_1"),
        "academician_name": academician.get("name", "Dr. Rajesh Kulkarni"),
        "college": academician.get("college", "JSPM RSCOE, Pune"),
        "institution_id": academician.get("institution_id", "inst_rscoe"),
        "department_id": academician.get("department_id", "dept_comp"),
        "target_type": req.target_type,
        "target_id": eff_target_id,
        "target_student_id": req.target_student_id,
        "target_label": req.target_label or f"Target: {eff_target_id}",
        "skill": eff_skill,
        "target_skill": eff_skill,
        "course_id": req.course_id or f"crs_{eff_skill.lower()[:3]}_rec",
        "course_title": req.course_title or f"{eff_skill} Mastery Course",
        "provider": req.provider or "Coursera",
        "duration": req.duration or "4 Weeks",
        "link": req.link or "https://www.coursera.org",
        "note": req.note or f"Recommended by Academician for {eff_skill} gap remediation.",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    ACADEMICIAN_RECOMMENDATIONS.insert(0, new_rec)

    return {
        "status": "success",
        "message": f"Successfully recommended '{req.course_title}' to {new_rec['target_label']}.",
        "recommendation": new_rec
    }

@router.get("/recommendations")
def get_academician_recommendations(
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """Returns all course recommendations issued by this Academician or platform."""
    academician = resolve_current_academician(email, acad_id)
    recs = [
        r for r in ACADEMICIAN_RECOMMENDATIONS 
        if r.get("academician_id") == academician.get("id") or r.get("institution_id") == academician.get("institution_id")
    ]
    if not recs:
        recs = ACADEMICIAN_RECOMMENDATIONS
    return {
        "status": "success",
        "recommendations": recs
    }

@router.get("/applications")
def get_cohort_applications(
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    PART 24: Placement and Outcome Analytics for the Academician's cohort.
    Uses the SINGLE shared application records.
    """
    academician = resolve_current_academician(email, acad_id)
    cohort = get_authorized_cohort_students(academician)
    cohort_student_ids = {s["id"] for s in cohort}

    cohort_apps = [a for a in APPLICATIONS if a.get("student_id") in cohort_student_ids]

    # Funnel counts
    status_counts = {
        "Applied": 0,
        "Under Review": 0,
        "Shortlisted": 0,
        "Interview": 0,
        "Selected": 0,
        "Rejected": 0
    }

    for a in cohort_apps:
        st = a.get("status", "Applied")
        if st in status_counts:
            status_counts[st] += 1
        elif "shortlist" in st.lower():
            status_counts["Shortlisted"] += 1
        elif "interview" in st.lower():
            status_counts["Interview"] += 1
        elif "select" in st.lower() or "offer" in st.lower():
            status_counts["Selected"] += 1
        elif "reject" in st.lower():
            status_counts["Rejected"] += 1
        else:
            status_counts["Applied"] += 1

    total_apps = len(cohort_apps)
    placed_count = status_counts["Selected"]
    shortlisted_count = status_counts["Shortlisted"] + status_counts["Interview"] + status_counts["Selected"]

    return {
        "status": "success",
        "total_applications": total_apps,
        "applications": cohort_apps,
        "funnel": status_counts,
        "placed_count": placed_count,
        "shortlisted_count": shortlisted_count,
        "conversion_rate_pct": round((placed_count / max(1, total_apps)) * 100, 1) if total_apps > 0 else 0
    }

# ====================================================
# FEATURE 2: ACADEMICIAN PROJECT CREATION & EVALUATION
# ====================================================

class CreateProjectRequest(BaseModel):
    title: str
    type: str = "Research Project"  # Research Project, Capstone Project, Industry Project, Innovation Project, Open Challenge, Internship Project
    description: str
    problem_statement: str
    research_area: str
    domain: str
    required_skills: List[str]
    preferred_skills: Optional[List[str]] = []
    team_size: int = 4
    start_date: str = "2026-10-01"
    expected_end_date: str = "2026-12-31"
    difficulty_level: str = "Advanced"
    expected_deliverables: str = "Working model and implementation codebase"
    mentor_email: Optional[str] = None
    department: Optional[str] = None
    college: Optional[str] = None
    visibility: str = "PUBLIC"  # PUBLIC, INSTITUTION_ONLY
    initial_milestones: Optional[List[Dict[str, Any]]] = None

class ApproveJoinRequestPayload(BaseModel):
    action: str = "APPROVE"  # "APPROVE" or "REJECT"
    rejection_reason: Optional[str] = None

class EvaluateContributionRequest(BaseModel):
    student_id: str
    skills_verified: List[str]
    grade: Optional[str] = "Verified Distinction"
    feedback: str

@router.post("/projects")
def create_academician_project(
    req: CreateProjectRequest,
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    FEATURE 2 — CREATE PROJECT:
    Academician initiates a new Research, Capstone, or Industry project.
    Skills are normalized from the existing SkillBridge taxonomy.
    """
    academician = resolve_current_academician(email, acad_id)
    if not academician.get("is_email_verified", False):
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Official institutional email verification is compulsory before creating collaborative research projects."
        )

    norm_required = [normalize_skill_name(s) for s in req.required_skills if s.strip()]
    norm_preferred = [normalize_skill_name(s) for s in req.preferred_skills if s.strip()] if req.preferred_skills else []

    if not norm_required:
        raise HTTPException(status_code=400, detail="Project must specify at least one required skill from the taxonomy.")

    proj_id = f"proj_{uuid.uuid4().hex[:8]}"
    
    # Default milestones if none provided
    milestones = req.initial_milestones or [
        {"id": f"m_{uuid.uuid4().hex[:6]}", "title": "Requirement Analysis & Literature Survey", "status": "NOT_STARTED", "deliverable": "Problem specification document", "feedback": None, "completed_at": None},
        {"id": f"m_{uuid.uuid4().hex[:6]}", "title": "Data Pipeline & Dataset Preparation", "status": "NOT_STARTED", "deliverable": "Preprocessed data artifacts", "feedback": None, "completed_at": None},
        {"id": f"m_{uuid.uuid4().hex[:6]}", "title": "Architecture & Prototype Development", "status": "NOT_STARTED", "deliverable": "Working baseline codebase", "feedback": None, "completed_at": None},
        {"id": f"m_{uuid.uuid4().hex[:6]}", "title": "Benchmarking & Rigorous Evaluation", "status": "NOT_STARTED", "deliverable": "Performance benchmarks and error metrics", "feedback": None, "completed_at": None},
        {"id": f"m_{uuid.uuid4().hex[:6]}", "title": "Final Demonstration & Open-Source Release", "status": "NOT_STARTED", "deliverable": "Repository, documentation, and live demo", "feedback": None, "completed_at": None}
    ]

    new_project = {
        "id": proj_id,
        "title": req.title,
        "type": req.type,
        "description": req.description,
        "problem_statement": req.problem_statement,
        "research_area": req.research_area,
        "domain": req.domain,
        "academician_id": academician.get("id", "acad_1"),
        "academician_name": academician.get("name", "Dr. Rajesh Kulkarni"),
        "mentor_email": req.mentor_email or academician.get("email", "hod.comp@rscoe.edu.in"),
        "college": req.college or academician.get("college", "JSPM RSCOE, Pune"),
        "institution_id": academician.get("institution_id", "inst_rscoe"),
        "department": req.department or academician.get("department", "Computer Engineering"),
        "department_id": academician.get("department_id", "dept_comp"),
        "required_skills": norm_required,
        "preferred_skills": norm_preferred,
        "team_size": max(1, req.team_size),
        "difficulty_level": req.difficulty_level,
        "start_date": req.start_date,
        "expected_end_date": req.expected_end_date,
        "status": "ACTIVE",
        "visibility": req.visibility,
        "expected_deliverables": req.expected_deliverables,
        "team": [],
        "join_requests": [],
        "milestones": milestones,
        "evidence_submissions": [],
        "evaluations": [],
        "sponsorship_interests": [],
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    COLLABORATION_PROJECTS.insert(0, new_project)

    log_audit_trail(
        actor=academician.get("email", "academician"),
        role="academician",
        action="PROJECT_CREATED",
        entity="CollaborationProject",
        entity_id=proj_id,
        old_value=None,
        new_value=f"Created {req.type}: '{req.title}' (Required Skills: {', '.join(norm_required)})"
    )

    return {
        "status": "success",
        "message": f"Successfully created {req.type} '{req.title}'. It is now live on Collaboration Hub for student team discovery.",
        "project": new_project
    }

@router.get("/projects")
def get_academician_projects(
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    Returns all collaboration projects managed by this Academician or department.
    """
    academician = resolve_current_academician(email, acad_id)
    acad_inst = academician.get("institution_id", "inst_rscoe")
    acad_dept = academician.get("department_id", "dept_comp")

    my_projects = [
        p for p in COLLABORATION_PROJECTS
        if p.get("academician_id") == academician.get("id") or 
           p.get("mentor_email") == academician.get("email") or
           (p.get("institution_id") == acad_inst and p.get("department_id") == acad_dept)
    ]
    
    if not my_projects:
        my_projects = COLLABORATION_PROJECTS

    # Enrich with summary metrics
    enriched = []
    for p in my_projects:
        milestones = p.get("milestones", [])
        completed_m = sum(1 for m in milestones if m.get("status") == "COMPLETED")
        progress_pct = round((completed_m / max(1, len(milestones))) * 100) if milestones else 0
        pending_requests = [r for r in p.get("join_requests", []) if r.get("status") == "PENDING"]

        enriched.append({
            **p,
            "progress_percentage": progress_pct,
            "team_count": len(p.get("team", [])),
            "pending_join_requests_count": len(pending_requests),
            "evidence_count": len(p.get("evidence_submissions", [])),
            "evaluations_count": len(p.get("evaluations", [])),
            "sponsorship_count": len(p.get("sponsorship_interests", []))
        })

    return {
        "status": "success",
        "total": len(enriched),
        "projects": enriched
    }

@router.post("/projects/{project_id}/join-requests/{request_id}/approve")
def handle_join_request(
    project_id: str,
    request_id: str,
    payload: ApproveJoinRequestPayload,
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    Academician approves or rejects student join request.
    If approved, adds student directly to the Project Team.
    """
    proj = next((p for p in COLLABORATION_PROJECTS if p["id"] == project_id), None)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")

    req_item = next((r for r in proj.get("join_requests", []) if r["id"] == request_id), None)
    if not req_item:
        raise HTTPException(status_code=404, detail="Join request not found.")

    academician = resolve_current_academician(email)

    if payload.action.upper() == "APPROVE":
        # Check team capacity
        if len(proj.get("team", [])) >= proj.get("team_size", 4):
            raise HTTPException(status_code=400, detail="Cannot approve: Project team is already at maximum capacity.")

        # Check if already a member
        sid = req_item["student_id"]
        if not any(m.get("student_id") == sid for m in proj.get("team", [])):
            student = next((s for s in STUDENTS if s["id"] == sid), None)
            talent_id = req_item.get("talent_id") or get_talent_id_for_student(sid)
            
            proj.setdefault("team", []).append({
                "student_id": sid,
                "talent_id": talent_id,
                "student_name": student.get("name") if student else "Student Contributor",
                "role": req_item.get("role", "ML / Software Contributor"),
                "joined_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "contribution": "Approved for project team execution",
                "verified_skills_awarded": []
            })

        req_item["status"] = "APPROVED"
        msg = f"Join request approved. {req_item.get('student_name', 'Student')} is now an active project team member."
    else:
        req_item["status"] = "REJECTED"
        req_item["rejection_reason"] = payload.rejection_reason or "Capacity constraints or skill mismatch."
        msg = "Join request rejected."

    log_audit_trail(
        actor=academician.get("email", "academician"),
        role="academician",
        action=f"PROJECT_JOIN_REQUEST_{payload.action.upper()}",
        entity="CollaborationProject",
        entity_id=project_id,
        old_value="PENDING",
        new_value=f"Request {request_id} for {req_item.get('student_name')}: {payload.action.upper()}"
    )

    return {
        "status": "success",
        "message": msg,
        "join_request": req_item,
        "team": proj.get("team", [])
    }

@router.post("/projects/{project_id}/evaluate")
def evaluate_project_contribution(
    project_id: str,
    req: EvaluateContributionRequest,
    email: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    CRITICAL STRATEGIC DIFFERENTIATOR:
    Academician evaluates student's project contribution.
    Awards verified project skills directly into the Student's Shared Skill Record,
    updates Longitudinal Skill Progression, and boosts AI Job Match scores!
    """
    academician = resolve_current_academician(email)
    mentor_name = academician.get("name", "Dr. Rajesh Kulkarni")

    norm_skills = [normalize_skill_name(s) for s in req.skills_verified if s.strip()]
    if not norm_skills:
        raise HTTPException(status_code=400, detail="Please select at least one skill to verify through project evidence.")

    res = evaluate_student_project_contribution(
        project_id=project_id,
        student_id=req.student_id,
        skills_verified=norm_skills,
        feedback=req.feedback,
        mentor_name=mentor_name
    )

    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])

    return res

@router.get("/collaboration-analytics")
def get_academician_collaboration_analytics(
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    FEATURE 2 — ACADEMICIAN COLLABORATION ANALYTICS:
    Aggregates project metrics, student participation, verified project skills awarded,
    completion rate, and industry sponsorships for academician dashboard.
    """
    academician = resolve_current_academician(email, acad_id)
    acad_inst = academician.get("institution_id", "inst_rscoe")
    acad_dept = academician.get("department_id", "dept_comp")

    my_projects = [
        p for p in COLLABORATION_PROJECTS
        if p.get("academician_id") == academician.get("id") or 
           p.get("mentor_email") == academician.get("email") or
           (p.get("institution_id") == acad_inst and p.get("department_id") == acad_dept)
    ]
    if not my_projects:
        my_projects = COLLABORATION_PROJECTS

    total_projects = len(my_projects)
    active_projects = sum(1 for p in my_projects if p.get("status") == "ACTIVE")
    completed_projects = sum(1 for p in my_projects if p.get("status") == "COMPLETED")

    # Participating students count
    all_team_sids = set()
    total_evaluations = 0
    all_verified_skills = []
    total_sponsorships = 0

    for p in my_projects:
        for m in p.get("team", []):
            if m.get("student_id"):
                all_team_sids.add(m["student_id"])
            for sk in m.get("verified_skills_awarded", []):
                all_verified_skills.append(sk)
        total_evaluations += len(p.get("evaluations", []))
        total_sponsorships += len(p.get("sponsorship_interests", []))

    # Skill demand by project
    project_skill_counts: Dict[str, int] = {}
    for p in my_projects:
        for sk in p.get("required_skills", []):
            c_sk = normalize_skill_name(sk)
            project_skill_counts[c_sk] = project_skill_counts.get(c_sk, 0) + 1

    top_project_skills = [{"skill": k, "count": v} for k, v in sorted(project_skill_counts.items(), key=lambda x: x[1], reverse=True)]

    return {
        "status": "success",
        "summary": {
            "total_projects": total_projects,
            "active_projects": active_projects,
            "completed_projects": completed_projects,
            "participating_students_count": len(all_team_sids),
            "project_evaluations_completed": total_evaluations,
            "verified_skills_awarded_count": len(all_verified_skills),
            "industry_sponsorship_connections": total_sponsorships,
            "project_completion_rate_pct": round((completed_projects / max(1, total_projects)) * 100, 1)
        },
        "top_project_skills": top_project_skills[:5],
        "projects": my_projects
    }

@router.get("/role-gaps")
def get_cohort_role_gaps(
    year: Optional[str] = Query(None, description="Filter by student year: '2nd Year', '3rd Year', '4th Year', 'All'"),
    opportunity_id: Optional[str] = Query(None, description="Filter for a specific opportunity ID"),
    email: Optional[str] = Query(None),
    acad_id: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["academician", "admin"]))
):
    """
    Analyzes student cohort skill readiness and gaps against active industry opportunities.
    Computes average fit scores, verdict distributions, and the most critical missing skills per role.
    """
    academician = resolve_current_academician(email, acad_id)
    cohort = get_authorized_cohort_students(academician)
    if year and year != "All":
        cohort = [s for s in cohort if s.get("year", "").lower() == year.lower()]

    active_opps = filter_active_opportunities(OPPORTUNITIES, include_expired=False)
    if opportunity_id:
        active_opps = [o for o in active_opps if o.get("id") == opportunity_id or o.get("opportunity_id") == opportunity_id]

    roles_summary = []
    global_missing_counts: Dict[str, Dict[str, Any]] = {}

    for opp in active_opps:
        fit_scores = []
        verdict_counts = {"STRONG_FIT": 0, "GOOD_FIT": 0, "PARTIAL_FIT": 0, "WEAK_FIT": 0}
        opp_missing_counts: Dict[str, int] = {}

        for student in cohort:
            analysis = analyze_student_for_opportunity(student, opp)
            fit_scores.append(analysis["overallFit"])
            v = analysis["verdict"]
            if v in verdict_counts:
                verdict_counts[v] += 1

            for gap in analysis.get("criticalGaps", []):
                sk = gap.get("skill")
                if sk:
                    opp_missing_counts[sk] = opp_missing_counts.get(sk, 0) + 1
                    if sk not in global_missing_counts:
                        global_missing_counts[sk] = {
                            "skill": sk,
                            "importance": gap.get("importance", "MUST_HAVE"),
                            "affectedStudents": set(),
                            "rolesCount": 0
                        }
                    global_missing_counts[sk]["affectedStudents"].add(student["id"])

        for sk in opp_missing_counts.keys():
            if sk in global_missing_counts:
                global_missing_counts[sk]["rolesCount"] += 1

        avg_fit = round(sum(fit_scores) / len(fit_scores), 1) if fit_scores else 0.0

        top_missing = []
        for sk, count in sorted(opp_missing_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
            pct = round((count / max(1, len(cohort))) * 100, 1)
            matched_course = None
            for cat_skill, courses in COURSE_CATALOG.items():
                if sk.lower() in cat_skill.lower() and courses:
                    matched_course = courses[0]
                    break
                for c in courses:
                    if sk.lower() in c.get("title", "").lower() or any(sk.lower() in s.lower() for s in c.get("skills_covered", [])):
                        matched_course = c
                        break
                if matched_course:
                    break
            top_missing.append({
                "skill": sk,
                "missingCount": count,
                "percentageOfCohort": pct,
                "recommendedCourse": matched_course.get("title") if matched_course else f"{sk} Mastery Lab",
                "recommendedCourseId": matched_course.get("id") if matched_course else None,
                "provider": matched_course.get("provider", "SkillBridge Academy") if matched_course else "SkillBridge Academy"
            })

        roles_summary.append({
            "opportunityId": opp["id"],
            "title": opp.get("title"),
            "company": opp.get("company"),
            "stipend": opp.get("stipend"),
            "location": opp.get("location"),
            "deadline": opp.get("deadline"),
            "avgFitScore": avg_fit,
            "verdictDistribution": verdict_counts,
            "topMissingSkills": top_missing
        })

    roles_summary.sort(key=lambda r: r["avgFitScore"], reverse=True)

    in_demand_gaps = []
    for sk, data in sorted(global_missing_counts.items(), key=lambda x: len(x[1]["affectedStudents"]), reverse=True)[:8]:
        affected_count = len(data["affectedStudents"])
        in_demand_gaps.append({
            "skill": sk,
            "importance": data["importance"],
            "affectedStudentsCount": affected_count,
            "affectedPercentage": round((affected_count / max(1, len(cohort))) * 100, 1),
            "demandingRolesCount": data["rolesCount"]
        })

    return {
        "status": "success",
        "cohortSize": len(cohort),
        "opportunitiesAnalyzed": len(active_opps),
        "roles": roles_summary,
        "mostInDemandGaps": in_demand_gaps
    }



