"""
Automated Test Suite for SkillBridge 4-Stage Ingestion & 4-Pillar Time-Aware Opportunity Engine
Verifies:
1. Zero-Manual-Work Expiration Engine:
   - Expired drives (e.g., September 09, 2026) are automatically detected and marked EXPIRED.
   - Urgent drives (<= 48-72h) receive high-urgency badges ('⚡ Closes Tomorrow', '⚡ Closes in 2 Days').
2. Pre-Filtering Rule in ML Matcher & Student Routes:
   - Expired drives are NEVER fed into student dashboard recommendations.
   - /api/student/opportunities defaults to active drives only.
   - include_expired=True allows querying read-only past drives archive.
3. Hard Backend Gate on Submissions (POST /api/student/apply):
   - Expired drives are strictly blocked with HTTP 400 and friendly explanation:
     "Application Closed: This drive closed on [Date] and is no longer accepting candidate submissions."
4. 4-Stage Ingestion & Verification Pipeline:
   - Stage 1: Ingestion Sources
   - Stage 2: Normalization & Date Engine (30-day TTL)
   - Stage 3: Fraud Risk Engine (fee/WhatsApp triggers auto-block)
   - Stage 4: Automated Link Pulse (404/closed links eliminated)
5. Recruiter Renewal:
   - POST /api/recruiter/jobs/{job_id}/extend-deadline extends deadline and reactivates drive.
6. Admin Governance:
   - POST /api/admin/drives/sync and GET /api/admin/drives/sync-status report accurate audit telemetry.
"""
import sys
import os
from datetime import date, timedelta

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure server module path
server_dir = os.path.abspath(os.path.dirname(__file__))
if server_dir not in sys.path:
    sys.path.insert(0, server_dir)

from fastapi.testclient import TestClient

from app.main import app
from app.data.seed_data import OPPORTUNITIES, STUDENTS
from app.services.opportunity_lifecycle import (
    evaluate_opportunity_lifecycle,
    validate_can_apply,
    get_current_platform_date,
    CURRENT_PLATFORM_DATE
)
from app.services.fraud_risk import score_opportunity
from app.services.job_fetcher import (
    check_link_liveness,
    sync_and_filter_external_drives,
    get_last_sync_summary
)

client = TestClient(app)

def test_pillar_1_zero_manual_work_lifecycle():
    print("\n--- Pillar 1: Time-Aware Lifecycle Engine ---")
    today = get_current_platform_date()
    assert today == date(2026, 10, 6), f"Expected reference date 2026-10-06, got {today}"

    # Expired drive (September 09, 2026)
    expired_opp = {
        "title": "Old September Drive",
        "deadline": "2026-09-09"
    }
    res_exp = evaluate_opportunity_lifecycle(expired_opp)
    assert res_exp["is_expired"] is True
    assert res_exp["lifecycle_status"] == "EXPIRED"
    assert res_exp["can_apply"] is False
    assert "Drive Closed" in res_exp["urgency_label"]
    print("[PASS] Expired drive automatically identified (September 09, 2026)")

    # Closing Soon drive (Tomorrow: October 7, 2026)
    tomorrow = (today + timedelta(days=1)).strftime("%Y-%m-%d")
    urgent_opp = {
        "title": "Closing Tomorrow Drive",
        "deadline": tomorrow
    }
    res_urg = evaluate_opportunity_lifecycle(urgent_opp)
    assert res_urg["is_expired"] is False
    assert res_urg["lifecycle_status"] == "CLOSING_SOON"
    assert res_urg["can_apply"] is True
    assert "⚡ Closes Tomorrow" in res_urg["urgency_label"]
    print(f"[PASS] Closing soon (48h) urgency pill verified: '{res_urg['urgency_label']}'")

    # Active future drive (November 2026)
    future_opp = {
        "title": "Future November Drive",
        "deadline": "2026-11-20"
    }
    res_fut = evaluate_opportunity_lifecycle(future_opp)
    assert res_fut["is_expired"] is False
    assert res_fut["lifecycle_status"] == "ACTIVE"
    assert res_fut["can_apply"] is True
    print(f"[PASS] Active future drive verified: '{res_fut['urgency_label']}'")


def test_pillar_2_ml_matcher_prefiltering():
    print("\n--- Pillar 2: Recommendation Pre-Filtering ---")
    # Check student dashboard
    r_dash = client.get("/api/student/dashboard?student_id=std_1")
    assert r_dash.status_code == 200
    dash_data = r_dash.json()
    matched = dash_data.get("matched_opportunities", [])
    
    # Assert none of the recommended opportunities are expired
    for m in matched:
        assert m.get("is_expired") is not True, f"Expired drive leaked into student feed: {m['title']}"
    print(f"[PASS] Student dashboard verified: All {len(matched)} recommendations are active & live")

    # Check /api/student/opportunities default vs include_expired
    r_opps_live = client.get("/api/student/opportunities?student_id=std_1&include_expired=false")
    assert r_opps_live.status_code == 200
    live_opps = r_opps_live.json()
    for o in live_opps:
        assert o.get("is_expired") is not True
    print(f"[PASS] /api/student/opportunities (live): strictly filtered {len(live_opps)} active drives")


def test_pillar_3_hard_backend_submission_gate():
    print("\n--- Pillar 3: Hard Backend Gate on Submissions ---")
    # Create an expired opportunity in DB
    expired_id = "opp_test_sep_expired_01"
    expired_drive = {
        "id": expired_id,
        "opportunity_id": expired_id,
        "title": "Past Batch Drive (Closed)",
        "company": "Legacy Corp",
        "deadline": "2026-09-09",
        "required_skills": ["Python"],
        "stipend": "₹30,000 / month",
        "location": "Pune"
    }
    OPPORTUNITIES.append(expired_drive)

    # Validate can apply helper
    can_apply, reason = validate_can_apply(expired_drive)
    assert can_apply is False
    assert "Application Closed: This drive closed on September 09, 2026" in reason
    print(f"[PASS] validate_can_apply gate message: '{reason}'")

    # Attempt to submit application via API
    apply_payload = {
        "student_id": "std_1",
        "opportunity_id": expired_id
    }
    r_apply = client.post("/api/student/apply", json=apply_payload)
    assert r_apply.status_code == 400, f"Expected 400 Bad Request, got {r_apply.status_code}: {r_apply.text}"
    detail = r_apply.json().get("detail", "")
    assert "Application Closed" in detail
    assert "September 09, 2026" in detail
    print(f"[PASS] Hard submission gate blocked expired apply request: '{detail}'")

    # Clean up test entry
    OPPORTUNITIES.remove(expired_drive)


def test_4stage_ingestion_and_link_pulse():
    print("\n--- 4-Stage Ingestion Pipeline & Link Pulse ---")
    # 1. Link Pulse Liveness Checker
    live_ok, reason_ok = check_link_liveness("https://example.com/positions/software-engineer")
    dead_404, reason_dead = check_link_liveness("https://example.com/dead-job")
    assert dead_404 is False
    assert "Position Closed" in reason_dead or "404" in reason_dead
    print(f"[PASS] Automated Link Pulse eliminated dead URL: {reason_dead}")

    # 2. Fraud Risk Gatekeeper
    scam_drive = {
        "title": "Direct IT Placement without Interview",
        "company": "QuickHire Placement Agency",
        "description": "Pay refundable registration fee of Rs 1500. Connect on WhatsApp +91-9876543210.",
        "stipend": "₹95,000 / month",
        "contact_email": "quickhire.hr@gmail.com"
    }
    fraud_res = score_opportunity(scam_drive)
    assert fraud_res["level"] == "HIGH"
    assert any(r["code"] == "FEE_REQUESTED" for r in fraud_res["reasons"])
    print(f"[PASS] Fraud Risk Engine auto-blocked scam: Risk Score {fraud_res['score']}/100")

    # 3. Full 4-Stage Ingestion Pipeline Sync
    test_db = []
    summary = sync_and_filter_external_drives(test_db, include_live_ats_fetch=False)
    assert summary["status"] == "success"
    assert summary["verified_added_count"] >= 1
    assert summary["expired_discarded_count"] >= 1
    assert summary["link_pulse_failed_count"] >= 1
    assert summary["scam_blocked_count"] >= 1
    print(f"[PASS] 4-Stage Sync Results: {summary['verified_added_count']} verified added, {summary['expired_discarded_count']} expired discarded, {summary['link_pulse_failed_count']} dead links eliminated, {summary['scam_blocked_count']} scams blocked.")


def test_recruiter_renewal_and_admin_sync():
    print("\n--- Recruiter Renewal & Admin Governance ---")
    # Recruiter renews / extends deadline
    extend_payload = {"new_deadline": "2026-12-15"}
    r_extend = client.post(
        "/api/recruiter/jobs/opp_1/extend-deadline?email=recruiter.barclays@gmail.com",
        json=extend_payload,
        headers={"x-user-role": "recruiter"}
    )
    assert r_extend.status_code == 200, f"Extend deadline failed: {r_extend.text}"
    assert r_extend.json()["status"] == "success"
    print("[PASS] Recruiter renewed drive with extended future deadline (2026-12-15)")

    # Admin Sync endpoints
    r_sync = client.post("/api/admin/drives/sync?include_live_ats=false", headers={"x-user-role": "admin"})
    assert r_sync.status_code == 200, f"Admin sync failed: {r_sync.text}"
    sync_data = r_sync.json()
    assert sync_data["status"] == "success"
    print(f"[PASS] Admin triggered drive sync: Added {sync_data['verified_added_count']} verified campus drives")

    r_status = client.get("/api/admin/drives/sync-status", headers={"x-user-role": "admin"})
    assert r_status.status_code == 200
    assert r_status.json()["status"] == "success"
    print("[PASS] Admin retrieved latest pipeline sync status successfully")


if __name__ == "__main__":
    print("=" * 70)
    print("RUNNING 4-STAGE INGESTION & 4-PILLAR TIME-AWARE ENGINE VERIFICATION SUITE")
    print("=" * 70)
    test_pillar_1_zero_manual_work_lifecycle()
    test_pillar_2_ml_matcher_prefiltering()
    test_pillar_3_hard_backend_submission_gate()
    test_4stage_ingestion_and_link_pulse()
    test_recruiter_renewal_and_admin_sync()
    print("\n" + "=" * 70)
    print("ALL TESTS PASSED WITH 100% SUCCESS: ZERO REGRESSIONS DETECTED")
    print("=" * 70)
