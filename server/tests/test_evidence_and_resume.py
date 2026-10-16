import pytest
from app.services.evidence_mapper import evidence_mapper_service
from app.services.counterfactual_guidance import counterfactual_guidance_service
from app.services.truthful_resume import truthful_resume_service

def test_evidence_to_skill_matrix_computation():
    """Verify multi-tier weighting, time decay, and status assignment."""
    matrix = evidence_mapper_service.compute_student_matrix("std_1")
    assert "skills" in matrix
    assert matrix["total_skills"] > 0
    assert "summary" in matrix
    assert matrix["summary"]["verified_count"] >= 1

    # Check Python skill
    python_skill = next((s for s in matrix["skills"] if s["skill"] == "Python"), None)
    assert python_skill is not None
    assert python_skill["status"] == "VERIFIED"
    assert python_skill["confidence_score"] >= 75
    assert len(python_skill["evidence_items"]) >= 1

    # Check evidence item types and strengths
    types = [e["type"] for e in python_skill["evidence_items"]]
    assert any(t in ("PROJECT", "ASSESSMENT", "CERTIFICATE") for t in types)

def test_evidence_submission_updates_matrix():
    """Verify adding a new piece of evidence elevates confidence and adds trace."""
    initial = evidence_mapper_service.compute_student_matrix("std_1")
    initial_skills_count = initial["total_skills"]

    # Submit evidence for a new skill: Kubernetes
    new_evidence = {
        "title": "Kubernetes Microservices Deployment Capstone",
        "type": "PROJECT",
        "description": "Deployed 5 microservices with ingress controller, HPA and helm charts",
        "url_or_repo": "https://github.com/dhruvpatil/k8s-microservices",
        "extracted_skills": ["Kubernetes", "Helm", "Docker"]
    }
    res = evidence_mapper_service.submit_evidence("std_1", new_evidence)
    assert res["status"] == "success"
    assert "Kubernetes" in res["skills_affected"]

    # Verify updated matrix
    updated = evidence_mapper_service.compute_student_matrix("std_1")
    k8s = next((s for s in updated["skills"] if s["skill"] == "Kubernetes"), None)
    assert k8s is not None
    assert k8s["status"] in ("VERIFIED", "PARTIALLY_VERIFIED")
    assert k8s["confidence_score"] >= 55

def test_counterfactual_guidance_and_effort_bridge():
    """Verify AI explainability, what-if minimum effort delta, and gap analysis."""
    guidance = counterfactual_guidance_service.get_guidance_for_opportunity("std_1", "opp_1")
    assert "overall_fit" in guidance
    assert "verdict" in guidance
    assert "natural_language_explanation" in guidance
    assert len(guidance["natural_language_explanation"]) > 10
    assert "counterfactual_advice" in guidance
    assert "minimal_effort_actions" in guidance
    assert len(guidance["minimal_effort_actions"]) >= 1
    # Check that each action has projected lift
    first_action = guidance["minimal_effort_actions"][0]
    assert "action" in first_action
    assert "estimated_hours" in first_action
    assert "projected_fit_lift" in first_action

def test_truthful_resume_anti_hallucination_lock():
    """Verify that unverified claims are flagged and filtered from verified ATS sections."""
    unverified_claim_resume = {
        "student_id": "std_1",
        "claimed_skills": ["Python", "React", "Quantum Cryptography", "Cobol Mainframe"],
        "target_role": "Full-Stack AI Developer"
    }
    audit = truthful_resume_service.audit_resume_claims("std_1", unverified_claim_resume)
    assert "truthfulness_score" in audit
    assert "verified_skills" in audit
    assert "unsupported_claims" in audit
    # Python & React should be verified
    assert "Python" in audit["verified_skills"]
    assert "React" in audit["verified_skills"]
    # Quantum Cryptography & Cobol Mainframe should be flagged as unsupported
    assert "Quantum Cryptography" in audit["unsupported_claims"]
    assert "Cobol Mainframe" in audit["unsupported_claims"]
    assert audit["is_clean_truthful"] is False

def test_truthful_resume_builder_export():
    """Verify single-column OpenResume layout generation with Google XYZ bullets."""
    resume_doc = truthful_resume_service.generate_truthful_resume("std_1", target_role="Full-Stack AI Developer")
    assert resume_doc["name"] == "Dhruv Patil"
    assert "education" in resume_doc
    assert "verified_technical_skills" in resume_doc
    assert len(resume_doc["verified_technical_skills"]) > 0
    assert "projects" in resume_doc
    # Check Google XYZ formatting in bullets
    for proj in resume_doc["projects"]:
        assert "bullets" in proj
        assert len(proj["bullets"]) > 0
        for b in proj["bullets"]:
            assert any(verb in b.lower() for verb in ["engineered", "developed", "architected", "built", "implemented", "optimized", "reduced"])
    assert "cryptographic_ledger_hash" in resume_doc

def test_http_endpoints_evidence_guidance_and_resume():
    """Verify HTTP endpoints for evidence matrix, counterfactual guidance, dispute filing, and resume building."""
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)

    # 1. Evidence Matrix endpoint
    res = client.get("/api/student/evidence-matrix?student_id=std_1")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "matrix" in data
    assert data["matrix"]["total_skills"] > 0

    # 2. Evidence Submission endpoint
    sub_res = client.post("/api/student/evidence/submit", json={
        "student_id": "std_1",
        "title": "PostgreSQL Index Optimization Project",
        "type": "PROJECT",
        "description": "Implemented B-Tree and GIN indexes, improving query throughput by 4x",
        "url_or_repo": "https://github.com/dhruvpatil/pg-optimization",
        "extracted_skills": ["PostgreSQL", "SQL"]
    })
    assert sub_res.status_code == 200
    assert sub_res.json()["status"] == "success"

    # 3. Counterfactual Guidance endpoint
    cf_res = client.get("/api/student/opportunities/opp_1/counterfactual?student_id=std_1")
    assert cf_res.status_code == 200
    cf_data = cf_res.json()
    assert cf_data["status"] == "success"
    assert "guidance" in cf_data
    assert "minimal_effort_actions" in cf_data["guidance"]

    # 4. Dispute Filing endpoint
    disp_res = client.post("/api/student/opportunities/opp_1/dispute", json={
        "student_id": "std_1",
        "disputed_skill": "Redis",
        "student_argument": "I completed a Redis pub-sub caching project in my capstone repository.",
        "supporting_evidence_url": "https://github.com/dhruvpatil/capstone-cache"
    })
    assert disp_res.status_code == 200
    disp_data = disp_res.json()
    assert disp_data["status"] == "success"
    assert "dispute_id" in disp_data

    # 5. Truthful Resume Builder GET endpoint
    res_get = client.get("/api/resume/truthful-builder/std_1?target_role=Full-Stack%20AI%20Developer")
    assert res_get.status_code == 200
    r_data = res_get.json()
    assert r_data["status"] == "success"
    assert r_data["resume"]["name"] == "Dhruv Patil"

    # 6. Truthful Resume Audit endpoint
    audit_res = client.post("/api/resume/truthful-builder/audit", json={
        "student_id": "std_1",
        "claimed_skills": ["Python", "React", "UnverifiedSkillXYZ"],
        "target_role": "Full-Stack AI Developer"
    })
    assert audit_res.status_code == 200
    a_data = audit_res.json()
    assert a_data["status"] == "success"
    assert "UnverifiedSkillXYZ" in a_data["audit"]["unsupported_claims"]

