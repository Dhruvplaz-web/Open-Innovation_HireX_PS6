"""
ATS Resume Scanner & Keyword Gap Analyzer
Parses candidate resume text, extracts tech stack entities, and evaluates
ATS Compatibility (0-100%) against target company vacancy descriptions.
"""

import re
from typing import Dict, Any, List

CORE_TECH_DICTIONARY = {
    "python": "Python",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "react": "React",
    "typescript": "TypeScript",
    "javascript": "JavaScript",
    "nodejs": "Node.js",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "postgresql": "PostgreSQL",
    "mongodb": "MongoDB",
    "sql": "SQL",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "scikit-learn": "Scikit-Learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "git": "Git",
    "ci/cd": "CI/CD",
    "linux": "Linux",
    "rest api": "REST API",
    "data structures": "Data Structures",
    "algorithms": "Algorithms"
}

ACTION_VERBS = [
    "architected", "engineered", "developed", "deployed", "optimized",
    "implemented", "designed", "scaled", "automated", "built", "reduced"
]

class ATSResumeScanner:
    def scan_resume(self, resume_text: str, target_job: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates resume compatibility against target job requirements.
        """
        if not resume_text.strip():
            return {
                "ats_score": 0,
                "error": "Resume text is empty"
            }

        text_lower = resume_text.lower()

        # 1. Extract detected skills
        detected_skills = set()
        for key, standard_name in CORE_TECH_DICTIONARY.items():
            if re.search(r'\b' + re.escape(key) + r'\b', text_lower):
                detected_skills.add(standard_name)

        # 2. Check Action Verbs (ATS Impact Score)
        found_verbs = [v for v in ACTION_VERBS if re.search(r'\b' + v + r'\b', text_lower)]
        action_verb_score = min(20, len(found_verbs) * 4)

        # 3. Compare with Job Requirements
        required_skills = target_job.get("required_skills", ["Python", "React", "FastAPI"])
        good_to_have = target_job.get("good_to_have", ["Docker", "PostgreSQL"])

        matched_required = [s for s in required_skills if s in detected_skills]
        missing_required = [s for s in required_skills if s not in detected_skills]
        matched_bonus = [s for s in good_to_have if s in detected_skills]

        # Skill match percentage (up to 70 points)
        if required_skills:
            skill_score = (len(matched_required) / len(required_skills)) * 55.0
        else:
            skill_score = 55.0

        if good_to_have:
            bonus_score = (len(matched_bonus) / len(good_to_have)) * 15.0
        else:
            bonus_score = 15.0

        # Measurable metrics check (percentages, numbers like "increased by 25%")
        has_metrics = bool(re.search(r'\d+%', text_lower) or re.search(r'\b\d+x\b', text_lower))
        metric_score = 10 if has_metrics else 3

        final_ats_score = int(round(min(98, max(25, skill_score + bonus_score + action_verb_score + metric_score))))

        # Formatting & Keyword suggestions
        suggestions = []
        if missing_required:
            suggestions.append(f"Add missing core keywords: {', '.join(missing_required)}.")
        if len(found_verbs) < 3:
            suggestions.append("Begin bullet points with strong action verbs (e.g. 'Architected', 'Deployed', 'Optimized').")
        if not has_metrics:
            suggestions.append("Include quantified business outcomes (e.g. 'Improved API response latency by 35%').")

        return {
            "ats_score": final_ats_score,
            "target_role": target_job.get("title", "Target Role"),
            "target_company": target_job.get("company", "Company"),
            "detected_skills": list(detected_skills),
            "matched_keywords": matched_required + matched_bonus,
            "missing_keywords": missing_required,
            "action_verbs_found": found_verbs,
            "quantified_outcomes_found": has_metrics,
            "suggestions": suggestions,
            "verdict": (
                "High ATS Compatibility — Likely to pass enterprise recruiter screens."
                if final_ats_score >= 82
                else "Moderate ATS Compatibility — Address missing keywords before applying."
            )
        }

# Global singleton
resume_scanner = ATSResumeScanner()
