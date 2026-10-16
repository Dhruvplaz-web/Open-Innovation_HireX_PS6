"""
Additive Data Backfill Script: JD Fit Snapshots for Applications.

Iterates over applications in storage. For any application missing jdFitScore or jdFitVerdict,
fetches the corresponding student skills and opportunity requirements, computes the deterministic
JD Fit analysis, and stores the snapshot.

Can be run standalone:
    python server/backfill_jd_fit.py
"""

import sys
import os
import datetime

server_dir = os.path.abspath(os.path.dirname(__file__))
if server_dir not in sys.path:
    sys.path.insert(0, server_dir)

from app.data.seed_data import APPLICATIONS, OPPORTUNITIES, STUDENTS
from app.services.jd_skill_analysis import analyze_student_for_opportunity


def backfill_application_jd_fit(dry_run: bool = False) -> dict:
    """
    Backfills missing jdFitScore, jdFitVerdict, jdFitSummary, and jdFitComputedAt
    on applications without modifying any existing fields.
    """
    processed = 0
    updated = 0
    skipped = 0

    print(f"[{datetime.datetime.now(datetime.timezone.utc).isoformat()}] Starting JD Fit Snapshot Backfill...")
    print(f"Total applications in store: {len(APPLICATIONS)}")

    for app in APPLICATIONS:
        processed += 1
        app_id = app.get("id")

        # Skip if already computed
        if app.get("jdFitScore") is not None and app.get("jdFitVerdict") is not None:
            skipped += 1
            print(f"  [SKIPPED] {app_id}: Already has snapshot ({app['jdFitScore']}%, {app['jdFitVerdict']})")
            continue

        student_id = app.get("student_id")
        opp_id = app.get("opportunity_id")

        student = next((s for s in STUDENTS if s.get("id") == student_id), None)
        opp = next((o for o in OPPORTUNITIES if o.get("id") == opp_id), None)

        if not opp:
            print(f"  [WARN] {app_id}: Opportunity {opp_id} not found. Skipping.")
            continue

        student_skills = student.get("skills", {}) if student else {}
        analysis = analyze_student_for_opportunity(student_skills, opportunity=opp)

        if not dry_run:
            app["jdFitScore"] = analysis["overallFit"]
            app["jdFitVerdict"] = analysis["verdict"]
            app["jdFitSummary"] = analysis["summary"]
            app["jdFitComputedAt"] = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        updated += 1
        print(f"  [BACKFILLED] {app_id} (Student: {student_id}, Opp: {opp_id}): Fit={analysis['overallFit']}%, Verdict={analysis['verdict']}")

    result = {
        "status": "success",
        "total_processed": processed,
        "total_updated": updated,
        "total_skipped": skipped,
        "dry_run": dry_run
    }
    print(f"[{datetime.datetime.now(datetime.timezone.utc).isoformat()}] Backfill completed: {result}")
    return result


if __name__ == "__main__":
    backfill_application_jd_fit(dry_run=False)
