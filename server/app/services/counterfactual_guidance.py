"""
HireX AI Explainability & Counterfactual Guidance Service
Provides natural language match explanations, minimal-effort counterfactual advice
("What is the shortest path to qualify?"), and human review / dispute workflows.
"""

from typing import Dict, Any, List, Optional
import time
from app.data.seed_data import STUDENTS, OPPORTUNITIES, log_audit_trail
from app.services.evidence_mapper import evidence_mapper_service
from app.services.jd_skill_analysis import analyze_student_for_opportunity

# Human Review Dispute Queue
HUMAN_REVIEW_DISPUTES: List[Dict[str, Any]] = []

class CounterfactualGuidanceService:
    def __init__(self):
        pass

    def get_guidance_for_opportunity(self, student_id: str, opportunity_id: str) -> Dict[str, Any]:
        """
        Generates full explainability and counterfactual guidance for a student
        against a specific campus placement opportunity.
        """
        from app.db.canonical_store import canonical_store
        student = next((s for s in STUDENTS if s["id"] == student_id), None) or canonical_store.get_student(student_id) or STUDENTS[0]
        opportunity = next((o for o in OPPORTUNITIES if o.get("id") == opportunity_id or o.get("opportunity_id") == opportunity_id), None) or OPPORTUNITIES[0]

        # Analyze current fit
        matrix = evidence_mapper_service.compute_student_matrix(student_id)
        verified_skills = {s["skill"]: s["confidence_score"] for s in matrix["skills"] if s["status"] == "VERIFIED"}
        partial_skills = {s["skill"]: s["confidence_score"] for s in matrix["skills"] if s["status"] == "PARTIALLY_VERIFIED"}
        
        req_skills = opportunity.get("required_skills", ["Python", "FastAPI"])
        good_skills = opportunity.get("good_to_have", ["Docker", "PostgreSQL"])
        company = opportunity.get("company", "Enterprise Partner")
        role = opportunity.get("title", "Software Engineer")

        # Compute matches and gaps
        matched_reqs = [sk for sk in req_skills if sk in verified_skills]
        partially_matched = [sk for sk in req_skills if sk in partial_skills]
        missing_reqs = [sk for sk in req_skills if sk not in verified_skills and sk not in partial_skills]
        missing_goods = [sk for sk in good_skills if sk not in verified_skills]

        # Baseline score calculation
        total_possible = len(req_skills) * 1.5 + len(good_skills) * 0.8
        score_achieved = sum(1.5 for sk in matched_reqs) + sum(0.9 for sk in partially_matched) + sum(0.8 for sk in good_skills if sk in verified_skills)
        overall_fit = min(98, max(25, int(round((score_achieved / max(1.0, total_possible)) * 100))))

        if overall_fit >= 80:
            verdict = "STRONG_FIT"
        elif overall_fit >= 65:
            verdict = "GOOD_FIT"
        elif overall_fit >= 50:
            verdict = "PARTIAL_FIT"
        else:
            verdict = "NEEDS_WORK"

        # 1. Natural Language Explanation
        explanation_lines = []
        if matched_reqs:
            explanation_lines.append(
                f"You hold solid institutional verification in {len(matched_reqs)} core requirements: {', '.join(matched_reqs)}."
            )
        if partially_matched:
            explanation_lines.append(
                f"{', '.join(partially_matched)} has partial evidence but needs an AST compiler check or project to become fully verified."
            )
        if missing_reqs:
            explanation_lines.append(
                f"The primary gap preventing top-tier shortlisting is lack of verified evidence for: {', '.join(missing_reqs)}."
            )
        else:
            explanation_lines.append("All primary required competencies are backed by verified evidence.")

        nl_explanation = " ".join(explanation_lines)

        # 2. Counterfactual Guidance & Minimal Effort Actions
        minimal_actions = []

        if missing_reqs:
            top_gap = missing_reqs[0]
            minimal_actions.append({
                "action": f"Complete the 45-minute {top_gap} AST Practical Code Lab",
                "skill": top_gap,
                "type": "CODE_LAB",
                "estimated_hours": 0.75,
                "projected_fit_lift": 14,
                "unlocks_verdict": "GOOD_FIT" if verdict in ("NEEDS_WORK", "PARTIAL_FIT") else "STRONG_FIT",
                "rationale": f"Resolving the mandatory requirement '{top_gap}' immediately lifts your eligibility score into the recruiter priority tier."
            })

        if partially_matched:
            p_skill = partially_matched[0]
            minimal_actions.append({
                "action": f"Submit GitHub repository or project link showing practical {p_skill} deployment",
                "skill": p_skill,
                "type": "EVIDENCE_SUBMISSION",
                "estimated_hours": 0.5,
                "projected_fit_lift": 8,
                "unlocks_verdict": "STRONG_FIT" if verdict == "GOOD_FIT" else "GOOD_FIT",
                "rationale": f"Elevating {p_skill} from partial to fully verified strengthens your profile integrity without taking new exams."
            })

        if missing_goods:
            bonus = missing_goods[0]
            minimal_actions.append({
                "action": f"Complete quick MCQ assessment for good-to-have skill: {bonus}",
                "skill": bonus,
                "type": "ASSESSMENT",
                "estimated_hours": 0.3,
                "projected_fit_lift": 6,
                "unlocks_verdict": "STRONG_FIT",
                "rationale": f"Good-to-have skills act as placement tie-breakers among top candidates at {company}."
            })

        # Summary counterfactual statement
        if minimal_actions:
            first = minimal_actions[0]
            counterfactual_advice = (
                f"Minimal-Effort Bridge: {first['action']} (~{first['estimated_hours']} hrs) "
                f"will boost your fit from {overall_fit}% to {min(98, overall_fit + first['projected_fit_lift'])}%, "
                f"flipping your verdict to {first['unlocks_verdict']}."
            )
        else:
            counterfactual_advice = f"You are already at peak eligibility ({overall_fit}%) for {company} {role}."

        return {
            "student_id": student_id,
            "opportunity_id": opportunity_id,
            "company": company,
            "role": role,
            "overall_fit": overall_fit,
            "verdict": verdict,
            "matched_skills": matched_reqs,
            "partial_skills": partially_matched,
            "missing_skills": missing_reqs,
            "natural_language_explanation": nl_explanation,
            "counterfactual_advice": counterfactual_advice,
            "minimal_effort_actions": minimal_actions
        }

    def file_human_review_dispute(
        self,
        student_id: str,
        opportunity_id: str,
        disputed_skill: str,
        student_argument: str,
        supporting_evidence_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Files a formal dispute / human verification request for review by faculty or TPO.
        """
        dispute_id = f"disp_{int(time.time())}_{len(HUMAN_REVIEW_DISPUTES) + 1}"
        student = next((s for s in STUDENTS if s["id"] == student_id), None)
        std_name = student.get("name", "Student") if student else "Student"

        dispute_record = {
            "dispute_id": dispute_id,
            "student_id": student_id,
            "student_name": std_name,
            "opportunity_id": opportunity_id,
            "disputed_skill": disputed_skill,
            "student_argument": student_argument,
            "supporting_evidence_url": supporting_evidence_url,
            "status": "PENDING_FACULTY_REVIEW",
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "assigned_reviewer": "Prof. S. R. Deshmukh (TPO Faculty Incharge)"
        }

        HUMAN_REVIEW_DISPUTES.append(dispute_record)
        try:
            from app.db.canonical_store import canonical_store
            canonical_store.record_human_review_dispute(dispute_record)
        except Exception as e:
            print(f"[CounterfactualGuidance] Warning persisting dispute to canonical store: {e}")

        log_audit_trail(
            actor=std_name,
            role="student",
            action="DISPUTE_FILED",
            entity="Dispute",
            entity_id=dispute_id,
            new_value=disputed_skill
        )

        return {
            "status": "success",
            "dispute_id": dispute_id,
            "message": "Human review request successfully dispatched to institutional TPO coordinator. Review typical turnaround is 24 hours.",
            "record": dispute_record
        }

    def get_pending_disputes(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            from app.db.canonical_store import canonical_store
            store_disputes = canonical_store.get_human_review_disputes(status)
            if store_disputes:
                return store_disputes
        except Exception:
            pass
        if status and status != "ALL":
            return [d for d in HUMAN_REVIEW_DISPUTES if d.get("status") == status]
        return HUMAN_REVIEW_DISPUTES

    def resolve_dispute(
        self,
        dispute_id: str,
        resolution: str,
        actor_id: str = "tpo_coordinator",
        new_score: Optional[int] = None,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Allows TPO or academic coordinator to resolve a dispute:
        'UPHELD' (AI score maintained) or 'OVERRIDDEN_APPROVED' (Manual verification approved).
        """
        target = next((d for d in HUMAN_REVIEW_DISPUTES if d.get("dispute_id") == dispute_id or d.get("id") == dispute_id), None)
        if target:
            target["status"] = resolution
            target["resolved_by"] = actor_id
            target["resolved_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            target["resolution_notes"] = notes or ""
            if new_score is not None:
                target["overridden_score"] = new_score

        try:
            from app.db.canonical_store import canonical_store
            return canonical_store.resolve_human_review_dispute(
                dispute_id=dispute_id,
                resolution=resolution,
                actor_id=actor_id,
                new_score=new_score,
                notes=notes
            )
        except Exception as e:
            print(f"[CounterfactualGuidance] Warning resolving in canonical store: {e}")
            return target or {"status": resolution, "dispute_id": dispute_id}


counterfactual_guidance_service = CounterfactualGuidanceService()
