from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import time
import uuid
from app.services.aptitude_service import aptitude_service

router = APIRouter(prefix="/api/aptitude", tags=["Gamified & Standardized Aptitude Arena"])

# Proctoring Event & Attempt Models
class StartAttemptRequest(BaseModel):
    student_id: str = "std_1"
    student_name: str = "Aarav Sharma"
    category: str = "All"
    assessment_mode: Optional[str] = "NORMAL"
    assessment_type: Optional[str] = "NORMAL_APTITUDE"
    allow_resume: Optional[bool] = True

class ProctorEventPayload(BaseModel):
    eventType: str
    severity: str = "WARNING"
    confidence: float = 0.85
    startTime: Optional[float] = None
    endTime: Optional[float] = None
    duration: float = 0.0
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    message: Optional[str] = None

class AptitudeSubmission(BaseModel):
    attempt_id: Optional[str] = None
    student_id: Optional[str] = "std_1"
    category: str = "All"
    answers: List[dict]
    proctoring_summary: Optional[Dict[str, Any]] = None

class PracticeSubmitRequest(BaseModel):
    student_id: str = "std_1"
    question_id: str
    selected_option: int

class TestStartRequest(BaseModel):
    student_id: str = "std_1"
    categories: Optional[List[str]] = None
    duration_minutes: int = 20
    assessment_mode: Optional[str] = "NORMAL"
    assessment_type: Optional[str] = "NORMAL_APTITUDE"
    allow_resume: bool = True

class TestSubmitRequest(BaseModel):
    attempt_id: str
    student_id: str = "std_1"
    answers: List[Dict[str, Any]]
    proctoring_events: Optional[List[Dict[str, Any]]] = None

class GamifiedBatterySubmitRequest(BaseModel):
    student_id: str = "std_1"
    game_metrics: Dict[str, Any]

class AIGenerateBatchRequest(BaseModel):
    category_id: str
    count: int = 10

# 1. OVERVIEW & CATEGORY SUMMARY
@router.get("/overview")
def get_aptitude_overview(student_id: str = Query("std_1")):
    """Returns overview of all 9 aptitude categories with counts, seen questions and metadata."""
    overview = aptitude_service.get_categories_overview(student_id)
    return {
        "status": "success",
        "student_id": student_id,
        "categories": overview
    }

# 2. PRACTICE MODE ENDPOINTS (Repetition allowed for learning)
@router.get("/practice/questions")
def get_practice_questions(
    category_id: str = Query("all"),
    difficulty: Optional[str] = Query("all"),
    limit: int = Query(10)
):
    """Retrieves practice questions with options and step-by-step explanations."""
    questions = aptitude_service.get_practice_questions(category_id, difficulty, limit)
    return {
        "status": "success",
        "category_id": category_id,
        "difficulty": difficulty,
        "count": len(questions),
        "questions": questions
    }

@router.post("/practice/submit")
def submit_practice_answer(req: PracticeSubmitRequest):
    """Submits and evaluates a practice answer with instant explanation feedback."""
    return aptitude_service.submit_practice_answer(req.student_id, req.question_id, req.selected_option)

# 3. TEST MODE ENDPOINTS (Strict Backend No-Repeat Enforcement & Immutable Snapshot)
@router.post("/test/start")
def start_test_mode(req: TestStartRequest):
    """Starts a timed Test attempt. Strictly filters out questions seen in previous TEST attempts."""
    return aptitude_service.start_test_attempt(
        req.student_id,
        "TEST",
        req.categories,
        req.duration_minutes,
        req.assessment_mode or "NORMAL",
        req.assessment_type or "NORMAL_APTITUDE",
        req.allow_resume
    )

@router.get("/attempts/active")
def get_active_attempt(student_id: str = Query("std_1"), assessment_type: str = Query("NORMAL_APTITUDE")):
    """Fetch current active in-progress attempt for a student to restore mode & state across refresh."""
    active = aptitude_service.get_active_attempt(student_id, assessment_type)
    if not active:
        return {"status": "none"}
    client_questions = []
    for qid in active.get("questionIds", []):
        q = next((item for item in aptitude_service.question_bank if item["id"] == qid), None)
        if q:
            client_questions.append({
                "id": q["id"],
                "category_id": q["category_id"],
                "category_name": q["category_name"],
                "topic": q["topic"],
                "difficulty": q["difficulty"],
                "question": q["question"],
                "options": q["options"],
                "visual_asset": q.get("visual_asset")
            })
    return {
        "status": "success",
        "attemptId": active["attemptId"],
        "assessment_mode": active.get("assessment_mode", "NORMAL"),
        "assessment_type": active.get("assessment_type", "NORMAL_APTITUDE"),
        "attemptStatus": active.get("status", "IN_PROGRESS"),
        "violationCount": active.get("violation_count", 0),
        "isDismissed": (active.get("status") == "DISMISSED_FOR_PROCTORING"),
        "dismissalReason": active.get("dismissalReason"),
        "startedAt": active["startedAt"],
        "expiresAt": active["expiresAt"],
        "durationMinutes": active.get("durationMinutes", 20),
        "bankExhaustedWarning": active.get("bankExhaustedWarning", False),
        "questions": client_questions
    }

@router.post("/test/submit")
def submit_test_mode(req: TestSubmitRequest):
    """Submits Test answers. Performs server-side scoring & records test history."""
    return aptitude_service.submit_test_attempt(req.attempt_id, req.student_id, req.answers, req.proctoring_events)

# 4. GAMIFIED COGNITIVE BATTERY ENDPOINT
@router.post("/gamified/battery/submit")
def submit_gamified_battery(req: GamifiedBatterySubmitRequest):
    """Processes raw cognitive metrics across 9 games into standardized 0-100 dimensions."""
    return aptitude_service.process_gamified_battery_results(req.student_id, req.game_metrics)

# 5. AI BATCH GENERATION ENDPOINT
@router.post("/ai/generate-batch")
def generate_ai_question_batch(req: AIGenerateBatchRequest):
    """Triggers background AI batch generation with SHA256 & semantic deduplication."""
    return aptitude_service.generate_ai_question_batch(req.category_id, req.count)

# --- BACKWARD COMPATIBLE SPRINT & PROCTORING ROUTES ---
@router.get("/sprint")
def get_sprint_questions(category: Optional[str] = Query("All")):
    cat_filter = category.lower() if category and category != "All" else "all"
    qs = aptitude_service.get_practice_questions(cat_filter, limit=7)
    sanitized = [
        {
            "id": q["id"],
            "category": q["category_name"],
            "topic": q["topic"],
            "difficulty": q["difficulty"],
            "question": q["question"],
            "options": q["options"],
            "visual_asset": q.get("visual_asset")
        }
        for q in qs
    ]
    return {
        "total": len(sanitized),
        "category": category,
        "questions": sanitized
    }

@router.post("/attempts/start")
def start_attempt(req: StartAttemptRequest):
    res = aptitude_service.start_test_attempt(
        req.student_id,
        "TEST",
        duration_minutes=20,
        assessment_mode=req.assessment_mode or "NORMAL",
        assessment_type=req.assessment_type or "NORMAL_APTITUDE",
        allow_resume=req.allow_resume if req.allow_resume is not None else True
    )
    return {
        "status": "success",
        "attemptId": res["attemptId"],
        "attempt": {
            "attemptId": res["attemptId"],
            "studentId": req.student_id,
            "studentName": req.student_name,
            "category": req.category,
            "assessment_mode": res.get("assessment_mode", "NORMAL"),
            "assessment_type": res.get("assessment_type", "NORMAL_APTITUDE"),
            "startTime": res.get("startedAt", int(time.time())),
            "status": res.get("attemptStatus", "IN_PROGRESS"),
            "events": []
        }
    }

@router.post("/attempts/{attemptId}/proctor-events")
def log_proctor_event(attemptId: str, payload: ProctorEventPayload, student_id: Optional[str] = Query("std_1")):
    evt_dict = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
    return aptitude_service.record_proctoring_event(attemptId, student_id or "std_1", evt_dict)

@router.post("/proctoring/event")
@router.post("/proctoring/events")
def log_proctor_event_alt(payload: Dict[str, Any]):
    attempt_id = payload.get("attemptId") or payload.get("attempt_id")
    student_id = payload.get("studentId") or payload.get("student_id") or "std_1"
    if not attempt_id:
        raise HTTPException(status_code=400, detail="Missing attemptId")
    return aptitude_service.record_proctoring_event(attempt_id, student_id, payload)

@router.get("/attempt/{attemptId}/status")
@router.get("/attempts/{attemptId}/status")
@router.get("/attempts/{attemptId}/proctoring")
def get_attempt_proctoring(attemptId: str):
    attempt = aptitude_service.attempts.get(attemptId, {})
    events = attempt.get("events", [])
    violation_count = attempt.get("violation_count", 0)
    status = attempt.get("status", "IN_PROGRESS")
    return {
        "status": status,
        "attemptId": attemptId,
        "attemptStatus": status,
        "violationCount": violation_count,
        "maxViolations": 3,
        "remainingViolations": max(0, 3 - violation_count),
        "isDismissed": (status == "DISMISSED_FOR_PROCTORING"),
        "riskScore": len(events) * 4,
        "events": events
    }

@router.post("/attempts/{attemptId}/review")
def review_attempt(attemptId: str, payload: Dict[str, Any]):
    decision = payload.get("decision", "APPROVED")
    comment = payload.get("comment", "")
    reviewer = payload.get("reviewer", "Dr. Rajesh Kulkarni")
    attempt = aptitude_service.attempts.get(attemptId)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    attempt["reviewDecision"] = decision
    attempt["reviewComment"] = comment
    attempt["reviewer"] = reviewer
    attempt["reviewedAt"] = int(time.time())
    return {
        "status": "success",
        "attemptId": attemptId,
        "decision": decision,
        "reviewer": reviewer
    }

@router.post("/submit")
def submit_sprint(sub: AptitudeSubmission):
    res = aptitude_service.submit_test_attempt(sub.attempt_id or "att_fallback", sub.student_id or "std_1", sub.answers)
    return {
        "status": "success",
        "attempt_id": sub.attempt_id,
        "total_attempted": res["totalQuestions"],
        "correct_count": res["correctCount"],
        "accuracy_pct": res["accuracyPct"],
        "score_awarded": res["compositeScore"],
        "xp_earned": res["correctCount"] * 50,
        "detailed_results": res["detailedResults"]
    }

@router.get("/attempts")
def list_all_attempts():
    return {
        "total": len(aptitude_service.attempts),
        "attempts": list(aptitude_service.attempts.values())
    }
