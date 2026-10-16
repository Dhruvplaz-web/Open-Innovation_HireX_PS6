"""
Fraud and Scam Opportunity Protection Engine
Pure, deterministic, rule-based risk evaluation for campus recruitment drives.
Zero external paid APIs or black-box ML.
"""
import re
from typing import Dict, Any, List, Optional

# Configurable Risk Scoring Weights and Thresholds
FRAUD_CONFIG = {
    # Weights for risk factors
    "WEIGHT_FEE_REQUEST": 45,
    "WEIGHT_OFF_PLATFORM_CHAT": 30,
    "WEIGHT_PERSONAL_EMAIL": 20,
    "WEIGHT_DOMAIN_MISMATCH": 15,
    "WEIGHT_UNREALISTIC_PAY": 25,
    "WEIGHT_PRESSURE_TACTICS": 15,
    "WEIGHT_GUARANTEED_JOB": 20,
    "WEIGHT_VAGUE_DESCRIPTION": 10,
    "WEIGHT_PER_REPORT": 15,
    "MAX_REPORT_WEIGHT": 45,

    # Deductions for trusted recruiter tiers
    "CREDIT_VERIFIED_TIER": 20,
    "CREDIT_COLLEGE_TRUSTED_TIER": 35,

    # Classification Levels
    "LEVEL_LOW_MAX": 29,
    "LEVEL_MEDIUM_MAX": 59,

    # Unrealistic pay threshold for freshers (stipend per month in INR)
    "UNREALISTIC_FRESHER_STIPEND_MONTHLY": 150000,
    "UNREALISTIC_FRESHER_CTC_ANNUAL": 2400000,

    # Rate limiting for BASIC recruiters
    "MAX_POSTS_PER_DAY_BASIC": 3,

    # Auto-flagging threshold
    "AUTO_FLAG_REPORT_THRESHOLD": 3
}

PERSONAL_EMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "yahoo.co.in", "outlook.com", "hotmail.com", 
    "live.com", "icloud.com", "rediffmail.com", "aol.com", "proton.me", "protonmail.com"
}

FEE_PATTERNS = [
    r"\b(registration|processing|security|training|kit|laptop|onboarding|documentation)\s*(fee|charge|deposit|cost|amount|money)\b",
    r"\b(refundable|non-refundable)\s*(fee|deposit|amount|charge)\b",
    r"\bpay\s*(to\s*apply|to\s*register|for\s*interview|to\s*confirm|before\s*joining|for\s*offer)\b",
    r"\b(fee|amount|payment|charge)\s*of\s*(rs\.?|inr|₹)?\s*\d+",
    r"\b(upi|gpay|phonepe|paytm)\s*(transfer|payment|id)\b",
    r"\bpay\s*(rs\.?|inr|₹)\s*\d+\b"
]

OFF_PLATFORM_PATTERNS = [
    r"\b(whatsapp|telegram|wa\.me|t\.me)\b",
    r"\bmsg\s*(me\s*on|on)\s*(wa|whatsapp|telegram)\b",
    r"\bconnect\s*via\s*(whatsapp|telegram)\b",
    r"\bsend\s*(cv|resume)\s*(on|to)\s*(whatsapp|telegram)\b",
    r"\bwhatsapp\s*number\b"
]

PRESSURE_PATTERNS = [
    r"\b(pay\s*today|pay\s*now|immediate\s*payment|slot\s*expires\s*in|limited\s*seats\s*left\s*pay)\b",
    r"\b(confirm\s*seat\s*now|last\s*few\s*slots\s*book\s*now)\b"
]

GUARANTEED_JOB_PATTERNS = [
    r"\b(100%\s*(job|placement|selection|guarantee))\b",
    r"\b(guaranteed\s*(placement|job|selection|offer\s*letter))\b",
    r"\b(direct\s*selection\s*without\s*interview)\b",
    r"\b(no\s*interview\s*direct\s*joining)\b"
]


def extract_email_domain(email: Optional[str]) -> Optional[str]:
    if not email or "@" not in email:
        return None
    return email.strip().split("@")[-1].lower()


def parse_pay_value(stipend_str: Optional[str]) -> int:
    """Extracts numeric compensation value from stipend string."""
    if not stipend_str:
        return 0
    # Remove commas
    clean = stipend_str.replace(",", "").lower()
    # Find numbers
    nums = re.findall(r"\d+", clean)
    if not nums:
        return 0
    val = int(nums[0])
    # Check if in Lakhs
    if "lpa" in clean or "lakh" in clean:
        return val * 100000
    # If monthly mentioned
    return val


def score_opportunity(opportunity: Dict[str, Any], recruiter: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Evaluates an opportunity for fraud and scam risk.
    Returns:
        {
            "score": int (0 - 100),
            "level": "LOW" | "MEDIUM" | "HIGH",
            "reasons": List[Dict[str, Any]],
            "auto_approved": bool,
            "recommended_action": str
        }
    """
    reasons: List[Dict[str, Any]] = []
    raw_score = 0

    title = opportunity.get("title", "")
    description = opportunity.get("description", "")
    stipend = opportunity.get("stipend", "")
    experience = opportunity.get("experience", "Fresher")
    contact_email = opportunity.get("contact_email") or (recruiter.get("email") if recruiter else "")
    company_website = opportunity.get("company_website") or (recruiter.get("company_website") if recruiter else "")
    reports = int(opportunity.get("report_count", 0))

    combined_text = f"{title} {description} {stipend}".lower()

    # Rule 1: Asks for fee, deposit, or money (HIGH WEIGHT)
    fee_detected = any(re.search(pat, combined_text, re.IGNORECASE) for pat in FEE_PATTERNS)
    if fee_detected:
        w = FRAUD_CONFIG["WEIGHT_FEE_REQUEST"]
        raw_score += w
        reasons.append({
            "code": "FEE_REQUESTED",
            "label": "Requests candidates to pay a fee, security deposit, or training charge",
            "weight": w
        })

    # Rule 2: Off-platform chat redirect (WhatsApp / Telegram)
    off_platform_detected = any(re.search(pat, combined_text, re.IGNORECASE) for pat in OFF_PLATFORM_PATTERNS)
    if off_platform_detected:
        w = FRAUD_CONFIG["WEIGHT_OFF_PLATFORM_CHAT"]
        raw_score += w
        reasons.append({
            "code": "OFF_PLATFORM_REDIRECT",
            "label": "Requires candidates to communicate via WhatsApp or Telegram links",
            "weight": w
        })

    # Rule 3: Personal email domain used instead of company domain
    email_domain = extract_email_domain(contact_email)
    if email_domain and email_domain in PERSONAL_EMAIL_DOMAINS:
        w = FRAUD_CONFIG["WEIGHT_PERSONAL_EMAIL"]
        raw_score += w
        reasons.append({
            "code": "PERSONAL_EMAIL_DOMAIN",
            "label": f"Uses free personal email domain (@{email_domain}) instead of verified company domain",
            "weight": w
        })

    # Rule 4: Domain mismatch between email and company website
    if email_domain and company_website and email_domain not in PERSONAL_EMAIL_DOMAINS:
        # Clean website domain
        clean_web = company_website.lower().replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
        if clean_web and email_domain not in clean_web and clean_web not in email_domain:
            w = FRAUD_CONFIG["WEIGHT_DOMAIN_MISMATCH"]
            raw_score += w
            reasons.append({
                "code": "DOMAIN_MISMATCH",
                "label": f"Email domain (@{email_domain}) does not match declared company website ({clean_web})",
                "weight": w
            })

    # Rule 5: Unrealistic fresher compensation
    is_fresher = any(term in experience.lower() for term in ["fresher", "0-1", "entry", "intern"])
    pay_num = parse_pay_value(stipend)
    if is_fresher and pay_num > 0:
        if "month" in stipend.lower() and pay_num >= FRAUD_CONFIG["UNREALISTIC_FRESHER_STIPEND_MONTHLY"]:
            w = FRAUD_CONFIG["WEIGHT_UNREALISTIC_PAY"]
            raw_score += w
            reasons.append({
                "code": "UNREALISTIC_PAY",
                "label": f"Stipend ({stipend}) abnormally exceeds industry benchmark for freshers",
                "weight": w
            })
        elif ("lpa" in stipend.lower() or "year" in stipend.lower()) and pay_num >= FRAUD_CONFIG["UNREALISTIC_FRESHER_CTC_ANNUAL"]:
            w = FRAUD_CONFIG["WEIGHT_UNREALISTIC_PAY"]
            raw_score += w
            reasons.append({
                "code": "UNREALISTIC_PAY",
                "label": f"Compensation ({stipend}) abnormally exceeds standard campus benchmarks",
                "weight": w
            })

    # Rule 6: Urgency or pressure tactics
    pressure_detected = any(re.search(pat, combined_text, re.IGNORECASE) for pat in PRESSURE_PATTERNS)
    if pressure_detected:
        w = FRAUD_CONFIG["WEIGHT_PRESSURE_TACTICS"]
        raw_score += w
        reasons.append({
            "code": "PRESSURE_LANGUAGE",
            "label": "Uses artificial urgency or pressure language to prompt immediate action",
            "weight": w
        })

    # Rule 7: 100% Guaranteed Job claims
    guarantee_detected = any(re.search(pat, combined_text, re.IGNORECASE) for pat in GUARANTEED_JOB_PATTERNS)
    if guarantee_detected:
        w = FRAUD_CONFIG["WEIGHT_GUARANTEED_JOB"]
        raw_score += w
        reasons.append({
            "code": "GUARANTEED_SELECTION_CLAIM",
            "label": "Claims guaranteed job or direct placement without credible evaluation",
            "weight": w
        })

    # Rule 8: Vague or minimal description
    if len(description.strip()) < 40 and not opportunity.get("is_system_demo"):
        w = FRAUD_CONFIG["WEIGHT_VAGUE_DESCRIPTION"]
        raw_score += w
        reasons.append({
            "code": "VAGUE_DESCRIPTION",
            "label": "Job description is unusually short or lacks clear engineering deliverables",
            "weight": w
        })

    # Rule 9: User reports accumulated
    if reports > 0:
        rep_weight = min(reports * FRAUD_CONFIG["WEIGHT_PER_REPORT"], FRAUD_CONFIG["MAX_REPORT_WEIGHT"])
        raw_score += rep_weight
        reasons.append({
            "code": "STUDENT_REPORTS",
            "label": f"Flagged by {reports} verified student report(s)",
            "weight": rep_weight
        })

    # Recruiter Tier Adjustments (Credits)
    recruiter_tier = (recruiter.get("verification_tier") if recruiter else opportunity.get("recruiter_tier", "BASIC")).upper()
    if recruiter_tier == "COLLEGE_TRUSTED":
        credit = FRAUD_CONFIG["CREDIT_COLLEGE_TRUSTED_TIER"]
        raw_score = max(0, raw_score - credit)
        reasons.append({
            "code": "COLLEGE_TRUSTED_DISCOUNT",
            "label": "Verified partner institution / College-Trusted Recruiter tier",
            "weight": -credit
        })
    elif recruiter_tier == "VERIFIED":
        credit = FRAUD_CONFIG["CREDIT_VERIFIED_TIER"]
        raw_score = max(0, raw_score - credit)
        reasons.append({
            "code": "VERIFIED_TIER_DISCOUNT",
            "label": "Verified corporate recruiter status",
            "weight": -credit
        })

    # Clamp score to 0 - 100
    final_score = max(0, min(100, raw_score))

    # Determine risk level
    if final_score <= FRAUD_CONFIG["LEVEL_LOW_MAX"]:
        level = "LOW"
    elif final_score <= FRAUD_CONFIG["LEVEL_MEDIUM_MAX"]:
        level = "MEDIUM"
    else:
        level = "HIGH"

    # Routing determination:
    # 1. COLLEGE_TRUSTED auto-approves unless level is HIGH
    # 2. VERIFIED auto-approves if LOW
    # 3. BASIC or MEDIUM/HIGH requires PENDING_REVIEW
    if recruiter_tier == "COLLEGE_TRUSTED" and level != "HIGH":
        auto_approved = True
        recommended_action = "AUTO_APPROVE"
    elif recruiter_tier == "VERIFIED" and level == "LOW":
        auto_approved = True
        recommended_action = "AUTO_APPROVE"
    else:
        auto_approved = False
        recommended_action = "HOLD_FOR_REVIEW"

    return {
        "score": final_score,
        "level": level,
        "reasons": reasons,
        "auto_approved": auto_approved,
        "recommended_action": recommended_action
    }
