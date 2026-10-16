from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.ml.resume_scanner import resume_scanner
from app.data.seed_data import OPPORTUNITIES

router = APIRouter(prefix="/api/resume", tags=["ATS Resume Scanner"])

class ResumeScanRequest(BaseModel):
    resume_text: str
    opportunity_id: Optional[str] = "opp_1"
    custom_role: Optional[str] = None
    custom_skills: Optional[List[str]] = None

@router.post("/scan-fit")
def scan_resume_fit(req: ResumeScanRequest):
    if not req.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume content cannot be empty.")

    # Find matching opportunity or use fallback
    job = next((o for o in OPPORTUNITIES if o["id"] == req.opportunity_id), None)
    if not job:
        job = {
            "title": req.custom_role or "Full Stack AI Engineer",
            "company": "Enterprise Placement Drive",
            "required_skills": req.custom_skills or ["Python", "FastAPI", "React", "TypeScript"],
            "good_to_have": ["Docker", "PostgreSQL", "Machine Learning"]
        }

    scan_result = resume_scanner.scan_resume(req.resume_text, job)
    return {
        "status": "success",
        "result": scan_result
    }

class TruthfulResumeAuditRequest(BaseModel):
    student_id: str = "std_1"
    claimed_skills: List[str]
    target_role: Optional[str] = "Full-Stack AI Developer"

@router.get("/truthful-builder/{student_id}")
def get_truthful_resume(student_id: str, target_role: Optional[str] = "Full-Stack AI Developer"):
    from app.services.truthful_resume import truthful_resume_service
    doc = truthful_resume_service.generate_truthful_resume(student_id, target_role=target_role)
    return {
        "status": "success",
        "resume": doc
    }

@router.post("/truthful-builder/audit")
def audit_truthful_resume_claims(req: TruthfulResumeAuditRequest):
    from app.services.truthful_resume import truthful_resume_service
    payload = req.model_dump() if hasattr(req, "model_dump") else req.dict()
    audit = truthful_resume_service.audit_resume_claims(req.student_id, payload)
    return {
        "status": "success",
        "audit": audit
    }

