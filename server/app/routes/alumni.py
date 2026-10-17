from fastapi import APIRouter, HTTPException, Query, Body, Header
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.db.canonical_store import canonical_store
from app.services.sync_service import sync_service

router = APIRouter(prefix="/api/alumni", tags=["Alumni Portal"])

# -------------------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------------------
class AlumniProfileUpdate(BaseModel):
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    current_company: Optional[str] = None
    designation: Optional[str] = None
    city: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    privacy_settings: Optional[Dict[str, Any]] = None

class MentorshipActionRequest(BaseModel):
    action: str = Field(..., description="ACCEPTED, DECLINED, or COMPLETED")
    scheduled_time: Optional[str] = None
    meeting_link: Optional[str] = None
    feedback_notes: Optional[str] = None

class CreateMentorshipRequest(BaseModel):
    alumni_id: str
    student_id: str
    student_name: str
    student_avatar: Optional[str] = None
    target_role: str
    topic: str
    message: str

class PostReferralRequest(BaseModel):
    alumni_id: str = "alm_1"
    alumni_name: Optional[str] = "Vikram Aditya"
    company: str
    role: str
    job_url: Optional[str] = ""
    location: str
    experience_required: str = "0-2 Years"

class ApplyReferralRequest(BaseModel):
    student_id: str
    student_name: str
    endorsement_note: Optional[str] = None

class PostInsightRequest(BaseModel):
    alumni_id: str = "alm_1"
    alumni_name: str = "Vikram Aditya"
    company: str
    designation: str
    role_interviewed: str
    rounds_breakdown: List[Dict[str, Any]]
    skills_we_actually_use: List[str]
    tips_for_juniors: str

class EndorsementRequest(BaseModel):
    alumni_id: str = "alm_1"
    alumni_name: str = "Vikram Aditya"
    student_id: str
    student_name: str
    skill: str
    context: str

# -------------------------------------------------------------
# PROFILE & DASHBOARD ENDPOINTS
# -------------------------------------------------------------
@router.get("/profile")
def get_profile(alumni_id: Optional[str] = Query(None), email: Optional[str] = Query(None)):
    ident = alumni_id or email or "alm_1"
    profile = canonical_store.get_alumni_profile(ident)
    if not profile:
        raise HTTPException(status_code=404, detail="Alumni profile not found.")
    return {"status": "success", "profile": profile}

@router.put("/profile")
def update_profile(
    payload: AlumniProfileUpdate,
    alumni_id: Optional[str] = Query(None),
    x_user_id: Optional[str] = Header(None)
):
    ident = alumni_id or x_user_id or "alm_1"
    dump = payload.model_dump(exclude_unset=True) if hasattr(payload, "model_dump") else payload.dict(exclude_unset=True)
    updated = canonical_store.update_alumni_profile(ident, dump)
    sync_service.publish_event(
        event_type="ALUMNI_PROFILE_UPDATED",
        data={"alumni_id": ident, "profile": updated},
        role="alumni"
    )
    return {"status": "success", "profile": updated}

@router.get("/dashboard")
def get_dashboard(alumni_id: Optional[str] = Query(None), email: Optional[str] = Query(None)):
    ident = alumni_id or email or "alm_1"
    data = canonical_store.get_alumni_dashboard(ident)
    return {"status": "success", "dashboard": data}

# -------------------------------------------------------------
# MENTORSHIP ENDPOINTS
# -------------------------------------------------------------
@router.get("/mentorship/requests")
def get_mentorship_requests(
    alumni_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    ident = alumni_id or "alm_1"
    requests = canonical_store.get_alumni_mentorship_requests(ident, status)
    return {"status": "success", "total": len(requests), "requests": requests}

@router.post("/mentorship/requests")
def create_mentorship_request(payload: CreateMentorshipRequest):
    dump = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    req = canonical_store.create_alumni_mentorship_request(dump)
    sync_service.publish_event(
        event_type="NEW_MENTORSHIP_REQUEST",
        data={"alumni_id": payload.alumni_id, "request": req},
        role="alumni"
    )
    return {"status": "success", "request": req}

@router.post("/mentorship/requests/{request_id}/action")
def action_mentorship_request(request_id: str, payload: MentorshipActionRequest):
    req = canonical_store.action_alumni_mentorship_request(
        request_id=request_id,
        action=payload.action,
        scheduled_time=payload.scheduled_time,
        meeting_link=payload.meeting_link,
        feedback_notes=payload.feedback_notes
    )
    sync_service.publish_event(
        event_type="MENTORSHIP_REQUEST_UPDATED",
        data={"request_id": request_id, "status": req.get("status"), "student_id": req.get("student_id")},
        role="student",
        student_id=req.get("student_id", "")
    )
    return {"status": "success", "request": req}

# -------------------------------------------------------------
# REFERRAL OPENINGS & APPLICATIONS
# -------------------------------------------------------------
@router.get("/referrals")
def get_referrals(alumni_id: Optional[str] = Query(None)):
    referrals = canonical_store.get_alumni_referrals(alumni_id)
    return {"status": "success", "total": len(referrals), "referrals": referrals}

@router.post("/referrals/post")
def post_referral(payload: PostReferralRequest):
    dump = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    ref = canonical_store.post_alumni_referral(dump)
    sync_service.publish_event(
        event_type="NEW_ALUMNI_REFERRAL_OPENING",
        data={"referral": ref, "company": ref.get("company"), "role": ref.get("role")},
        role="student"
    )
    return {"status": "success", "referral": ref}

@router.post("/referrals/{referral_id}/apply")
def apply_to_referral(referral_id: str, payload: ApplyReferralRequest):
    res = canonical_store.apply_to_alumni_referral(
        referral_id=referral_id,
        student_id=payload.student_id,
        student_name=payload.student_name,
        endorsement_note=payload.endorsement_note
    )
    return {"status": "success", **res}

# -------------------------------------------------------------
# INDUSTRY INSIGHTS & INTERVIEW EXPERIENCES
# -------------------------------------------------------------
@router.get("/insights")
def get_insights():
    insights = canonical_store.get_alumni_insights()
    return {"status": "success", "total": len(insights), "insights": insights}

@router.post("/insights/post")
def post_insight(payload: PostInsightRequest):
    dump = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    ins = canonical_store.post_alumni_insight(dump)
    sync_service.publish_event(
        event_type="NEW_INDUSTRY_INSIGHT",
        data={"insight": ins, "company": ins.get("company")},
        role="all"
    )
    return {"status": "success", "insight": ins}

# -------------------------------------------------------------
# SKILL ENDORSEMENTS
# -------------------------------------------------------------
@router.post("/endorsements/submit")
def submit_endorsement(payload: EndorsementRequest):
    dump = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    end = canonical_store.submit_alumni_endorsement(dump)
    sync_service.publish_event(
        event_type="ALUMNI_SKILL_ENDORSEMENT",
        data={"endorsement": end, "student_id": payload.student_id, "skill": payload.skill},
        role="student",
        student_id=payload.student_id
    )
    return {"status": "success", "endorsement": end}

# -------------------------------------------------------------
# ALUMNI DIRECTORY
# -------------------------------------------------------------
@router.get("/directory")
def get_directory(
    query: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    company: Optional[str] = Query(None)
):
    directory = canonical_store.get_alumni_directory(query, department, company)
    return {"status": "success", "total": len(directory), "directory": directory}
