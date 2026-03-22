#!/usr/bin/env python3
"""
Trade Partner HQ — Daily Scraper Runner
Runs all scrapers and reports results.

Usage:
  python run_all.py           # Run all scrapers
  python run_all.py --dry-run # Scrape but don't write to DB
"""
import sys
import time
from datetime import datetime

from scrape_sam_gov import scrape_sam_gov
from scrape_state_dots import scrape_all_state_dots
from scrape_trade_associations import scrape_all_trade_associations
from scrape_linkedin import scrape_linkedin
from config import upsert_events


def main():
    dry_run = "--dry-run" in sys.argv
    start = time.time()

    print(f"{'='*60}")
    print(f"Trade Partner HQ — Daily Scrape")
    print(f"Started: {datetime.now().isoformat()}")
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE (writing to database)'}")
    print(f"{'='*60}\n")

    results = {}

    # 1. SAM.gov (Federal procurement)
    print("[1/4] SAM.gov Federal Opportunities")
    try:
        sam_events = scrape_sam_gov()
        results["SAM.gov"] = len(sam_events)
        print(f"  → {len(sam_events)} events found\n")
    except Exception as e:
        sam_events = []
        results["SAM.gov"] = f"ERROR: {e}"
        print(f"  → ERROR: {e}\n")

    # 2. State DOTs
    print("[2/4] State DOT SBE/DBE Programs")
    try:
        dot_events = scrape_all_state_dots()
        results["State DOTs"] = len(dot_events)
        print(f"  → {len(dot_events)} events found\n")
    except Exception as e:
        dot_events = []
        results["State DOTs"] = f"ERROR: {e}"
        print(f"  → ERROR: {e}\n")

    # 3. Trade Associations
    print("[3/4] Trade Associations (AGC, ABC, NAHB)")
    try:
        assoc_events = scrape_all_trade_associations()
        results["Trade Associations"] = len(assoc_events)
        print(f"  → {len(assoc_events)} events found\n")
    except Exception as e:
        assoc_events = []
        results["Trade Associations"] = f"ERROR: {e}"
        print(f"  → ERROR: {e}\n")

    # 4. LinkedIn / GC Websites
    print("[4/4] LinkedIn & GC Websites")
    try:
        linkedin_events = scrape_linkedin()
        results["LinkedIn/GC Sites"] = len(linkedin_events)
        print(f"  → {len(linkedin_events)} events found\n")
    except Exception as e:
        linkedin_events = []
        results["LinkedIn/GC Sites"] = f"ERROR: {e}"
        print(f"  → ERROR: {e}\n")

    # Combine all events
    all_events = sam_events + dot_events + assoc_events + linkedin_events

    # Write to database
    if dry_run:
        print(f"DRY RUN — skipping database write")
        upserted = 0
    else:
        print(f"Writing {len(all_events)} events to Supabase...")
        try:
            upserted = upsert_events(all_events)
            print(f"  → Upserted {upserted} events (deduped)")
        except Exception as e:
            print(f"  → DATABASE ERROR: {e}")
            upserted = 0

    elapsed = time.time() - start

    # Summary
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    for source, count in results.items():
        status = f"{count} events" if isinstance(count, int) else count
        print(f"  {source:25s} {status}")
    print(f"  {'─'*40}")
    print(f"  {'Total scraped':25s} {len(all_events)} events")
    print(f"  {'Upserted to DB':25s} {upserted} events")
    print(f"  {'Duration':25s} {elapsed:.1f}s")
    print(f"  {'Finished':25s} {datetime.now().isoformat()}")
    print(f"{'='*60}")

    # Exit with error code if all scrapers failed
    if all(isinstance(v, str) and "ERROR" in v for v in results.values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
