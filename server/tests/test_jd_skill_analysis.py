"""
Unit tests for the Pure, Deterministic JD Skill Analysis Service.
Tests all rules specified in Step 3:
- All requirements met (STRONG_FIT)
- Missing / gap must-have capping verdict at PARTIAL_FIT
- Skill alias resolution
- Related skill matching with 0.6 factor and explicit labeling
- Not assessed skills reporting None and NOT_ASSESSED status (no invented scores)
- Empty requirements fallback deriving from opportunity fields
- Verdict capping and plain-English explanation generation
"""

import sys
import os

server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if server_dir not in sys.path:
    sys.path.insert(0, server_dir)

import pytest
from app.services.jd_skill_analysis import (
    analyze_student_for_opportunity,
    derive_requirements_from_opportunity,
    JD_ANALYSIS_CONFIG
)


def test_all_requirements_met():
    """When all must-have and nice-to-have skills meet or exceed target level."""
    student_skills = {
        "Python": {"score": 90, "verified": True},
        "FastAPI": {"score": 85, "verified": True},
        "Docker": {"score": 80, "verified": True}
    }
    requirements = [
        {"skill": "Python", "importance": "MUST_HAVE", "targetLevel": 80},
        {"skill": "FastAPI", "importance": "MUST_HAVE", "targetLevel": 75},
        {"skill": "Docker", "importance": "NICE_TO_HAVE", "targetLevel": 70}
    ]

    res = analyze_student_for_opportunity(student_skills, requirements)

    assert res["overallFit"] == 100
    assert res["mustHaveCoverage"] == 100.0
    assert res["niceToHaveCoverage"] == 100.0
    assert res["verdict"] == "STRONG_FIT"
    assert len(res["topGaps"]) == 0
    assert all(s["status"] == "MET" for s in res["skills"])
    assert all(s["matchedVia"] == "EXACT" for s in res["skills"])


def test_missing_must_have_caps_verdict_at_partial_fit():
    """A missing must-have skill caps the verdict at PARTIAL_FIT even if other scores are 100."""
    student_skills = {
        "React": {"score": 95, "verified": True},
        "TypeScript": {"score": 92, "verified": True}
        # Python is completely missing
    }
    requirements = [
        {"skill": "Python", "importance": "MUST_HAVE", "targetLevel": 70},
        {"skill": "React", "importance": "NICE_TO_HAVE", "targetLevel": 70},
        {"skill": "TypeScript", "importance": "NICE_TO_HAVE", "targetLevel": 70}
    ]

    res = analyze_student_for_opportunity(student_skills, requirements)

    # Even though React & TypeScript gave points, missing MUST_HAVE caps verdict at PARTIAL_FIT
    assert res["verdict"] == "PARTIAL_FIT"
    py_skill = next(s for s in res["skills"] if s["skill"] == "Python")
    assert py_skill["status"] == "NOT_ASSESSED"
    assert py_skill["studentScore"] is None
    assert any("capped at PARTIAL_FIT" in exp for exp in res["explanation"])


def test_gap_in_must_have_caps_verdict():
    """A must-have skill that scores below partial threshold caps verdict at PARTIAL_FIT."""
    student_skills = {
        "Python": {"score": 30, "verified": True},  # Target is 80 => coverage = 30/80 = 0.375 < 0.5 => GAP
        "React": {"score": 95, "verified": True},
        "FastAPI": {"score": 90, "verified": True}
    }
    requirements = [
        {"skill": "Python", "importance": "MUST_HAVE", "targetLevel": 80},
        {"skill": "React", "importance": "NICE_TO_HAVE", "targetLevel": 70},
        {"skill": "FastAPI", "importance": "NICE_TO_HAVE", "targetLevel": 70}
    ]

    res = analyze_student_for_opportunity(student_skills, requirements)

    py_skill = next(s for s in res["skills"] if s["skill"] == "Python")
    assert py_skill["status"] == "GAP"
    assert res["verdict"] == "PARTIAL_FIT"
    assert any("capped at PARTIAL_FIT" in exp for exp in res["explanation"])


def test_skill_alias_resolution():
    """Aliases like react.js, python 3, ts map seamlessly to canonical skills."""
    student_skills = {
        "react.js": {"score": 85, "verified": True},
        "python 3": {"score": 88, "verified": True},
        "ts": {"score": 82, "verified": True}
    }
    requirements = [
        {"skill": "React", "importance": "MUST_HAVE", "targetLevel": 80},
        {"skill": "Python", "importance": "MUST_HAVE", "targetLevel": 80},
        {"skill": "TypeScript", "importance": "NICE_TO_HAVE", "targetLevel": 80}
    ]

    res = analyze_student_for_opportunity(student_skills, requirements)

    assert res["overallFit"] >= 80
    assert res["verdict"] == "STRONG_FIT"
    for s in res["skills"]:
        assert s["status"] == "MET"
        assert s["matchedVia"] in ("EXACT", "ALIAS")
        assert s["studentScore"] is not None


def test_related_skill_multiplier_and_labeling():
    """A related skill (e.g. PostgreSQL when MySQL is required) uses the 0.6 factor."""
    student_skills = {
        "PostgreSQL": {"score": 80, "verified": True}
    }
    requirements = [
        {"skill": "MySQL", "importance": "MUST_HAVE", "targetLevel": 70}
    ]

    res = analyze_student_for_opportunity(student_skills, requirements)

    my_sql = res["skills"][0]
    assert my_sql["matchedVia"] == "RELATED"
    assert my_sql["matchedSkill"] == "PostgreSQL"
    # Effective score = 80 * 0.6 = 48.0. Target = 70. Coverage = 48 / 70 = ~0.686 => PARTIAL
    assert my_sql["effectiveScore"] == pytest.approx(48.0, 0.1)
    assert my_sql["status"] == "PARTIAL"
    assert any("Related skill equivalence applied" in exp for exp in res["explanation"])


def test_not_assessed_skills_never_invent_scores():
    """Unassessed skills must strictly have studentScore: None and status NOT_ASSESSED."""
    student_skills = {}
    requirements = [
        {"skill": "Machine Learning", "importance": "MUST_HAVE", "targetLevel": 75}
    ]

    res = analyze_student_for_opportunity(student_skills, requirements)

    ml = res["skills"][0]
    assert ml["studentScore"] is None
    assert ml["status"] == "NOT_ASSESSED"
    assert ml["coverage"] == 0.0
    assert res["overallFit"] == 0
    assert res["verdict"] == "NEEDS_WORK"


def test_empty_requirements_fallback_derivation():
    """When requirements is empty, derive from opportunity required_skills and good_to_have."""
    mock_opp = {
        "id": "opp_test",
        "title": "Software Engineer",
        "company": "Acme Corp",
        "required_skills": ["Python", "SQL"],
        "good_to_have": ["Docker"],
        "min_verified_score": 75
    }

    derived = derive_requirements_from_opportunity(mock_opp)
    assert len(derived) == 3
    assert derived[0]["skill"] == "Python"
    assert derived[0]["importance"] == "MUST_HAVE"
    assert derived[0]["targetLevel"] == 75

    assert derived[1]["skill"] == "SQL"
    assert derived[1]["importance"] == "MUST_HAVE"

    assert derived[2]["skill"] == "Docker"
    assert derived[2]["importance"] == "NICE_TO_HAVE"

    # Analyze with derived fallback
    student_skills = {
        "Python": {"score": 80, "verified": True},
        "SQL": {"score": 78, "verified": True},
        "Docker": {"score": 70, "verified": True}
    }
    res = analyze_student_for_opportunity(student_skills, opportunity=mock_opp)
    assert res["overallFit"] >= 80
    assert res["verdict"] == "STRONG_FIT"


def test_top_gaps_limited_to_max_three():
    """Top gaps must be capped at 3, prioritizing MUST_HAVE first."""
    student_skills = {}
    requirements = [
        {"skill": "Python", "importance": "MUST_HAVE", "targetLevel": 90},
        {"skill": "Java", "importance": "MUST_HAVE", "targetLevel": 85},
        {"skill": "SQL", "importance": "MUST_HAVE", "targetLevel": 80},
        {"skill": "React", "importance": "NICE_TO_HAVE", "targetLevel": 75},
        {"skill": "Docker", "importance": "NICE_TO_HAVE", "targetLevel": 70}
    ]

    res = analyze_student_for_opportunity(student_skills, requirements)

    assert len(res["topGaps"]) == 3
    assert all(g["importance"] == "MUST_HAVE" for g in res["topGaps"])
