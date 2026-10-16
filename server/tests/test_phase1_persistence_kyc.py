import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.canonical_store import canonical_store, ConcurrencyConflictException
from app.ml.aadhaar_verifier import verify_aadhaar, generate_verhoeff_sample, validate_verhoeff
from app.ml.id_card_auditor import id_card_auditor

client = TestClient(app)

def test_canonical_store_basic_and_occ():
    """Verify canonical store retrieves, persists, and tracks monotonic versioning."""
    std = canonical_store.get_student("std_1")
    assert std is not None
    assert "name" in std
    
    # Monotonic version check
    orig_ver = std.get("_version", 1)
    std["bio"] = "Phase 1 Persistence Verified"
    saved = canonical_store.save_student_profile(std, actor_id="test_suite")
    assert saved["bio"] == "Phase 1 Persistence Verified"
    assert saved.get("_version", 1) >= orig_ver

def test_verhoeff_aadhaar_validation():
    """Verify official Verhoeff check digit validation."""
    sample = generate_verhoeff_sample()
    assert len(sample.replace("-", "")) == 12
    assert validate_verhoeff(sample.replace("-", "")) is True
    
    # Valid Aadhaar
    res = verify_aadhaar(sample)
    assert res["status"] == "VERIFIED"
    assert res["is_valid"] is True
    assert res["masked_aadhaar"].startswith("XXXX-XXXX-")
    
    # Corrupted Aadhaar (swap or alter check digit)
    raw_digits = sample.replace("-", "")
    corrupted = raw_digits[:-1] + ("1" if raw_digits[-1] == "0" else "0")
    res_corrupted = verify_aadhaar(corrupted)
    assert res_corrupted["is_valid"] is False
    assert res_corrupted["status"] in ["FAILED", "CORRUPTED_CHECKSUM", "INVALID_LENGTH", "INVALID_FORMAT"]

def test_college_id_card_forensics():
    """Verify College ID card forensics engine."""
    res_valid = id_card_auditor.audit_college_id(
        student_id="std_1",
        college_name="JSPM RSCOE, Pune",
        id_text="JSPM RSCOE Computer Engineering PRN: 72153921K Valid Till: 2026",
        filename="dhruv_id.png"
    )
    assert res_valid["status"] == "success"
    assert res_valid["verdict"] == "REAL"
    assert res_valid["is_authentic"] is True
    assert res_valid["confidence_score"] >= 80.0
    
    # Fake / tampered ID
    res_fake = id_card_auditor.audit_college_id(
        student_id="std_1",
        college_name="JSPM RSCOE, Pune",
        id_text="Fake dummy unverified template 00000",
        filename="fake_card_tampered.png"
    )
    assert res_fake["verdict"] == "FAKE"
    assert res_fake["is_authentic"] is False

def test_student_kyc_endpoints():
    """Verify real HTTP endpoints for Aadhaar and College ID verification."""
    sample = generate_verhoeff_sample()
    
    # POST /api/student/verify-aadhaar
    res_aadhaar = client.post("/api/student/verify-aadhaar", json={
        "student_id": "std_1",
        "aadhaar_number": sample
    })
    assert res_aadhaar.status_code == 200
    data_aadhaar = res_aadhaar.json()
    assert data_aadhaar["status"] == "VERIFIED"
    assert data_aadhaar["is_valid"] is True
    
    # POST /api/student/verify-college-id
    res_id = client.post("/api/student/verify-college-id", json={
        "student_id": "std_1",
        "college_name": "JSPM RSCOE, Pune",
        "college_id_text": "JSPM RSCOE Computer Engineering PRN: 72153921K Valid Till: 2026",
        "file_name": "college_id_card.png"
    })
    assert res_id.status_code == 200
    data_id = res_id.json()
    assert data_id["verdict"] == "REAL"
    assert data_id["is_authentic"] is True
