import pytest
from app.ml.code_auditor import code_auditor
from app.agents.placement_agent import placement_agent


def test_code_auditor_github_repo():
    repo_result = code_auditor.audit_github_repo("https://github.com/torvalds/linux")
    assert repo_result["repo_name"] == "torvalds/linux"
    assert "sha256_hash" in repo_result
    assert len(repo_result["sha256_hash"]) == 64
    assert repo_result["authenticity_score"] > 80
    assert "cyclomatic_grade" in repo_result
    assert "commit_cadence" in repo_result


def test_code_auditor_sandboxed_execution():
    source_code = """
def solve(n):
    return n * 2
"""
    test_cases = [
        {"input": "2", "expected": "4"},
        {"input": "5", "expected": "10"}
    ]
    res = code_auditor.execute_challenge("chal_1", source_code, test_cases)
    assert res["success"] is True
    assert res["tests_passed"] == 2
    assert res["total_tests"] == 2


def test_placement_agent_recruiter_tools():
    shortlist = placement_agent.tool_shortlist_candidates(min_score=70)
    assert "total_matches" in shortlist
    assert "candidates" in shortlist
    assert isinstance(shortlist["candidates"], list)

    recruiter_res = placement_agent.execute_prompt(
        user_role="recruiter",
        user_id="rec_1",
        message="Find and shortlist top candidates with Python skills"
    )
    assert "reply" in recruiter_res
    assert recruiter_res["action_type"] in ["candidate_shortlist", "shortlist_view", "student_list", "recruiter_query"]


def test_placement_agent_academician_tools():
    curriculum = placement_agent.tool_audit_curriculum(department="Computer Engineering")
    assert "sync_score" in curriculum
    assert "critical_gaps" in curriculum

    academic_res = placement_agent.execute_prompt(
        user_role="academician",
        user_id="prof_1",
        message="Audit the current curriculum gaps against live industry demands"
    )
    assert "reply" in academic_res
    assert "sync_score" in academic_res.get("action_data", {}) or "action_type" in academic_res


def test_placement_agent_student_copilot():
    student_res = placement_agent.execute_prompt(
        user_role="student",
        user_id="std_1",
        message="Audit this code for time complexity: def search(arr, target): return target in arr"
    )
    assert "reply" in student_res
    assert "agent_telemetry" in student_res
