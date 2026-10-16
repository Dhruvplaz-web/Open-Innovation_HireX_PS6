"""
Tests for: centralized violation counting/dedup/disqualification and tie-safe skill analysis.
Run: python test_assessment_integrity.py
"""
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.routes.assessments import analyze_skill_results, PROCTORING_CONFIG, ASSESSMENT_SESSIONS

client = TestClient(app)


def stats(**kw):
    return {k: {"correct": v[0], "total": v[1]} for k, v in kw.items()}


def names(items):
    return sorted(i["skill"] for i in items)


# ---------------------------------------------------------------- skill analysis
def test_two_way_tie_strongest():
    a = analyze_skill_results(stats(Python=(2, 3), SQL=(2, 3), React=(1, 3)))
    assert names(a["strongest_skills"]) == ["Python", "SQL"], a["strongest_skills"]
    assert names(a["weakest_skills"]) == ["React"]
    assert "tied" in a["strongest_text"]


def test_tie_weakest():
    a = analyze_skill_results(stats(Python=(3, 3), SQL=(1, 3), React=(1, 3)))
    assert names(a["strongest_skills"]) == ["Python"]
    assert names(a["weakest_skills"]) == ["React", "SQL"]


def test_all_tied_has_no_distinct_weakest():
    a = analyze_skill_results(stats(Python=(2, 3), SQL=(2, 3), React=(2, 3)))
    assert a["all_tied"] is True
    assert len(a["strongest_skills"]) == 3
    assert a["weakest_skills"] == []


def test_single_skill():
    a = analyze_skill_results(stats(Python=(3, 3)))
    assert names(a["strongest_skills"]) == ["Python"]
    assert a["weakest_skills"] == []


def test_exact_scores_not_rounded_before_comparison():
    # 2/3=66.67 vs 667/1000=66.7 -> both display 67 but are NOT tied
    a = analyze_skill_results({"A": {"correct": 2, "total": 3}, "B": {"correct": 667, "total": 1000}})
    assert a["skills"][0]["score"] == a["skills"][1]["score"] == 67
    assert names(a["strongest_skills"]) == ["B"]
    assert names(a["weakest_skills"]) == ["A"]


def test_per_skill_verification_independent_of_aggregate():
    a = analyze_skill_results(stats(Python=(5, 5), SQL=(1, 5)))  # 100 / 20
    by = {s["skill"]: s for s in a["skills"]}
    assert by["Python"]["verified"] is True and by["Python"]["status"] == "ASSESSMENT VERIFIED"
    assert by["SQL"]["verified"] is False and by["SQL"]["status"] == "Needs Improvement"
    assert names(a["improvement_targets"]) == ["SQL"]


def test_no_courses_for_strong_skills():
    a = analyze_skill_results(stats(Python=(3, 3), SQL=(3, 3)))
    assert a["improvement_targets"] == []


# ---------------------------------------------------------------- violation pipeline
def _start(student):
    gen = client.post("/api/assessments/generate", json={
        "student_id": student, "skills": ["Python", "SQL"], "questions_per_skill": 3, "time_limit_minutes": 10})
    assert gen.status_code == 200, gen.text
    aid = gen.json()["assessment_id"]
    r = client.post("/api/assessments/system-check-verify", json={
        "assessment_id": aid, "student_id": student, "camera_ready": True, "microphone_ready": True,
        "fullscreen_ready": True, "network_ready": True, "consent_given": True})
    assert r.status_code == 200
    r = client.post("/api/assessments/start", json={"assessment_id": aid, "student_id": student})
    assert r.status_code == 200
    return aid


def _log(aid, student, etype, **kw):
    r = client.post("/api/assessments/log-violation", json={
        "assessment_id": aid, "student_id": student, "event_type": etype, **kw})
    assert r.status_code == 200, r.text
    return r.json()


def test_blur_plus_tab_switch_is_one_violation():
    aid = _start("std_integrity_dedupe")
    r1 = _log(aid, "std_integrity_dedupe", "WINDOW_BLUR")
    r2 = _log(aid, "std_integrity_dedupe", "TAB_SWITCH")
    assert r1["counted"] is True and r1["violation_count"] == 1 and r1["is_disqualified"] is False
    assert r2["counted"] is False and r2["violation_count"] == 1 and r2["is_disqualified"] is False


def test_second_violation_disqualifies_and_blocks_scoring():
    s = "std_integrity_second"
    aid = _start(s)
    r1 = _log(aid, s, "FULLSCREEN_EXIT")
    assert r1["violation_count"] == 1 and not r1["is_disqualified"]
    r2 = _log(aid, s, "TAB_SWITCH")  # different category -> still the 2nd counted violation
    assert r2["violation_count"] == 2 and r2["is_disqualified"] is True, r2
    res = client.post("/api/assessments/submit-multisection", json={
        "assessment_id": aid, "student_id": s, "answers": {"Python": [0, 0, 0], "SQL": [0, 0, 0]}})
    assert res.json()["valid_score_available"] is False


def test_camera_interruption_restored_in_grace_not_counted():
    s = "std_integrity_cam_ok"
    aid = _start(s)
    r = _log(aid, s, "CAMERA_INTERRUPTED", details="Camera stream disconnected")
    assert r["counted"] is False and r["violation_count"] == 0
    _log(aid, s, "CAMERA_RESTORED")
    sess = client.get(f"/api/assessments/session/{aid}").json()
    assert sess["violation_count"] == 0


def test_camera_grace_expiry_disqualifies():
    s = "std_integrity_cam_bad"
    aid = _start(s)
    r = _log(aid, s, "CAMERA_INTERRUPTED", grace_expired=True)
    assert r["is_disqualified"] is True and "grace" in r["disqualification_reason"].lower()


def test_client_cannot_self_disqualify_or_inflate_via_terminated_event():
    s = "std_integrity_terminated"
    aid = _start(s)
    r = _log(aid, s, "ASSESSMENT_TERMINATED", severity="DISQUALIFICATION")
    assert r["is_disqualified"] is False and r["violation_count"] == 0


def test_submit_unstarted_rejected_and_ownership():
    s = "std_integrity_unstarted"
    gen = client.post("/api/assessments/generate", json={
        "student_id": s, "skills": ["Python"], "questions_per_skill": 3, "time_limit_minutes": 10}).json()
    r = client.post("/api/assessments/submit-multisection", json={
        "assessment_id": gen["assessment_id"], "student_id": s, "answers": {"Python": [0, 0, 0]}})
    assert r.status_code == 409
    r = client.post("/api/assessments/submit-multisection", json={
        "assessment_id": gen["assessment_id"], "student_id": "someone_else", "answers": {}})
    assert r.status_code == 403


def test_valid_result_payload_is_normalized():
    s = "std_integrity_result"
    aid = _start(s)
    res = client.post("/api/assessments/submit-multisection", json={
        "assessment_id": aid, "student_id": s, "answers": {"Python": [0, 0, 0], "SQL": [0, 0, 0]}}).json()
    assert res["assessment_status"] == "COMPLETED"
    assert len(res["skills"]) == 2
    assert res["violation_count"] == 0
    assert res["max_allowed_violations"] == PROCTORING_CONFIG["maxAllowedViolations"]


if __name__ == "__main__":
    tests = [(n, f) for n, f in sorted(globals().items()) if n.startswith("test_") and callable(f)]
    for name, fn in tests:
        fn()
        print(f"✓ {name}")
    print(f"\nALL {len(tests)} INTEGRITY TESTS PASSED")
