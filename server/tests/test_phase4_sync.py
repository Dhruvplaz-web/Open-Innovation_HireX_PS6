import io
import time
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.canonical_store import canonical_store
from app.code_lab.code_lab_engine import code_lab_engine
from app.code_lab.code_lab_bank import CHALLENGE_BANK, CHALLENGE_MAP

client = TestClient(app)

def test_resume_file_extraction_text():
    """Validates /api/resume/extract-pdf extracts text properly and rejects empty files."""
    # 1. Successful text document upload
    file_content = b"John Doe\nSoftware Engineer\nSkills: Python, FastAPI, React, Docker\nExperience: 3 years building AI applications."
    files = {"file": ("resume.txt", io.BytesIO(file_content), "text/plain")}
    res = client.post("/api/resume/extract-pdf", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "John Doe" in data["text"]
    assert "FastAPI" in data["text"]
    assert data["char_count"] == len(data["text"])

    # 2. Empty file upload rejection
    empty_files = {"file": ("empty.txt", io.BytesIO(b""), "text/plain")}
    res_empty = client.post("/api/resume/extract-pdf", files=empty_files)
    assert res_empty.status_code == 400
    assert "empty" in res_empty.json()["detail"].lower()

def test_proctoring_violation_and_audit_synthesis():
    """Validates proctor event recording, canonical persistence, and audit log synthesis with RBAC."""
    test_assessment_id = f"asmt_phase4_audit_{int(time.time())}"
    test_student_id = "std_1"

    # 1. Log a violation through canonical store with event dictionary
    canonical_store.record_proctor_event({
        "eventType": "MULTIPLE_FACES_DETECTED",
        "event_type": "MULTIPLE_FACES_DETECTED",
        "severity": "HIGH",
        "details": "Second individual detected in camera frame",
        "student_id": test_student_id,
        "studentId": test_student_id,
        "assessment_id": test_assessment_id,
        "assessmentAttemptId": test_assessment_id,
        "confidence": 0.92
    })

    # 2. Query audit logs as academician
    res = client.get("/api/assessments/integrity/audit-logs?role=academician")
    assert res.status_code == 200
    audit_data = res.json()
    attempts = audit_data.get("attempts", [])
    assert len(attempts) > 0

    # Ensure synthesized attempt exists
    target = next((a for a in attempts if a.get("assessment_id") == test_assessment_id), None)
    assert target is not None
    assert target.get("student_id") == test_student_id
    assert target.get("total_violations", 0) >= 1
    assert any(e.get("eventType") == "MULTIPLE_FACES_DETECTED" or e.get("event_type") == "MULTIPLE_FACES_DETECTED" for e in target.get("events", []))

    # 3. RBAC validation: Recruiters must be strictly blocked with 403 Forbidden
    recruiter_res = client.get("/api/assessments/integrity/audit-logs?role=recruiter")
    assert recruiter_res.status_code == 403
    assert "forbidden" in recruiter_res.json()["detail"].lower()

def test_code_lab_stubs_integrity():
    """Ensures challenge bank starter code provides clean starter stubs instead of copy-pasted solutions."""
    # Check Two Sum
    two_sum = CHALLENGE_MAP.get("ch_alg_twosum")
    assert two_sum is not None
    assert two_sum["starter_code"].strip().endswith("pass")
    assert "seen =" not in two_sum["starter_code"]

    # Check Valid Parentheses
    valid_parens = CHALLENGE_MAP.get("ch_fund_valid_parentheses")
    assert valid_parens is not None
    assert valid_parens["starter_code"].strip().endswith("pass")
    assert "stack =" not in valid_parens["starter_code"]

    # Check Palindrome
    palindrome = CHALLENGE_MAP.get("ch_fund_palindrome")
    assert palindrome is not None
    assert palindrome["starter_code"].strip().endswith("pass")
    assert "left =" not in palindrome["starter_code"]

def test_code_lab_infinite_loop_timeout_protection():
    """Validates that infinite loop solutions terminate safely within the 3.0s timeout."""
    infinite_loop_code = """
def two_sum(nums, target):
    while True:
        pass
    return []
"""
    t0 = time.time()
    result = code_lab_engine.execute_and_evaluate_code(
        challenge_id="ch_alg_twosum",
        student_id="std_1",
        source_code=infinite_loop_code,
        language="python",
        mode="practice"
    )
    elapsed = time.time() - t0

    # Must timeout in ~3.0 seconds (with process overhead margin < 5.0s)
    assert elapsed < 5.0, f"Execution took too long: {elapsed}s"
    assert result["all_passed"] is False
    assert result["multi_dimensional_scores"]["correctness"] == 0.0
    assert any("TimeoutError" in str(r.get("actual")) for r in result.get("test_results", []))

def test_academician_cohort_year_filtering():
    """Validates bidirectional graduation cohort ('2025') vs academic year ('3rd Year') filtering."""
    headers = {"x-user-role": "academician"}

    # 1. Test /api/academician/students with year '3rd Year'
    res_3rd = client.get("/api/academician/students?year=3rd Year", headers=headers)
    assert res_3rd.status_code == 200
    stds_3rd = res_3rd.json().get("students", [])
    assert len(stds_3rd) > 0

    # 2. Test /api/academician/students with year '2025'
    res_2025 = client.get("/api/academician/students?year=2025", headers=headers)
    assert res_2025.status_code == 200
    stds_2025 = res_2025.json().get("students", [])
    assert len(stds_2025) > 0

    # 3. Test /api/academician/cohort-skill-gaps with year filter
    gaps_res = client.get("/api/academician/cohort-skill-gaps?year=3rd Year", headers=headers)
    assert gaps_res.status_code == 200
    gaps_data = gaps_res.json()
    assert "analysis" in gaps_data
    assert gaps_data["analysis"]["cohort_size"] > 0

    # 4. Test /api/academician/role-gaps with year filter
    role_gaps_res = client.get("/api/academician/role-gaps?year=4th Year", headers=headers)
    assert role_gaps_res.status_code == 200
    role_gaps_data = role_gaps_res.json()
    assert "roles" in role_gaps_data
    assert role_gaps_data.get("cohortSize", 0) > 0
