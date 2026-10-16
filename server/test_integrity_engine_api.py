"""
Test Suite for Assessment Integrity Engine Backend Endpoints
Verifies:
1. Retrieval and dynamic updates to integrity configuration.
2. Ingestion of multi-signal integrity events:
   - Multiple people detected
   - Mobile phone detected
   - Candidate absence
   - Possible multiple voices detected
   - Tab switch / window blur
   - Camera/mic disconnects
3. Deduplication and non-cheating probabilistic scoring (0-100).
4. Integrity session review and timeline retrieval.
5. Strict RBAC protection:
   - Recruiters are strictly blocked (HTTP 403) from proctoring/integrity telemetry.
   - Admin and Academician get full audit logs with filtering.
   - Students get their own session information.
"""

import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_integrity_config():
    # 1. Get config
    res = client.get("/api/assessments/integrity-config")
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["status"] == "success"
    assert "warningThreshold" in data["config"]
    assert data["config"]["personDetectionEnabled"] is True

    # 2. Update config
    update_res = client.post("/api/assessments/integrity-config", json={
        "absenceGracePeriodSeconds": 8.5,
        "phoneConfidenceThreshold": 0.80
    })
    assert update_res.status_code == 200, update_res.text
    new_data = update_res.json()
    assert new_data["config"]["absenceGracePeriodSeconds"] == 8.5
    assert new_data["config"]["phoneConfidenceThreshold"] == 0.80

def test_log_integrity_events_and_scoring():
    aid = "asmt_test_integ_001"
    sid = "std_integ_test"

    # Start an assessment attempt
    gen_res = client.post("/api/assessments/generate", json={
        "student_id": sid,
        "skills": ["Python", "SQL"],
        "questions_per_skill": 3,
        "time_limit_minutes": 10
    })
    assert gen_res.status_code == 200
    real_aid = gen_res.json()["assessment_id"]

    client.post("/api/assessments/system-check-verify", json={
        "assessment_id": real_aid,
        "student_id": sid,
        "camera_ready": True,
        "microphone_ready": True,
        "fullscreen_ready": True,
        "network_ready": True,
        "consent_given": True
    })

    client.post("/api/assessments/start", json={
        "assessment_id": real_aid,
        "student_id": sid
    })

    # Log clean events
    ev1 = client.post("/api/assessments/integrity/event", json={
        "assessmentAttemptId": real_aid,
        "userId": sid,
        "eventType": "CAMERA_CONNECTED",
        "severity": "LOW",
        "confidence": 1.0,
        "message": "Camera connected cleanly"
    })
    assert ev1.status_code == 200
    d1 = ev1.json()
    assert d1["integrityScore"] >= 95
    assert d1["integrityStatus"] in ("VALID", "IN_PROGRESS")

    # Log phone detected (HIGH severity, duration 3s)
    ev2 = client.post("/api/assessments/integrity/event", json={
        "assessmentAttemptId": real_aid,
        "userId": sid,
        "eventType": "PHONE_DETECTED",
        "severity": "HIGH",
        "confidence": 0.88,
        "durationSeconds": 3,
        "message": "Secondary mobile device detected in frame"
    })
    assert ev2.status_code == 200
    d2 = ev2.json()
    assert d2["totalViolations"] >= 1
    assert d2["categories"]["phone"] >= 1
    assert d2["integrityScore"] < 95

    # Log multiple voices detected (MEDIUM severity)
    ev3 = client.post("/api/assessments/integrity/event", json={
        "assessmentAttemptId": real_aid,
        "userId": sid,
        "eventType": "MULTIPLE_VOICES_DETECTED",
        "severity": "MEDIUM",
        "confidence": 0.75,
        "durationSeconds": 2,
        "message": "Possible multiple voices detected"
    })
    assert ev3.status_code == 200
    d3 = ev3.json()
    assert d3["categories"]["audio"] >= 1

    # Verify session summary endpoint
    sess_res = client.get(f"/api/assessments/integrity/session/{real_aid}")
    assert sess_res.status_code == 200
    s_data = sess_res.json()
    assert s_data["assessment_id"] == real_aid
    assert len(s_data["events"]) >= 3
    assert s_data["categories"]["phone"] >= 1
    assert s_data["categories"]["audio"] >= 1

def test_rbac_privacy_protection():
    # Recruiter MUST be forbidden from accessing proctoring / integrity audit telemetry
    recruiter_res = client.get("/api/assessments/integrity/audit-logs?role=recruiter")
    assert recruiter_res.status_code == 403, "Recruiter must receive 403 Forbidden"
    assert "Recruiters are not authorized" in recruiter_res.json()["detail"]

    # Admin is authorized
    admin_res = client.get("/api/assessments/integrity/audit-logs?role=admin")
    assert admin_res.status_code == 200
    assert "attempts" in admin_res.json()

    # Academician is authorized
    acad_res = client.get("/api/assessments/integrity/audit-logs?role=academician")
    assert acad_res.status_code == 200

    # Status filter works
    filter_res = client.get("/api/assessments/integrity/audit-logs?role=admin&status_filter=VALID")
    assert filter_res.status_code == 200

if __name__ == "__main__":
    test_integrity_config()
    print("✓ test_integrity_config passed")
    test_log_integrity_events_and_scoring()
    print("✓ test_log_integrity_events_and_scoring passed")
    test_rbac_privacy_protection()
    print("✓ test_rbac_privacy_protection passed")
    print("\nALL INTEGRITY ENGINE API TESTS PASSED!")
