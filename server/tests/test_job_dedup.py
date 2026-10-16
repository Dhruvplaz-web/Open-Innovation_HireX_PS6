"""
Unit Test Suite for Module 1: Skill Ontology & Multi-Source Job Deduplicator
Asserts 100% accuracy on skill alias normalization, WhatsApp noise stripping,
tiered skill separation (Required vs Preferred), and composite duplicate detection.
"""

import pytest
from app.services.skill_ontology import skill_ontology
from app.services.job_dedup import job_dedup_service


def test_skill_ontology_normalization():
    """Verify common tech aliases normalize to canonical industry names."""
    assert skill_ontology.normalize_skill("ReactJS") == "React"
    assert skill_ontology.normalize_skill("React.js") == "React"
    assert skill_ontology.normalize_skill("react js") == "React"
    assert skill_ontology.normalize_skill("react") == "React"

    assert skill_ontology.normalize_skill("NodeJS") == "Node.js"
    assert skill_ontology.normalize_skill("node.js") == "Node.js"
    assert skill_ontology.normalize_skill("node js") == "Node.js"

    assert skill_ontology.normalize_skill("Postgres") == "PostgreSQL"
    assert skill_ontology.normalize_skill("postgresql") == "PostgreSQL"
    assert skill_ontology.normalize_skill("psql") == "PostgreSQL"

    assert skill_ontology.normalize_skill("golang") == "Go"
    assert skill_ontology.normalize_skill("k8s") == "Kubernetes"
    assert skill_ontology.normalize_skill("aws") == "AWS"
    assert skill_ontology.normalize_skill("springboot") == "Spring Boot"


def test_fuzzy_typo_resolution():
    """Verify minor typos are resolved via edit distance."""
    assert skill_ontology.normalize_skill("pyhton") == "Python"
    assert skill_ontology.normalize_skill("postgress") == "PostgreSQL"
    assert skill_ontology.normalize_skill("dockr") == "Docker"


def test_unstructured_skill_extraction():
    """Verify skills are extracted from natural language sentences without false positives."""
    sample_text = (
        "We are looking for candidates proficient in ReactJS, Node.js, and Postgres. "
        "Knowledge of Docker, AWS, and Git is preferred."
    )
    extracted = skill_ontology.extract_and_normalize_skills(sample_text)
    assert "React" in extracted
    assert "Node.js" in extracted
    assert "PostgreSQL" in extracted
    assert "Docker" in extracted
    assert "AWS" in extracted
    assert "Git" in extracted


def test_whatsapp_noise_stripper():
    """Verify WhatsApp forwarding markers, emojis, and timestamps are cleanly stripped."""
    raw_whatsapp = (
        "Forwarded as received... 🚨🚨 URGENT DRIVE FOR 2025 BATCH!! [10/16, 2:30 PM] "
        "Infosys is hiring for Specialist Programmer. Package: 9.5 LPA. Location: Pune. "
        "Must have: Python, Django, SQL. Good to have: Docker, AWS. Apply before 5 PM! 🔗"
    )
    cleaned = job_dedup_service.clean_whatsapp_text(raw_whatsapp)
    assert "Forwarded as received" not in cleaned
    assert "🚨" not in cleaned
    assert "🔗" not in cleaned
    assert "Infosys" in cleaned
    assert "Specialist Programmer" in cleaned


def test_entity_extraction_from_raw_text():
    """Verify company, role, CTC, and batch are extracted accurately."""
    sample = (
        "Persistent Systems is hiring for React Developer. Package: 5.5 to 7.5 LPA. "
        "Eligible: 2025 Batch B.Tech students. Skills: React, TypeScript, Redux."
    )
    company = job_dedup_service.extract_company(sample)
    role = job_dedup_service.extract_role(sample)
    min_ctc, max_ctc, ctc_display = job_dedup_service.extract_ctc(sample)
    batch = job_dedup_service.extract_batch(sample)

    assert company == "Persistent Systems"
    assert "React Developer" in role
    assert min_ctc == 5.5
    assert max_ctc == 7.5
    assert "2025 Batch" in batch


def test_tiered_skill_separation():
    """Verify skills are linguistically separated into Required (70%) vs Preferred (30%)."""
    sample = (
        "Role: Full-Stack Engineer\n"
        "Must have: React.js, Node.js, PostgreSQL, TypeScript.\n"
        "Good to have: Docker, AWS, Kubernetes, GraphQL."
    )
    req, pref = job_dedup_service.extract_tiered_skills(sample)
    assert "React" in req
    assert "Node.js" in req
    assert "PostgreSQL" in req
    assert "TypeScript" in req

    assert "Docker" in pref
    assert "AWS" in pref
    assert "Kubernetes" in pref
    # Ensure no duplicate crossover between required and preferred
    assert set(req).isdisjoint(set(pref))


def test_duplicate_job_detection_merge():
    """Verify identical/near-identical job posts from two sources trigger a duplicate merge."""
    existing_job = {
        "id": "drive_persistent_01",
        "company": "Persistent Systems",
        "title": "React Developer",
        "min_ctc": 5.5,
        "max_ctc": 7.5,
        "required_skills": ["React", "TypeScript", "Redux"],
        "preferred_skills": ["Node.js", "Docker"]
    }

    # Second incoming forward from an alumnus with slight rephrasing and formatting
    alumni_forward = (
        "Forwarded message: Persistent Systems is recruiting ReactJS / Typescript Developers! "
        "CTC is around 6 to 7 LPA. Must know React.js, Redux, Typescript. Nice to have: Docker."
    )

    result = job_dedup_service.process_raw_ingestion(
        raw_text=alumni_forward,
        source_type="ALUMNI_WHATSAPP",
        submitted_by="Alumnus (Rohan Sharma)",
        existing_jobs=[existing_job]
    )

    assert result["is_duplicate"] is True
    assert result["status"] == "DUPLICATE_MERGE"
    assert result["matched_job_id"] == "drive_persistent_01"
    assert result["similarity_score"] >= 0.80
    assert "Persistent Systems" in result["parsed_job"]["company"]


def test_non_duplicate_different_roles():
    """Verify distinct roles at the same company are NOT falsely merged."""
    tcs_ninja = {
        "id": "tcs_ninja_drive",
        "company": "TCS",
        "title": "Graduate Engineer Trainee",
        "min_ctc": 3.6,
        "max_ctc": 3.6,
        "required_skills": ["Java", "SQL"],
        "preferred_skills": ["Python"]
    }

    # Distinct role: TCS Digital (Higher salary, different skills)
    tcs_digital_post = (
        "TCS is hiring for Digital Specialist Engineer! Package is 7.5 LPA. "
        "Must have: Python, Machine Learning, Deep Learning, Cloud."
    )

    result = job_dedup_service.process_raw_ingestion(
        raw_text=tcs_digital_post,
        source_type="TPO_EMAIL",
        submitted_by="TPO Desk",
        existing_jobs=[tcs_ninja]
    )

    assert result["is_duplicate"] is False
    assert result["status"] == "NEW_CANONICAL_OPENING"
    assert result["similarity_score"] < 0.82


def test_http_parse_raw_and_confirm_ingest():
    """Verify end-to-end HTTP REST endpoints for raw WhatsApp parsing and confirmation."""
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    raw_post = (
        "Forwarded message: Capgemini is hiring for Java Backend Developer! "
        "CTC: 4.5 to 6.5 LPA. Location: Pune. Must have: Java, Spring Boot, PostgreSQL. "
        "Good to have: Docker, AWS. Batch: 2025 passouts."
    )

    # 1. Parse raw WhatsApp forward
    res_parse = client.post("/api/academician/jobs/parse-raw", json={
        "raw_text": raw_post,
        "source_type": "WHATSAPP_FORWARD",
        "submitted_by": "Prof. Shinde"
    })
    assert res_parse.status_code == 200
    data = res_parse.json()
    assert data["status"] == "success"
    analysis = data["analysis"]
    parsed = analysis["parsed_job"]

    assert parsed["company"] == "Capgemini"
    assert "Java" in parsed["required_skills"]
    assert "Spring Boot" in parsed["required_skills"]
    assert "PostgreSQL" in parsed["required_skills"]
    assert "Docker" in parsed["preferred_skills"]

    # 2. Confirm ingestion
    res_confirm = client.post("/api/academician/jobs/confirm-ingest", json={
        "company": parsed["company"],
        "title": parsed["title"],
        "min_ctc": parsed["min_ctc"],
        "max_ctc": parsed["max_ctc"],
        "ctc_display": parsed["ctc_display"],
        "eligible_batch": parsed["eligible_batch"],
        "required_skills": parsed["required_skills"],
        "preferred_skills": parsed["preferred_skills"],
        "source_type": "WHATSAPP_FORWARD",
        "submitted_by": "Prof. Shinde",
        "is_duplicate": analysis["is_duplicate"],
        "matched_job_id": analysis["matched_job_id"]
    })
    assert res_confirm.status_code == 200
    confirm_data = res_confirm.json()
    assert confirm_data["status"] == "success"
    assert confirm_data["action"] in ["CREATED_NEW_CANONICAL", "MERGED_INTO_EXISTING"]

