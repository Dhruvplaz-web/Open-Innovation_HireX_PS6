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

def test_alumni_auth_login_and_registration():
    # 1. Test Login with Demo Alumni (Vikram Aditya)
    login_payload = {
        "email": "vikram.aditya@google.com",
        "password": "demo123",
        "role": "alumni"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    user_data = login_res.json()["user"]
    assert user_data["role"] == "alumni"
    assert user_data["name"] == "Vikram Aditya"
    assert user_data["companyName"] == "Google"
    assert "token" in login_res.json()

    # 2. Register a New Alumni
    new_email = "nimisha.alumni.test@microsoft.com"
    reg_payload = {
        "email": new_email,
        "password": "password123",
        "role": "alumni",
        "full_name": "Nimisha Joshi",
        "college": "JSPM RSCOE, Pune",
        "department": "Computer Engineering",
        "year": "2020",
        "company": "Microsoft",
        "designation": "Senior AI Architect"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200
    reg_data = reg_res.json()["user"]
    assert reg_data["role"] == "alumni"
    assert reg_data["companyName"] == "Microsoft"
    assert reg_data["designation"] == "Senior AI Architect"
    new_alumni_id = reg_data["id"]

    # 3. Log in with the newly registered alumni
    login_new_res = client.post("/api/auth/login", json={
        "email": new_email,
        "password": "password123"
    })
    assert login_new_res.status_code == 200
    assert login_new_res.json()["user"]["name"] == "Nimisha Joshi"

    # 4. Fetch the profile and dashboard for the newly registered alumni
    prof_res = client.get(f"/api/alumni/profile?alumni_id={new_alumni_id}")
    assert prof_res.status_code == 200
    assert prof_res.json()["profile"]["current_company"] == "Microsoft"

    dash_res = client.get(f"/api/alumni/dashboard?alumni_id={new_alumni_id}")
    assert dash_res.status_code == 200
    assert dash_res.json()["dashboard"]["profile"]["name"] == "Nimisha Joshi"

def test_tripartite_curriculum_feedback_and_teacher_insights():
    # 1. Alumni submits curriculum feedback
    fb_payload = {
        "alumni_id": "alm_1",
        "alumni_name": "Vikram Aditya",
        "current_company": "Google",
        "department": "Computer Engineering",
        "course_name": "Distributed Systems",
        "syllabus_topic": "Corba & RMI",
        "status_verdict": "OBSOLETE_DEPRECATE",
        "suggested_modern_replacement": "gRPC & Protocol Buffers",
        "industry_priority": "CRITICAL",
        "notes": "Replace Java RMI with modern gRPC microservices."
    }
    fb_res = client.post("/api/alumni/curriculum/feedback", json=fb_payload)
    assert fb_res.status_code == 200
    assert fb_res.json()["feedback"]["status_verdict"] == "OBSOLETE_DEPRECATE"

    # 2. Alumni gets curriculum summary
    sum_res = client.get("/api/alumni/curriculum/summary?department=Computer%20Engineering")
    assert sum_res.status_code == 200
    summary = sum_res.json()["summary"]
    assert summary["obsolete_topics_flagged"] >= 1
    assert summary["curriculum_industry_alignment_score"] > 0

    # 3. Academician views alumni curriculum insights
    acad_res = client.get("/api/academician/alumni/curriculum-insights?department=Computer%20Engineering")
    assert acad_res.status_code == 200
    insights = acad_res.json()["insights"]
    assert "priority_recommendations" in insights

def test_tripartite_masterclass_and_endorsements():
    # 1. Create a Masterclass
    mst_payload = {
        "title": "Autonomous AI Agents in Production",
        "speaker_id": "alm_1",
        "speaker_name": "Vikram Aditya",
        "speaker_company": "Google",
        "speaker_role": "Staff Software Engineer",
        "department": "Computer Engineering",
        "target_year": "3rd & 4th Year",
        "date_time": "2026-11-12 18:00 IST",
        "meeting_link": "https://meet.google.com/test-ai-agents",
        "description": "Building tool-using ReAct agents with low latency.",
        "capacity": 200
    }
    mst_res = client.post("/api/alumni/masterclasses", json=mst_payload)
    assert mst_res.status_code == 200
    mst_id = mst_res.json()["masterclass"]["id"]

    # 2. Student registers for masterclass
    reg_res = client.post(f"/api/alumni/masterclasses/{mst_id}/register", json={
        "student_id": "std_1",
        "student_name": "Dhruv Patil"
    })
    assert reg_res.status_code == 200
    assert reg_res.json()["status"] == "success"

    # 3. Teacher endorses student for alumni referrals
    end_res = client.post("/api/academician/students/std_1/endorse-for-alumni", json={
        "teacher_id": "acad_1",
        "teacher_name": "Dr. Rajesh Kulkarni",
        "note": "Exceptional coding craftsmanship and mathematical rigor in CS.",
        "academic_standing": "Top 5% Cohort"
    })
    assert end_res.status_code == 200
    assert end_res.json()["recommendation"]["endorsement_badge"] == "Faculty Seal of Excellence"

    # 4. Student applies to alumni referral (verifies teacher endorsement and verified score attached)
    apply_res = client.post("/api/alumni/referrals/ref_alm_1/apply", json={
        "student_id": "std_1",
        "student_name": "Dhruv Patil",
        "endorsement_note": "Requesting referral with faculty seal."
    })
    assert apply_res.status_code in [200, "already_applied"]

    # 5. Alumni reviews student referral application
    rev_res = client.post("/api/alumni/referrals/ref_alm_1/review", json={
        "student_id": "std_1",
        "decision": "SUBMITTED_TO_HR",
        "notes": "Reviewed Code Lab verification score and faculty endorsement. Referred to Google Cloud team!"
    })
    assert rev_res.status_code == 200
    assert rev_res.json()["applicant"]["status"] == "SUBMITTED_TO_HR"


