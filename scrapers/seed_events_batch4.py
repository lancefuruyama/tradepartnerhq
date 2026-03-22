#!/usr/bin/env python3
"""
Seed batch 4 of manually researched events into the Trade Partner HQ database.
Found via extensive web search on 2026-03-22.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("SUPABASE_URL", "https://ycgyfukhxxtitrbkotpj.supabase.co")

from config import upsert_events, get_coords, STATE_NAMES, CITY_COORDS

# Add new cities we need
NEW_CITIES = {
    ("Charleston", "WV"): (38.3498, -81.6326),
    ("Bowling Green", "OH"): (41.3748, -83.6513),
    ("Hanover", "MD"): (39.1929, -76.7241),
    ("St. Paul", "MN"): (44.9537, -93.0900),
    ("Concord", "NC"): (35.4088, -80.5795),
    ("Tucson", "AZ"): (32.2226, -110.9747),
    ("San Jose", "CA"): (37.3382, -121.8863),
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
    # ── WV Construction + Design EXPO ──────────────────────────────
    ev("West Virginia Construction + Design EXPO 2026", "2026-03-25", "Charleston", "WV",
       "47th annual WV Construction + Design EXPO at Charleston Coliseum & Convention Center. March 25-26. 3,000+ attendees, 300+ exhibitors, 70+ CE seminars. Free registration.",
       "CAWV", "trade_association", "https://wvexpo.com/", "conference"),

    # ── ODOT DBE Workshop ──────────────────────────────────────────
    ev("ODOT DBE/ACDBE Personal Narrative Workshop — NW Ohio", "2026-04-29", "Bowling Green", "OH",
       "Ohio DOT free DBE/ACDBE workshop at ODOT District 2, Bowling Green. One-on-one guidance on Personal Narrative statements and B2Gnow portal submissions.",
       "ODOT", "government", "https://www.eventbrite.com/e/odot-dbeacdbe-personal-narrative-workshop-northwest-ohio-tickets-1909278586649", "networking"),

    # ── NAMC Atlanta Meet the Primes ───────────────────────────────
    ev("NAMC Greater Atlanta — Annual Meet the Primes 2026", "2026-07-24", "Atlanta", "GA",
       "National Association of Minority Contractors Greater Atlanta annual Meet the Primes event. Premier networking connecting minority subcontractors with prime general contractors on major projects.",
       "NAMC Greater Atlanta", "trade_association", "https://namcatlanta.org/annual-meet-the-primes/", "networking"),

    # ── City of San Jose Meet the Primes ───────────────────────────
    ev("City of San Jose — Meet the Primes 2026", "2026-05-15", "San Jose", "CA",
       "City of San Jose Public Works Construction Academy hosts Meet the Primes. Connect with prime contractors on city capital improvement projects. Free networking and matchmaking.",
       "City of San Jose", "government", "https://www.sanjoseca.gov/your-government/departments-offices/public-works/construction-academy/meet-the-primes", "networking"),

    # ── ABC Regional Construction Summit ───────────────────────────
    ev("ABC Regional Construction Summit 2026 — Hanover, MD", "2026-04-10", "Hanover", "MD",
       "Premier ABC networking and education conference co-hosted by ABC Chesapeake Shores, Greater Baltimore, Metro Washington, and Virginia. Sessions on BIM, AI, safety, workforce, and operations at MD Live! Casino.",
       "ABC Greater Baltimore", "abc_chapter", "https://abc-summit.com/", "conference"),

    # ── NAHB International Builders Show ───────────────────────────
    # (Feb 17-19 — past, skip)

    # ── Ohio Business Matchmaker ───────────────────────────────────
    ev("2026 Ohio Business Matchmaker", "2026-04-22", "Dayton", "OH",
       "Two-day government contracting event at Wright State University. Day 1: training. Day 2: 1,500+ one-on-one meetings with federal, state, local buyers and prime contractors.",
       "Ohio Dept. of Development", "government", "https://www.ohiobusinessmatchmaker.com/", "networking"),

    # ── Kiewit S/DBE Outreach — Washington ─────────────────────────
    ev("Kiewit S/DBE Outreach Event — Washington State", "2026-04-10", "Seattle", "WA",
       "Kiewit Infrastructure outreach event for small and disadvantaged businesses. Learn about upcoming projects, subcontracting opportunities, and certification assistance.",
       "Kiewit", "trade_association", "https://omwbe.wa.gov/about/events/kiewit-sdbe-outreach-event", "networking"),

    # ── ABC Central Texas Construction Summit ──────────────────────
    ev("ABC Central Texas Construction Summit 2026", "2026-05-08", "Austin", "TX",
       "ABC Central Texas chapter construction summit. Subcontractors, GCs, architects, engineers, and suppliers networking. Education sessions on safety, workforce, and industry trends.",
       "ABC Central Texas", "abc_chapter", "https://abccentraltexas.org/construction-summit/", "conference"),

    # ── AGC of Minnesota Construction Summit ───────────────────────
    # (Feb 18-19 — past, skip)

    # ── Midwest Construction Safety Conference ─────────────────────
    ev("2026 Midwest Construction Safety Conference", "2026-03-25", "St. Paul", "MN",
       "Regional construction safety conference hosted by AGC of Minnesota. Safety leaders, construction professionals, and industry experts tackle critical jobsite safety challenges.",
       "AGC of Minnesota", "trade_association", "https://www.thebuildersagc.com/BA/iCore/Events/Event_display.aspx?EventKey=MM03052026", "conference"),

    # ── Alaska DOT Civil Rights Conference ─────────────────────────
    ev("Alaska DOT&PF DBE Civil Rights Conference 2026", "2026-09-15", "Anchorage", "AK",
       "Annual Alaska DOT Civil Rights Office conference for DBE firms, prime contractors, and subcontractors. Networking with primes, bidding process insights, and DBE certification assistance.",
       "Alaska DOT&PF", "government", "https://dot.alaska.gov/cvlrts/dbealaska.shtml", "conference"),

    # ── DDOT DBE Summit — DC ───────────────────────────────────────
    ev("DDOT 15th Annual DBE Summit & Networking Symposium 2026", "2026-06-05", "Washington", "DC",
       "DC Dept of Transportation annual DBE Summit co-sponsored by FHWA. Connect with government decision-makers and prime contractors. Upcoming DDOT project forecasts and procurement info. Free.",
       "DDOT", "government", "https://ddot.dc.gov/event/ddots-11th-annual-dbe-summit-networking-symposium", "networking"),

    # ── ABC Greater Baltimore Meet the Primes ──────────────────────
    ev("ABC Greater Baltimore — Meet the Primes 2026", "2026-09-18", "Baltimore", "MD",
       "ABC Greater Baltimore's signature Meet the Primes event. Timed sessions connecting qualified subcontractors with general contractors in classroom-style format plus networking happy hour.",
       "ABC Greater Baltimore", "abc_chapter", "https://events.abcbaltimore.org/event/meet-the-primes-3/", "networking"),

    # ── CT Business Matchmaker ─────────────────────────────────────
    # (March 5 — past, skip)

    # ── SBA Supplier Matchmaking Expo ──────────────────────────────
    # (March 11 — past, skip)

    # ── meettheprimes.com National Event ────────────────────────────
    ev("Meet the Primes National 2026 — Federal Procurement", "2026-08-20", "Washington", "DC",
       "National Meet the Primes event connecting small businesses with prime federal contractors. Federal procurement matchmaking, certification workshops, and agency networking.",
       "meettheprimes.com", "trade_association", "https://www.meettheprimes.com/", "networking"),

    # ── AGC of California CONSTRUCT ────────────────────────────────
    # (already in batch 2)

    # ── Building Connections SE Michigan ────────────────────────────
    ev("Building Connections 2026 — SE Michigan Construction", "2026-06-11", "Detroit", "MI",
       "Largest annual gathering of the construction community in southeast Michigan. General contractors, subcontractors, developers, architects, engineers, and vendors networking.",
       "Michigan Building Trades", "trade_association", "https://michiganscouting.org/buildingconnections/", "networking"),

    # ── Texas Construction Association Events ──────────────────────
    ev("TexCon Annual Convention 2026", "2026-06-08", "San Antonio", "TX",
       "Texas Construction Association annual convention. 3,000+ specialty contractors and subcontractors networking. Largest trade contractor organization in Texas.",
       "Texas Construction Association", "trade_association", "https://www.texcon.org/texcon/Upcoming_Events.asp", "conference"),
]

if __name__ == "__main__":
    from datetime import date
    today = date.today().isoformat()
    future = [e for e in events if e["date"] >= today]
    print(f"Seeding {len(future)} future events (filtered {len(events) - len(future)} past)...")
    count = upsert_events(future)
    print(f"Upserted {count} events.")
