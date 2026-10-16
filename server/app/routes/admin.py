from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import time

from app.data.seed_data import (
    PLATFORM_STATS,
    STUDENTS,
    OPPORTUNITIES,
    APPLICATIONS,
    ACADEMICIANS,
    RECRUITERS,
    INSTITUTIONS,
    DEPARTMENTS,
    COURSE_CATALOG,
    TRAINING_INTERVENTIONS,
    RECRUITMENT_OUTCOMES,
    AUDIT_LOGS,
    INSTITUTION_SUBSCRIPTIONS,
    TALENT_VISIBILITY_SETTINGS,
    TALENT_INVITATIONS,
    IDENTITY_REVEAL_CONSENTS,
    COLLABORATION_PROJECTS,
    log_audit_trail
)
from app.ml.demand_predictor import trend_predictor
from app.ml.skill_intelligence import skill_intelligence, normalize_skill_name
from app.routes.auth import require_roles, USER_DB
from app.services.job_fetcher import sync_and_filter_external_drives, get_last_sync_summary
from app.services.opportunity_lifecycle import filter_active_opportunities
from app.services.jd_skill_analysis import derive_requirements_from_opportunity

router = APIRouter(prefix="/api/admin", tags=["Admin"])

class VerifyUserRequest(BaseModel):
    user_id: str
    role: str  # "academician" or "recruiter"
    new_status: str  # "APPROVED", "VERIFIED", "REJECTED", "SUSPENDED"

@router.get("/dashboard")
def get_admin_dashboard(auth_check = Depends(require_roles(["admin"]))):
    chart_data = trend_predictor.get_trend_chart_data(role="admin")
    
    return {
        "stats": {
            **PLATFORM_STATS,
            "total_students_active": len(STUDENTS),
            "total_opportunities_live": len(OPPORTUNITIES),
            "total_applications_logged": len(APPLICATIONS),
            "total_academicians_registered": len(ACADEMICIANS),
            "total_recruiters_registered": len(RECRUITERS)
        },
        "chart_data": chart_data,
        "recent_verifications": [
            {"student": "Dhruv Patil", "skill": "React", "score": 89, "status": "Verified"},
            {"student": "Yuvraj Kadam", "skill": "Machine Learning", "score": 86, "status": "Verified"},
            {"student": "Nimisha Joshi", "skill": "TypeScript", "score": 91, "status": "Verified"},
            {"student": "Khushi Patil", "skill": "PyTorch", "score": 82, "status": "Verified"}
        ],
        "colleges_overview": [
            {"name": "IIT Bombay, Mumbai", "students": 420, "placed": 395, "sync_score": "88%"},
            {"name": "BITS Pilani", "students": 380, "placed": 352, "sync_score": "84%"},
            {"name": "RVCE Bengaluru", "students": 340, "placed": 298, "sync_score": "79%"},
            {"name": "COEP Tech, Pune", "students": 310, "placed": 260, "sync_score": "76%"},
            {"name": "JSPM RSCOE, Pune", "students": 240, "placed": 142, "sync_score": "58%"}
        ],
        "applications": APPLICATIONS
    }

@router.get("/users")
def get_all_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    auth_check = Depends(require_roles(["admin"]))
):
    """PART 25: Admin platform governance over users across all four roles."""
    users_list = []

    # Academicians
    for a in ACADEMICIANS:
        if not role or role.lower() == "academician":
            users_list.append({
                "id": a["id"],
                "name": a["name"],
                "email": a.get("email", ""),
                "role": "academician",
                "organization": a.get("college", "JSPM RSCOE, Pune"),
                "department": a.get("department", "Computer Engineering"),
                "status": a.get("status", "APPROVED"),
                "is_verified": a.get("is_email_verified", True)
            })

    # Recruiters
    for r in RECRUITERS:
        if not role or role.lower() == "recruiter":
            users_list.append({
                "id": r["id"],
                "name": r["name"],
                "email": r.get("email", ""),
                "role": "recruiter",
                "organization": r.get("company", "Barclays"),
                "department": r.get("title", "Campus Talent Partner"),
                "status": r.get("status", "APPROVED"),
                "is_verified": r.get("is_email_verified", True)
            })

    # Students
    if not role or role.lower() == "student":
        for s in STUDENTS:
            users_list.append({
                "id": s["id"],
                "name": s["name"],
                "email": s.get("email", ""),
                "role": "student",
                "organization": s.get("college", "JSPM RSCOE, Pune"),
                "department": s.get("department", "Computer Engineering"),
                "status": "ACTIVE",
                "is_verified": True
            })

    return {
        "status": "success",
        "total": len(users_list),
        "users": users_list
    }

@router.post("/verify-user")
def verify_user(req: VerifyUserRequest, auth_check = Depends(require_roles(["admin"]))):
    """
    PART 25: Admin verifies or updates approval status for an Academician or Recruiter.
    """
    if req.role.lower() == "academician":
        target = next((a for a in ACADEMICIANS if a["id"] == req.user_id), None)
        if not target:
            raise HTTPException(status_code=404, detail="Academician not found.")
        target["status"] = req.new_status
        target["is_email_verified"] = req.new_status in ["APPROVED", "VERIFIED"]
        return {
            "status": "success",
            "message": f"Academician '{target['name']}' status set to '{req.new_status}'.",
            "user": target
        }
    elif req.role.lower() == "recruiter":
        target = next((r for r in RECRUITERS if r["id"] == req.user_id), None)
        if not target:
            raise HTTPException(status_code=404, detail="Recruiter not found.")
        target["status"] = req.new_status
        target["is_email_verified"] = req.new_status in ["APPROVED", "VERIFIED"]
        return {
            "status": "success",
            "message": f"Recruiter '{target['name']}' status set to '{req.new_status}'.",
            "user": target
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid role for verification.")

@router.get("/institutions")
def get_institutions_admin(auth_check = Depends(require_roles(["admin"]))):
    """PART 25: Admin institutions and department registry management."""
    result = []
    for inst in INSTITUTIONS:
        depts = [d for d in DEPARTMENTS if d.get("institution_id") == inst["id"]]
        stds = [s for s in STUDENTS if s.get("institution_id") == inst["id"] or inst["name"].lower() in s.get("college", "").lower()]
        acads = [a for a in ACADEMICIANS if a.get("institution_id") == inst["id"] or inst["name"].lower() in a.get("college", "").lower()]
        result.append({
            **inst,
            "departments": depts,
            "total_students": len(stds),
            "total_academicians": len(acads)
        })
    return {
        "status": "success",
        "total": len(result),
        "institutions": result
    }

@router.get("/skills-courses")
def get_skills_courses_admin(auth_check = Depends(require_roles(["admin"]))):
    """PART 25: Admin view of normalized skills, assessment question bank, and courses."""
    skills_data = []
    from app.routes.assessments import QUESTION_BANK
    all_skill_names = set(QUESTION_BANK.keys()) | set(COURSE_CATALOG.keys())
    for sk in sorted(all_skill_names):
        q_count = len(QUESTION_BANK.get(sk, []))
        c_count = len(COURSE_CATALOG.get(sk, []))
        skills_data.append({
            "skill": sk,
            "questions_count": q_count,
            "courses_count": c_count,
            "status": "ACTIVE",
            "verified_benchmark": 70
        })
    return {
        "status": "success",
        "total": len(skills_data),
        "skills": skills_data
    }

@router.get("/applications")
def get_all_applications_admin(auth_check = Depends(require_roles(["admin"]))):
    """PART 25: Admin platform-wide application oversight."""
    return {
        "status": "success",
        "total": len(APPLICATIONS),
        "applications": APPLICATIONS
    }

# ====================================================
# PART 24 & 29: ADMIN SKILL INTELLIGENCE DASHBOARD
# ====================================================
@router.get("/skill-intelligence")
def get_admin_skill_intelligence(auth_check = Depends(require_roles(["admin"]))):
    """
    Returns aggregated ecosystem intelligence calculated transparently from real database records:
    - Total Students Assessed & Verified Skills
    - Identified Gaps & Interventions
    - Applications & Outcomes Funnel
    - Live Industry Demand
    - Average Skill Improvement from post-training reassessments
    """
    total_students = len(STUDENTS)
    total_assessments = sum(s.get("assessments_completed", 0) for s in STUDENTS)
    
    # Calculate verified skills
    verified_skills_count = 0
    skill_totals: Dict[str, List[int]] = {}
    for s in STUDENTS:
        for raw_k, val in s.get("skills", {}).items():
            sk = normalize_skill_name(raw_k)
            score = val.get("score", 0) if isinstance(val, dict) else int(val)
            if score >= 70:
                verified_skills_count += 1
            if sk not in skill_totals:
                skill_totals[sk] = []
            skill_totals[sk].append(score)

    top_skills = []
    for sk, scores in skill_totals.items():
        avg = round(sum(scores) / len(scores))
        ver_count = sum(1 for sc in scores if sc >= 70)
        top_skills.append({
            "skill": sk,
            "average_score": avg,
            "verified_count": ver_count,
            "total_assessed": len(scores)
        })
    top_skills.sort(key=lambda x: x["verified_count"], reverse=True)

    # Industry Demand
    demand = skill_intelligence.aggregate_industry_demand(OPPORTUNITIES)

    # Interventions improvement
    completed_interventions = [i for i in TRAINING_INTERVENTIONS if i.get("status") == "COMPLETED" and i.get("improvement_points") is not None]
    if completed_interventions:
        avg_improvement = round(sum(i["improvement_points"] for i in completed_interventions) / len(completed_interventions), 1)
    else:
        avg_improvement = 0.0

    # Applications outcome funnel
    total_apps = len(APPLICATIONS)
    shortlisted = sum(1 for a in APPLICATIONS if "shortlist" in a.get("status", "").lower())
    selected = sum(1 for a in APPLICATIONS if "select" in a.get("status", "").lower() or "offer" in a.get("status", "").lower())

    return {
        "status": "success",
        "ecosystem_summary": {
            "total_students": total_students,
            "total_assessments_taken": total_assessments,
            "total_verified_skills": verified_skills_count,
            "total_active_opportunities": len(OPPORTUNITIES),
            "total_applications": total_apps,
            "shortlisted_count": shortlisted,
            "selected_count": selected,
            "total_interventions": len(TRAINING_INTERVENTIONS),
            "completed_interventions": len(completed_interventions),
            "average_skill_improvement_points": avg_improvement,
            "recruitment_feedback_count": len(RECRUITMENT_OUTCOMES)
        },
        "top_verified_skills": top_skills[:6],
        "industry_demand": demand,
        "interventions": TRAINING_INTERVENTIONS,
        "recruitment_outcomes": RECRUITMENT_OUTCOMES
    }

# ====================================================
# PART 39: AUDIT TRAIL LOGS
# ====================================================
@router.get("/audit-logs")
def get_audit_logs(
    role: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    auth_check = Depends(require_roles(["admin"]))
):
    """
    Returns audit trail records for compliance, tracking user actions and mutations.
    """
    logs = list(AUDIT_LOGS)
    if role:
        logs = [l for l in logs if l.get("role", "").lower() == role.lower()]
    if action:
        logs = [l for l in logs if action.lower() in l.get("action", "").lower()]

    return {
        "status": "success",
        "total": len(logs),
        "audit_logs": logs
    }

# ====================================================
# PART 36: COMMERCIAL & MULTI-TENANCY METRICS
# ====================================================
@router.get("/multi-tenancy-metrics")
def get_multi_tenancy_metrics(auth_check = Depends(require_roles(["admin"]))):
    """
    Returns institutional tenancy subscriptions, entitlements, and usage metrics.
    """
    return {
        "status": "success",
        "total_institutions": len(INSTITUTION_SUBSCRIPTIONS),
        "subscriptions": list(INSTITUTION_SUBSCRIPTIONS.values())
    }

# ====================================================
# FEATURE 1: ADMIN TALENT MATCHING ANALYTICS
# ====================================================
@router.get("/talent-matching/analytics")
def get_admin_talent_matching_analytics(auth_check = Depends(require_roles(["admin"]))):
    """
    Returns platform-wide metrics for Incognito Talent Matching:
    - Total profiles in Incognito vs Normal vs Hidden
    - Recruiter invitations sent, accepted, declined
    - Identity reveal events
    - Conversion rate
    """
    total_profiles = len(TALENT_VISIBILITY_SETTINGS)
    incognito_count = sum(1 for p in TALENT_VISIBILITY_SETTINGS.values() if p.get("mode") == "INCOGNITO")
    normal_count = sum(1 for p in TALENT_VISIBILITY_SETTINGS.values() if p.get("mode") == "NORMAL")
    hidden_count = sum(1 for p in TALENT_VISIBILITY_SETTINGS.values() if p.get("mode") == "HIDDEN")

    total_invitations = len(TALENT_INVITATIONS)
    accepted_invitations = sum(1 for i in TALENT_INVITATIONS if i.get("status") == "ACCEPTED")
    declined_invitations = sum(1 for i in TALENT_INVITATIONS if i.get("status") == "DECLINED")
    pending_invitations = sum(1 for i in TALENT_INVITATIONS if i.get("status") == "PENDING")

    acceptance_rate = round((accepted_invitations / max(1, (accepted_invitations + declined_invitations))) * 100, 1)

    return {
        "status": "success",
        "talent_matching_summary": {
            "total_talent_profiles": total_profiles,
            "incognito_mode_count": incognito_count,
            "normal_mode_count": normal_count,
            "hidden_mode_count": hidden_count,
            "total_invitations_sent": total_invitations,
            "invitations_accepted": accepted_invitations,
            "invitations_declined": declined_invitations,
            "invitations_pending": pending_invitations,
            "acceptance_rate_pct": acceptance_rate,
            "total_identity_reveal_events": len(IDENTITY_REVEAL_CONSENTS)
        },
        "recent_invitations": TALENT_INVITATIONS[:10],
        "identity_reveal_consents": IDENTITY_REVEAL_CONSENTS
    }

# ====================================================
# FEATURE 2: ADMIN COLLABORATION HUB ANALYTICS
# ====================================================
@router.get("/collaboration/analytics")
def get_admin_collaboration_analytics(auth_check = Depends(require_roles(["admin"]))):
    """
    Returns platform-wide metrics for Project & Research Collaboration Hub:
    - Active vs Completed projects across institutions
    - Project distribution by type (Research, Capstone, Industry, Innovation, Open Challenge)
    - Total student participants & project-verified skills awarded
    - Industry sponsorships & corporate interest
    """
    total_projects = len(COLLABORATION_PROJECTS)
    active_projects = sum(1 for p in COLLABORATION_PROJECTS if p.get("status") == "ACTIVE")
    completed_projects = sum(1 for p in COLLABORATION_PROJECTS if p.get("status") == "COMPLETED")

    # Group by type
    by_type: Dict[str, int] = {}
    for p in COLLABORATION_PROJECTS:
        t = p.get("type", "Research Project")
        by_type[t] = by_type.get(t, 0) + 1

    # Student participants and evaluations
    all_participants = set()
    total_evaluations = 0
    total_evidence = 0
    total_sponsorships = 0

    for p in COLLABORATION_PROJECTS:
        for m in p.get("team", []):
            if m.get("student_id"):
                all_participants.add(m["student_id"])
        total_evaluations += len(p.get("evaluations", []))
        total_evidence += len(p.get("evidence_submissions", []))
        total_sponsorships += len(p.get("sponsorship_interests", []))

    return {
        "status": "success",
        "collaboration_summary": {
            "total_projects": total_projects,
            "active_projects": active_projects,
            "completed_projects": completed_projects,
            "project_types_distribution": by_type,
            "total_student_participants": len(all_participants),
            "project_evaluations_completed": total_evaluations,
            "evidence_artifacts_submitted": total_evidence,
            "industry_sponsorship_connections": total_sponsorships,
            "overall_completion_rate_pct": round((completed_projects / max(1, total_projects)) * 100, 1)
        },
        "projects": COLLABORATION_PROJECTS
    }

@router.get("/identity-reveal-logs")
def get_admin_identity_reveal_logs(auth_check = Depends(require_roles(["admin"]))):
    """
    Admin Privacy & Audit Trail for Identity Reveal Events.
    Demonstrates compliance with student-initiated explicit consent workflow.
    """
    return {
        "status": "success",
        "total": len(IDENTITY_REVEAL_CONSENTS),
        "reveal_logs": IDENTITY_REVEAL_CONSENTS
    }

@router.post("/drives/sync")
def sync_campus_drives(
    include_live_ats: bool = Query(True, description="Fetch live Greenhouse and Lever endpoints"),
    auth_check = Depends(require_roles(["admin"]))
):
    """
    Triggers the 4-Stage Ingestion & Verification Pipeline:
    1. Ingestion: ATS connectors (Greenhouse/Lever), JobSpy, and verified campus sources.
    2. Date Engine: Extracts deadlines and assigns 30-day freshness TTL.
    3. Fraud Risk Gatekeeper: Auto-blocks fees, off-platform chat redirects, and scams.
    4. Time-Aware Live Verification: Discards past-deadline drives and runs Link Pulse liveness check.
    """
    summary = sync_and_filter_external_drives(
        existing_opportunities=OPPORTUNITIES,
        include_live_ats_fetch=include_live_ats
    )

    log_audit_trail(
        actor="admin",
        role="admin",
        action="DRIVES_INGESTED_SYNC",
        entity="OpportunitiesPipeline",
        entity_id="external_sync",
        old_value=None,
        new_value=f"Sync complete: {summary['verified_added_count']} added, {summary['expired_discarded_count']} expired discarded, {summary['link_pulse_failed_count']} dead links eliminated, {summary['scam_blocked_count']} scams blocked."
    )

    return summary

@router.get("/drives/sync-status")
def get_campus_drives_sync_status(auth_check = Depends(require_roles(["admin"]))):
    """Returns the latest ingestion pipeline summary and statistics."""
    summary = get_last_sync_summary()
    return {
        "status": "success",
        "sync_summary": summary,
        "total_opportunities_in_db": len(OPPORTUNITIES)
    }

@router.get("/analytics/skill-demand-coverage")
def get_skill_demand_coverage(
    min_demand: int = Query(1, description="Minimum number of active job postings requiring the skill"),
    auth_check = Depends(require_roles(["admin"]))
):
    """
    Computes platform-wide skill demand vs student verified coverage.
    Maps every skill required across live opportunities against student assessment benchmarks.
    """
    active_opps = filter_active_opportunities(OPPORTUNITIES, include_expired=False)

    demand_map: Dict[str, Dict[str, Any]] = {}

    for opp in active_opps:
        reqs = opp.get("skillRequirements")
        if not reqs:
            reqs = derive_requirements_from_opportunity(opp)

        for r in reqs:
            sk_name = r.get("skill", "")
            if not sk_name:
                continue
            canonical = normalize_skill_name(sk_name)
            if canonical not in demand_map:
                demand_map[canonical] = {
                    "skill": sk_name,
                    "demandingRolesCount": 0,
                    "mustHaveCount": 0,
                    "niceToHaveCount": 0,
                    "targetScores": []
                }
            demand_map[canonical]["demandingRolesCount"] += 1
            if r.get("importance") == "MUST_HAVE":
                demand_map[canonical]["mustHaveCount"] += 1
            else:
                demand_map[canonical]["niceToHaveCount"] += 1
            target_sc = r.get("targetScore", 70)
            demand_map[canonical]["targetScores"].append(target_sc)

    coverage_rows = []
    total_students = len(STUDENTS)

    for canonical, d_info in demand_map.items():
        if d_info["demandingRolesCount"] < min_demand:
            continue

        scores = d_info["targetScores"]
        avg_target = round(sum(scores) / len(scores), 1) if scores else 70.0

        verified_count = 0
        proficient_count = 0
        missing_count = 0
        student_scores = []

        for student in STUDENTS:
            std_skills = student.get("skills", {})
            matched_val = None
            for s_name, val in std_skills.items():
                if normalize_skill_name(s_name) == canonical:
                    matched_val = val
                    break

            if matched_val is not None:
                sc = matched_val.get("score", 0) if isinstance(matched_val, dict) else int(matched_val)
                student_scores.append(sc)
                if sc >= avg_target:
                    verified_count += 1
                if sc >= 50:
                    proficient_count += 1
            else:
                missing_count += 1

        avg_std_score = round(sum(student_scores) / len(student_scores), 1) if student_scores else 0.0
        coverage_pct = round((verified_count / max(1, total_students)) * 100, 1)

        gap_severity = "BALANCED"
        if d_info["demandingRolesCount"] >= 2 and coverage_pct < 40:
            gap_severity = "CRITICAL_DEFICIT"
        elif coverage_pct < 60:
            gap_severity = "MODERATE_DEFICIT"
        elif coverage_pct >= 80:
            gap_severity = "STRONG_SUPPLY"

        coverage_rows.append({
            "skill": d_info["skill"],
            "canonicalName": canonical,
            "rolesDemanding": d_info["demandingRolesCount"],
            "mustHaveDemand": d_info["mustHaveCount"],
            "niceToHaveDemand": d_info["niceToHaveCount"],
            "avgTargetScore": avg_target,
            "totalStudents": total_students,
            "verifiedCount": verified_count,
            "proficientCount": proficient_count,
            "unassessedOrMissingCount": missing_count,
            "coveragePercentage": coverage_pct,
            "avgStudentScore": avg_std_score,
            "gapSeverity": gap_severity
        })

    coverage_rows.sort(key=lambda x: (x["rolesDemanding"], -x["coveragePercentage"]), reverse=True)
    deficit_skills = [r for r in coverage_rows if r["gapSeverity"] in ["CRITICAL_DEFICIT", "MODERATE_DEFICIT"]]
    surplus_skills = [r for r in coverage_rows if r["gapSeverity"] == "STRONG_SUPPLY"]

    return {
        "status": "success",
        "totalActiveOpportunities": len(active_opps),
        "totalStudents": total_students,
        "uniqueSkillsAnalyzed": len(coverage_rows),
        "criticalDeficitSkillsCount": len(deficit_skills),
        "coverageData": coverage_rows,
        "highPriorityInterventions": deficit_skills[:5],
        "wellSuppliedSkills": surplus_skills[:5]
    }




