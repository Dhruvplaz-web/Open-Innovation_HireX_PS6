import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.db.canonical_store import canonical_store

client = TestClient(app)

def test_cross_role_application_sync():
    student_id = f"test_sync_std_{uuid.uuid4().hex[:6]}"
    opp_id = "opp_1"

    # Step 1: Ensure clean state
    # Fetch opportunities for this student - has_applied should be False
    res = client.get(f"/api/student/opportunities?student_id={student_id}")
    assert res.status_code == 200
    opps = res.json()
    target_opp = next((o for o in opps if o["id"] == opp_id), None)
    assert target_opp is not None
    assert target_opp.get("has_applied") is False

    # Step 2: Apply to opportunity
    apply_payload = {
        "student_id": student_id,
        "opportunity_id": opp_id
    }
    apply_res = client.post("/api/student/apply", json=apply_payload)
    assert apply_res.status_code == 200
    app_data = apply_res.json()
    assert app_data["status"] == "success"

    # Step 3: Verify duplicate application is rejected
    dup_res = client.post("/api/student/apply", json=apply_payload)
    assert dup_res.status_code == 400
    assert "already applied" in dup_res.json()["detail"].lower()

    # Step 4: Verify has_applied is now True on /api/student/opportunities
    res2 = client.get(f"/api/student/opportunities?student_id={student_id}")
    assert res2.status_code == 200
    opps2 = res2.json()
    target_opp2 = next((o for o in opps2 if o["id"] == opp_id), None)
    assert target_opp2 is not None
    assert target_opp2.get("has_applied") is True

    # Step 5: Verify Recruiter sees this applicant
    recruiter_res = client.get("/api/recruiter/applicants", headers={"x-user-role": "recruiter"})
    assert recruiter_res.status_code == 200
    applicants = recruiter_res.json().get("applicants", [])
    matching_app = next((a for a in applicants if a.get("student_id") == student_id and a.get("opportunity_id") == opp_id), None)
    assert matching_app is not None

def test_recruiter_invitation_sync():
    # Find an uninvited candidate in the talent pool
    pool_res = client.get("/api/recruiter/incognito-talents", headers={"x-user-role": "recruiter"})
    assert pool_res.status_code == 200
    data = pool_res.json()
    talents = data.get("talents", [])
    assert len(talents) > 0
    target_talent = next((t for t in talents if not t.get("is_invited") and t.get("invitation_status") not in ("INVITED", "PENDING")), None)
    if not target_talent:
        # Pick the first one if all are invited, but choose a different opportunity
        target_talent = talents[0]
        opp_id = "opp_2"
    else:
        opp_id = "opp_1"

    talent_id = target_talent["talent_id"]

    # Send invitation
    invite_payload = {
        "talent_id": talent_id,
        "opportunity_id": opp_id,
        "message": "We invite you to interview for our opening."
    }
    invite_res = client.post("/api/recruiter/talent-invitations", json=invite_payload, headers={"x-user-role": "recruiter"})
    assert invite_res.status_code == 200
    assert invite_res.json()["status"] == "success"

    # Re-fetch incognito pool for that opportunity - the talent should now show INVITED or PENDING status
    pool_res2 = client.get(f"/api/recruiter/incognito-talents?opportunity_id={opp_id}", headers={"x-user-role": "recruiter"})
    assert pool_res2.status_code == 200
    talents2 = pool_res2.json().get("talents", [])
    cand = next((c for c in talents2 if c.get("talent_id") == talent_id), None)
    if cand:
        assert cand.get("invitation_status") in ("INVITED", "PENDING") or cand.get("is_invited") is True

def test_academician_applied_for_what():
    res = client.get("/api/academician/students", headers={"x-user-role": "academician"})
    assert res.status_code == 200
    data = res.json()
    assert "students" in data
    students = data["students"]
    assert len(students) > 0
    # Every student must have an applied_for_what field
    for s in students[:20]:
        assert "applied_for_what" in s
        assert isinstance(s["applied_for_what"], str)
