import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_alumni_profile_and_dashboard():
    # 1. Get default alumni profile (Vikram Aditya)
    res = client.get("/api/alumni/profile?alumni_id=alm_1")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    profile = data["profile"]
    assert profile["name"] == "Vikram Aditya"
    assert profile["current_company"] == "Google"
    assert profile["is_verified_alumni"] is True

    # 2. Get alumni dashboard
    res_dash = client.get("/api/alumni/dashboard?alumni_id=alm_1")
    assert res_dash.status_code == 200
    dash = res_dash.json()["dashboard"]
    assert "stats" in dash
    assert dash["stats"]["impact_score"] >= 400
    assert len(dash["college_announcements"]) >= 1

def test_alumni_profile_update():
    update_payload = {
        "bio": "Updated Staff Software Engineer bio mentoring JSPM RSCOE students.",
        "skills": ["Distributed Systems", "Go", "Kubernetes", "AI Infra"]
    }
    res = client.put("/api/alumni/profile?alumni_id=alm_1", json=update_payload)
    assert res.status_code == 200
    updated = res.json()["profile"]
    assert "Updated Staff Software Engineer" in updated["bio"]
    assert "AI Infra" in updated["skills"]

def test_mentorship_requests_and_actions():
    # 1. List mentorship requests
    res = client.get("/api/alumni/mentorship/requests?alumni_id=alm_1")
    assert res.status_code == 200
    reqs = res.json()["requests"]
    assert len(reqs) >= 1

    # 2. Student creates a new mentorship request
    new_req_payload = {
        "alumni_id": "alm_1",
        "student_id": "std_1",
        "student_name": "Dhruv Patil",
        "target_role": "AI Architect",
        "topic": "LLM Inference Infrastructure",
        "message": "Seeking advice on production serving for generative AI agents."
    }
    create_res = client.post("/api/alumni/mentorship/requests", json=new_req_payload)
    assert create_res.status_code == 200
    created_id = create_res.json()["request"]["id"]

    # 3. Alumnus accepts the request with meeting link
    action_payload = {
        "action": "ACCEPTED",
        "scheduled_time": "2026-10-25 18:00 IST",
        "meeting_link": "https://meet.google.com/test-session-link",
        "feedback_notes": "Look forward to discussing your vLLM and Triton setups."
    }
    act_res = client.post(f"/api/alumni/mentorship/requests/{created_id}/action", json=action_payload)
    assert act_res.status_code == 200
    assert act_res.json()["request"]["status"] == "ACCEPTED"
    assert act_res.json()["request"]["meeting_link"] == "https://meet.google.com/test-session-link"

def test_alumni_referral_pipeline():
    # 1. Post a referral opening
    post_payload = {
        "alumni_id": "alm_1",
        "alumni_name": "Vikram Aditya",
        "company": "Google",
        "role": "Cloud Infrastructure Engineer",
        "job_url": "https://careers.google.com/jobs/results/99912",
        "location": "Pune / Bengaluru",
        "experience_required": "0-1 Years"
    }
    post_res = client.post("/api/alumni/referrals/post", json=post_payload)
    assert post_res.status_code == 200
    ref = post_res.json()["referral"]
    ref_id = ref["id"]
    assert ref["company"] == "Google"

    # 2. Student applies for the referral opening
    apply_payload = {
        "student_id": "std_1",
        "student_name": "Dhruv Patil",
        "endorsement_note": "Verified 88% skill score with AST complexity certifications."
    }
    apply_res = client.post(f"/api/alumni/referrals/{ref_id}/apply", json=apply_payload)
    assert apply_res.status_code == 200
    updated_ref = apply_res.json()["referral"]
    student_apps = updated_ref["student_referrals"]
    assert any(a["student_id"] == "std_1" for a in student_apps)

def test_alumni_insights_and_endorsements():
    # 1. Post an interview breakdown insight
    insight_payload = {
        "alumni_id": "alm_1",
        "alumni_name": "Vikram Aditya",
        "company": "Google",
        "designation": "Staff SWE",
        "role_interviewed": "SWE L4",
        "rounds_breakdown": [
            {
                "round_name": "Round 1: DSA",
                "focus": "Binary trees",
                "sample_questions": ["Invert binary tree under concurrency"],
                "difficulty": "MEDIUM"
            }
        ],
        "skills_we_actually_use": ["Go", "Kubernetes"],
        "tips_for_juniors": "Always test edge cases."
    }
    ins_res = client.post("/api/alumni/insights/post", json=insight_payload)
    assert ins_res.status_code == 200
    assert ins_res.json()["insight"]["company"] == "Google"

    # 2. Submit student skill endorsement
    endorse_payload = {
        "alumni_id": "alm_1",
        "alumni_name": "Vikram Aditya",
        "student_id": "std_1",
        "student_name": "Dhruv Patil",
        "skill": "Python",
        "context": "Verified high-integrity AST code analysis engine."
    }
    end_res = client.post("/api/alumni/endorsements/submit", json=endorse_payload)
    assert end_res.status_code == 200
    assert end_res.json()["endorsement"]["weight"] == 1.25

def test_alumni_directory():
    res = client.get("/api/alumni/directory?company=Google")
    assert res.status_code == 200
    alumni_list = res.json()["directory"]
    assert len(alumni_list) >= 1
    assert alumni_list[0]["current_company"] == "Google"
