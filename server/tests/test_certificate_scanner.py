"""
Unit & Integration Tests for Forensic Certificate Scanner & Academic Credential Auditor (Phase 1)
Tests:
1. Multi-issuer Anchor OCR & Regex Parsing (NPTEL Elite, AWS Solutions Architect, Coursera).
2. Forensic Name Mismatch Detection (Levenshtein distance vs Aadhaar/KYC identity).
3. Duplicate Image Collision Detection (anti-fraud registry).
4. Temporal Sanity Checks.
5. ESCO / Canonical Skill Extraction and NCrF credit calculation.
6. Live HTTP Endpoints (/api/assessments/certificates/scan and /commit-to-profile).
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.certificate_scanner import certificate_scanner_service, ForensicCertificateScanner


def test_nptel_elite_parsing_and_skills():
    scanner = ForensicCertificateScanner()
    raw_nptel = """
    NPTEL Online Certification (Funded by the MoE, Govt. of India)
    This is to certify that
    DHRUV PATIL
    for successfully completing the course
    Cloud Computing and Distributed Systems
    with a consolidated score of 88%
    Roll No: NPTEL24CS89S1234567
    IIT Madras
    """
    res = scanner.parse_and_audit_certificate(
        raw_text=raw_nptel,
        student_id="std_1",
        student_kyc_name="Dhruv Patil"
    )

    assert res["status"] == "VERIFIED_AUTHENTIC"
    assert res["is_authentic"] is True
    assert res["issuer_key"] == "NPTEL"
    assert res["tier"] == "Elite + Silver"
    assert res["score"] == 88
    assert res["credential_id"] == "NPTEL24CS89S1234567"
    assert "Cloud Computing" in res["skills"]
    assert res["ncrf_credits"] >= 3
    assert len(res["fraud_flags"]) == 0


def test_aws_solutions_architect_parsing():
    scanner = ForensicCertificateScanner()
    raw_aws = """
    Amazon Web Services
    AWS Certified Solutions Architect – Associate
    conferred upon
    Dhruv Patil
    Validation Number: AWS0192837465ABCD
    Issue Date: 2026-04-12
    Verify at aws.amazon.com/verification
    """
    res = scanner.parse_and_audit_certificate(
        raw_text=raw_aws,
        student_id="std_1",
        student_kyc_name="Dhruv Patil"
    )

    assert res["status"] == "VERIFIED_AUTHENTIC"
    assert res["issuer_key"] == "AWS"
    assert res["credential_id"] == "AWS0192837465ABCD"
    assert "Cloud Architecture" in res["skills"] or "AWS" in res["skills"]
    assert len(res["fraud_flags"]) == 0


def test_name_mismatch_fraud_detection():
    scanner = ForensicCertificateScanner()
    # Certificate was issued to "Rohan Deshmukh", but candidate trying to claim it is "Dhruv Patil"
    tampered_nptel = """
    NPTEL Online Certification
    This is to certify that
    Rohan Deshmukh
    for successfully completing the course
    Deep Learning and Neural Networks
    with a consolidated score of 92%
    Roll No: NPTEL24CS10S9876543
    """
    res = scanner.parse_and_audit_certificate(
        raw_text=tampered_nptel,
        student_id="std_1",
        student_kyc_name="Dhruv Patil"
    )

    assert res["status"] == "FLAGGED_FOR_REVIEW"
    assert res["is_authentic"] is False
    assert any("NAME_MISMATCH" in flag for flag in res["fraud_flags"])
    assert res["name_match_score"] < 0.82


def test_duplicate_collision_fraud_detection():
    scanner = ForensicCertificateScanner()
    shared_cert_text = """
    Coursera Verified Certificate
    This is to certify that
    Aarav Sharma
    has successfully completed
    Machine Learning Specialization
    Verify at coursera.org/verify/COURSERA998877
    """
    # Student 1 registers it
    res1 = scanner.parse_and_audit_certificate(
        raw_text=shared_cert_text,
        student_id="std_student_alpha",
        student_kyc_name="Aarav Sharma",
        custom_hash="duplicate_collision_test_hash_123"
    )
    assert res1["status"] == "VERIFIED_AUTHENTIC"

    # Student 2 uploads the identical file/hash with another identity
    res2 = scanner.parse_and_audit_certificate(
        raw_text=shared_cert_text,
        student_id="std_student_beta",
        student_kyc_name="Aarav Sharma",
        custom_hash="duplicate_collision_test_hash_123"
    )
    assert res2["status"] == "REJECTED"
    assert res2["is_authentic"] is False
    assert any("DUPLICATE_FILE" in flag for flag in res2["fraud_flags"])


def test_future_temporal_anomaly():
    scanner = ForensicCertificateScanner()
    future_cert = """
    Microsoft Certified Professional
    Presented to Dhruv Patil
    for completing Azure Fundamentals
    Completed in December 2035
    """
    res = scanner.parse_and_audit_certificate(
        raw_text=future_cert,
        student_id="std_1",
        student_kyc_name="Dhruv Patil"
    )

    assert res["status"] == "FLAGGED_FOR_REVIEW"
    assert any("TEMPORAL_ANOMALY" in flag for flag in res["fraud_flags"])


def test_http_scan_and_commit_endpoints():
    client = TestClient(app)

    # 1. Scan valid NPTEL certificate
    payload = {
        "raw_text": """
        NPTEL Online Certification
        This is to certify that
        Dhruv Patil
        for successfully completing the course
        Cloud Computing and Distributed Systems
        with a consolidated score of 85%
        Roll No: NPTEL26CS99S112233
        """,
        "student_id": "std_1",
        "student_kyc_name": "Dhruv Patil"
    }

    scan_res = client.post("/api/assessments/certificates/scan", json=payload)
    assert scan_res.status_code == 200
    data = scan_res.json()
    assert data["status"] == "success"
    audit = data["audit"]
    assert audit["is_authentic"] is True
    assert "Cloud Computing" in audit["skills"]

    # 2. Commit verified certificate to student profile
    commit_payload = {
        "student_id": "std_1",
        "certificate_data": audit
    }
    commit_res = client.post("/api/assessments/certificates/commit-to-profile", json=commit_payload)
    assert commit_res.status_code == 200
    commit_data = commit_res.json()
    assert commit_data["status"] == "success"
    assert "Cloud Computing" in commit_data["student"]["skills"]
    assert commit_data["student"]["skills"]["Cloud Computing"]["verified"] is True
