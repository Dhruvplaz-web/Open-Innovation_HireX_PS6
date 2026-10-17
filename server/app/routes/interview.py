from fastapi import APIRouter, HTTPException, Query, Header, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from app.services.interview_service import interview_service
from app.db.canonical_store import canonical_store
from app.config import settings

router = APIRouter(prefix="/api/interview", tags=["AI Mock Interview"])

# =========================================================================
# PYDANTIC SCHEMAS
# =========================================================================
class StartInterviewRequest(BaseModel):
    student_id: str = Field(..., description="Student ID e.g. std_1")
    role: str = Field(..., description="Job role e.g. Software Developer")
    round_type: str = Field(..., description="Interview round e.g. Technical Fundamentals")
    difficulty: Optional[str] = Field("Intermediate", description="Beginner | Intermediate | Advanced")
    experience_level: Optional[str] = Field("Fresher / Student (0-1 yrs)", description="Experience level")
    duration_minutes: Optional[int] = Field(15, description="Interview duration (10, 15, or 30 mins)")
    target_company: Optional[str] = Field("Barclays", description="Target company e.g. Barclays, Google, Amazon")
    job_description: Optional[str] = Field("", description="Optional raw JD snippet for customized questions")
    resume_text: Optional[str] = Field("", description="Optional resume snippet for project discussion")

class SubmitAnswerRequest(BaseModel):
    session_id: str = Field(..., description="Interview session ID")
    student_id: str = Field(..., description="Student ID for authorization")
    answer_text: str = Field(..., description="Candidate's technical answer text")
    audio_duration_seconds: Optional[float] = Field(0.0, description="Speech duration in seconds if voice input was used")

class CompleteInterviewRequest(BaseModel):
    session_id: str = Field(..., description="Interview session ID")
    student_id: str = Field(..., description="Student ID for authorization")

# =========================================================================
# ENDPOINTS
# =========================================================================
@router.get("/config")
def get_interview_config():
    """Returns AI Provider status and available configurations."""
    has_gemini = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 10)
    has_groq = bool(settings.GROQ_API_KEY and len(settings.GROQ_API_KEY.strip()) > 10)
    
    return {
        "status": "online",
        "has_live_llm": has_gemini or has_groq,
        "active_provider": "Google Gemini 2.5 Flash" if has_gemini else ("Groq LLM" if has_groq else "HireX Sovereign Context Engine"),
        "model": "gemini-2.5-flash" if has_gemini else "Sovereign AST & Semantic Knowledge Engine",
        "fallback_mode": "Autonomous High-Fidelity Knowledge Graph Active",
        "supported_roles": [
            "Software Developer",
            "Frontend Developer",
            "Backend Developer",
            "Full Stack Developer",
            "Data Analyst / Scientist",
            "DevOps / Cloud Engineer",
            "Mobile App Developer"
        ],
        "supported_rounds": [
            "HR & Behavioral Round",
            "Technical Fundamentals",
            "DSA & Algorithmic Problem Solving",
            "System Design & Architecture",
            "Project Discussion & Resume Defense"
        ],
        "supported_difficulties": ["Beginner", "Intermediate", "Advanced"],
        "supported_durations": [10, 15, 30]
    }

@router.post("/start")
def start_interview(payload: StartInterviewRequest):
    """Initializes an interview session and returns Question 1."""
    try:
        session = interview_service.start_interview_session(
            student_id=payload.student_id,
            role=payload.role,
            round_type=payload.round_type,
            difficulty=payload.difficulty or "Intermediate",
            experience_level=payload.experience_level or "Fresher / Student (0-1 yrs)",
            duration_minutes=payload.duration_minutes or 15,
            target_company=payload.target_company or "Tier-1 Tech",
            job_description=payload.job_description or "",
            resume_text=payload.resume_text or ""
        )
        return {
            "status": "success",
            "message": "AI Mock Interview session started successfully",
            "session": session
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start interview session: {str(e)}")

@router.post("/submit-answer")
def submit_answer(payload: SubmitAnswerRequest):
    """Submits student answer, evaluates technical depth, and returns next question or finalizes."""
    try:
        result = interview_service.submit_answer_and_progress(
            session_id=payload.session_id,
            student_id=payload.student_id,
            answer_text=payload.answer_text,
            audio_duration_seconds=payload.audio_duration_seconds or 0.0
        )
        return {
            "status": "success",
            "data": result
        }
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate answer: {str(e)}")

@router.post("/complete")
def complete_interview(payload: CompleteInterviewRequest):
    """Forces early completion or finalizes session to generate comprehensive report."""
    try:
        result = interview_service.complete_interview_session(
            session_id=payload.session_id,
            student_id=payload.student_id
        )
        return {
            "status": "success",
            "message": "Interview session completed and evaluated successfully",
            "data": result
        }
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete session: {str(e)}")

@router.get("/history/{student_id}")
def get_student_history(student_id: str):
    """Retrieves all past interview sessions for the authenticated student."""
    try:
        sessions = canonical_store.get_student_interview_sessions(student_id)
        return {
            "status": "success",
            "student_id": student_id,
            "total_interviews": len(sessions),
            "sessions": sessions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch interview history: {str(e)}")

@router.get("/session/{session_id}")
def get_session_detail(session_id: str, student_id: Optional[str] = Query(None)):
    """Retrieves full transcript and diagnostic report for an interview session."""
    session = canonical_store.get_interview_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    
    # Enforce user authorization if student_id is provided
    if student_id and session.get("student_id") != student_id:
        raise HTTPException(status_code=403, detail="Access denied: You cannot view another student's interview session.")

    return {
        "status": "success",
        "session": session
    }
