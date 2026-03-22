#!/usr/bin/env python3
"""
Seed batch 3 of manually researched events into the Trade Partner HQ database.
Found via extensive web search on 2026-03-22.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("SUPABASE_URL", "https://ycgyfukhxxtitrbkotpj.supabase.co")

from config import upsert_events, get_coords, STATE_NAMES, CITY_COORDS

# Add new cities we need
NEW_CITIES = {
    ("Reno", "NV"): (39.5296, -119.8138),
    ("New Orleans", "LA"): (29.9511, -90.0715),
    ("Rochester", "NY"): (43.1566, -77.6088),
    ("Grapevine", "TX"): (32.9343, -97.0781),
    ("Glendale", "AZ"): (33.5387, -112.1860),
}
CITY_COORDS.update(NEW_CITIES)

def ev(title, date, city, sc, desc, sn, st, url, et, org=None):
    coords = get_coords(city, sc)
    return {
        "title": title, "date": date, "city": city, "state_code": sc,
        "state": STATE_NAMES.get(sc, ""),
        "lat": coords[0] if coords else None,
        "lng": coords[1] if coords else None,
        "description": desc, "source_name": sn, "source_type": st,
        "source_url": url, "event_type": et,
        "organization": org or sn,
    }

events = [
    # ── NAWIC ────────────────────────────────────────────────────
    ev("NAWIC 71st Annual Conference — Reno", "2026-08-10", "Reno", "NV",
       "National Association of Women in Construction 71st Annual Conference at Grand Sierra Resort. Aug 10-15. Technical skills, leadership tracks, networking. Call for speakers open.",
       "NAWIC", "trade_association", "https://nawic.org/2026-annual-conference/", "conference"),

    # ── VETS26 ───────────────────────────────────────────────────
    ev("VETS26 Conference — Veteran Small Business", "2026-06-01", "New Orleans", "LA",
       "Premier federal small business event at Hyatt Regency New Orleans. June 1-4. 2,000 attendees, 25+ federal agencies, 60+ training sessions, 200+ exhibitors, 1-on-1 matchmaking.",
       "NVSBC", "government", "https://nvsbc.org/events/vets26-conference/", "conference"),

    # ── Alliance Northwest ───────────────────────────────────────
    ev("Alliance Northwest 2026 — Government Contracting Conference", "2026-03-26", "Tacoma", "WA",
       "40th Annual Alliance Northwest at Greater Tacoma Convention Center. Largest business-to-government conference in the Pacific Northwest. 1,000+ attendees, 1:1 matchmaking, exhibit hall.",
       "Alliance Northwest", "government", "https://alliancenorthwest.org/", "conference"),

    # ── Upstate NY MWBE Conference ───────────────────────────────
    ev("Upstate NY MWBE Conference 2026", "2026-03-30", "Rochester", "NY",
       "4th Annual MWBE Conference at Rochester Riverside Convention Center. March 30 - April 1. MWBE Expo, networking luncheon, Under Construction Boot Camp, panels on bonding, access to capital.",
       "City of Rochester", "government", "https://www.eventbrite.com/e/upstate-ny-mwbe-conference-2026-tickets-1978987008415", "conference"),

    # ── SEBC ─────────────────────────────────────────────────────
    ev("Southeast Building Conference (SEBC) 2026", "2026-07-29", "Orlando", "FL",
       "Largest building industry trade show in the Southeast at Orange County Convention Center. July 29-30. 6,000+ attendees, 300+ exhibitors, education, networking.",
       "FHBA", "trade_association", "https://sebcshow.com/", "conference"),

    # ── Infraday PNW ─────────────────────────────────────────────
    ev("Infraday Pacific Northwest 2026 — Seattle", "2026-08-19", "Seattle", "WA",
       "5th Annual infrastructure leadership forum in Seattle. 60+ speakers from Sound Transit, WSDOT, King County, Port of Seattle, WSP, Jacobs. Transportation, energy, water systems.",
       "Infraday", "trade_association", "https://www.infraday.com/pnw", "conference"),

    # ── SAME SBC (already have this one, skip) ───────────────────

    # ── COMTO National Conference ────────────────────────────────
    ev("COMTO National Meeting & Training Conference 2026", "2026-07-12", "Washington", "DC",
       "Conference of Minority Transportation Officials annual meeting at Grand Hyatt Washington DC. Networking, training, and contracting for minority transportation firms.",
       "COMTO", "trade_association", "https://members.comtonational.org/page/2026-conference-home", "conference"),

    # ── AGC Technology Conference (Chicago) ──────────────────────
    ev("AGC Technology Conference for Construction 2026", "2026-08-06", "Chicago", "IL",
       "AGC national technology conference. August 6-8 in Chicago. AI, BIM, robotics, drones, and emerging tech for construction. Networking with GCs and tech providers.",
       "AGC of America", "trade_association", "https://tech-con.agc.org/", "conference"),

    # ── AGC Convention (Orlando, already have San Antonio one) ───
    ev("AGC Annual Convention 2026 — Orlando", "2026-03-24", "Orlando", "FL",
       "AGC of America annual convention. March 24-26 in Orlando. Keynotes, policy updates, hands-on learning, and national-level construction industry networking.",
       "AGC of America", "trade_association", "https://convention.agc.org/", "conference"),

    # ── AWCI BUILD26 (past but BUILD27 is future) ────────────────
    ev("AWCI BUILD27 Convention + Expo", "2027-04-12", "Grapevine", "TX",
       "AWCI wall and ceiling industry convention and expo at Grapevine, TX. April 12-15, 2027. Drywall, framing, plaster, EIFS, acoustics. Trade show, education, networking.",
       "AWCI", "trade_association", "https://www.awci.org/events/build-convention/", "conference"),

    # ── Mass Timber Conference ───────────────────────────────────
    ev("International Mass Timber Conference 2026", "2026-03-31", "Portland", "OR",
       "World's largest mass timber event at Oregon Convention Center. March 31 - April 2. 4,000+ attendees from 40+ countries. Design, engineering, construction innovation.",
       "WoodWorks", "trade_association", "https://masstimberconference.com/", "conference"),

    # ── NAIOP CRE.Converge ───────────────────────────────────────
    ev("CRE.Converge 2026 — NAIOP", "2026-10-12", "Las Vegas", "NV",
       "NAIOP Commercial Real Estate Development Association annual conference. Construction, development, design, and investment networking in Las Vegas.",
       "NAIOP", "trade_association", "https://www.naiop.org/events-and-sponsorship/corporate-events-list/conferences/2026-cre-converge/", "conference"),

    # ── JLC LIVE ─────────────────────────────────────────────────
    ev("JLC LIVE Residential Construction Show 2026", "2026-03-19", "Providence", "RI",
       "JLC LIVE at Rhode Island Convention Center. March 19-21. Live construction demos, 100+ exhibitors, education for residential builders, remodelers, and specialty contractors.",
       "JLC", "trade_association", "https://www.jlclive.com/", "conference"),

    # ── New Castle County Prime-Sub Connections ──────────────────
    ev("Prime-Subcontractor Connections — New Castle County, DE", "2026-05-01", "Wilmington", "DE",
       "New Castle County government-hosted event connecting prime contractors with subcontractors for upcoming county construction projects. Free networking and matchmaking.",
       "New Castle County", "government", "https://www.newcastlede.gov/2695/Prime-Subcontractor-Connections", "networking"),

    # ── OCTA Training & Outreach ─────────────────────────────────
    ev("OCTA Small Business Outreach — Orange County, CA", "2026-04-15", "Santa Ana", "CA",
       "Orange County Transportation Authority small business training and outreach event. Networking with OCTA primes, certification workshops, and upcoming project briefings.",
       "OCTA", "government", "https://cammnet.octa.net/about-us/training-accordion/", "networking"),

    # ── National 8(a) SBC ────────────────────────────────────────
    ev("SAME Federal Small Business Conference — A/E/C Industry Day 2026", "2026-11-05", "Charlotte", "NC",
       "Federal A/E/C Industry Day at SAME SBC in Charlotte. Procurement workshops, prime contractor matchmaking, and federal agency networking for architecture, engineering, and construction firms.",
       "National 8(a) Association", "trade_association", "https://www.national8aassociation.org/calendar-of-events/federal-small-business-conference-for-the-aec-industry-day-2026-1", "conference"),

    # ── ConExpo (already past but keeping as reference) ──────────

    # ── ABC Salt Lake City Convention (already have) ─────────────

    # ── More regional Build Expos ────────────────────────────────
    ev("Chicago Build Expo 2026", "2026-04-08", "Chicago", "IL",
       "Two-day construction trade show at McCormick Place. 350+ exhibitors, 500+ speakers, 30,000+ attendees. Largest construction show in the Midwest.",
       "Build Expo USA", "trade_association", "https://buildexpousa.com/chicago-build-expo/", "conference"),

    ev("Seattle Build Expo 2026", "2026-09-16", "Seattle", "WA",
       "Two-day construction trade show in Seattle. Networking with Pacific Northwest contractors, suppliers, architects, and construction professionals.",
       "Build Expo USA", "trade_association", "https://buildexpousa.com/", "conference"),

    ev("Philadelphia Build Expo 2026", "2026-06-10", "Philadelphia", "PA",
       "Two-day construction trade show. Networking with contractors, suppliers, and construction professionals in the Philadelphia metro area.",
       "Build Expo USA", "trade_association", "https://buildexpousa.com/", "conference"),

    ev("Denver Build Expo 2026", "2026-06-24", "Denver", "CO",
       "Two-day construction trade show. Networking with Rocky Mountain region contractors, suppliers, and construction professionals.",
       "Build Expo USA", "trade_association", "https://buildexpousa.com/", "conference"),

    ev("Boston Build Expo 2026", "2026-10-28", "Boston", "MA",
       "Two-day construction trade show. Networking with New England contractors, suppliers, and construction professionals.",
       "Build Expo USA", "trade_association", "https://buildexpousa.com/", "conference"),

    ev("San Francisco Build Expo 2026", "2026-12-02", "San Francisco", "CA",
       "Two-day construction trade show. Networking with Bay Area contractors, suppliers, architects, and construction professionals.",
       "Build Expo USA", "trade_association", "https://buildexpousa.com/", "conference"),

    # ── NMSDC Leadership Summit ──────────────────────────────────
    ev("NMSDC Supplier Impact Leadership Summit 2026", "2026-06-17", "Atlanta", "GA",
       "Forward-thinking sessions for supplier inclusion professionals. Knowledge, tools, and connections to scale MBEs and advance economic equity in construction supply chains.",
       "NMSDC", "trade_association", "https://nmsdc.org/events/", "conference"),
]

if __name__ == "__main__":
    from datetime import date
    today = date.today().isoformat()
    future = [e for e in events if e["date"] >= today]
    print(f"Seeding {len(future)} future events (filtered {len(events) - len(future)} past)...")
    count = upsert_events(future)
    print(f"Upserted {count} events.")
