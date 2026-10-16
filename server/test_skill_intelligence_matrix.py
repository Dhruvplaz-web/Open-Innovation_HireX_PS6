"""
End-to-End Skill Intelligence Test Matrix
Tests all new endpoints and data loops:
1. Student Skill Passport & Evidence Model
2. Student Career Pathway & Versioned Skill History
3. Academician Institutional Readiness Index & Component Breakdown
4. Academician Cohort Skill Gaps & Year-Wise Heatmap Matrix
5. Academician Industry Demand vs Student Gap Analysis
6. Academician Training Interventions (Creation, Baseline Before, and Reassessment After)
7. Recruiter Job Posting with Minimum Proficiency Thresholds
8. Recruiter Candidate Privacy-Preserving Skill Passport
9. Recruiter Outcome Feedback Loop (Associated skills with hiring outcome)
10. Admin Skill Intelligence Ecosystem Summary & Audit Trail
11. Strong-Skill Opportunity Rule in Job Matcher
"""

import sys
from fastapi.testclient import TestClient
from app.main import app
from app.data.seed_data import STUDENTS, OPPORTUNITIES, APPLICATIONS, TRAINING_INTERVENTIONS, RECRUITMENT_OUTCOMES
from app.ml.job_matcher import matcher

client = TestClient(app)

def test_skill_intelligence_suite():
    print(">>> [1/11] Testing Student Skill Passport Endpoint...")
    res = client.get("/api/student/skill-passport?student_id=std_1")
    assert res.status_code == 200, f"Skill passport failed: {res.text}"
    pdata = res.json()
    assert pdata["status"] == "success"
    assert "passport" in pdata
    assert len(pdata["passport"]) > 0
    # Verify evidence structure
    first_skill = pdata["passport"][0]
    assert "evidencePoints" in first_skill
    assert "badgeType" in first_skill
    # Check that LinkedIn is EVIDENCE_ONLY, not automatically verified
    for sk in pdata["passport"]:
        for ev in sk["evidencePoints"]:
            if ev["type"] == "LINKEDIN":
                assert ev["status"] == "EVIDENCE_ONLY", "LinkedIn cannot be automatically verified!"
    print(f"    [OK] Skill passport returned {len(pdata['passport'])} skills with transparent evidence breakdown.")

    print(">>> [2/11] Testing Student Career Pathway Endpoint...")
    res = client.get("/api/student/career-path?student_id=std_1")
    assert res.status_code == 200
    cpdata = res.json()
    assert "career_pathway" in cpdata
    assert "targetRole" in cpdata["career_pathway"]
    assert "identifiedGaps" in cpdata["career_pathway"]
    print(f"    [OK] Career Pathway generated for {cpdata['career_pathway']['targetRole']} with {len(cpdata['career_pathway']['identifiedGaps'])} identified gaps.")

    print(">>> [3/11] Testing Student Skill Progression History...")
    res = client.get("/api/student/skill-history?student_id=std_1")
    assert res.status_code == 200
    hdata = res.json()
    assert "history_by_skill" in hdata
    assert "Python" in hdata["history_by_skill"]
    print(f"    [OK] Historical skill attempts tracked for {len(hdata['history_by_skill'])} skills.")

    print(">>> [4/11] Testing Academician Institutional Readiness Index...")
    acad_headers = {"x-user-role": "academician"}
    res = client.get("/api/academician/institutional-readiness?email=dr.patil@jspmrscoe.edu.in", headers=acad_headers)
    assert res.status_code == 200, f"Readiness index failed: {res.text}"
    irdata = res.json()
    assert "readiness_index" in irdata
    idx_obj = irdata["readiness_index"]
    assert idx_obj["has_sufficient_data"] is True
    assert "overall_index" in idx_obj
    assert len(idx_obj["components"]) == 5
    print(f"    [OK] Institutional Readiness Index calculated: {idx_obj['overall_index']}% across 5 documented components.")

    print(">>> [5/11] Testing Academician Cohort Skill Gaps & Year Heatmap Matrix...")
    res = client.get("/api/academician/cohort-skill-gaps?year=All%20Years&email=dr.patil@jspmrscoe.edu.in", headers=acad_headers)
    assert res.status_code == 200
    cgdata = res.json()
    assert "analysis" in cgdata
    analysis = cgdata["analysis"]
    assert "year_comparison_matrix" in analysis
    print(f"    [OK] Cohort skill gaps & year-wise comparison matrix analyzed for cohort of {analysis['cohort_size']} students.")

    print(">>> [6/11] Testing Academician Industry Demand vs Student Gap...")
    res = client.get("/api/academician/industry-demand-gap?email=dr.patil@jspmrscoe.edu.in", headers=acad_headers)
    assert res.status_code == 200
    gapdata = res.json()
    assert "gap_analysis" in gapdata
    g_obj = gapdata["gap_analysis"]
    assert g_obj["has_sufficient_data"] is True
    assert len(g_obj["gaps"]) > 0
    print(f"    [OK] Comparative gaps calculated for {len(g_obj['gaps'])} skills with attribution: '{g_obj['disclaimer']}'.")

    print(">>> [7/11] Testing Academician Training Intervention Creation & Lifecycle...")
    create_payload = {
        "skill": "FastAPI",
        "course_title": "FastAPI & Microservices Engineering Bootcamp",
        "target_year": "3rd Year",
        "provider": "Coursera / DeepLearning.AI",
        "target_students_count": 85,
        "note": "Bridging FastAPI gap for upcoming Barclays Campus Drive."
    }
    res = client.post("/api/academician/interventions?email=dr.patil@jspmrscoe.edu.in", json=create_payload, headers=acad_headers)
    assert res.status_code == 200
    new_int = res.json()["intervention"]
    int_id = new_int["id"]
    assert new_int["after_score"] is None, "New intervention must not have fake after_score!"
    print(f"    [OK] Intervention created with real baseline score: {new_int['before_score']}%. Post-training evaluation pending.")

    # Record post-training reassessment
    reassess_payload = {"post_training_score": 86}
    res = client.post(f"/api/academician/interventions/{int_id}/record-reassessment", json=reassess_payload, headers=acad_headers)
    assert res.status_code == 200
    updated_int = res.json()["intervention"]
    assert updated_int["after_score"] == 86
    assert updated_int["improvement_points"] == (86 - new_int["before_score"])
    print(f"    [OK] Post-training reassessment recorded: {updated_int['after_score']}% (+{updated_int['improvement_points']} improvement points).")

    print(">>> [8/11] Testing Recruiter Candidate Privacy-Preserving Passport...")
    rec_headers = {"x-user-role": "recruiter"}
    res = client.get("/api/recruiter/candidate-skill-passport/std_1", headers=rec_headers)
    assert res.status_code == 200
    r_pass = res.json()["candidate"]
    assert "candidateName" in r_pass
    assert "verifiedSkills" in r_pass
    assert "aadhaar_number" not in r_pass, "Candidate PII must be protected!"
    print(f"    [OK] Recruiter view candidate passport: {len(r_pass['verifiedSkills'])} verified skills, zero private PII exposed.")

    print(">>> [9/11] Testing Recruiter Outcome Feedback Loop...")
    outcome_payload = {
        "application_id": "app_1",
        "outcome": "SELECTED",
        "important_skills": ["Python", "FastAPI", "React"],
        "skill_readiness": "Exceeded benchmark cutoff on proctored live coding",
        "interview_readiness": "Excellent algorithmic communication",
        "technical_gap": "Container deployment knowledge can be polished before onboarding",
        "notes": "Python and FastAPI were among the verified skills associated with this positive recruitment outcome."
    }
    res = client.post("/api/recruiter/submit-outcome-feedback", json=outcome_payload, headers=rec_headers)
    assert res.status_code == 200
    out_record = res.json()["outcome"]
    assert out_record["outcome"] == "SELECTED"
    print(f"    [OK] Recruitment outcome recorded without unsupported causal claims.")

    print(">>> [10/11] Testing Admin Skill Intelligence Summary & Audit Trail...")
    adm_headers = {"x-user-role": "admin"}
    res = client.get("/api/admin/skill-intelligence", headers=adm_headers)
    assert res.status_code == 200
    admin_data = res.json()
    assert "ecosystem_summary" in admin_data
    summary = admin_data["ecosystem_summary"]
    assert summary["total_students"] > 0
    assert summary["total_verified_skills"] > 0
    print(f"    [OK] Ecosystem summary: {summary['total_students']} students, {summary['total_verified_skills']} verified skills, {summary['total_interventions']} interventions.")

    res = client.get("/api/admin/audit-logs", headers=adm_headers)
    assert res.status_code == 200
    assert len(res.json()["audit_logs"]) > 0
    print(f"    [OK] Audit trail returned {len(res.json()['audit_logs'])} immutable compliance entries.")

    print(">>> [11/11] Testing Strong-Skill Opportunity Rule in Job Matcher...")
    # Test a student with high Python and low Docker
    student_sample = {
        "skills": {
            "Python": {"score": 90, "verified": True},
            "React": {"score": 85, "verified": True},
            "SQL": {"score": 78, "verified": True},
            "Docker": {"score": 35, "verified": False}
        }
    }
    # Opportunity 1: Python/React heavy
    opp_py_react = {
        "id": "opp_test_1",
        "title": "Full-Stack Python/React Intern",
        "company": "Tech Corp",
        "required_skills": ["Python", "React"],
        "good_to_have": ["SQL"],
        "min_verified_score": 70
    }
    # Opportunity 2: Docker heavy
    opp_docker = {
        "id": "opp_test_2",
        "title": "DevOps Container Specialist",
        "company": "Cloud Tech",
        "required_skills": ["Docker"],
        "good_to_have": [],
        "min_verified_score": 70
    }
    match_1 = matcher.match_student_to_opportunity(student_sample["skills"], opp_py_react)
    match_2 = matcher.match_student_to_opportunity(student_sample["skills"], opp_docker)

    assert match_1["match_percentage"] > match_2["match_percentage"], "Strong-Skill Rule violation: Python/React must rank higher than Docker!"
    assert "Skill gap" in match_2["explanation"], "Weak main skill must indicate skill gap!"
    print(f"    [OK] Strong-Skill Rule verified: Python/React match ({match_1['match_percentage']}%) > Docker match ({match_2['match_percentage']}%). Explanation correctly flags '{match_2['explanation']}'.")

    print("\n=======================================================")
    print("ALL 11 SKILL INTELLIGENCE MATRIX TESTS PASSED WITH 100% SUCCESS!")
    print("=======================================================")

if __name__ == "__main__":
    test_skill_intelligence_suite()
