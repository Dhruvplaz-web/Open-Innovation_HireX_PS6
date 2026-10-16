import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import pytest
try:
    from backend.code_lab_engine import code_lab_engine
    from backend.code_lab_bank import CHALLENGE_BANK, CHALLENGE_MAP
except ImportError:
    from code_lab_engine import code_lab_engine
    from code_lab_bank import CHALLENGE_BANK, CHALLENGE_MAP

def test_challenge_bank_integrity():
    assert len(CHALLENGE_BANK) >= 8
    # Ensure all primary challenge types are represented
    types = {c["challenge_type"] for c in CHALLENGE_BANK}
    assert "STANDARD_CODING" in types
    assert "DEBUGGING" in types
    assert "OPTIMIZATION" in types
    assert "CODE_REVIEW" in types
    assert "SQL" in types
    assert "PROJECT" in types
    assert "INTERVIEW" in types

    for ch in CHALLENGE_BANK:
        assert "id" in ch
        assert "title" in ch
        assert "skills" in ch
        assert len(ch["skills"]) > 0
        assert "visible_tests" in ch
        assert len(ch["visible_tests"]) > 0

def test_analyze_student_skill_evidence():
    analysis = code_lab_engine.analyze_student_skill_evidence("std_1")
    assert analysis["student_id"] == "std_1"
    assert "target_career" in analysis
    assert len(analysis["skills"]) > 0
    assert analysis["strongly_supported_count"] >= 0
    assert analysis["requires_validation_count"] >= 0

    # Ensure evidence classifications are strict
    for sk in analysis["skills"]:
        assert sk["evidence_strength"] in ["STRONG", "MODERATE", "WEAK", "UNASSESSED"]
        assert "validation_priority" in sk
        assert "sources" in sk

def test_select_personalized_challenge():
    # Test deterministic recommendation
    sel = code_lab_engine.select_personalized_challenge(
        student_id="std_1",
        mode="prove_my_skills"
    )
    assert "selected_challenge" in sel
    assert "recommendation_score" in sel
    assert "reason" in sel
    assert sel["recommendation_score"] > 0
    assert len(sel["reason"]) > 10

    # Test mode filtering
    debug_sel = code_lab_engine.select_personalized_challenge(
        student_id="std_1",
        mode="debugging"
    )
    assert debug_sel["selected_challenge"]["challenge_type"] == "DEBUGGING"

    # Test SQL lab selection
    sql_sel = code_lab_engine.select_personalized_challenge(
        student_id="std_1",
        mode="sql"
    )
    assert sql_sel["selected_challenge"]["challenge_type"] == "SQL"

def test_execute_and_evaluate_code_success():
    # Two sum challenge
    solution = """
def two_sum(nums, target):
    lookup = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in lookup:
            return [lookup[diff], i]
        lookup[num] = i
    return []
"""
    result = code_lab_engine.execute_and_evaluate_code(
        challenge_id="ch_alg_twosum",
        student_id="std_1",
        source_code=solution,
        language="python",
        mode="prove_my_skills"
    )

    assert result["all_passed"] is True
    assert result["composite_score"] >= 85.0
    assert result["sha256_proof"] is not None
    assert len(result["sha256_proof"]) == 64
    assert result["multi_dimensional_scores"]["correctness"] == 100.0
    assert result["multi_dimensional_scores"]["efficiency"] >= 80.0
    assert "ast_report" in result

def test_execute_and_evaluate_code_failure():
    # Broken solution
    solution = """
def two_sum(nums, target):
    return [0, 0]
"""
    result = code_lab_engine.execute_and_evaluate_code(
        challenge_id="ch_alg_twosum",
        student_id="std_1",
        source_code=solution,
        language="python",
        mode="practice"
    )

    assert result["all_passed"] is False
    assert result["composite_score"] < 50.0

def test_execute_sql_challenge():
    query = """
    SELECT s.name, s.verified_score, d.name AS dept_name
    FROM students s
    JOIN departments d ON s.department_id = d.id
    WHERE s.verified_score >= 85
    ORDER BY s.verified_score DESC;
    """
    res = code_lab_engine.execute_sql_challenge(
        challenge_id="ch_sql_window_placement",
        student_id="std_1",
        sql_query=query
    )
    assert res["success"] is True
    assert res["passed"] is True
    assert res["row_count"] >= 3
    assert len(res["columns"]) == 3

def test_mistake_intelligence_and_missions():
    mistakes = code_lab_engine.get_mistake_intelligence("std_1")
    assert "patterns_detected" in mistakes

    missions = code_lab_engine.get_coding_missions("std_1")
    assert len(missions) >= 2
    assert "steps" in missions[0]
    assert "progress_pct" in missions[0]

def test_skill_testing_matrix():
    matrix = code_lab_engine.get_skill_testing_matrix("std_1")
    assert len(matrix) >= 5
    for row in matrix:
        assert "skill" in row
        assert "resume_claim" in row
        assert "evidence_strength" in row
        assert row["evidence_strength"] in ["STRONG", "MODERATE", "WEAK", "UNASSESSED"]

def test_sandbox_security_rejection():
    # Attempt to import os or subprocess
    malicious_code = """
import os
def two_sum(nums, target):
    os.listdir('.')
    return [0, 1]
"""
    res = code_lab_engine.execute_and_evaluate_code(
        challenge_id="ch_alg_twosum",
        student_id="std_1",
        source_code=malicious_code,
        language="python"
    )
    assert res["status"] == "FAILED"
    assert "Security Sandbox Rejection" in res["message"]
    assert res["all_passed"] is False

def test_challenge_pipeline_validation_and_duplicate():
    try:
        from backend.challenge_pipeline import challenge_pipeline
    except ImportError:
        from challenge_pipeline import challenge_pipeline

    candidate = {
        "id": "ch_auto_test_unique_1",
        "title": "Reverse Words in a String",
        "challenge_type": "STANDARD_CODING",
        "language": "python",
        "skills": ["Python", "Algorithms"],
        "difficulty": "Beginner",
        "description": "Reverse words in a given string sentence in O(N) time.",
        "starter_code": "def reverse_words(s: str) -> str:\n    return ' '.join(reversed(s.split()))",
        "reference_solution": "def reverse_words(s: str) -> str:\n    return ' '.join(reversed(s.split()))",
        "visible_tests": [
            {"input": "s = 'the sky is blue'", "expected": "blue is sky the"}
        ],
        "hidden_tests": [
            {"input": "s = '  hello world  '", "expected": "world hello"}
        ]
    }

    # First ingestion must succeed
    res = challenge_pipeline.process_and_ingest(candidate)
    assert res["success"] is True
    assert res["challenge_id"] == "ch_auto_test_unique_1"

    # Second duplicate attempt must be caught
    dup_res = challenge_pipeline.process_and_ingest(candidate)
    assert dup_res["valid"] is False
    assert dup_res["stage"] == "DUPLICATE_DETECTION"

def test_expanded_bank_volume():
    assert len(CHALLENGE_BANK) >= 15
    types = {c["challenge_type"] for c in CHALLENGE_BANK}
    assert len(types) >= 7

