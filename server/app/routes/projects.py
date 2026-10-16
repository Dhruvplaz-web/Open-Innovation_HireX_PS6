from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import time
import uuid
import numpy as np

from app.data.seed_data import (
    STUDENTS,
    COLLABORATION_PROJECTS,
    get_or_create_talent_profile,
    get_talent_id_for_student,
    has_identity_reveal_consent,
    log_audit_trail
)
from app.ml.skill_intelligence import normalize_skill_name

router = APIRouter(prefix="/api/projects", tags=["Collaboration Projects"])

class JoinProjectRequest(BaseModel):
    student_id: str = "std_1"
    message: Optional[str] = "I would love to contribute my skills to this project."
    role: Optional[str] = "Student Contributor"

class SubmitEvidenceRequest(BaseModel):
    student_id: str = "std_1"
    title: str
    github_url: Optional[str] = ""
    description: str
    file_url: Optional[str] = ""

class UpdateMilestoneStatusRequest(BaseModel):
    student_id: str = "std_1"
    status: str  # "NOT_STARTED", "IN_PROGRESS", "COMPLETED"
    deliverable: Optional[str] = None
    note: Optional[str] = None

@router.get("")
@router.get("/")
def get_all_collaboration_projects(
    student_id: Optional[str] = Query(None),
    domain: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """
    FEATURE 2 — PROJECT DISCOVERY:
    Browse all active & completed research/collaboration projects.
    When student_id is provided, calculates personalized AI Match %
    based on verified skills, gaps, and academic domain.
    """
    student = next((s for s in STUDENTS if s["id"] == student_id), None) if student_id else None
    std_skills = student.get("skills", {}) if student else {}

    results = []
    for proj in COLLABORATION_PROJECTS:
        # Filters
        if status and status != "All" and proj.get("status", "").lower() != status.lower():
            continue
        if type and type != "All" and proj.get("type", "").lower() != type.lower():
            continue
        if domain and domain != "All" and domain.lower() not in proj.get("domain", "").lower() and domain.lower() not in proj.get("research_area", "").lower():
            continue
        if skill:
            req_pref = proj.get("required_skills", []) + proj.get("preferred_skills", [])
            if not any(normalize_skill_name(skill) == normalize_skill_name(s) for s in req_pref):
                continue
        if search:
            q = search.lower()
            m_title = q in proj.get("title", "").lower()
            m_desc = q in proj.get("description", "").lower()
            m_skills = any(q in s.lower() for s in (proj.get("required_skills", []) + proj.get("preferred_skills", [])))
            m_domain = q in proj.get("domain", "").lower()
            if not (m_title or m_desc or m_skills or m_domain):
                continue

        # AI Match calculation if student is present
        req_skills = proj.get("required_skills", [])
        pref_skills = proj.get("preferred_skills", [])

        matched_req = [s for s in req_skills if normalize_skill_name(s) in {normalize_skill_name(k) for k in std_skills}]
        missing_req = [s for s in req_skills if normalize_skill_name(s) not in {normalize_skill_name(k) for k in std_skills}]
        matched_pref = [s for s in pref_skills if normalize_skill_name(s) in {normalize_skill_name(k) for k in std_skills}]

        if req_skills:
            req_ratio = len(matched_req) / len(req_skills)
        else:
            req_ratio = 1.0

        pref_ratio = len(matched_pref) / max(1, len(pref_skills)) if pref_skills else 1.0
        scores = [std_skills[s]["score"] if isinstance(std_skills.get(s), dict) else int(std_skills.get(s, 70)) for s in matched_req if s in std_skills]
        avg_score = float(np.mean(scores)) if scores else 60.0

        raw_match = (req_ratio * 65.0) + (pref_ratio * 15.0) + ((avg_score / 100.0) * 20.0)
        match_pct = int(min(98, max(30, round(raw_match))))

        # Progress calculation
        milestones = proj.get("milestones", [])
        completed_m = sum(1 for m in milestones if m.get("status") == "COMPLETED")
        progress_pct = round((completed_m / max(1, len(milestones))) * 100) if milestones else 0

        # Membership state
        is_member = any(m.get("student_id") == student_id for m in proj.get("team", [])) if student_id else False
        has_pending = any(r.get("student_id") == student_id and r.get("status") == "PENDING" for r in proj.get("join_requests", [])) if student_id else False

        results.append({
            **proj,
            "match_percentage": match_pct if student else 80,
            "matched_skills": matched_req if student else req_skills,
            "missing_skills": missing_req if student else [],
            "matched_preferred_skills": matched_pref if student else pref_skills,
            "progress_percentage": progress_pct,
            "is_team_member": is_member,
            "has_pending_request": has_pending,
            "team_spots_left": max(0, proj.get("team_size", 4) - len(proj.get("team", []))),
            "explanation": f"{match_pct}% Match: Strong alignment with verified {', '.join(matched_req) if matched_req else 'required project skills'}."
        })

    if student:
        results.sort(key=lambda x: x["match_percentage"], reverse=True)

    return {
        "status": "success",
        "total": len(results),
        "projects": results
    }

@router.get("/{project_id}")
def get_collaboration_project_workspace(
    project_id: str,
    student_id: Optional[str] = Query(None),
    recruiter_id: Optional[str] = Query(None)
):
    """
    FEATURE 2 — PROJECT WORKSPACE:
    Detailed workspace including milestones, tasks, team members, deliverables,
    progress, mentor feedback, evidence submissions, and evaluations.
    """
    proj = next((p for p in COLLABORATION_PROJECTS if p["id"] == project_id), None)
    if not proj:
        raise HTTPException(status_code=404, detail="Collaboration project not found.")

    student = next((s for s in STUDENTS if s["id"] == student_id), None) if student_id else None
    std_skills = student.get("skills", {}) if student else {}

    # Progress calculation
    milestones = proj.get("milestones", [])
    completed_m = sum(1 for m in milestones if m.get("status") == "COMPLETED")
    progress_pct = round((completed_m / max(1, len(milestones))) * 100) if milestones else 0

    # Privacy-safe team members representation
    team_members = []
    for m in proj.get("team", []):
        m_sid = m.get("student_id")
        talent_id = m.get("talent_id") or get_talent_id_for_student(m_sid)
        m_student = next((s for s in STUDENTS if s["id"] == m_sid), None)
        
        has_consent = has_identity_reveal_consent(m_sid, recruiter_id) if recruiter_id else True
        
        team_members.append({
            "student_id": m_sid if has_consent else None,
            "talent_id": talent_id,
            "student_name": m_student.get("name") if (has_consent and m_student) else talent_id,
            "student_avatar": m_student.get("avatar") if (has_consent and m_student) else f"https://api.dicebear.com/7.x/avataaars/svg?seed={talent_id}",
            "role": m.get("role", "Developer"),
            "joined_at": m.get("joined_at"),
            "contribution": m.get("contribution", ""),
            "verified_skills_awarded": m.get("verified_skills_awarded", []),
            "evaluated": m.get("evaluated", False)
        })

    is_member = any(m.get("student_id") == student_id for m in proj.get("team", [])) if student_id else False
    has_pending = any(r.get("student_id") == student_id and r.get("status") == "PENDING" for r in proj.get("join_requests", [])) if student_id else False

    # AI Match breakdown
    req_skills = proj.get("required_skills", [])
    pref_skills = proj.get("preferred_skills", [])
    matched_req = [s for s in req_skills if normalize_skill_name(s) in {normalize_skill_name(k) for k in std_skills}]
    missing_req = [s for s in req_skills if normalize_skill_name(s) not in {normalize_skill_name(k) for k in std_skills}]

    return {
        "status": "success",
        "project": {
            **proj,
            "team": team_members,
            "progress_percentage": progress_pct,
            "is_team_member": is_member,
            "has_pending_request": has_pending,
            "team_spots_left": max(0, proj.get("team_size", 4) - len(proj.get("team", []))),
            "matched_skills": matched_req,
            "missing_skills": missing_req
        }
    }

@router.post("/{project_id}/join")
def join_or_request_collaboration_project(
    project_id: str,
    req: JoinProjectRequest
):
    """
    FEATURE 2 — TEAM FORMATION / JOIN REQUEST:
    Student applies to join an active research / capstone / industry project.
    Validates:
    - Active project status
    - Maximum team size constraint
    - Prevents duplicate team membership
    - Prevents duplicate pending join requests
    """
    proj = next((p for p in COLLABORATION_PROJECTS if p["id"] == project_id), None)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")

    if proj.get("status") != "ACTIVE":
        raise HTTPException(status_code=400, detail=f"Cannot join project with status '{proj.get('status')}'.")

    # Constraint 1: Prevent duplicate team membership
    if any(m.get("student_id") == req.student_id for m in proj.get("team", [])):
        raise HTTPException(status_code=400, detail="Duplicate Membership: You are already an active member of this project team.")

    # Constraint 2: Check team capacity
    max_team = proj.get("team_size", 4)
    current_members = len(proj.get("team", []))
    if current_members >= max_team:
        raise HTTPException(status_code=400, detail=f"Project is full. Maximum team size of {max_team} has been reached.")

    # Constraint 3: Prevent duplicate pending join requests
    if any(r.get("student_id") == req.student_id and r.get("status") == "PENDING" for r in proj.get("join_requests", [])):
        raise HTTPException(status_code=400, detail="You already have a pending join request for this project.")

    student = next((s for s in STUDENTS if s["id"] == req.student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found.")

    talent_id = get_talent_id_for_student(req.student_id)
    req_id = f"jr_{uuid.uuid4().hex[:8]}"
    now_ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    join_request = {
        "id": req_id,
        "student_id": req.student_id,
        "talent_id": talent_id,
        "student_name": student.get("name"),
        "student_email": student.get("email"),
        "department": student.get("department"),
        "year": student.get("year"),
        "cgpa": student.get("cgpa", 8.5),
        "verified_score": student.get("verified_score", 85),
        "role": req.role or "Student Contributor",
        "message": req.message,
        "status": "PENDING",
        "requested_at": now_ts
    }

    proj.setdefault("join_requests", []).append(join_request)

    log_audit_trail(
        actor=student.get("email", req.student_id),
        role="student",
        action="PROJECT_JOIN_REQUESTED",
        entity="CollaborationProject",
        entity_id=project_id,
        old_value=None,
        new_value=f"Requested to join '{proj['title']}' as {req.role}"
    )

    return {
        "status": "success",
        "message": f"Join request submitted to {proj.get('academician_name', 'project mentor')}. You will be notified upon review.",
        "join_request": join_request
    }

@router.post("/{project_id}/leave")
def leave_collaboration_project(
    project_id: str,
    student_id: str = Query("std_1")
):
    """Student leaves a project team."""
    proj = next((p for p in COLLABORATION_PROJECTS if p["id"] == project_id), None)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")

    member = next((m for m in proj.get("team", []) if m.get("student_id") == student_id), None)
    if not member:
        raise HTTPException(status_code=400, detail="You are not a member of this project team.")

    proj["team"] = [m for m in proj.get("team", []) if m.get("student_id") != student_id]

    log_audit_trail(
        actor=student_id,
        role="student",
        action="PROJECT_LEFT",
        entity="CollaborationProject",
        entity_id=project_id,
        old_value="MEMBER",
        new_value="LEFT"
    )

    return {
        "status": "success",
        "message": f"Successfully left project '{proj['title']}'."
    }

@router.post("/{project_id}/evidence")
def submit_project_evidence(
    project_id: str,
    req: SubmitEvidenceRequest
):
    """
    FEATURE 2 — PROJECT EVIDENCE SUBMISSION:
    Student uploads verifiable evidence (GitHub repo, code artifacts, report) for their project.
    """
    proj = next((p for p in COLLABORATION_PROJECTS if p["id"] == project_id), None)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")

    student = next((s for s in STUDENTS if s["id"] == req.student_id), None)
    talent_id = get_talent_id_for_student(req.student_id)

    ev_id = f"ev_{uuid.uuid4().hex[:8]}"
    ev_record = {
        "id": ev_id,
        "student_id": req.student_id,
        "talent_id": talent_id,
        "title": req.title,
        "github_url": req.github_url,
        "description": req.description,
        "file_url": req.file_url,
        "submitted_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    proj.setdefault("evidence_submissions", []).insert(0, ev_record)

    log_audit_trail(
        actor=student.get("email", req.student_id) if student else req.student_id,
        role="student",
        action="PROJECT_EVIDENCE_SUBMITTED",
        entity="CollaborationProject",
        entity_id=project_id,
        old_value=None,
        new_value=f"Submitted evidence '{req.title}' ({req.github_url})"
    )

    return {
        "status": "success",
        "message": "Project evidence submitted successfully. Mentor can now review and evaluate contribution.",
        "evidence": ev_record
    }

@router.post("/{project_id}/milestones/{milestone_id}/status")
def update_milestone_status(
    project_id: str,
    milestone_id: str,
    req: UpdateMilestoneStatusRequest
):
    """
    Updates progress of a project milestone.
    """
    proj = next((p for p in COLLABORATION_PROJECTS if p["id"] == project_id), None)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")

    milestone = next((m for m in proj.get("milestones", []) if m["id"] == milestone_id), None)
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found.")

    old_st = milestone.get("status", "NOT_STARTED")
    milestone["status"] = req.status.upper()
    if req.deliverable:
        milestone["deliverable"] = req.deliverable
    if req.status.upper() == "COMPLETED" and not milestone.get("completed_at"):
        milestone["completed_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    return {
        "status": "success",
        "message": f"Milestone '{milestone['title']}' updated to '{req.status.upper()}'.",
        "milestone": milestone
    }
