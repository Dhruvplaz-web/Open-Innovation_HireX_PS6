import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient

# Ensure app is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app.main import app
from app.routes.assessments import PROCTORING_CONFIG

client = TestClient(app)

def run_tests():
    print("============================================================")
    print("SKILLBRIDGE PROCTORED ASSESSMENT UPGRADE — TEST MATRIX")
    print("============================================================")

    # TEST 1: Proctoring Config Authoritative Retrieval
    print("\n--- TEST: Proctoring Config Retrieval ---")
    res = client.get("/api/assessments/proctoring-config")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    cfg = data.get("config", data)
    assert cfg["maxTabSwitches"] == PROCTORING_CONFIG["maxTabSwitches"]
    assert cfg["maxFullscreenExits"] == PROCTORING_CONFIG["maxFullscreenExits"]
    print(f"✓ Authoritative Config Verified: maxTabSwitches={cfg['maxTabSwitches']}, maxFullscreenExits={cfg['maxFullscreenExits']}, gracePeriod={cfg['gracePeriodSeconds']}s")

    # TEST 2 & 12: Generate Assessment & Single Active Attempt Prevention
    print("\n--- TEST: Single Active Attempt Enforcement ---")
    test_student = "std_proctor_matrix_1"
    gen_payload = {
        "student_id": test_student,
        "skills": ["Python", "React", "FastAPI"],
        "questions_per_skill": 3,
        "time_limit_minutes": 15
    }
    res_gen = client.post("/api/assessments/generate", json=gen_payload)
    assert res_gen.status_code == 200
    gen_data = res_gen.json()
    assessment_id = gen_data["assessment_id"]
    assert gen_data["proctoring_status"] == "SYSTEM_CHECK"
    assert len(gen_data["sections"]) == 3
    print(f"✓ Attempt Created: {assessment_id}, proctoringStatus={gen_data['proctoring_status']}")

    # Second generation attempt with same student must be prevented / linked
    res_gen2 = client.post("/api/assessments/generate", json=gen_payload)
    assert res_gen2.status_code == 409 or (res_gen2.status_code == 200 and (res_gen2.json().get("resumed_existing_session") or res_gen2.json().get("existing_active_attempt"))), f"Expected conflict or existing attempt, got {res_gen2.status_code}: {res_gen2.text}"
    print(f"✓ Concurrent Active Attempt Blocked / Linked for student {test_student}")

    # TEST 3: System Check Failure on Missing Permissions
    print("\n--- TEST: Pre-Assessment System Check Permission Gating ---")
    bad_check_payload = {
        "assessment_id": assessment_id,
        "student_id": test_student,
        "camera_ready": False,
        "microphone_ready": True,
        "fullscreen_ready": True,
        "network_ready": True,
        "consent_given": True
    }
    res_bad_sys = client.post("/api/assessments/system-check-verify", json=bad_check_payload)
    assert res_bad_sys.status_code == 400
    assert "Camera" in res_bad_sys.json()["detail"]
    print(f"✓ Blocked start when Camera denied: {res_bad_sys.json()['detail']}")

    # System Check Pass when all device checks & consent verified
    good_check_payload = {
        "assessment_id": assessment_id,
        "student_id": test_student,
        "camera_ready": True,
        "microphone_ready": True,
        "fullscreen_ready": True,
        "network_ready": True,
        "consent_given": True
    }
    res_good_sys = client.post("/api/assessments/system-check-verify", json=good_check_payload)
    assert res_good_sys.status_code == 200
    assert res_good_sys.json()["proctoring_status"] == "READY"
    print("✓ System Check Passed: Camera, Mic, Fullscreen, Network & Consent validated")

    # TEST 4: Start Assessment & Server Timer Initialization
    print("\n--- TEST: Server-Controlled Timer & Attempt Start ---")
    start_payload = {
        "assessment_id": assessment_id,
        "student_id": test_student
    }
    res_start = client.post("/api/assessments/start", json=start_payload)
    assert res_start.status_code == 200
    start_data = res_start.json()
    assert start_data["proctoring_status"] == "IN_PROGRESS"
    assert "started_at" in start_data and "expires_at" in start_data
    print(f"✓ Assessment Started: status={start_data['proctoring_status']}, expires_at={start_data['expires_at']}")

    # Session Status Check
    res_sess = client.get(f"/api/assessments/session/{assessment_id}?student_id={test_student}")
    assert res_sess.status_code == 200
    sess_data = res_sess.json()
    assert sess_data["is_active"] is True
    assert sess_data["remaining_seconds"] > 0
    print(f"✓ Server Session Clock Validated: {sess_data['remaining_seconds']}s remaining")

    # TEST 5: Autosave Answers
    print("\n--- TEST: Answer Autosave ---")
    save_payload = {
        "assessment_id": assessment_id,
        "student_id": test_student,
        "answers": {
            "Python": [0, 0, 1],
            "React": [0, 1, 0],
            "FastAPI": [0, 0, 0]
        },
        "time_spent_seconds": 120
    }
    res_save = client.post("/api/assessments/save-progress", json=save_payload)
    assert res_save.status_code == 200
    print(f"✓ Progressive Autosave Succeeded: {res_save.json()['message']}")

    # TEST 6 & 7: Violation Logging & Disqualification Policy (Tab Switches)
    print("\n--- TEST: Tab-Switch Violation Escalation & Disqualification ---")
    # 1st tab switch -> WARNING
    v1_payload = {
        "assessment_id": assessment_id,
        "student_id": test_student,
        "event_type": "TAB_SWITCH",
        "severity": "WARNING",
        "details": "User switched away to another application tab",
        "action_taken": "WARNING"
    }
    res_v1 = client.post("/api/assessments/log-violation", json=v1_payload)
    assert res_v1.status_code == 200
    assert res_v1.json()["is_disqualified"] is False
    assert res_v1.json()["action_taken"] == "WARNING"
    print(f"✓ Tab Switch Violation #1: {res_v1.json()['action_taken']} issued (threshold not exceeded)")

    # 2nd tab switch -> Exceeds maxTabSwitches=1 -> DISQUALIFIED
    v2_payload = {
        "assessment_id": assessment_id,
        "student_id": test_student,
        "event_type": "TAB_SWITCH",
        "severity": "HIGH",
        "details": "Second tab switch recorded",
        "action_taken": "DISQUALIFIED"
    }
    res_v2 = client.post("/api/assessments/log-violation", json=v2_payload)
    assert res_v2.status_code == 200
    assert res_v2.json()["is_disqualified"] is True
    assert res_v2.json()["proctoring_status"] == "DISQUALIFIED"
    assert "tab-switch" in res_v2.json()["disqualification_reason"].lower()
    print(f"✓ Tab Switch Violation #2: Candidate DISQUALIFIED -> {res_v2.json()['disqualification_reason']}")

    # TEST 8: Rejection of Autosave After Disqualification
    print("\n--- TEST: Rejection of Submissions Post-Disqualification ---")
    res_save_blocked = client.post("/api/assessments/save-progress", json=save_payload)
    assert res_save_blocked.status_code == 403, f"Expected 403, got {res_save_blocked.status_code}"
    print(f"✓ Answer Autosave Rejected post-disqualification: HTTP 403 {res_save_blocked.json()['detail']}")

    # TEST 9: Disqualified Multi-Section Final Submission Nullifies Score
    print("\n--- TEST: Disqualified Final Submission & Skill Nullification ---")
    sub_payload = {
        "assessment_id": assessment_id,
        "student_id": test_student,
        "answers": {
            "Python": [0, 0, 1],
            "React": [0, 1, 0],
            "FastAPI": [0, 0, 0]
        },
        "practical_code_score": 85.0
    }
    res_sub_disq = client.post("/api/assessments/submit-multisection", json=sub_payload)
    assert res_sub_disq.status_code == 200
    disq_data = res_sub_disq.json()
    assert disq_data["valid_score_available"] is False
    assert disq_data["proctoring_status"] == "DISQUALIFIED"
    assert disq_data["overall_score"] is None or disq_data["overall_score"] == 0
    print(f"✓ Disqualified Assessment Submission Handled: valid_score_available={disq_data['valid_score_available']}, reason={disq_data['disqualification_reason']}")

    # TEST 10: Clean Assessment Run with Scoring & Recommendations
    print("\n--- TEST: Valid Clean Assessment Run & ML Scoring Pipeline ---")
    clean_student = "std_proctor_clean_99"
    res_clean_gen = client.post("/api/assessments/generate", json={
        "student_id": clean_student,
        "skills": ["Python", "SQL"],
        "questions_per_skill": 3,
        "time_limit_minutes": 10
    })
    clean_assmt_id = res_clean_gen.json()["assessment_id"]
    
    # System check & start
    client.post("/api/assessments/system-check-verify", json={
        "assessment_id": clean_assmt_id,
        "student_id": clean_student,
        "camera_ready": True,
        "microphone_ready": True,
        "fullscreen_ready": True,
        "network_ready": True,
        "consent_given": True
    })
    client.post("/api/assessments/start", json={
        "assessment_id": clean_assmt_id,
        "student_id": clean_student
    })

    # Submit clean
    clean_sub_res = client.post("/api/assessments/submit-multisection", json={
        "assessment_id": clean_assmt_id,
        "student_id": clean_student,
        "answers": {
            "Python": [0, 0, 1],
            "SQL": [0, 0, 1]
        },
        "practical_code_score": 90.0
    })
    assert clean_sub_res.status_code == 200
    clean_data = clean_sub_res.json()
    assert clean_data["valid_score_available"] is True
    assert clean_data["proctoring_status"] == "COMPLETED"
    assert clean_data["overall_score"] > 0
    assert len(clean_data["donut_chart_data"]) == 2
    assert len(clean_data["section_breakdowns"]) == 2
    print(f"✓ Clean Assessment Scored: overall_score={clean_data['overall_score']}%, proctoring_status={clean_data['proctoring_status']}")
    print(f"  Sections: {[s['skill'] for s in clean_data['section_breakdowns']]}")
    print(f"  Verified skills: {[s['skill'] for s in clean_data.get('strong_skills', [])]}")

    # TEST 11: Admin Audit Logs Visibility (Requirement 26)
    print("\n--- TEST: Admin Audit Logs Visibility ---")
    res_audit = client.get("/api/assessments/audit-logs")
    assert res_audit.status_code == 200
    audit_data = res_audit.json()
    assert "attempts" in audit_data and "events" in audit_data
    attempts = audit_data["attempts"]
    disq_attempt = next((a for a in attempts if a["student_id"] == test_student), None)
    clean_attempt = next((a for a in attempts if a["student_id"] == clean_student), None)
    assert disq_attempt is not None, "Disqualified attempt must be visible in audit logs"
    assert disq_attempt["proctoring_status"] == "DISQUALIFIED"
    assert clean_attempt is not None, "Clean attempt must be visible in audit logs"
    assert clean_attempt["proctoring_status"] == "COMPLETED"
    print(f"✓ Admin Audit Logs Verified: Found {len(attempts)} attempts and {len(audit_data['events'])} events.")
    print(f"  Student {test_student}: Proctoring={disq_attempt['proctoring_status']}, Violations={disq_attempt['violations_count']}, Reason='{disq_attempt['disqualification_reason']}'")
    print(f"  Student {clean_student}: Proctoring={clean_attempt['proctoring_status']}, Score={clean_attempt['score']}%")

    print("\n============================================================")
    print("ALL PROCTORED ASSESSMENT UPGRADE MATRIX TESTS PASSED (100%)")
    print("============================================================")

if __name__ == "__main__":
    run_tests()
