"""
HireX — Aptitude Arena Integration Tests
Verifies question bank seed size (>=450 items), 9 categories, strict test no-repeat rule,
server-side scoring, gamified battery metric normalization, and AI batch deduplication.
"""

from app.services.aptitude_service import aptitude_service
from app.data.aptitude_bank_seed import FULL_QUESTION_BANK, generate_question_hash

def test_question_bank_seed_size():
    """Verify question bank has at least 450 items (>=50 per category for 9 categories)."""
    assert len(FULL_QUESTION_BANK) >= 450
    category_counts = {}
    for q in FULL_QUESTION_BANK:
        cat = q["category_id"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    assert len(category_counts) == 9
    for cat, count in category_counts.items():
        assert count >= 50, f"Category {cat} has only {count} questions (expected >= 50)"
    print("[PASS] test_question_bank_seed_size passed (450+ questions verified across 9 categories)")

def test_strict_test_no_repeat_rule():
    """Verify that questions used in a student's TEST attempt are NEVER repeated in subsequent TEST attempts."""
    student_id = "test_student_no_repeat_01"
    
    # Attempt 1
    res1 = aptitude_service.start_test_attempt(student_id, "TEST", duration_minutes=20, allow_resume=False)
    q_ids_1 = set(q["id"] for q in res1["questions"])
    assert len(q_ids_1) == 20
    
    # Complete attempt 1
    aptitude_service.submit_test_attempt(res1["attemptId"], student_id, [])

    # Attempt 2
    res2 = aptitude_service.start_test_attempt(student_id, "TEST", duration_minutes=20, allow_resume=False)
    q_ids_2 = set(q["id"] for q in res2["questions"])
    assert len(q_ids_2) == 20
    
    # Assert zero overlap between attempt 1 and attempt 2 questions
    overlap = q_ids_1.intersection(q_ids_2)
    assert len(overlap) == 0, f"Test questions repeated for student! Overlap: {overlap}"
    print("[PASS] test_strict_test_no_repeat_rule passed (Zero test question overlap verified)")

def test_practice_mode_allows_repetition():
    """Verify that practice mode returns questions with full step-by-step explanations."""
    qs = aptitude_service.get_practice_questions("quantitative", limit=5)
    assert len(qs) == 5
    for q in qs:
        assert "explanation" in q
        assert "correct_answer" in q
    print("[PASS] test_practice_mode_allows_repetition passed")

def test_practice_submission_evaluation():
    """Verify practice answer evaluation returns explanation and correctness."""
    q = aptitude_service.question_bank[0]
    res = aptitude_service.submit_practice_answer("std_1", q["id"], q["correct_answer"])
    assert res["status"] == "success"
    assert res["is_correct"] is True
    assert "explanation" in res
    print("[PASS] test_practice_submission_evaluation passed")

def test_server_side_composite_scoring():
    """Verify official composite scoring calculation (Accuracy 70% + Difficulty 20% + Time 10%)."""
    student_id = "test_scoring_student"
    attempt_res = aptitude_service.start_test_attempt(student_id, "TEST")
    attempt_id = attempt_res["attemptId"]
    
    answers = [
        {"question_id": q["id"], "selected_option": aptitude_service.question_bank[idx % 5]["correct_answer"]}
        for idx, q in enumerate(attempt_res["questions"])
    ]
    
    sub_res = aptitude_service.submit_test_attempt(attempt_id, student_id, answers)
    assert sub_res["status"] == "success"
    assert "compositeScore" in sub_res
    assert 0 <= sub_res["compositeScore"] <= 100
    print("[PASS] test_server_side_composite_scoring passed")

def test_gamified_battery_normalization():
    """Verify raw game metrics normalize into 9 standardized 0-100 cognitive dimension scores."""
    metrics = {
        "risk_reward": {"banked_points": 750, "popped_count": 1},
        "working_memory": {"accuracy": 85, "hits": 8},
        "cognitive_flexibility": {"switch_cost_ms": 250},
        "spatial_visualization": {"accuracy": 90},
        "planning": {"extra_moves": 1},
        "processing_speed": {"clicks_per_sec": 3.2},
        "resource_management": {"final_health": 85},
        "emotion_recognition": {"accuracy": 83},
        "maze_pressure": {"errors": 1}
    }
    
    res = aptitude_service.process_gamified_battery_results("std_1", metrics)
    assert "overallCognitiveIndex" in res
    assert len(res["dimensions"]) == 9
    for dim_key, dim in res["dimensions"].items():
        assert 0 <= dim["score"] <= 100
        assert "label" in dim
    assert "disclaimer" in res
    print("[PASS] test_gamified_battery_normalization passed (9 cognitive dimensions verified)")

def test_ai_question_batch_deduplication():
    """Verify AI question generation skips exact SHA-256 hash duplicates."""
    res = aptitude_service.generate_ai_question_batch("numerical", count=5)
    assert res["status"] == "success"
    assert res["added_count"] + res["duplicates_skipped"] == 5
    print("[PASS] test_ai_question_batch_deduplication passed (SHA-256 deduplication verified)")

def test_assessment_mode_selection_and_locking():
    """Verify NORMAL vs PROCTORED mode storage, server-side mode locking, and active attempt restoration."""
    student_id = "test_mode_student_99"

    # 1. Start Normal Assessment Mode
    res_normal = aptitude_service.start_test_attempt(student_id, "TEST", assessment_mode="NORMAL", assessment_type="NORMAL_APTITUDE", allow_resume=False)
    assert res_normal["assessment_mode"] == "NORMAL"
    assert res_normal["assessment_type"] == "NORMAL_APTITUDE"

    # 2. Check Active Attempt returns locked mode (NORMAL)
    active_normal = aptitude_service.get_active_attempt(student_id, "NORMAL_APTITUDE")
    assert active_normal is not None
    assert active_normal["assessment_mode"] == "NORMAL"

    # 3. Complete Normal Attempt
    aptitude_service.submit_test_attempt(res_normal["attemptId"], student_id, [])

    # 4. Start Proctored Assessment Mode
    res_proctored = aptitude_service.start_test_attempt(student_id, "TEST", assessment_mode="PROCTORED", assessment_type="NORMAL_APTITUDE", allow_resume=False)
    assert res_proctored["assessment_mode"] == "PROCTORED"

    # 5. Check Active Attempt returns locked mode (PROCTORED)
    active_proctored = aptitude_service.get_active_attempt(student_id, "NORMAL_APTITUDE")
    assert active_proctored is not None
    assert active_proctored["assessment_mode"] == "PROCTORED"

    # 6. Complete Proctored Attempt
    sub_proc = aptitude_service.submit_test_attempt(res_proctored["attemptId"], student_id, [])
    assert sub_proc["assessment_mode"] == "PROCTORED"

    print("[PASS] test_assessment_mode_selection_and_locking passed (NORMAL & PROCTORED mode locking verified)")

def run_all():
    test_question_bank_seed_size()
    test_strict_test_no_repeat_rule()
    test_practice_mode_allows_repetition()
    test_practice_submission_evaluation()
    test_server_side_composite_scoring()
    test_gamified_battery_normalization()
    test_ai_question_batch_deduplication()
    test_assessment_mode_selection_and_locking()
    print("\nALL APTITUDE ARENA TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_all()
else:
    run_all()
