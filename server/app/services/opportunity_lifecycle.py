"""
Time-Aware Opportunity Lifecycle Engine
Solves ghost postings and expired recommendations by enforcing deterministic
date-based lifecycle states: ACTIVE, CLOSING_SOON, and EXPIRED.
"""
from datetime import datetime, date
import re
from typing import Optional, Dict, Any, List, Tuple

# Current simulation baseline for SkillBridge (2026-10-06)
CURRENT_PLATFORM_DATE = date(2026, 10, 6)

def parse_deadline(deadline_val: Any) -> Optional[date]:
    """
    Parses flexible date formats commonly found in job drives.
    Supports: YYYY-MM-DD, DD-MM-YYYY, 'Oct 30, 2026', '2026/10/30', ISO timestamps.
    """
    if not deadline_val:
        return None
    if isinstance(deadline_val, date):
        return deadline_val
    if isinstance(deadline_val, datetime):
        return deadline_val.date()

    val_str = str(deadline_val).strip()
    # Trim timestamp if present (e.g., 2026-11-30T00:00:00Z)
    if "t" in val_str.lower():
        val_str = re.split(r"[tT]", val_str)[0]

    formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%Y/%m/%d",
        "%d/%m/%Y",
        "%b %d, %Y",
        "%B %d, %Y",
        "%d %b %Y",
        "%d %B %Y"
    ]
    for fmt in formats:
        try:
            return datetime.strptime(val_str, fmt).date()
        except ValueError:
            continue

    # Fallback regex search for YYYY-MM-DD
    match = re.search(r"(\d{4})-(\d{1,2})-(\d{1,2})", val_str)
    if match:
        try:
            return date(int(match.group(1)), int(match.group(2)), int(match.group(3)))
        except ValueError:
            pass

    return None


def get_current_platform_date() -> date:
    """Returns today's date in platform context (2026-10-06)."""
    return CURRENT_PLATFORM_DATE


def evaluate_opportunity_lifecycle(
    opportunity: Dict[str, Any], 
    reference_date: Optional[date] = None
) -> Dict[str, Any]:
    """
    Calculates the exact temporal lifecycle state of an opportunity:
    - ACTIVE: Open for submissions
    - CLOSING_SOON: Less than or equal to 3 days remaining (high urgency for students)
    - EXPIRED: Past the deadline, automatically closed to prevent stale recommendations
    """
    today = reference_date or get_current_platform_date()
    deadline_date = parse_deadline(opportunity.get("deadline"))

    if not deadline_date:
        # If no deadline was specified, apply default 30-day freshness window
        return {
            "lifecycle_status": "ACTIVE",
            "is_expired": False,
            "days_remaining": 30,
            "urgency_label": "Open Drive",
            "can_apply": True,
            "formatted_deadline": "Rolling Basis"
        }

    delta_days = (deadline_date - today).days

    if delta_days < 0:
        return {
            "lifecycle_status": "EXPIRED",
            "is_expired": True,
            "days_remaining": delta_days,
            "urgency_label": f"Drive Closed on {deadline_date.strftime('%B %d, %Y')}",
            "can_apply": False,
            "formatted_deadline": deadline_date.strftime("%B %d, %Y")
        }
    elif delta_days == 0:
        return {
            "lifecycle_status": "CLOSING_SOON",
            "is_expired": False,
            "days_remaining": 0,
            "urgency_label": "⚡ Closes Today (Final Hours)",
            "can_apply": True,
            "formatted_deadline": deadline_date.strftime("%B %d, %Y")
        }
    elif delta_days == 1:
        return {
            "lifecycle_status": "CLOSING_SOON",
            "is_expired": False,
            "days_remaining": 1,
            "urgency_label": "⚡ Closes Tomorrow",
            "can_apply": True,
            "formatted_deadline": deadline_date.strftime("%B %d, %Y")
        }
    elif delta_days <= 3:
        return {
            "lifecycle_status": "CLOSING_SOON",
            "is_expired": False,
            "days_remaining": delta_days,
            "urgency_label": f"⚡ Closes in {delta_days} Days",
            "can_apply": True,
            "formatted_deadline": deadline_date.strftime("%B %d, %Y")
        }
    else:
        return {
            "lifecycle_status": "ACTIVE",
            "is_expired": False,
            "days_remaining": delta_days,
            "urgency_label": f"Due in {delta_days} days",
            "can_apply": True,
            "formatted_deadline": deadline_date.strftime("%B %d, %Y")
        }


def is_opportunity_expired(opportunity: Dict[str, Any], reference_date: Optional[date] = None) -> bool:
    """Helper to check if an opportunity is past its deadline."""
    return evaluate_opportunity_lifecycle(opportunity, reference_date)["is_expired"]


def enrich_opportunity_with_lifecycle(
    opportunity: Dict[str, Any],
    reference_date: Optional[date] = None
) -> Dict[str, Any]:
    """Adds temporal status and badges to an opportunity object."""
    lifecycle = evaluate_opportunity_lifecycle(opportunity, reference_date)
    return {
        **opportunity,
        "is_expired": lifecycle["is_expired"],
        "lifecycle_status": lifecycle["lifecycle_status"],
        "days_remaining": lifecycle["days_remaining"],
        "urgency_label": lifecycle["urgency_label"],
        "can_apply": lifecycle["can_apply"],
        "formatted_deadline": lifecycle["formatted_deadline"]
    }


def filter_active_opportunities(
    opportunities: List[Dict[str, Any]], 
    include_expired: bool = False,
    reference_date: Optional[date] = None
) -> List[Dict[str, Any]]:
    """
    Filters opportunities for student recommendation feeds.
    By default, strictly excludes all expired postings so students are never recommended dead drives.
    """
    results = []
    for opp in opportunities:
        enriched = enrich_opportunity_with_lifecycle(opp, reference_date)
        if include_expired or not enriched["is_expired"]:
            results.append(enriched)
    return results


def validate_can_apply(opportunity: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validates if an opportunity can accept applications (Pillar 3 Gate).
    Returns (True, "") or (False, "Reason for rejection").
    """
    lifecycle = evaluate_opportunity_lifecycle(opportunity)
    if lifecycle["is_expired"]:
        return (
            False, 
            f"Application Closed: This drive closed on {lifecycle['formatted_deadline']} and is no longer accepting candidate submissions."
        )
    return (True, "OK")
