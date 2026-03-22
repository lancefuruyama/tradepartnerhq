#!/usr/bin/env python3
"""
Seed batch 2 of manually researched events into the Trade Partner HQ database.
Found via web search on 2026-03-22.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("SUPABASE_URL", "https://ycgyfukhxxtitrbkotpj.supabase.co")

from config import upsert_events, get_coords, STATE_NAMES

# DB constraints: event_type IN ('conference', 'networking')
#                 source_type IN ('eventbrite', 'government', 'trade_association', 'abc_chapter', ...)

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
    # ── Meet the Primes ──────────────────────────────────────────
    ev("Meet the Primes — Denver International Airport (DEN)", "2026-06-19", "Denver", "CO",
       "Free virtual networking connecting small businesses with prime GCs at DEN: Hensel Phelps, Swinerton, Flatiron, PCL, WCG Construction, Gilmore, Select Building Group, Millstone Weber.",
       "Eventbrite", "eventbrite", "https://www.eventbrite.com/e/meet-the-primes-tickets-1975157470163", "networking"),

    ev("AMAC Meet the Primes — General Contractors Virtual Outreach", "2026-04-09", "Denver", "CO",
       "Monthly virtual outreach by AMAC connecting local, small, and historically underutilized firms with prime GCs at DEN. Second Thursday each month, 1-2:15 PM.",
       "AMAC", "trade_association", "https://www.amac-org.com/events/meet-the-primes-general-contractors/", "networking"),

    ev("AMAC Meet the Primes — A/E Virtual Outreach", "2026-05-14", "Denver", "CO",
       "Virtual outreach featuring A/E prime firms (AECOM, HDR, HNTB, Mead & Hunt, RS&H, WSP) discussing best practices at DEN.",
       "AMAC", "trade_association", "https://www.amac-org.com/events/meet-the-primes-architecture-and-engineering-virtual-outreach/", "networking"),

    ev("City of San Jose — Meet the Primes", "2026-05-15", "San Jose", "CA",
       "City of San Jose Public Works Construction Academy hosts Meet the Primes. Connect with prime contractors on city projects.",
       "City of San Jose", "government", "https://www.sanjoseca.gov/your-government/departments-offices/public-works/construction-academy/meet-the-primes", "networking"),

    ev("JFK New Terminal One — Meet the Primes", "2026-06-01", "New York", "NY",
       "Meet the Primes for the $9.5B JFK New Terminal One project. Connect MWBE, SDVOB and ACDBE firms with project leaders and prime contractors.",
       "Port Authority", "government", "https://www.portauthoritybuilds.com/redevelopment/us/en/jfk/planned-projects/terminal-1/events/new-terminal-one---meet-the-primes-event.html", "networking"),

    # ── Build Expos ──────────────────────────────────────────────
    ev("Dallas Build Expo 2026", "2026-04-22", "Dallas", "TX",
       "Two-day construction trade show at Dallas Market Hall. 250 exhibitors, 3,500+ attendees. Networking with contractors, suppliers, and industry experts.",
       "Build Expo USA", "trade_association", "https://buildexpousa.com/dallas-build-expo/", "conference"),

    ev("Austin Build Expo 2026", "2026-05-27", "Austin", "TX",
       "Two-day construction trade show at Palmer Events Center. Connect with contractors, suppliers, and industry professionals.",
       "Build Expo USA", "trade_association", "https://buildexpousa.com/austin-build-expo/", "conference"),

    ev("Nashville Build Expo 2026", "2026-07-01", "Nashville", "TN",
       "Two-day construction trade show at Music City Center. Networking with contractors, suppliers, architects, and construction professionals.",
       "Build Expo USA", "trade_association", "https://buildexpousa.com/nashville-build-expo/", "conference"),

    ev("Houston Build Expo 2026", "2026-08-12", "Houston", "TX",
       "Two-day construction trade show at NRG Center. Connect with Houston-area contractors, suppliers, and construction industry professionals.",
       "Build Expo USA", "trade_association", "https://buildexpousa.com/houston-build-expo/", "conference"),

    ev("South Florida Build Expo 2026", "2026-09-30", "Fort Lauderdale", "FL",
       "Two-day construction trade show at Broward County Convention Center. 6,000+ attendees. Sustainable construction, building materials, and networking.",
       "Build Expo USA", "trade_association", "https://buildexpousa.com/south-florida/", "conference"),

    ev("Charlotte Build Expo 2026", "2026-10-13", "Charlotte", "NC",
       "Two-day construction trade show. Networking with contractors, suppliers, and construction professionals in the Charlotte region.",
       "Build Expo USA", "trade_association", "https://buildexpousa.com/", "conference"),

    ev("Los Angeles Build Expo 2026", "2026-11-04", "Los Angeles", "CA",
       "Two-day construction trade show at the LA Convention Center. Networking, exhibits, and education for the Southern California construction market.",
       "Build Expo USA", "trade_association", "https://buildexpousa.com/los-angeles-build-expo/", "conference"),

    # ── Major Conferences ────────────────────────────────────────
    ev("SAME Federal Small Business Conference (SBC) 2026", "2026-11-04", "Charlotte", "NC",
       "Federal small business conference for A/E/C industry. 5,000+ attendees. Matched networking with USACE, VA, and federal agencies. One-on-one appointments.",
       "SAME", "trade_association", "https://www.samesbc.org/", "conference"),

    ev("NMSDC Annual Conference & Exchange 2026", "2026-10-25", "Los Angeles", "CA",
       "World's largest minority business conference. 3,000+ CEOs, procurement execs, and minority business owners. Business matchmaking and executive networking.",
       "NMSDC", "trade_association", "https://nmsdc.org/events/annual-conference-and-exchange/", "conference"),

    ev("AGC of California CONSTRUCT 2026", "2026-10-06", "Indian Wells", "CA",
       "AGC of California's annual conference at Grand Hyatt Indian Wells. Networking, education, and business development for California construction.",
       "AGC of California", "trade_association", "https://www.agc-ca.org/event/construct-annual-conference-2026/", "conference"),

    ev("LCI Congress 2026 — Lean Construction", "2026-10-12", "Atlanta", "GA",
       "Lean Construction Institute Congress. Practical tools: takt planning, pull techniques, IPD case studies. Premier networking for construction professionals.",
       "LCI", "trade_association", "https://www.lean-construction.org/", "conference"),

    # ── SBA / Government Matchmaking ─────────────────────────────
    ev("2026 Ohio Business Matchmaker", "2026-04-22", "Dayton", "OH",
       "Two-day government contracting event at Wright State Univ. Day 1: training. Day 2: 1,500+ one-on-one meetings with federal, state, local buyers and prime contractors.",
       "Ohio Dept. of Development", "government", "https://www.ohiobusinessmatchmaker.com/", "networking"),

    ev("American Small Business GovCon Summit 2026", "2026-07-01", "Reston", "VA",
       "3rd Annual GovCon Summit. Small business contracting with DoD, Coast Guard, prime defense contractors, and federal agencies. July 1-2.",
       "Defense Leadership Forum", "government", "https://www.usdlf.org/american-small-business-govcon-summit-26", "conference"),

    # ── ABC / Regional Expos ─────────────────────────────────────
    ev("ABC Central Florida Construction Expo 2026", "2026-09-17", "Orlando", "FL",
       "ABC Central Florida chapter construction expo at Central Florida Fairgrounds. 4-7 PM. Subcontractors, architects, engineers, suppliers networking.",
       "ABC Central Florida", "abc_chapter", "https://abccentralflorida.com/abc-events/construction-expo/", "networking"),

    # ── Subcontractor Outreach ───────────────────────────────────
    ev("Korsmo Construction Subcontractor Outreach", "2026-03-19", "Tacoma", "WA",
       "Information session for subcontractors about upcoming partnership opportunities across multiple bid packages. Project scopes, support services, and team introductions.",
       "Korsmo Construction", "eventbrite", "https://www.eventbrite.com/e/korsmo-construction-subcontractor-outreach-multiple-opportunities-tickets-1984088827092", "networking"),

    ev("Hensel Phelps LAX Curbside Improvement Business Outreach", "2026-04-15", "Los Angeles", "CA",
       "Hensel Phelps outreach for the LAX Curbside Improvement project. Connecting small and local businesses with subcontracting opportunities on a major airport project.",
       "Hensel Phelps", "trade_association", "https://www.henselphelps.com/subcontractor-outreach-2/", "networking"),

    # ── Small Business Expos ─────────────────────────────────────
    ev("Small Business Construction Expo (SBCX) 2026", "2026-08-28", "Anaheim", "CA",
       "SBCX at Hilton Anaheim. Connect with public agencies, prime contractors, and specialty trades across California. Build relationships and secure contracts.",
       "AGC of California", "trade_association", "https://www.agc-ca.org/sites/small-business-construction-expo/", "networking"),
]

if __name__ == "__main__":
    from datetime import date
    today = date.today().isoformat()
    future = [e for e in events if e["date"] >= today]
    print(f"Seeding {len(future)} future events (filtered {len(events) - len(future)} past)...")
    count = upsert_events(future)
    print(f"Upserted {count} events.")
