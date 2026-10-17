import unittest
from app.services.interview_service import interview_service
from app.db.canonical_store import canonical_store

class TestInterviewSystem(unittest.TestCase):
    def test_session_lifecycle(self):
        # 1. Start Session
        session = interview_service.start_interview_session(
            student_id="std_unit_test",
            role="Backend Developer",
            round_type="System Design & Architecture",
            difficulty="Advanced",
            duration_minutes=15,
            target_company="Barclays"
        )
        self.assertIsNotNone(session["id"])
        self.assertEqual(session["student_id"], "std_unit_test")
        self.assertEqual(len(session["questions"]), 1)
        self.assertIn("Barclays", session["questions"][0]["question"])

        # 2. Submit Answer
        ans_res = interview_service.submit_answer_and_progress(
            session_id=session["id"],
            student_id="std_unit_test",
            answer_text="For idempotency, I use a unique Idempotency-Key UUID header with Redis SETNX atomic locks and a database unique constraint. If a duplicate request arrives, the cached response is returned without re-charging."
        )
        self.assertIn("previous_evaluation", ans_res)
        eval_data = ans_res["previous_evaluation"]
        self.assertGreaterEqual(eval_data["overall_score"], 5.0)
        self.assertTrue(len(eval_data["keywords_detected"]) > 0)
        self.assertIn("next_question", ans_res)

        # 3. Complete Session
        comp_res = interview_service.complete_interview_session(
            session_id=session["id"],
            student_id="std_unit_test"
        )
        self.assertEqual(comp_res["status"], "COMPLETED")
        self.assertIn("overall_score", comp_res["report"])
        self.assertIn("category_scores", comp_res["report"])
        self.assertIn("personalized_preparation_plan", comp_res["report"])

        # 4. Verify History in Canonical Store
        history = canonical_store.get_student_interview_sessions("std_unit_test")
        self.assertTrue(any(s["id"] == session["id"] for s in history))

        # 5. Authorization Check: Attempting to access another student's session should fail
        with self.assertRaises(PermissionError):
            interview_service.submit_answer_and_progress(
                session_id=session["id"],
                student_id="std_unauthorized_user",
                answer_text="Malicious attempt"
            )

if __name__ == "__main__":
    unittest.main()
