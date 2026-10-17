"""
HireX Evidence-to-Skill Mapping Engine
Connects claimed skills to concrete multi-tier proof artifacts (Projects, Assessments,
Certificates, Internships, Repositories).
Computes mathematically grounded confidence scores using tier weighting, depth,
and exponential time decay, categorizing skills into VERIFIED, PARTIALLY_VERIFIED, and UNSUPPORTED.
Aligns with ESCO & O*NET canonical taxonomy.
"""

import time
import math
import hashlib
from typing import Dict, Any, List, Optional
from app.services.skill_ontology import skill_ontology_service
from app.data.seed_data import STUDENTS, log_audit_trail

# Multi-Tier Weight Multipliers
EVIDENCE_TIER_WEIGHTS = {
    "PROJECT": 1.00,       # Working repository, AST validated capstone, live deployment
    "ASSESSMENT": 0.85,    # Proctored examination, AST compiler lab, timed challenge
    "INTERNSHIP": 0.80,    # Industrial experience letter, corporate verification
    "CERTIFICATE": 0.70,   # NPTEL Elite, AWS, Coursera with cryptographic token
    "COURSE": 0.50,        # Completed MOOC syllabus
    "SELF_CLAIM": 0.15     # Unverified keyword on student resume
}

# Verification Thresholds
VERIFIED_THRESHOLD = 75.0
PARTIAL_THRESHOLD = 40.0

# In-memory Evidence Ledger: student_id -> List of evidence items
STUDENT_EVIDENCE_REGISTRY: Dict[str, List[Dict[str, Any]]] = {
    "std_1": [
        {
            "id": "ev_p1",
            "title": "HireX Distributed Job Ingestion & Deduplication Engine",
            "type": "PROJECT",
            "description": "Built high-throughput multi-source placement ingestion engine with MinHash LSH and vector cosine deduplication.",
            "url_or_repo": "https://github.com/dhruvpatil/HireX-Ingestion-Engine",
            "strength": 0.95,
            "created_at": "2024-09-15",
            "age_months": 1,
            "extracted_skills": ["Python", "FastAPI", "PostgreSQL", "Data Structures", "Algorithms"]
        },
        {
            "id": "ev_p2",
            "title": "Autonomous Multi-Agent Collaboration Workspace",
            "type": "PROJECT",
            "description": "Full-stack React & FastAPI agentic workspace with WebSockets and dynamic state synchronization.",
            "url_or_repo": "https://github.com/dhruvpatil/HireX-Agentic-Collab",
            "strength": 0.92,
            "created_at": "2024-08-20",
            "age_months": 2,
            "extracted_skills": ["React", "TypeScript", "Python", "FastAPI"]
        },
        {
            "id": "ev_a1",
            "title": "AST Python Compiler & Algorithmic Complexity Lab",
            "type": "ASSESSMENT",
            "description": "Proctored institutional AST evaluator. Verified O(N) linear time complexity across 8/8 test suites.",
            "url_or_repo": "hirex://assessments/ast/py_eval_9918",
            "strength": 0.94,
            "created_at": "2024-10-01",
            "age_months": 0,
            "extracted_skills": ["Python", "Data Structures", "Algorithms"]
        },
        {
            "id": "ev_a2",
            "title": "Proctored Modern React & Component Architecture Exam",
            "type": "ASSESSMENT",
            "description": "Timed evaluation of hooks, concurrency, state lifecycles, and a11y standards. Score: 89%.",
            "url_or_repo": "hirex://assessments/react/eval_8102",
            "strength": 0.89,
            "created_at": "2024-09-10",
            "age_months": 1,
            "extracted_skills": ["React"]
        },
        {
            "id": "ev_c1",
            "title": "NPTEL Elite + Gold — Cloud Computing & Distributed Systems",
            "type": "CERTIFICATE",
            "description": "12-week national examination by IIT Kharagpur. Score: 84%. AICTE Approved with 3 NCrF credits.",
            "url_or_repo": "sha256:a4f89d31b9e28f110c7e2b74051a96da438fbcd58269e8b15a6b0c20188941cf",
            "strength": 0.84,
            "created_at": "2024-10-05",
            "age_months": 0,
            "extracted_skills": ["Cloud Computing", "Distributed Systems"]
        },
        {
            "id": "ev_c2",
            "title": "IBM Machine Learning & Deep Neural Networks Specialization",
            "type": "CERTIFICATE",
            "description": "Coursera verified specialization covering supervised learning, Scikit-Learn, and regression modeling.",
            "url_or_repo": "coursera:IBM-ML-99214",
            "strength": 0.82,
            "created_at": "2024-07-12",
            "age_months": 3,
            "extracted_skills": ["Machine Learning", "Python"]
        }
    ]
}


class EvidenceMapperService:
    def __init__(self):
        pass

    def _compute_time_decay(self, age_months: float) -> float:
        """
        Exponential time-decay: w_t = exp(-lambda * delta_t).
        Evidence loses 15% strength per year (lambda = 0.013 per month).
        """
        decay_rate = 0.013
        return math.exp(-decay_rate * max(0.0, age_months))

    def compute_skill_confidence(self, evidence_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregates multiple pieces of evidence for a single skill into a unified
        confidence score (0-100) and status.
        """
        if not evidence_list:
            return {
                "confidence_score": 0.0,
                "status": "UNSUPPORTED",
                "raw_weight": 0.0,
                "primary_proof_tier": "NONE"
            }

        total_weight = 0.0
        best_tier = "SELF_CLAIM"
        highest_tier_rank = -1

        tier_order = ["SELF_CLAIM", "COURSE", "CERTIFICATE", "INTERNSHIP", "ASSESSMENT", "PROJECT"]

        for item in evidence_list:
            etype = (item.get("type") or "PROJECT").upper()
            base_tier_weight = EVIDENCE_TIER_WEIGHTS.get(etype, 0.5)
            strength = float(item.get("strength") or 0.8)
            age = float(item.get("age_months") or 0)
            decay = self._compute_time_decay(age)

            effective_item_weight = base_tier_weight * strength * decay
            total_weight += effective_item_weight

            # Track highest quality tier
            if etype in tier_order and tier_order.index(etype) > highest_tier_rank:
                highest_tier_rank = tier_order.index(etype)
                best_tier = etype

        # Non-linear asymptotic saturation curve: Score = 100 * (1 - exp(-Raw / 0.95))
        confidence = min(99.0, round(100.0 * (1.0 - math.exp(-total_weight / 0.95)), 1))

        # Check for direct high-tier proof requirement for 'VERIFIED'
        has_concrete_proof = any(
            (i.get("type") or "").upper() in ("PROJECT", "ASSESSMENT", "CERTIFICATE", "INTERNSHIP")
            for i in evidence_list
        )

        if confidence >= VERIFIED_THRESHOLD and has_concrete_proof:
            status = "VERIFIED"
        elif confidence >= PARTIAL_THRESHOLD:
            status = "PARTIALLY_VERIFIED"
        else:
            status = "UNSUPPORTED"

        return {
            "confidence_score": confidence,
            "status": status,
            "raw_weight": round(total_weight, 3),
            "primary_proof_tier": best_tier
        }

    def compute_student_matrix(self, student_id: str = "std_1") -> Dict[str, Any]:
        """
        Builds the complete Skill-to-Evidence Matrix for a student, showing linked proof,
        canonical ESCO taxonomy alignment, and verified vs unsupported breakdown.
        """
        from app.db.canonical_store import canonical_store
        student = next((s for s in STUDENTS if s["id"] == student_id), None) or canonical_store.get_student(student_id)
        base_skills = student.get("skills", {}) if student else {}
        evidence_items = list(STUDENT_EVIDENCE_REGISTRY.get(student_id, []))
        # Merge persistent disk evidence from canonical_store
        disk_items = canonical_store.get_student_evidence(student_id)
        existing_ids = {e.get("id") for e in evidence_items}
        for di in disk_items:
            if di.get("id") not in existing_ids:
                evidence_items.append(di)

        # Group evidence by extracted skills
        skill_evidence_map: Dict[str, List[Dict[str, Any]]] = {}

        # 1. Map all concrete evidence items
        for ev in evidence_items:
            extracted = ev.get("extracted_skills", [])
            for raw_sk in extracted:
                canonical = skill_ontology_service.resolve_canonical(raw_sk)
                sk_name = canonical["name"]
                if sk_name not in skill_evidence_map:
                    skill_evidence_map[sk_name] = []
                # Append copy of evidence item with canonical context
                ev_copy = dict(ev)
                ev_copy["matched_as"] = sk_name
                skill_evidence_map[sk_name].append(ev_copy)

        # 2. Add base profile skills if not already present
        for sk_name in base_skills.keys():
            canonical = skill_ontology_service.resolve_canonical(sk_name)
            name = canonical["name"]
            if name not in skill_evidence_map:
                skill_evidence_map[name] = []
                # Add default self claim or base verification if verified in profile
                if base_skills[sk_name].get("verified"):
                    skill_evidence_map[name].append({
                        "id": f"ev_base_{name.lower().replace(' ', '_')}",
                        "title": f"Initial Institutional Placement Baseline ({name})",
                        "type": "ASSESSMENT",
                        "description": f"Verified during campus placement registration. Score: {base_skills[sk_name].get('score', 80)}%.",
                        "url_or_repo": "hirex://baseline/campus_onboarding",
                        "strength": base_skills[sk_name].get("score", 80) / 100.0,
                        "created_at": "2024-06-01",
                        "age_months": 4,
                        "extracted_skills": [name]
                    })
                else:
                    skill_evidence_map[name].append({
                        "id": f"ev_claim_{name.lower().replace(' ', '_')}",
                        "title": f"Self-Reported Resume Skill ({name})",
                        "type": "SELF_CLAIM",
                        "description": "Added on resume without linked repository or institutional assessment certificate.",
                        "url_or_repo": "resume://unverified",
                        "strength": 0.40,
                        "created_at": "2024-09-01",
                        "age_months": 1,
                        "extracted_skills": [name]
                    })

        # 3. Assemble matrix records
        matrix_rows = []
        verified_count = 0
        partial_count = 0
        unsupported_count = 0

        for sk_name, proofs in skill_evidence_map.items():
            canonical = skill_ontology_service.resolve_canonical(sk_name)
            calc = self.compute_skill_confidence(proofs)

            if calc["status"] == "VERIFIED":
                verified_count += 1
            elif calc["status"] == "PARTIALLY_VERIFIED":
                partial_count += 1
            else:
                unsupported_count += 1

            matrix_rows.append({
                "skill": sk_name,
                "canonical_code": canonical["code"],
                "esco_uri": canonical["esco_uri"],
                "category": canonical["category"],
                "status": calc["status"],
                "confidence_score": calc["confidence_score"],
                "primary_proof_tier": calc["primary_proof_tier"],
                "raw_weight": calc["raw_weight"],
                "evidence_count": len(proofs),
                "evidence_items": proofs
            })

        # Sort: VERIFIED first (descending confidence), then PARTIALLY_VERIFIED, then UNSUPPORTED
        status_rank = {"VERIFIED": 3, "PARTIALLY_VERIFIED": 2, "UNSUPPORTED": 1}
        matrix_rows.sort(key=lambda r: (status_rank.get(r["status"], 0), r["confidence_score"]), reverse=True)

        return {
            "student_id": student_id,
            "total_skills": len(matrix_rows),
            "summary": {
                "verified_count": verified_count,
                "partial_count": partial_count,
                "unsupported_count": unsupported_count,
                "overall_evidence_integrity": round((verified_count / max(1, len(matrix_rows))) * 100, 1)
            },
            "skills": matrix_rows
        }

    def submit_evidence(self, student_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Accepts a user-submitted evidence item (repo link, project report, certificate scan,
        internship letter, or assessment token), extracts canonical skills, and incorporates it
        into the live student evidence registry.
        """
        if student_id not in STUDENT_EVIDENCE_REGISTRY:
            STUDENT_EVIDENCE_REGISTRY[student_id] = []

        title = payload.get("title") or "Independent Technical Project"
        etype = (payload.get("type") or "PROJECT").upper()
        description = payload.get("description") or ""
        url_or_repo = payload.get("url_or_repo") or ""
        strength = float(payload.get("strength") or 0.85)

        # Extract skills
        raw_skills = payload.get("extracted_skills") or []
        if not raw_skills:
            # Auto-extract from text
            extracted = skill_ontology_service.extract_skills(f"{title} {description}")
            raw_skills = [s["skill"] for s in extracted]

        canonical_skills = []
        for sk in raw_skills:
            can = skill_ontology_service.resolve_canonical(sk)
            if can["name"] not in canonical_skills:
                canonical_skills.append(can["name"])

        if not canonical_skills:
            canonical_skills = ["Software Engineering"]

        ev_id = f"ev_user_{int(time.time())}_{hashlib.md5(title.encode()).hexdigest()[:6]}"
        new_item = {
            "id": ev_id,
            "title": title,
            "type": etype,
            "description": description,
            "url_or_repo": url_or_repo,
            "strength": strength,
            "created_at": time.strftime("%Y-%m-%d"),
            "age_months": 0,
            "extracted_skills": canonical_skills
        }

        STUDENT_EVIDENCE_REGISTRY[student_id].append(new_item)
        try:
            from app.db.canonical_store import canonical_store
            canonical_store.save_evidence_item(student_id, new_item)
        except Exception as e:
            print(f"[EvidenceMapper] Warning persisting evidence to canonical store: {e}")

        log_audit_trail(
            actor=student_id,
            role="student",
            action="EVIDENCE_SUBMITTED",
            entity="SkillEvidence",
            entity_id=ev_id,
            new_value=title
        )

        return {
            "status": "success",
            "evidence_id": ev_id,
            "skills_affected": canonical_skills,
            "message": f"Successfully incorporated {len(canonical_skills)} skills into institutional evidence matrix."
        }


evidence_mapper_service = EvidenceMapperService()
