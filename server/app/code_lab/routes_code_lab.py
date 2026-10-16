from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

try:
    from app.data.aptitude_data import CODING_CHALLENGES
except (ImportError, ValueError):
    CODING_CHALLENGES = []

try:
    from .code_lab_bank import CHALLENGE_BANK, CHALLENGE_MAP
    from .code_auditor import code_auditor
    from .code_lab_engine import code_lab_engine
    from .challenge_pipeline import challenge_pipeline
except (ImportError, ValueError):
    from code_lab_bank import CHALLENGE_BANK, CHALLENGE_MAP
    from code_auditor import code_auditor
    from code_lab_engine import code_lab_engine
    from challenge_pipeline import challenge_pipeline

router = APIRouter(prefix="/api/code-lab", tags=["SkillBridge Code Lab 2.0"])

# -----------------------------------------------------------------------------
# Request & Response Schemas
# -----------------------------------------------------------------------------
class RunCodeRequest(BaseModel):
    challenge_id: str
    source_code: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = "python"

    def get_code(self) -> str:
        return self.source_code or self.code or ""

class AuditASTRequest(BaseModel):
    source_code: Optional[str] = None
    code: Optional[str] = None
    language: Optional[str] = "python"

    def get_code(self) -> str:
        return self.source_code or self.code or ""

class AuditRepoRequest(BaseModel):
    repo_url: str = "https://github.com/dhruv-patil/skillbridge-microservices"

class SelectChallengeRequest(BaseModel):
    student_id: Optional[str] = "std_1"
    mode: Optional[str] = "prove_my_skills"
    target_skill: Optional[str] = None
    challenge_type: Optional[str] = None

class SubmitChallengeRequest(BaseModel):
    challenge_id: str
    student_id: Optional[str] = "std_1"
    source_code: str
    language: Optional[str] = "python"
    mode: Optional[str] = "practice"
    interview_explanation: Optional[str] = None

class RunSqlRequest(BaseModel):
    challenge_id: str
    student_id: Optional[str] = "std_1"
    sql_query: str

# -----------------------------------------------------------------------------
# Code Lab 2.0 Endpoints
# -----------------------------------------------------------------------------

@router.get("/overview")
def get_code_lab_overview(student_id: str = Query("std_1")):
    """
    Returns high-level Code Lab readiness metrics:
    - Overall readiness %
    - Category score breakdown (Problem Solving, DSA, Algorithms, Debugging, Quality, SQL, Security)
    - Strongest skill & biggest gap
    - Missions snapshot
    - Evidence analysis
    """
    analysis = code_lab_engine.analyze_student_skill_evidence(student_id)
    missions = code_lab_engine.get_coding_missions(student_id)
    mistakes = code_lab_engine.get_mistake_intelligence(student_id)
    history = code_lab_engine.submission_history.get(student_id, [])

    # Calculate readiness score
    skill_breakdown = {
        "Problem Solving": 84,
        "DSA": 82,
        "Algorithms": 76,
        "Debugging": 89,
        "Code Quality": 85,
        "Testing": 64,
        "SQL": 78,
        "Security": 60,
        "System Design": 52
    }
    
    # Adjust based on recent submissions if available
    if history:
        avg_score = round(sum(s["composite_score"] for s in history) / len(history), 1)
        skill_breakdown["Problem Solving"] = round((skill_breakdown["Problem Solving"] + avg_score) / 2, 1)

    overall_readiness = round(sum(skill_breakdown.values()) / len(skill_breakdown), 1)

    # Identify strongest and gap
    sorted_skills = sorted(skill_breakdown.items(), key=lambda x: x[1], reverse=True)
    strongest_skill = sorted_skills[0][0]
    biggest_gap = sorted_skills[-1][0]

    # Select recommended validation challenge
    recommended = code_lab_engine.select_personalized_challenge(
        student_id=student_id,
        mode="prove_my_skills"
    )

    return {
        "student_id": student_id,
        "overall_readiness": overall_readiness,
        "skill_breakdown": skill_breakdown,
        "strongest_skill": strongest_skill,
        "biggest_gap": biggest_gap,
        "total_challenges_completed": len(history),
        "evidence_analysis": analysis,
        "recommended_challenge": recommended,
        "missions": missions,
        "mistake_patterns": mistakes.get("patterns_detected", [])
    }

@router.get("/prove-my-skills")
def get_prove_my_skills_analysis(student_id: str = Query("std_1")):
    """
    Evidence analysis intake table:
    Lists detected skills from Resume, GitHub, Projects, and assessments.
    Ranks each as STRONG, MODERATE, WEAK, or UNASSESSED with validation priority.
    """
    return code_lab_engine.analyze_student_skill_evidence(student_id)

@router.post("/select-personalized-challenge")
def select_personalized_challenge(req: SelectChallengeRequest):
    """
    Deterministic challenge selection engine based on:
    SkillRelevance, EvidenceGap, SkillGap, CareerRelevance, and Difficulty.
    """
    return code_lab_engine.select_personalized_challenge(
        student_id=req.student_id or "std_1",
        mode=req.mode or "prove_my_skills",
        target_skill=req.target_skill,
        challenge_type=req.challenge_type
    )

@router.get("/challenges")
def get_challenges(
    challenge_type: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    language: Optional[str] = Query(None)
):
    """
    Returns curated challenge bank with filtering.
    Hidden tests are scrubbed from list/summary view for security.
    """
    results = []
    for ch in CHALLENGE_BANK:
        if challenge_type and ch["challenge_type"].upper() != challenge_type.upper():
            continue
        if skill and not any(s.lower() == skill.lower() for s in ch["skills"]):
            continue
        if difficulty and ch.get("difficulty", "").lower() != difficulty.lower():
            continue
        if language and ch.get("language", "").lower() != language.lower():
            continue

        # Scrub hidden tests for client security
        sanitized = {**ch}
        if "hidden_tests" in sanitized:
            sanitized["hidden_tests_count"] = len(sanitized["hidden_tests"])
            del sanitized["hidden_tests"]
        if "edge_tests" in sanitized:
            sanitized["edge_tests_count"] = len(sanitized["edge_tests"])
            del sanitized["edge_tests"]
        results.append(sanitized)

    return {
        "total": len(results),
        "challenges": results
    }

@router.get("/challenges/{challenge_id}")
def get_single_challenge(challenge_id: str):
    """
    Returns full metadata and visible tests for a challenge.
    Hidden tests remain protected in the backend sandbox.
    """
    ch = CHALLENGE_MAP.get(challenge_id)
    if not ch:
        # Check legacy challenges
        ch = next((c for c in CODING_CHALLENGES if c["id"] == challenge_id), None)
        if not ch:
            raise HTTPException(status_code=404, detail="Challenge not found.")

    sanitized = {**ch}
    if "hidden_tests" in sanitized:
        sanitized["hidden_tests_count"] = len(sanitized["hidden_tests"])
        del sanitized["hidden_tests"]
    if "edge_tests" in sanitized:
        sanitized["edge_tests_count"] = len(sanitized["edge_tests"])
        del sanitized["edge_tests"]

    return sanitized

@router.post("/submit")
def submit_code_challenge(req: SubmitChallengeRequest):
    """
    Executes student submission against complete visible, hidden, and edge test suites.
    Performs AST complexity analysis and multi-dimensional rubric scoring.
    Generates cryptographic SHA-256 proof-of-skill and updates canonical profile.
    """
    return code_lab_engine.execute_and_evaluate_code(
        challenge_id=req.challenge_id,
        student_id=req.student_id or "std_1",
        source_code=req.source_code,
        language=req.language or "python",
        mode=req.mode or "practice",
        interview_explanation=req.interview_explanation
    )

@router.post("/run-sql")
def run_sql_query(req: RunSqlRequest):
    """
    Executes SQL queries against the isolated SQLite relational sandbox.
    """
    return code_lab_engine.execute_sql_challenge(
        challenge_id=req.challenge_id,
        student_id=req.student_id or "std_1",
        sql_query=req.sql_query
    )

@router.post("/ingest-challenge")
def ingest_challenge(challenge_data: Dict[str, Any]):
    """
    Automated Challenge Validation & Ingestion Pipeline (Section 31):
    AI Generation / Contributed Challenge -> Schema Validation ->
    Duplicate Check -> Reference Solution Test -> AST Complexity -> Ingestion.
    """
    res = challenge_pipeline.process_and_ingest(challenge_data)
    if not res.get("valid", True) and not res.get("success", False):
        raise HTTPException(status_code=400, detail=res.get("error", "Challenge validation failed."))
    return res

@router.get("/missions")
def get_missions(student_id: str = Query("std_1")):
    """
    Returns progressive multi-step career coding missions.
    """
    return {
        "missions": code_lab_engine.get_coding_missions(student_id)
    }

@router.get("/mistake-intelligence")
def get_mistake_intelligence(student_id: str = Query("std_1")):
    """
    Returns diagnostic patterns and remediation actions.
    """
    return code_lab_engine.get_mistake_intelligence(student_id)

@router.get("/skill-matrix")
def get_skill_matrix(student_id: str = Query("std_1")):
    """
    Returns unified 7-column Skill Testing Matrix for student.
    """
    return {
        "student_id": student_id,
        "matrix": code_lab_engine.get_skill_testing_matrix(student_id)
    }

# -----------------------------------------------------------------------------
# Legacy Compatibility Endpoints
# -----------------------------------------------------------------------------
@router.post("/run")
def run_code_challenge_legacy(req: RunCodeRequest):
    """
    Preserved for backward compatibility with previous client calls.
    """
    code_text = req.get_code()
    # Check new bank first
    if req.challenge_id in CHALLENGE_MAP:
        return code_lab_engine.execute_and_evaluate_code(
            challenge_id=req.challenge_id,
            student_id="std_1",
            source_code=code_text,
            language=req.language or "python",
            mode="practice"
        )
    
    # Fallback to legacy aptitude challenge list
    challenge = next((c for c in CODING_CHALLENGES if c["id"] == req.challenge_id), CODING_CHALLENGES[0])
    execution_result = code_auditor.execute_challenge(
        challenge_id=req.challenge_id,
        source_code=code_text,
        test_cases=challenge["test_cases"]
    )
    return {
        "challenge_id": req.challenge_id,
        "title": challenge["title"],
        "passed": execution_result.get("all_passed", True),
        "ast_audit": execution_result.get("ast_report", {}),
        **execution_result
    }

@router.post("/audit-ast")
def audit_custom_ast(req: AuditASTRequest):
    code_text = req.get_code()
    return code_auditor.audit_code(code_text, req.language or "python")

@router.post("/audit-repo")
def audit_repo(req: AuditRepoRequest):
    return code_auditor.audit_github_repo(req.repo_url)
