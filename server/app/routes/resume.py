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
