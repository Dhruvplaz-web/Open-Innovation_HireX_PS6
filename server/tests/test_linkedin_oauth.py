import sys
import os
import time
from fastapi.testclient import TestClient

# Ensure server path is in sys.path
server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if server_dir not in sys.path:
    sys.path.insert(0, server_dir)

from app.main import app
from app.models.linkedin import (
    encrypt_access_token,
    decrypt_access_token,
    validate_linkedin_url,
    generate_oauth_state,
    validate_and_consume_oauth_state,
    LINKEDIN_CONNECTIONS
)
from app.data.seed_data import AUDIT_LOGS, STUDENTS
from app.ml.skill_extractor import skill_extractor
from app.ml.skill_intelligence import skill_intelligence

client = TestClient(app)

def test_linkedin_url_validation():
    """Verify LinkedIn URL input validation accepts valid profile links and rejects invalid."""
    assert validate_linkedin_url("https://www.linkedin.com/in/dhruv-patil") is True
    assert validate_linkedin_url("https://linkedin.com/in/dhruv-patil-123") is True
    assert validate_linkedin_url("http://www.linkedin.com/in/user_name") is True
    assert validate_linkedin_url("") is True  # Optional field
    assert validate_linkedin_url(None) is True  # Optional field

    # Reject non-LinkedIn domains or malicious schemes
    assert validate_linkedin_url("javascript:alert(1)") is False
    assert validate_linkedin_url("https://evil.com/phishing") is False
    assert validate_linkedin_url("https://notlinkedin.com/in/user") is False

def test_token_encryption_never_plaintext():
    """Verify that OAuth access tokens are encrypted and never stored in plaintext."""
    raw_token = "AQX_super_secret_oauth_token_from_linkedin_2026"
    encrypted = encrypt_access_token(raw_token)
    
    assert encrypted != raw_token
    assert raw_token not in encrypted
    assert encrypted.startswith("enc_")
    
    # Decrypt returns original token
    decrypted = decrypt_access_token(encrypted)
    assert decrypted == raw_token

    # Tampered encrypted string must be rejected
    tampered = encrypted[:-4] + "XXXX"
    assert decrypt_access_token(tampered) is None

def test_csrf_oauth_state_protection():
    """Verify CSRF protection: state is cryptographically generated and single-use."""
    state = generate_oauth_state("std_1", "workflow")
    assert len(state) >= 32

    # Consuming state first time succeeds
    data = validate_and_consume_oauth_state(state)
    assert data is not None
    assert data["student_id"] == "std_1"
    assert data["redirect_to"] == "workflow"

    # Replay attempt fails (single-use consume)
    replay = validate_and_consume_oauth_state(state)
    assert replay is None

    # Invalid state fails
    assert validate_and_consume_oauth_state("invalid_state_token") is None

def test_linkedin_authorize_endpoint():
    """Verify GET /api/auth/linkedin/authorize generates valid URL with required scopes."""
    res = client.get("/api/auth/linkedin/authorize?student_id=std_1&redirect_to=workflow")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "authorization_url" in data
    assert "openid" in data["authorization_url"]
    assert "profile" in data["authorization_url"]
    assert "email" in data["authorization_url"]
    assert "state=" in data["authorization_url"]
    assert "client_secret" not in data["authorization_url"]  # Never expose secret

def test_linkedin_callback_invalid_state_rejected():
    """Verify OAuth callback rejects invalid or missing CSRF state."""
    # Missing state
    res = client.get("/api/auth/linkedin/callback?code=sample_code", follow_redirects=False)
    assert res.status_code in [302, 307]  # Redirect to frontend with error
    assert "error_type=invalid_state" in res.headers.get("location", "")

    # Invalid state
    res2 = client.get("/api/auth/linkedin/callback?code=sample_code&state=fake_nonexistent_state", follow_redirects=False)
    assert res2.status_code in [302, 307]
    assert "error_type=invalid_state" in res2.headers.get("location", "")

def test_linkedin_callback_user_cancelled():
    """Verify OAuth callback gracefully handles user cancellation."""
    res = client.get("/api/auth/linkedin/callback?error=user_cancelled_authorize&error_description=User+cancelled", follow_redirects=False)
    assert res.status_code in [302, 307]
    assert "error_type=cancelled" in res.headers.get("location", "")

def test_linkedin_connect_correlation_and_audit():
    """
    Verify successful OAuth connection:
    - Attaches to existing SkillBridge student account (no duplicate user created)
    - Retrieves permitted fields (sub, name, email, email_verified)
    - Records audit log
    """
    initial_student_count = len(STUDENTS)

    # Use simulated callback to verify end-to-end data correlation and security
    payload = {
        "student_id": "std_1",
        "linkedin_subject_id": "li_sub_dhruv_9821",
        "linkedin_name": "Dhruv Patil",
        "linkedin_email": "dhruv.patil@rscoe.edu.in",
        "linkedin_email_verified": True
    }
    res = client.post("/api/auth/linkedin/simulate-callback", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"

    # Verify no duplicate student account was created
    assert len(STUDENTS) == initial_student_count

    # Check status endpoint
    status_res = client.get("/api/auth/linkedin/status?student_id=std_1")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["connected"] is True
    assert status_data["status"] == "CONNECTED"
    assert status_data["connection"]["linkedin_name"] == "Dhruv Patil"
    assert status_data["connection"]["linkedin_subject_id"] == "li_sub_dhruv_9821"

    # Verify token is NOT exposed in status
    assert "encrypted_access_token" not in status_data["connection"] or status_data["connection"]["encrypted_access_token"] is None

    # Verify limitation disclosure: skills/experience/education marked as unavailable
    assert status_data["unavailable_fields"]["skills"] == "Not available through current LinkedIn permissions"
    assert status_data["unavailable_fields"]["experience"] == "Not available through current LinkedIn permissions"

    # Verify audit log entry was created
    audit_entry = next((log for log in AUDIT_LOGS if log.get("action") == "LINKEDIN_CONNECTED" and log.get("entity_id") == "std_1"), None)
    assert audit_entry is not None
    assert "Connected LinkedIn" in audit_entry["new_value"]

def test_duplicate_linkedin_connection_collision():
    """Verify that linking a LinkedIn account to a second student is rejected."""
    # std_1 is already linked to li_sub_dhruv_9821
    payload = {
        "student_id": "std_2",
        "linkedin_subject_id": "li_sub_dhruv_9821",  # Same subject ID!
        "linkedin_name": "Duplicate Attempt"
    }
    res = client.post("/api/auth/linkedin/simulate-callback", json=payload)
    assert res.status_code == 409  # Conflict!
    assert "already linked" in res.json()["detail"].lower()

def test_linkedin_disconnect():
    """Verify disconnection removes connection state and records audit log."""
    res = client.post("/api/auth/linkedin/disconnect", json={"student_id": "std_1"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["connection_status"] == "NOT_CONNECTED"

    # Check status is now NOT_CONNECTED
    status_res = client.get("/api/auth/linkedin/status?student_id=std_1")
    assert status_res.json()["connected"] is False

    # Check disconnect audit log
    audit_entry = next((log for log in AUDIT_LOGS if log.get("action") == "LINKEDIN_DISCONNECTED" and log.get("entity_id") == "std_1"), None)
    assert audit_entry is not None

def test_skill_extraction_evidence_sources_hierarchy():
    """
    Verify SkillBridge Evidence System:
    Skill
    ├── source: RESUME
    ├── source: GITHUB
    ├── source: LINKEDIN
    ├── source: PROJECT
    └── source: ASSESSMENT
    - LinkedIn URL does NOT infer skills
    - Only authorized LinkedIn skills (if provided) get LINKEDIN source
    """
    resume_text = "Experienced in Python and React development."
    github_url = "https://github.com/test-user"
    projects = [{
        "name": "Cloud Backend",
        "description": "FastAPI and Docker microservice.",
        "github_repo_url": "https://github.com/test-user/cloud",
        "technologies": ["FastAPI", "Docker"]
    }]

    # 1. Standard extraction without authorized LinkedIn skill permissions
    result = skill_extractor.extract_all(
        resume_text=resume_text,
        github_url=github_url,
        projects=projects,
        authorized_linkedin_skills=[]
    )
    detected = result["detected_skills"]
    
    # Skills from resume
    python_skill = next((s for s in detected if s["skill"] == "Python"), None)
    assert python_skill is not None
    assert "RESUME" in python_skill["sources"]

    # Git from GitHub
    git_skill = next((s for s in detected if s["skill"] == "Git"), None)
    assert git_skill is not None
    assert "GITHUB" in git_skill["sources"]

    # FastAPI from project
    fastapi_skill = next((s for s in detected if s["skill"] == "FastAPI"), None)
    assert fastapi_skill is not None
    assert "PROJECT" in fastapi_skill["sources"]

    # Verify NO LinkedIn skills were inferred simply from a LinkedIn profile or URL
    for s in detected:
        assert "LINKEDIN" not in s["sources"]

    # 2. Only if authorized LinkedIn skills are returned do they get source: LINKEDIN
    result_with_li = skill_extractor.extract_all(
        resume_text="",
        github_url="",
        projects=[],
        authorized_linkedin_skills=["Java"]
    )
    java_skill = next((s for s in result_with_li["detected_skills"] if s["skill"] == "Java"), None)
    assert java_skill is not None
    assert "LINKEDIN" in java_skill["sources"]

def test_student_registration_with_linkedin_url():
    """Verify student registration validates LinkedIn URL and works seamlessly."""
    reg_payload = {
        "student_id": "std_1",
        "full_name": "Dhruv Patil",
        "mobile_number": "9876543210",
        "email": "dhruv.patil@rscoe.edu.in",
        "college_name": "JSPM RSCOE, Pune",
        "graduating_year": "2026",
        "stream_branch": "Computer Engineering",
        "city": "Pune",
        "state": "Maharashtra",
        "linkedin_url": "https://www.linkedin.com/in/dhruv-patil",
        "github_url": "https://github.com/dhruv-patil",
        "projects": []
    }
    res = client.post("/api/student/registration", json=reg_payload)
    assert res.status_code == 200
    assert res.json()["status"] == "success"

    # Malicious LinkedIn URL rejected
    bad_payload = dict(reg_payload, linkedin_url="javascript:alert('xss')")
    bad_res = client.post("/api/student/registration", json=bad_payload)
    assert bad_res.status_code == 400
    assert "Invalid LinkedIn Profile URL" in bad_res.json()["detail"]
