from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
from app.data.aptitude_data import APTITUDE_QUESTIONS

router = APIRouter(prefix="/api/aptitude", tags=["Gamified Aptitude Arena"])

class AptitudeSubmission(BaseModel):
    category: str = "All"
    answers: List[dict]  # [{"question_id": "q_1", "selected_option": 1}]

@router.get("/sprint")
def get_sprint_questions(category: Optional[str] = Query("All")):
    if category and category != "All":
        filtered = [q for q in APTITUDE_QUESTIONS if q["category"].lower() == category.lower()]
    else:
        filtered = APTITUDE_QUESTIONS

    # Return questions with sanitized answer key
    sanitized = [
        {
            "id": q["id"],
            "category": q["category"],
            "topic": q["topic"],
            "difficulty": q["difficulty"],
            "question": q["question"],
            "options": q["options"]
        }
        for q in filtered
    ]
    return {
        "total": len(sanitized),
        "category": category,
        "questions": sanitized
    }

@router.post("/submit")
def submit_sprint(sub: AptitudeSubmission):
    results = []
    correct_count = 0

    for ans in sub.answers:
        qid = ans.get("question_id")
        selected = ans.get("selected_option")
        q = next((item for item in APTITUDE_QUESTIONS if item["id"] == qid), None)
        if q:
            is_correct = (selected == q["correct"])
            if is_correct:
                correct_count += 1
            results.append({
                "id": qid,
                "question": q["question"],
                "selected": selected,
                "correct": q["correct"],
                "is_correct": is_correct,
                "explanation": q["explanation"]
            })

    total = len(sub.answers) if len(sub.answers) > 0 else 1
    accuracy_pct = round((correct_count / total) * 100.0, 1)
    xp_earned = correct_count * 50

    return {
        "status": "success",
        "total_attempted": len(sub.answers),
        "correct_count": correct_count,
        "accuracy_pct": accuracy_pct,
        "xp_earned": xp_earned,
        "streak_bonus": "🔥 3x Streak Active",
        "detailed_results": results
    }
