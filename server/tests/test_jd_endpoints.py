"""
Test suite validating all newly wired JD Fit endpoints across Student, Recruiter, Academician, and Admin.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if server_dir not in sys.path:
    sys.path.insert(0, server_dir)

from app.main import app
from app.data.seed_data import OPPORTUNITIES, STUDENTS, APPLICATIONS

client = TestClient(app)


def test_student_jd_analysis_endpoint():
    r = client.get("/api/student/jd-analysis?student_id=std_1")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "success"
    assert data["student_id"] == "std_1"
    assert len(data["analyses"]) > 0
    first = data["analyses"][0]
    assert "overallFit" in first
    assert "verdict" in first
    assert "skills" in first


def test_student_opportunities_contain_jd_fit():
    r = client.get("/api/student/opportunities?student_id=std_1")
    assert r.status_code == 200
    opps = r.json()
    assert len(opps) > 0
    assert "jdFit" in opps[0]
    assert "score" in opps[0]["jdFit"]
    assert "verdict" in opps[0]["jdFit"]


def test_assessments_jd_analysis_endpoint():
    r = client.get("/api/assessments/jd-analysis?student_id=std_1")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "success"
    assert len(data["opportunities"]) > 0


def test_recruiter_applicants_fit_endpoint():
    r = client.get(
        "/api/recruiter/opportunities/opp_1/applicants-fit?sort=fit",
        headers={"X-User-Role": "recruiter"}
    )
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "success"
    assert data["opportunityId"] == "opp_1"
    assert "applicants" in data
    if len(data["applicants"]) > 0:
        first = data["applicants"][0]
        assert "jdFitScore" in first
        assert "jdFitVerdict" in first
        assert "skills" in first


def test_recruiter_applicant_skill_analysis_endpoint():
    r = client.get(
        "/api/recruiter/opportunities/opp_1/applicants/std_1/skill-analysis",
        headers={"X-User-Role": "recruiter"}
    )
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "success"
    assert "analysis" in data
    assert data["analysis"]["overallFit"] >= 0


def test_recruiter_fit_summary_endpoint():
    r = client.get(
        "/api/recruiter/opportunities/opp_1/fit-summary",
        headers={"X-User-Role": "recruiter"}
    )
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "success"
    assert "verdictDistribution" in data
    assert "STRONG_FIT" in data["verdictDistribution"]


def test_academician_role_gaps_endpoint():
    r = client.get(
        "/api/academician/role-gaps",
        headers={"X-User-Role": "academician"}
    )
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "success"
    assert "roles" in data
    assert "mostInDemandGaps" in data


def test_admin_skill_demand_coverage_endpoint():
    r = client.get(
        "/api/admin/analytics/skill-demand-coverage",
        headers={"X-User-Role": "admin"}
    )
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "success"
    assert "coverageData" in data
    assert len(data["coverageData"]) > 0
    first = data["coverageData"][0]
    assert "rolesDemanding" in first
    assert "coveragePercentage" in first
