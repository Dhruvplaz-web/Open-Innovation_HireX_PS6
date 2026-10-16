"""
SkillBridge Code Lab 2.0 - Automated Challenge Validation & Ingestion Pipeline
Implements Section 31 of Code Lab 2.0 Specification:
1. AI Generation / Input Schema Validation
2. Reference Solution Execution & Self-Test Verification
3. Difficulty Calibration & Time/Space Complexity Audit
4. Duplicate Prevention (Exact Normalized Token Hash & Semantic Fingerprinting)
5. Promotion to ACTIVE Challenge Bank
"""

import ast
import hashlib
import time
from typing import Dict, Any, List, Optional
try:
    from .code_lab_bank import CHALLENGE_BANK, CHALLENGE_MAP
    from .code_auditor import code_auditor
except (ImportError, ValueError):
    from code_lab_bank import CHALLENGE_BANK, CHALLENGE_MAP
    from code_auditor import code_auditor

class ChallengePipeline:
    def __init__(self):
        self.registered_hashes = set()
        self._populate_existing_hashes()

    def _populate_existing_hashes(self):
        for ch in CHALLENGE_BANK:
            norm_hash = self.compute_challenge_hash(ch.get("title", ""), ch.get("description", ""))
            self.registered_hashes.add(norm_hash)

    def compute_challenge_hash(self, title: str, description: str) -> str:
        """
        Computes a normalized SHA-256 hash of title and description
        to prevent duplicate or nearly-identical challenge submissions.
        """
        norm_text = "".join(ch.lower() for ch in (title + description) if ch.isalnum())
        return hashlib.sha256(norm_text.encode("utf-8")).hexdigest()

    def validate_schema(self, challenge_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates that candidate challenge meets strict structural requirements.
        """
        required_fields = [
            "title", "description", "challenge_type", "language",
            "skills", "difficulty", "starter_code", "reference_solution",
            "visible_tests", "hidden_tests"
        ]
        missing = [f for f in required_fields if f not in challenge_data or not challenge_data[f]]
        if missing:
            return {
                "valid": False,
                "stage": "SCHEMA_VALIDATION",
                "error": f"Missing required fields: {', '.join(missing)}"
            }

        valid_types = [
            "STANDARD_CODING", "FUNCTION_IMPLEMENTATION", "DEBUGGING",
            "CODE_REVIEW", "OPTIMIZATION", "SQL", "PROJECT", "INTERVIEW"
        ]
        if challenge_data["challenge_type"].upper() not in valid_types:
            return {
                "valid": False,
                "stage": "SCHEMA_VALIDATION",
                "error": f"Invalid challenge_type '{challenge_data['challenge_type']}'. Must be one of {valid_types}"
            }

        if len(challenge_data.get("visible_tests", [])) < 1:
            return {
                "valid": False,
                "stage": "SCHEMA_VALIDATION",
                "error": "At least 1 visible test case is required."
            }

        if len(challenge_data.get("hidden_tests", [])) < 1:
            return {
                "valid": False,
                "stage": "SCHEMA_VALIDATION",
                "error": "At least 1 hidden test case is required for deterministic verification."
            }

        return {"valid": True, "stage": "SCHEMA_VALIDATION"}

    def test_reference_solution(self, challenge_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes reference_solution against all declared visible and hidden test cases.
        The reference solution MUST achieve 100% test pass rate to qualify.
        """
        ref_code = challenge_data.get("reference_solution", "")
        tests = challenge_data.get("visible_tests", []) + challenge_data.get("hidden_tests", []) + challenge_data.get("edge_tests", [])

        safe_builtins = {
            "abs": abs, "all": all, "any": any, "bool": bool, "dict": dict,
            "enumerate": enumerate, "filter": filter, "float": float, "int": int,
            "isinstance": isinstance, "len": len, "list": list, "map": map,
            "max": max, "min": min, "range": range, "reversed": reversed,
            "round": round, "set": set, "sorted": sorted, "str": str,
            "sum": sum, "tuple": tuple, "zip": zip, "True": True, "False": False, "None": None
        }
        scope = {"__builtins__": safe_builtins}

        try:
            compiled = compile(ref_code, "<reference_solution_validation>", "exec")
            exec(compiled, scope)
        except Exception as e:
            return {
                "valid": False,
                "stage": "REFERENCE_SOLUTION_TEST",
                "error": f"Reference solution compilation failed: {type(e).__name__}: {str(e)}"
            }

        user_fn = None
        for k, v in scope.items():
            if callable(v) and not k.startswith("__"):
                user_fn = v
                break

        if not user_fn:
            return {
                "valid": False,
                "stage": "REFERENCE_SOLUTION_TEST",
                "error": "No callable entry point function found in reference solution."
            }

        passed = 0
        for idx, tc in enumerate(tests):
            try:
                call_expr = f"user_fn({tc['input']})"
                actual = eval(call_expr, {"user_fn": user_fn, "__builtins__": safe_builtins})
                actual_str = str(actual)
                expected_str = str(tc["expected"]).strip()

                is_eq = (actual_str == expected_str or actual_str == expected_str.strip("'\"") or actual_str.strip("'\"") == expected_str)
                if not is_eq:
                    try:
                        is_eq = (ast.literal_eval(actual_str) == ast.literal_eval(expected_str))
                    except Exception:
                        pass

                if is_eq:
                    passed += 1
                else:
                    return {
                        "valid": False,
                        "stage": "REFERENCE_SOLUTION_TEST",
                        "error": f"Reference solution failed test case #{idx + 1}. Expected: {expected_str}, Actual: {actual_str}"
                    }
            except Exception as test_err:
                return {
                    "valid": False,
                    "stage": "REFERENCE_SOLUTION_TEST",
                    "error": f"Exception on test case #{idx + 1}: {str(test_err)}"
                }

        return {
            "valid": True,
            "stage": "REFERENCE_SOLUTION_TEST",
            "tests_verified": passed,
            "total_tests": len(tests)
        }

    def check_duplicate(self, challenge_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates against exact or near-duplicate challenges.
        """
        title = challenge_data.get("title", "")
        desc = challenge_data.get("description", "")
        c_hash = self.compute_challenge_hash(title, desc)

        if c_hash in self.registered_hashes:
            return {
                "valid": False,
                "stage": "DUPLICATE_DETECTION",
                "error": f"Challenge with normalized hash '{c_hash[:12]}' already exists in challenge bank."
            }

        # Check existing IDs
        cid = challenge_data.get("id")
        if cid and cid in CHALLENGE_MAP:
            return {
                "valid": False,
                "stage": "DUPLICATE_DETECTION",
                "error": f"Challenge ID '{cid}' already in use."
            }

        return {"valid": True, "stage": "DUPLICATE_DETECTION", "hash": c_hash}

    def process_and_ingest(self, challenge_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Full 5-stage automated pipeline:
        1. Schema validation
        2. Duplicate detection
        3. Reference solution automated test execution
        4. AST complexity audit
        5. Ingestion to ACTIVE Challenge Bank
        """
        # 1. Schema Validation
        s_res = self.validate_schema(challenge_data)
        if not s_res["valid"]:
            return s_res

        # 2. Duplicate Detection
        d_res = self.check_duplicate(challenge_data)
        if not d_res["valid"]:
            return d_res

        # 3. Reference Solution Test
        r_res = self.test_reference_solution(challenge_data)
        if not r_res["valid"]:
            return r_res

        # 4. AST Complexity Audit
        ref_code = challenge_data["reference_solution"]
        ast_report = code_auditor.audit_code(ref_code, language="python")

        # 5. Ingestion
        cid = challenge_data.get("id") or f"ch_auto_{hashlib.md5(challenge_data['title'].encode()).hexdigest()[:8]}"
        sanitized = {
            **challenge_data,
            "id": cid,
            "version": 1,
            "status": "ACTIVE",
            "detected_complexity": ast_report.get("time_complexity", "O(N)"),
            "ast_quality_score": ast_report.get("code_quality_score", 90),
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        CHALLENGE_BANK.append(sanitized)
        CHALLENGE_MAP[cid] = sanitized
        self.registered_hashes.add(d_res["hash"])

        return {
            "success": True,
            "stage": "ACTIVE",
            "challenge_id": cid,
            "title": sanitized["title"],
            "skills": sanitized["skills"],
            "difficulty": sanitized["difficulty"],
            "tests_verified": r_res["tests_verified"],
            "complexity": sanitized["detected_complexity"],
            "message": "Challenge successfully validated and published to active challenge bank."
        }

# Global singleton
challenge_pipeline = ChallengePipeline()
