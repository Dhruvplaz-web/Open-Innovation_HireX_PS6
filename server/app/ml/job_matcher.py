"""
Job & Internship Matcher (ML Model 2)
Implements:
1. Strong-Skill Opportunity Rule (Prioritizes student's strongest verified skills)
2. Explainable AI (XAI) Match Breakdown:
   - Match Score
   - Matched Skills (Verified vs Evidence)
   - Missing Skills
   - Proficiency Gaps (e.g., SQL required 70%, student 58%)
   - Evidence Strength & Role Fit
   - Plain-English Rationale
"""

import numpy as np
from typing import Dict, List, Any
from app.ml.skill_intelligence import normalize_skill_name
from app.services.opportunity_lifecycle import evaluate_opportunity_lifecycle

class JobMatcher:
    def __init__(self):
        pass

    def match_student_to_opportunity(self, student_skills: dict, opportunity: dict) -> dict:
        """
        Calculates exact match percentage, proficiency gaps, and explainable AI rationale.
        Enforces the Strong-Skill Opportunity Rule.
        """
        required_raw = opportunity.get("required_skills", [])
        good_raw = opportunity.get("good_to_have", [])

        # Canonical normalization
        required = [normalize_skill_name(s) for s in required_raw]
        good_to_have = [normalize_skill_name(s) for s in good_raw]

        # Normalized student skills lookup: {canonical_name: {"score": int, "verified": bool}}
        norm_std_skills: Dict[str, Dict[str, Any]] = {}
        for k, v in student_skills.items():
            c_name = normalize_skill_name(k)
            if isinstance(v, dict):
                score = v.get("score", 0)
                is_ver = v.get("verified", score >= 70)
            else:
                score = int(v)
                is_ver = score >= 70
            norm_std_skills[c_name] = {"score": score, "verified": is_ver}

        # 1. Evaluate Overlap & Proficiency Gaps
        matched_required = []
        missing_required = []
        proficiency_gaps = []
        strong_verified_matches = []
        weak_required_matches = []

        min_req_score = opportunity.get("min_verified_score", 70)

        for req_skill in required:
            if req_skill in norm_std_skills:
                std_sk = norm_std_skills[req_skill]
                matched_required.append(req_skill)
                std_score = std_sk["score"]

                if std_sk["verified"] and std_score >= 75:
                    strong_verified_matches.append(req_skill)
                elif std_score < 60:
                    weak_required_matches.append(req_skill)

                if std_score < min_req_score:
                    proficiency_gaps.append({
                        "skill": req_skill,
                        "required_score": min_req_score,
                        "student_score": std_score,
                        "gap": min_req_score - std_score
                    })
            else:
                missing_required.append(req_skill)
                proficiency_gaps.append({
                    "skill": req_skill,
                    "required_score": min_req_score,
                    "student_score": 0,
                    "gap": min_req_score
                })

        matched_bonus = [s for s in good_to_have if s in norm_std_skills]

        # 2. Strong-Skill Rule & Weighted Score Calculation
        # Rule: A recommendation should primarily align with the student's strongest verified skills.
        # If student has a weak score (<60%) in a core required skill, penalize raw match so it does not falsely present as a top match.
        if len(required) > 0:
            coverage_ratio = len(matched_required) / len(required)
            req_score = coverage_ratio * 65.0
        else:
            coverage_ratio = 1.0
            req_score = 65.0

        if len(good_to_have) > 0:
            bonus_score = (len(matched_bonus) / len(good_to_have)) * 15.0
        else:
            bonus_score = 15.0

        # Proficiency Weight (up to 20 points based on actual verified strength in matched required skills)
        if matched_required:
            prof_scores = [norm_std_skills[s]["score"] for s in matched_required]
            avg_prof = float(np.mean(prof_scores))
            prof_points = (avg_prof / 100.0) * 20.0
        else:
            prof_points = 0.0

        raw_match = req_score + bonus_score + prof_points

        # Penalty under Strong-Skill Rule if major required skill is weak or missing
        if weak_required_matches:
            raw_match -= (len(weak_required_matches) * 12.0)

        final_match_pct = int(min(98, max(25, round(raw_match))))

        # Evidence Strength calculation
        verified_count = len(strong_verified_matches)
        if verified_count >= 2 and final_match_pct >= 80:
            evidence_strength = "STRONG / VERIFIED"
        elif verified_count >= 1:
            evidence_strength = "MODERATE"
        else:
            evidence_strength = "EVIDENCE_ONLY / NEEDS_IMPROVEMENT"

        # 3. Plain-English Explainable Rationale
        if weak_required_matches and not strong_verified_matches:
            rationale = (
                f"Skill gap — improvement recommended. Role requires {', '.join(weak_required_matches)} "
                f"where your current verified score is below benchmark ({min_req_score}%)."
            )
        elif missing_required or proficiency_gaps:
            main_gap_skills = [p["skill"] for p in proficiency_gaps[:2]]
            if strong_verified_matches:
                rationale = (
                    f"Recommended because your verified {', '.join(strong_verified_matches)} skills strongly align with the role. "
                    f"{', '.join(main_gap_skills)} proficiency gap is the main area for improvement."
                )
            else:
                rationale = (
                    f"Partial match ({final_match_pct}%). Requires {', '.join(missing_required[:2])} "
                    f"to meet live hiring benchmark."
                )
        else:
            rationale = (
                f"Outstanding match ({final_match_pct}%)! All core requirements ({', '.join(matched_required)}) "
                f"are verified with strong assessment evidence."
            )

        # Pillar 1 & 4: Evaluate temporal lifecycle and verified badges
        lifecycle = evaluate_opportunity_lifecycle(opportunity)
        source_type = opportunity.get("source_type", "CAMPUS_TPO")
        verified_badge = opportunity.get("verified_source_badge")
        if not verified_badge:
            verified_badge = "Direct Employer Verified" if source_type == "ATS_DIRECT" else "Campus TPO Verified"

        return {
            "id": opportunity["id"],
            "opportunity_id": opportunity["id"],
            "title": opportunity["title"],
            "company": opportunity["company"],
            "match_percentage": final_match_pct,
            "matched_skills": matched_required + matched_bonus,
            "missing_skills": missing_required,
            "proficiency_gaps": proficiency_gaps,
            "strong_verified_matches": strong_verified_matches,
            "weak_required_matches": weak_required_matches,
            "evidence_strength": evidence_strength,
            "stipend": opportunity.get("stipend", ""),
            "location": opportunity.get("location", ""),
            "duration": opportunity.get("duration", ""),
            "deadline": opportunity.get("deadline", ""),
            "color_theme": opportunity.get("color_theme", "indigo"),
            "explanation": rationale,
            # Time-Aware Lifecycle additions (Pillars 1, 2, 4)
            "is_expired": lifecycle["is_expired"],
            "lifecycle_status": lifecycle["lifecycle_status"],
            "days_remaining": lifecycle["days_remaining"],
            "urgency_label": lifecycle["urgency_label"],
            "can_apply": lifecycle["can_apply"],
            "formatted_deadline": lifecycle["formatted_deadline"],
            "source_type": source_type,
            "verified_source_badge": verified_badge,
            "risk_level": opportunity.get("risk_level", "LOW")
        }

    def calculate_match(self, student: dict, opportunity: dict) -> dict:
        """Helper to calculate match given student dict and opportunity dict."""
        skills = student.get("skills", {}) if isinstance(student, dict) else {}
        return self.match_student_to_opportunity(skills, opportunity)

    def rank_opportunities_for_student(self, student: dict, opportunities: list, include_expired: bool = False) -> list:
        student_skills = student.get("skills", {})
        results = []
        for opp in opportunities:
            match_res = self.match_student_to_opportunity(student_skills, opp)
            # Pillar 2: Pre-Filtering Rule: Expired drives are strictly filtered out of live feeds
            if not include_expired and match_res.get("is_expired"):
                continue
            results.append(match_res)
            
        # Sort by match percentage descending
        results.sort(key=lambda x: x["match_percentage"], reverse=True)
        return results

    def rank_candidates_for_recruiter(self, students: list, opportunity: dict) -> list:
        candidates = []
        for std in students:
            match_res = self.match_student_to_opportunity(std.get("skills", {}), opportunity)
            candidates.append({
                "student_id": std["id"],
                "name": std["name"],
                "college": std["college"],
                "department": std.get("department", "Computer Engineering"),
                "year": std.get("year", "3rd Year"),
                "cgpa": std["cgpa"],
                "avatar": std["avatar"],
                "verified_score": std["verified_score"],
                "match_percentage": match_res["match_percentage"],
                "matched_skills": match_res["matched_skills"],
                "missing_skills": match_res["missing_skills"],
                "proficiency_gaps": match_res.get("proficiency_gaps", []),
                "evidence_strength": match_res.get("evidence_strength", "MODERATE"),
                "explanation": match_res["explanation"]
            })
        candidates.sort(key=lambda x: x["match_percentage"], reverse=True)
        return candidates

# Global singleton
matcher = JobMatcher()
