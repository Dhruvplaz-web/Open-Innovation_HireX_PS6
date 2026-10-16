"""
HireX Multi-Source Job Ingestion & Fuzzy Deduplication Service
Cleans unformatted WhatsApp text, extracts entities (Company, Role, CTC, Batch),
tiers skills into Required (70%) vs Preferred (30%), and calculates multi-attribute similarity
to prevent duplicate job listings arriving from multiple placement channels.
"""

import re
import difflib
import hashlib
from typing import Dict, List, Tuple, Any, Optional
from datetime import datetime, timezone

from app.services.skill_ontology import skill_ontology, CANONICAL_SKILL_MAP

# Prominent tech companies common in campus placements for heuristic matching
KNOWN_COMPANIES = [
    "TCS", "Tata Consultancy Services", "Infosys", "Wipro", "Cognizant", "Accenture",
    "Capgemini", "Persistent Systems", "Persistent", "Barclays", "Tech Mahindra",
    "HCL Technologies", "HCLTech", "LTIMindtree", "Mindtree", "KPIT", "Zensar",
    "Amazon", "Microsoft", "Google", "Nvidia", "Oracle", "Cisco", "IBM", "Intel",
    "Morgan Stanley", "JPMorgan", "JP Morgan", "Goldman Sachs", "DE Shaw",
    "Deloitte", "PwC", "EY", "KPMG", "Siemens", "Robert Bosch", "Bosch", "PubMatic"
]

KNOWN_ROLES = [
    "Software Development Engineer", "SDE", "SDE-1", "SDE-I", "Software Engineer",
    "Graduate Engineer Trainee", "GET", "Associate Software Engineer", "ASE",
    "Specialist Programmer", "System Engineer", "Digital Specialist Engineer",
    "Full-Stack Developer", "Full Stack Developer", "Backend Developer", "Frontend Developer",
    "Python Developer", "Java Developer", "React Developer", "Node Developer",
    "Data Analyst", "Data Engineer", "Machine Learning Engineer", "DevOps Engineer",
    "Cloud Engineer", "Quality Assurance Engineer", "QA Engineer", "SDET"
]


class JobDeduplicationService:
    """
    Intelligent Intake Gatekeeper: Parses unstructured WhatsApp posts,
    normalizes skill variants, and calculates composite similarity to merge duplicates.
    """

    @classmethod
    def clean_whatsapp_text(cls, raw_text: str) -> str:
        """
        Strips common WhatsApp forwarding markers, timestamps, emojis, and noise.
        """
        if not raw_text:
            return ""

        # Remove WhatsApp forwarding headers
        cleaned = re.sub(r'(?i)forwarded\s+(?:as\s+received|many\s+times|\.\.\.?)', '', raw_text)
        # Remove timestamps like "[10/16, 2:30 PM] Name:" or "10/16/24, 14:30 -"
        cleaned = re.sub(r'\[?\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?,\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\]?\s*-?', '', cleaned)
        # Remove common phone numbers
        cleaned = re.sub(r'\+?\d{1,3}[-.\s]?\d{10}', '', cleaned)
        # Remove URLs temporarily preserved for extraction later
        # Remove decorative symbols and emojis
        cleaned = re.sub(r'[🚨📢🔥💥✨🎯📍📌⚠️👉🔗✅❌]', ' ', cleaned)
        # Normalize whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        return cleaned

    @classmethod
    def extract_company(cls, text: str) -> str:
        """Heuristically extracts company name from unstructured text."""
        # 1. Exact gazetteer match
        for comp in KNOWN_COMPANIES:
            pattern = r'(?i)\b' + re.escape(comp) + r'\b'
            if re.search(pattern, text):
                return comp

        # 2. Heuristic: "X is hiring" or "Drive for X"
        match = re.search(r'(?i)(?:hiring\s+at|drive\s+for|openings?\s+at|opportunity\s+at)\s+([A-Z][a-zA-Z0-9\s&]{2,25})', text)
        if match:
            return match.group(1).strip()

        # 3. Fallback: Check first capitalized phrase
        first_words = re.findall(r'\b[A-Z][a-zA-Z0-9]{2,}\b', text)
        if first_words:
            return first_words[0]

        return "Enterprise Partner"

    @classmethod
    def extract_role(cls, text: str) -> str:
        """Extracts job role or title from text with skill-role normalization."""
        # 1. Check known roles first
        for role in KNOWN_ROLES:
            pattern = r'(?i)\b' + re.escape(role) + r'\b'
            if re.search(pattern, text):
                return role

        # 2. Match patterns like "recruiting ReactJS / Typescript Developers" or "hiring for Python Engineer"
        match = re.search(
            r'(?i)(?:hiring\s+for|recruiting|hiring|seeking|looking\s+for|role\s*[:\-]?|position\s*[:\-]?)\s+([A-Za-z0-9\s\-/]+?\s+(?:Developer|Developers|Engineer|Engineers|Programmer|Programmers|Specialist|Trainee|Intern))',
            text
        )
        if match:
            candidate_role = match.group(1).strip()
            # Normalize plurals
            candidate_role = re.sub(r'(?i)developers\b', 'Developer', candidate_role)
            candidate_role = re.sub(r'(?i)engineers\b', 'Engineer', candidate_role)
            candidate_role = re.sub(r'(?i)programmers\b', 'Programmer', candidate_role)
            # Normalize any embedded skill variants (e.g. ReactJS -> React)
            words = candidate_role.split()
            normalized_words = [skill_ontology.normalize_skill(w) if skill_ontology.normalize_skill(w) in CANONICAL_SKILL_MAP.values() else w for w in words]
            return " ".join(normalized_words)[:40]

        # 3. Fallback: If skills found, e.g. React -> "React Developer"
        found_skills = skill_ontology.extract_and_normalize_skills(text)
        if found_skills:
            return f"{found_skills[0]} Developer"

        return "Graduate Software Engineer"

    @classmethod
    def extract_ctc(cls, text: str) -> Tuple[float, float, str]:
        """
        Extracts CTC range in LPA (Lakhs Per Annum).
        Returns (min_lpa, max_lpa, display_str).
        """
        # Range: "5.5 to 7.5 LPA" or "4 - 6 LPA" or "4.5-6.5 L"
        range_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(?:LPA|lpa|L|lakhs|Lakhs)', text)
        if range_match:
            min_c = float(range_match.group(1))
            max_c = float(range_match.group(2))
            return min_c, max_c, f"₹{min_c} - {max_c} LPA"

        # Single: "6.5 LPA"
        single_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:LPA|lpa|L|lakhs|Lakhs)', text)
        if single_match:
            val = float(single_match.group(1))
            return val, val, f"₹{val} LPA"

        # Stipend: "₹35,000 / month"
        stipend_match = re.search(r'₹?\s*(\d{2,3}(?:,\d{3})?|\d{4,6})\s*(?:/|\s*per\s*)?\s*(?:month|pm|stipend)', text, re.IGNORECASE)
        if stipend_match:
            raw_val = stipend_match.group(1).replace(',', '')
            monthly = float(raw_val)
            annual_lpa = round((monthly * 12) / 100000, 2)
            return annual_lpa, annual_lpa, f"₹{monthly:,.0f}/month (approx {annual_lpa} LPA)"

        return 4.5, 6.5, "₹4.5 - 6.5 LPA (Industry Standard)"

    @classmethod
    def extract_batch(cls, text: str) -> str:
        """Extracts eligible graduation batch."""
        batch_match = re.search(r'(?i)\b(202[4-7])\s*(?:batch|passouts?|pass-outs?)?', text)
        if batch_match:
            return f"{batch_match.group(1)} Batch"
        return "2025 Batch"

    @classmethod
    def extract_tiered_skills(cls, text: str) -> Tuple[List[str], List[str]]:
        """
        Linguistically splits text into Required Skills (70% weight) vs Preferred Skills (30% weight).
        Uses natural language boundary markers.
        """
        # Look for section split markers
        preferred_markers = [
            r'good\s+to\s+have\s*[:\-]?',
            r'preferred\s*(?:skills)?\s*[:\-]?',
            r'nice\s+to\s+have\s*[:\-]?',
            r'bonus\s*(?:skills)?\s*[:\-]?',
            r'advantageous\s*[:\-]?'
        ]

        # Combine regex
        combined_pref_pattern = '|'.join(preferred_markers)
        split_parts = re.split(combined_pref_pattern, text, maxsplit=1, flags=re.IGNORECASE)

        required_text = split_parts[0]
        preferred_text = split_parts[1] if len(split_parts) > 1 else ""

        required_skills = skill_ontology.extract_and_normalize_skills(required_text)
        preferred_skills = skill_ontology.extract_and_normalize_skills(preferred_text)

        # De-duplicate: If skill is in required, remove from preferred
        preferred_skills = [s for s in preferred_skills if s not in required_skills]

        # If no skills separated, default top 3 to required and rest to preferred
        if not required_skills and not preferred_skills:
            all_found = skill_ontology.extract_and_normalize_skills(text)
            if all_found:
                required_skills = all_found[:4]
                preferred_skills = all_found[4:]
            else:
                required_skills = ["Problem Solving", "Data Structures & Algorithms"]
                preferred_skills = ["Git", "Communication"]

        return required_skills, preferred_skills

    @classmethod
    def compute_similarity(cls, job_a: Dict[str, Any], job_b: Dict[str, Any]) -> float:
        """
        Computes multi-attribute composite similarity between two job postings:
        S_comp = 0.35 * S_company + 0.30 * S_title + 0.25 * S_skills + 0.10 * S_ctc
        """
        # 1. Company Similarity (Normalized Levenshtein)
        comp_a = str(job_a.get("company", "")).strip().lower()
        comp_b = str(job_b.get("company", "")).strip().lower()
        s_company = difflib.SequenceMatcher(None, comp_a, comp_b).ratio()

        # If companies are completely distinct, composite score shouldn't merge
        if s_company < 0.60:
            return s_company * 0.40  # Heavily dampen

        # 2. Title Similarity (Token Overlap & SequenceMatcher)
        clean_title_a = re.sub(r'[^a-zA-Z0-9\s]', ' ', str(job_a.get("title", ""))).lower().split()
        clean_title_b = re.sub(r'[^a-zA-Z0-9\s]', ' ', str(job_b.get("title", ""))).lower().split()
        set_a, set_b = set(clean_title_a), set(clean_title_b)
        token_jaccard = len(set_a.intersection(set_b)) / len(set_a.union(set_b)) if set_a and set_b else 0.0
        
        title_a = " ".join(sorted(clean_title_a))
        title_b = " ".join(sorted(clean_title_b))
        seq_ratio = difflib.SequenceMatcher(None, title_a, title_b).ratio()
        s_title = max(token_jaccard, seq_ratio)

        # 3. Skills Jaccard Similarity
        skills_a = set(job_a.get("required_skills", []) + job_a.get("preferred_skills", []))
        skills_b = set(job_b.get("required_skills", []) + job_b.get("preferred_skills", []))
        
        if skills_a and skills_b:
            intersection = skills_a.intersection(skills_b)
            union = skills_a.union(skills_b)
            s_skills = len(intersection) / len(union) if union else 0.0
        else:
            s_skills = 0.50

        # 4. CTC Overlap
        min_a = float(job_a.get("min_ctc", 4.0))
        max_a = float(job_a.get("max_ctc", 8.0))
        min_b = float(job_b.get("min_ctc", 4.0))
        max_b = float(job_b.get("max_ctc", 8.0))

        overlap_min = max(min_a, min_b)
        overlap_max = min(max_a, max_b)
        if overlap_max >= overlap_min:
            s_ctc = 1.0 - (abs(min_a - min_b) + abs(max_a - max_b)) / max(max_a, max_b, 1.0)
            s_ctc = max(0.0, min(1.0, s_ctc))
        else:
            s_ctc = 0.20

        # Weighted Composite
        composite = (0.35 * s_company) + (0.30 * s_title) + (0.25 * s_skills) + (0.10 * s_ctc)
        return round(composite, 4)

    @classmethod
    def process_raw_ingestion(
        cls,
        raw_text: str,
        source_type: str = "WHATSAPP_FORWARD",
        submitted_by: str = "Placement Coordinator",
        existing_jobs: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        End-to-End Ingestion Pipeline:
        1. Cleans noise.
        2. Extracts entities (Company, Role, CTC, Batch).
        3. Normalizes skills into Required (70%) vs Preferred (30%).
        4. Checks against existing active jobs to detect duplicates (>82% threshold).
        """
        cleaned = cls.clean_whatsapp_text(raw_text)
        company = cls.extract_company(cleaned)
        role = cls.extract_role(cleaned)
        min_ctc, max_ctc, ctc_display = cls.extract_ctc(cleaned)
        batch = cls.extract_batch(cleaned)
        req_skills, pref_skills = cls.extract_tiered_skills(cleaned)

        # Generate unique fingerprint
        fp_str = f"{company.lower()}_{role.lower()}_{min_ctc}_{max_ctc}"
        job_hash = hashlib.sha256(fp_str.encode('utf-8')).hexdigest()[:12]

        new_job_candidate = {
            "company": company,
            "title": role,
            "min_ctc": min_ctc,
            "max_ctc": max_ctc,
            "ctc_display": ctc_display,
            "eligible_batch": batch,
            "required_skills": req_skills,
            "preferred_skills": pref_skills,
            "raw_text_snippet": raw_text[:200] + "..." if len(raw_text) > 200 else raw_text,
            "source": {
                "type": source_type,
                "submitted_by": submitted_by,
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%SZ")
            }
        }

        # Deduplication Check
        is_duplicate = False
        matched_job_id = None
        highest_score = 0.0
        duplicate_reason = ""

        if existing_jobs:
            for ex in existing_jobs:
                sim = cls.compute_similarity(new_job_candidate, ex)
                if sim > highest_score:
                    highest_score = sim
                    matched_job_id = ex.get("id") or ex.get("job_id")

            if highest_score >= 0.80:
                is_duplicate = True
                duplicate_reason = (
                    f"Identified as duplicate of active drive '{matched_job_id}' "
                    f"with {round(highest_score * 100, 1)}% composite similarity. "
                    f"Source will be aggregated into existing drive pipeline."
                )

        return {
            "status": "DUPLICATE_MERGE" if is_duplicate else "NEW_CANONICAL_OPENING",
            "is_duplicate": is_duplicate,
            "similarity_score": highest_score,
            "matched_job_id": matched_job_id,
            "duplicate_reason": duplicate_reason,
            "parsed_job": new_job_candidate,
            "hash_id": f"job_{job_hash}"
        }


# Singleton instance
job_dedup_service = JobDeduplicationService()
