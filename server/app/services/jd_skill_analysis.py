"""
Pure, Deterministic Job Description (JD) Skill Analysis Service.
Evaluates student verified skills against structured or derived opportunity requirements.

CRITICAL RULES:
1. Pure, deterministic, explainable (no paid APIs, no black-box ML).
2. Uses skills only. Strictly ignores name, gender, college, region, and personal attributes.
3. Not-assessed skills always report NOT_ASSESSED and studentScore: None. Never invent a score.
4. Missing or GAP MUST_HAVE caps the verdict at PARTIAL_FIT with plain-English explanation.
5. All weights, multipliers, and thresholds are centralized in JD_ANALYSIS_CONFIG.
"""

from typing import Dict, List, Any, Optional, Tuple
import math
import datetime
from app.ml.skill_intelligence import normalize_skill_name

# ==============================================================================
# CONFIGURATION & THRESHOLDS (Centralized & Fully Documented)
# ==============================================================================
JD_ANALYSIS_CONFIG = {
    # Weights for requirement importance
    "weights": {
        "MUST_HAVE": 2.0,
        "NICE_TO_HAVE": 1.0,
    },
    # Multiplier applied when a skill is matched through a related skill
    "related_multiplier": 0.6,
    # Thresholds for status determination based on coverage (effectiveScore / target)
    "coverage_thresholds": {
        "met": 1.0,      # coverage >= 1.0 => MET
        "partial": 0.5,  # 0.5 <= coverage < 1.0 => PARTIAL, else GAP
    },
    # Thresholds for overallFit verdicts
    "verdict_thresholds": {
        "strong_fit": 80.0,
        "good_fit": 60.0,
        "partial_fit": 40.0,
        # below 40.0 => NEEDS_WORK
    },
    # Default target level when not explicitly specified
    "default_target_levels": {
        "MUST_HAVE": 70,
        "NICE_TO_HAVE": 65,
    },
    # Configurable symmetric/directional related skills mapping
    "related_skills": {
        "mysql": ["postgresql", "sql", "sqlite"],
        "postgresql": ["mysql", "sql", "sqlite"],
        "sql": ["postgresql", "mysql"],
        "react": ["vue.js", "angular", "next.js"],
        "vue.js": ["react"],
        "angular": ["react"],
        "fastapi": ["flask", "django"],
        "flask": ["fastapi", "django"],
        "django": ["fastapi", "flask"],
        "pytorch": ["tensorflow", "machine learning"],
        "tensorflow": ["pytorch", "machine learning"],
        "docker": ["kubernetes", "cloud computing"],
        "kubernetes": ["docker", "cloud computing"],
        "aws": ["google cloud", "azure", "cloud computing"],
        "google cloud": ["aws", "azure", "cloud computing"],
        "azure": ["aws", "google cloud", "cloud computing"],
        "typescript": ["javascript"],
        "javascript": ["typescript"],
        "java": ["c#", "c++", "spring boot"],
        "spring boot": ["java"],
        "c++": ["c", "java"],
    },
    # Freshness half-life in days (if dates provided; else decay skipped)
    "freshness_decay_days": 180,
}


def derive_requirements_from_opportunity(opportunity: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Derives structured skill requirements if opportunity.skillRequirements is empty.
    Required skills => MUST_HAVE with default target (e.g. min_verified_score or 70).
    Good-to-have / preferred skills => NICE_TO_HAVE with default target (e.g. 65).
    """
    reqs: List[Dict[str, Any]] = []
    
    # 1. If explicit skillRequirements / skill_requirements exist and non-empty, use them
    explicit = opportunity.get("skillRequirements") or opportunity.get("skill_requirements")
    if explicit and isinstance(explicit, list) and len(explicit) > 0:
        for r in explicit:
            importance = r.get("importance", "MUST_HAVE")
            if importance not in ("MUST_HAVE", "NICE_TO_HAVE"):
                importance = "MUST_HAVE" if "must" in str(importance).lower() else "NICE_TO_HAVE"
            target = r.get("targetLevel") or r.get("target_level")
            if target is None:
                target = JD_ANALYSIS_CONFIG["default_target_levels"].get(importance, 70)
            reqs.append({
                "skill": normalize_skill_name(r.get("skill", "")),
                "importance": importance,
                "targetLevel": int(target)
            })
        return reqs

    # 2. Derive from required_skills & good_to_have
    base_target = opportunity.get("min_verified_score", JD_ANALYSIS_CONFIG["default_target_levels"]["MUST_HAVE"])
    proficiencies = opportunity.get("min_skill_proficiencies", {})

    for s in opportunity.get("required_skills", []):
        norm_s = normalize_skill_name(s)
        target = proficiencies.get(s, proficiencies.get(norm_s, base_target))
        reqs.append({
            "skill": norm_s,
            "importance": "MUST_HAVE",
            "targetLevel": int(target)
        })

    for s in opportunity.get("good_to_have", []):
        norm_s = normalize_skill_name(s)
        # Avoid duplicate if already in required
        if any(r["skill"] == norm_s for r in reqs):
            continue
        reqs.append({
            "skill": norm_s,
            "importance": "NICE_TO_HAVE",
            "targetLevel": int(proficiencies.get(s, JD_ANALYSIS_CONFIG["default_target_levels"]["NICE_TO_HAVE"]))
        })

    return reqs


def _normalize_student_skills(student_skills: Any) -> Dict[str, Dict[str, Any]]:
    """
    Normalizes student skills dictionary into canonical lookup:
    {canonical_name: {"score": int, "verified": bool, "date": Optional[str]}}
    """
    normalized: Dict[str, Dict[str, Any]] = {}
    if not isinstance(student_skills, dict):
        return normalized

    if "skills" in student_skills and isinstance(student_skills["skills"], dict):
        student_skills = student_skills["skills"]

    for k, v in student_skills.items():
        c_name = normalize_skill_name(str(k))
        if not c_name:
            continue
        if isinstance(v, dict):
            score = v.get("score")
            verified = v.get("verified", False)
            date_str = v.get("verifiedDate") or v.get("date") or v.get("verified_date")
        else:
            try:
                score = int(v)
            except (ValueError, TypeError):
                score = None
            verified = False
            date_str = None
        
        normalized[c_name.lower()] = {
            "canonicalName": c_name,
            "score": score,
            "verified": verified,
            "date": date_str
        }
    return normalized


def analyze_student_for_opportunity(
    student_skills: Any,
    requirements: Optional[List[Dict[str, Any]]] = None,
    opportunity: Optional[Dict[str, Any]] = None,
    options: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Pure, deterministic evaluation of student skills against JD requirements.

    Returns:
    {
      "overallFit": 0-100,
      "mustHaveCoverage": float,
      "niceToHaveCoverage": float,
      "verdict": "STRONG_FIT" | "GOOD_FIT" | "PARTIAL_FIT" | "NEEDS_WORK",
      "skills": [{
         "skill": str,
         "importance": "MUST_HAVE" | "NICE_TO_HAVE",
         "targetLevel": int,
         "studentScore": int | None,
         "matchedVia": "EXACT" | "ALIAS" | "RELATED" | "NONE",
         "matchedSkill": str | None,
         "coverage": float,
         "status": "MET" | "PARTIAL" | "GAP" | "NOT_ASSESSED",
         "gap": int
      }],
      "topGaps": [ ... max 3 ... ],
      "explanation": List[str]
    }
    """
    opts = options or {}
    config = JD_ANALYSIS_CONFIG

    # 1. Resolve requirements (explicit or derived)
    if isinstance(requirements, dict):
        opportunity = requirements
        requirements = None

    if requirements is None or len(requirements) == 0:
        if opportunity:
            if isinstance(opportunity, dict) and opportunity.get("skillRequirements") and isinstance(opportunity.get("skillRequirements"), list):
                req_list = opportunity["skillRequirements"]
            else:
                req_list = derive_requirements_from_opportunity(opportunity)
        else:
            req_list = []
    elif isinstance(requirements, list):
        processed_reqs = []
        for r_item in requirements:
            if isinstance(r_item, str):
                processed_reqs.append({
                    "skill": r_item,
                    "importance": "MUST_HAVE",
                    "targetLevel": 70
                })
            elif isinstance(r_item, dict):
                processed_reqs.append(r_item)
        req_list = processed_reqs
    else:
        req_list = []

    if not req_list and opportunity:
        req_list = derive_requirements_from_opportunity(opportunity)

    norm_skills_lookup = _normalize_student_skills(student_skills)

    skills_analysis: List[Dict[str, Any]] = []
    explanations: List[str] = []

    total_weighted_coverage = 0.0
    total_weights = 0.0

    must_have_weighted_cov = 0.0
    must_have_weights = 0.0

    nice_have_weighted_cov = 0.0
    nice_have_weights = 0.0

    has_must_have_gap_or_unassessed = False
    must_have_unmet_skills: List[str] = []

    # Check whether freshness decay is possible
    has_any_dates = any(item.get("date") for item in norm_skills_lookup.values())
    if not has_any_dates:
        decay_note = "Freshness decay skipped: no assessment dates recorded."
    else:
        decay_note = None

    for r in req_list:
        raw_skill_name = r.get("skill", "")
        norm_req_name = normalize_skill_name(raw_skill_name)
        importance = r.get("importance", "MUST_HAVE")
        if importance not in ("MUST_HAVE", "NICE_TO_HAVE"):
            importance = "MUST_HAVE"

        target_level = int(r.get("targetLevel") or r.get("target_level") or config["default_target_levels"].get(importance, 70))
        target_level = max(1, min(100, target_level))

        weight = config["weights"].get(importance, 1.0)

        # Match strategy: EXACT / ALIAS -> RELATED -> NONE
        matched_via = "NONE"
        matched_skill_name: Optional[str] = None
        raw_score: Optional[int] = None
        effective_score = 0.0

        key_lower = norm_req_name.lower()

        # Check exact or normalized alias
        if key_lower in norm_skills_lookup and norm_skills_lookup[key_lower]["score"] is not None:
            matched_via = "EXACT" if raw_skill_name.strip().lower() == norm_req_name.lower() else "ALIAS"
            matched_skill_name = norm_skills_lookup[key_lower]["canonicalName"]
            raw_score = int(norm_skills_lookup[key_lower]["score"])
            effective_score = float(raw_score)
        else:
            # Check related skills
            rel_keys = config["related_skills"].get(key_lower, [])
            for rel_k in rel_keys:
                if rel_k in norm_skills_lookup and norm_skills_lookup[rel_k]["score"] is not None:
                    matched_via = "RELATED"
                    matched_skill_name = norm_skills_lookup[rel_k]["canonicalName"]
                    raw_score = int(norm_skills_lookup[rel_k]["score"])
                    effective_score = raw_score * config["related_multiplier"]
                    break

        # Calculate coverage: min(effectiveScore / target, 1.0)
        if raw_score is None:
            status = "NOT_ASSESSED"
            coverage = 0.0
            gap = target_level
        else:
            coverage = min(1.0, max(0.0, effective_score / target_level))
            gap = max(0, int(round(target_level - effective_score)))
            if coverage >= config["coverage_thresholds"]["met"]:
                status = "MET"
            elif coverage >= config["coverage_thresholds"]["partial"]:
                status = "PARTIAL"
            else:
                status = "GAP"

        # Check Must-Have constraints
        if importance == "MUST_HAVE":
            must_have_weights += weight
            must_have_weighted_cov += weight * coverage
            if status in ("GAP", "NOT_ASSESSED"):
                has_must_have_gap_or_unassessed = True
                must_have_unmet_skills.append(norm_req_name)
        else:
            nice_have_weights += weight
            nice_have_weighted_cov += weight * coverage

        total_weights += weight
        total_weighted_coverage += weight * coverage

        skills_analysis.append({
            "skill": norm_req_name,
            "importance": importance,
            "targetLevel": target_level,
            "studentScore": raw_score,  # None if not assessed
            "effectiveScore": round(effective_score, 1) if raw_score is not None else None,
            "matchedVia": matched_via,
            "matchedSkill": matched_skill_name,
            "coverage": round(coverage, 3),
            "status": status,
            "gap": gap
        })

    # Overall calculation
    if total_weights > 0:
        raw_overall_fit = (total_weighted_coverage / total_weights) * 100.0
    else:
        raw_overall_fit = 0.0
    overall_fit = int(round(raw_overall_fit))
    overall_fit = max(0, min(100, overall_fit))

    must_have_coverage_pct = round((must_have_weighted_cov / must_have_weights) * 100.0, 1) if must_have_weights > 0 else 100.0
    nice_have_coverage_pct = round((nice_have_weighted_cov / nice_have_weights) * 100.0, 1) if nice_have_weights > 0 else 100.0

    # Determine Base Verdict
    vt = config["verdict_thresholds"]
    if overall_fit >= vt["strong_fit"]:
        base_verdict = "STRONG_FIT"
    elif overall_fit >= vt["good_fit"]:
        base_verdict = "GOOD_FIT"
    elif overall_fit >= vt["partial_fit"]:
        base_verdict = "PARTIAL_FIT"
    else:
        base_verdict = "NEEDS_WORK"

    # Enforce MUST_HAVE Capping Rule:
    # A missing or gap MUST_HAVE caps the verdict at PARTIAL_FIT, explicitly stated in explanation.
    final_verdict = base_verdict
    capped_due_to_must_have = False
    if has_must_have_gap_or_unassessed:
        if base_verdict in ("STRONG_FIT", "GOOD_FIT"):
            final_verdict = "PARTIAL_FIT"
            capped_due_to_must_have = True
        elif base_verdict == "PARTIAL_FIT":
            capped_due_to_must_have = True

    # Identify Top Gaps (max 3, prioritized by MUST_HAVE first, then gap size)
    unmet_skills = [
        s for s in skills_analysis if s["status"] in ("GAP", "NOT_ASSESSED", "PARTIAL")
    ]
    # Sort key: MUST_HAVE before NICE_TO_HAVE, then highest gap
    unmet_skills.sort(
        key=lambda x: (0 if x["importance"] == "MUST_HAVE" else 1, -x["gap"])
    )
    top_gaps = unmet_skills[:3]

    # Generate Explainable AI Rationales
    met_count = sum(1 for s in skills_analysis if s["status"] == "MET")
    total_count = len(skills_analysis)

    explanations.append(
        f"Overall JD fit: {overall_fit}% with {met_count} of {total_count} requirements fully met."
    )
    explanations.append(
        f"Must-have requirement coverage is {must_have_coverage_pct}%; preferred skills coverage is {nice_have_coverage_pct}%."
    )

    if capped_due_to_must_have:
        unmet_names = ", ".join(must_have_unmet_skills[:3])
        explanations.append(
            f"Verdict capped at PARTIAL_FIT due to missing or below-target core must-have requirement(s): {unmet_names}."
        )
    else:
        if final_verdict == "STRONG_FIT":
            explanations.append("High alignment across all primary verified technical benchmarks.")
        elif final_verdict == "GOOD_FIT":
            explanations.append("Solid core match with minor opportunities for competency expansion.")
        elif final_verdict == "PARTIAL_FIT":
            explanations.append("Partial alignment. Target specific gap labs or skill assessments to raise fit.")
        else:
            explanations.append("Foundational development required across key role competencies.")

    # Note on related skills if any were used
    related_matches = [s for s in skills_analysis if s["matchedVia"] == "RELATED"]
    if related_matches:
        rel_info = ", ".join([f"{r['skill']} via {r['matchedSkill']} (x0.6 factor)" for r in related_matches])
        explanations.append(f"Related skill equivalence applied: {rel_info}.")

    if decay_note:
        explanations.append(decay_note)

    summary_data = {
        "mustHaveCoverage": must_have_coverage_pct,
        "niceToHaveCoverage": nice_have_coverage_pct,
        "topGaps": [g["skill"] for g in top_gaps],
        "metCount": met_count,
        "totalCount": total_count,
    }

    verdict_explanation = " ".join(explanations)

    return {
        "overallFit": overall_fit,
        "mustHaveCoverage": must_have_coverage_pct,
        "niceToHaveCoverage": nice_have_coverage_pct,
        "verdict": final_verdict,
        "verdictExplanation": verdict_explanation,
        "skills": skills_analysis,
        "topGaps": top_gaps,
        "criticalGaps": top_gaps,
        "summary": summary_data,
        "explanation": explanations,
    }
