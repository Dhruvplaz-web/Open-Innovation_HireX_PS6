"""
One-Click Sanity Verification for Algorithmic Code Lab & AST Auditor
Run: python verify_installation.py
"""
import sys
import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CODE_LAB_DIR = os.path.join(CURRENT_DIR, "app", "code_lab")
BACKEND_DIR = os.path.join(CURRENT_DIR, "backend")
for p in [CODE_LAB_DIR, BACKEND_DIR, CURRENT_DIR]:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

def verify():
    print("=" * 65)
    print("  Algorithmic Code Lab & AST Auditor — Sanity Diagnostic")
    print("=" * 65)

    from code_auditor import code_auditor
    from code_lab_engine import code_lab_engine
    from code_lab_bank import CHALLENGE_BANK
    from challenge_pipeline import challenge_pipeline

    print(f"\n[1/5] Checking Challenge Bank: Loaded {len(CHALLENGE_BANK)} challenges... OK")

    # AST complexity test
    ast_res = code_auditor.audit_code("def find_pair(nums):\n    for x in nums:\n        for y in nums:\n            pass")
    print(f"[2/5] AST Complexity Auditor: Detected {ast_res['time_complexity']} ({ast_res['complexity_rating']})... OK")
    assert ast_res['time_complexity'] == 'O(N^2)', "AST time complexity failed"

    # Execution sandbox test
    sub = code_lab_engine.execute_and_evaluate_code(
        challenge_id="ch_alg_twosum",
        student_id="std_1",
        source_code="def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []",
        language="python"
    )
    print(f"[3/5] Python Execution Sandbox: Composite Score = {sub['composite_score']}%, Proof = {sub['sha256_proof'][:16]}... OK")
    assert sub['all_passed'] is True, "Execution sandbox test failed"

    # SQL Relational sandbox test
    sql_res = code_lab_engine.execute_sql_challenge(
        challenge_id="ch_sql_window_placement",
        student_id="std_1",
        sql_query="SELECT s.name, s.verified_score, d.name AS dept_name FROM students s JOIN departments d ON s.department_id = d.id WHERE s.verified_score >= 85;"
    )
    print(f"[4/5] SQL Relational Sandbox: Returned {sql_res['row_count']} rows in {sql_res['execution_time_ms']}ms... OK")
    assert sql_res['passed'] is True, "SQL sandbox test failed"

    # Challenge Pipeline Deduplication test
    sample_candidate = {
        "id": "ch_diag_test_1",
        "title": "Diagnostic Verification Reverse",
        "challenge_type": "STANDARD_CODING",
        "language": "python",
        "skills": ["Python"],
        "difficulty": "Beginner",
        "description": "Diagnostic verification challenge.",
        "starter_code": "def run(x): return x[::-1]",
        "reference_solution": "def run(x): return x[::-1]",
        "visible_tests": [{"input": "x = 'abc'", "expected": "cba"}],
        "hidden_tests": [{"input": "x = '123'", "expected": "321"}]
    }
    pipe_res = challenge_pipeline.process_and_ingest(sample_candidate)
    print(f"[5/5] Challenge Validation & Ingestion Pipeline: Ingested = {pipe_res['success']}... OK")
    assert pipe_res['success'] is True, "Pipeline ingestion failed"

    print("\n=================================================================")
    print("  ALL 5 DIAGNOSTIC TESTS PASSED CLEANLY (100% OPERATIONAL)")
    print("=================================================================\n")

if __name__ == "__main__":
    verify()
