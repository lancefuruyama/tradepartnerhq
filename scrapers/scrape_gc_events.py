"""
Scraper: General Contractor Trade Partner Outreach Events
Directly scrapes the outreach/events pages of ENR Top 400 GCs.

Focus: Connecting trade partners with general contractors — not just SBE/DBE.
Sources include company outreach pages, event pages, and dedicated trade partner portals.
"""
import requests
import re
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import urljoin
from config import HEADERS, STATE_NAMES, get_coords, upsert_events, CITY_COORDS


# ─── ENR Top 400 GCs with known outreach/events pages ────────
# Each entry: (company name, URL, default state code, category)
GC_EVENT_SOURCES = [
    # --- Tier 1: Companies with dedicated outreach event pages ---
    ("Swinerton", "https://swinerton.com/about-us/community-outreach/", "CA", "outreach"),
    ("Swinerton Events", "https://swinerton.com/tradeshows/", "CA", "events"),
    ("Webcor", "https://www.webcor.com/outreach", "CA", "outreach"),
    ("Hensel Phelps", "https://www.henselphelps.com/subcontractor-outreach-2-2/", "CO", "outreach"),
    ("Hensel Phelps SoCal", "https://www.henselphelps.com/trade-partners-southern-california-region/", "CA", "trade_partners"),
    ("Layton Construction", "https://www.laytonconstructionevents.com/outreach", "UT", "outreach"),
    ("DPR Construction", "https://www.dpr.com/media/events", "CA", "events"),
    ("Turner Construction", "https://www.turnerconstruction.com/insights", "NY", "events"),

    # --- Tier 2: Trade partner / subcontractor pages ---
    ("Clark Construction", "https://www.clarkconstruction.com/our-business/trade-partners", "MD", "trade_partners"),
    ("McCarthy Building", "https://www.mccarthy.com/trade-partners", "MO", "trade_partners"),
    ("Gilbane Building", "https://www.gilbaneco.com/subcontractors/", "RI", "trade_partners"),
    ("Skanska USA", "https://www.usa.skanska.com/who-we-are/diversity-and-inclusion/supplier-diversity/", "NY", "trade_partners"),
    ("Suffolk Construction", "https://suffolk.com/trade-partners", "MA", "trade_partners"),
    ("Holder Construction", "https://www.holder.com/trade-partners", "GA", "trade_partners"),
    ("Mortenson", "https://www.mortenson.com/contact/trade-partner-program/bid-list", "MN", "trade_partners"),
    ("Brasfield & Gorrie", "https://www.brasfieldgorrie.com/trade-partners/", "AL", "trade_partners"),
    ("Whiting-Turner", "https://www.whiting-turner.com/subcontractors/", "MD", "trade_partners"),
    ("JE Dunn", "https://www.jedunn.com/trade-partners", "MO", "trade_partners"),
    ("Sundt Construction", "https://www.sundt.com/trade-partners/", "AZ", "trade_partners"),
    ("Barton Malow", "https://www.bartonmalow.com/trade-partners", "MI", "trade_partners"),
    ("Austin Industries", "https://www.austin-ind.com/trade-partners", "TX", "trade_partners"),
    ("Walsh Group", "https://www.walshgroup.com/", "IL", "trade_partners"),
    ("Balfour Beatty US", "https://www.balfourbeattyus.com/our-work/trade-partners", "TX", "trade_partners"),
    ("PCL Construction", "https://www.pcl.com/us/en/build-with-us/trade-partners", "CO", "trade_partners"),
    ("AECOM", "https://aecom.com/", "TX", "trade_partners"),
    ("Kiewit", "https://www.kiewit.com/business-with-us/subcontractors-and-suppliers/", "NE", "trade_partners"),
    ("Granite Construction", "https://www.graniteconstruction.com/suppliers-subcontractors", "CA", "trade_partners"),
    ("Flatiron Construction", "https://www.flatironcorp.com/subcontractors/", "CO", "trade_partners"),

    # --- Tier 3: Regional GCs with active outreach ---
    ("Clancy & Theys", "https://www.clancytheys.com/trade-partners/", "NC", "trade_partners"),
    ("Bayley Construction", "https://www.bayley.com/", "OR", "trade_partners"),
    ("Korsmo Construction", "https://www.korsmo.com/", "WA", "trade_partners"),
    ("NIBBI Brothers", "https://www.nibbi.com/", "CA", "trade_partners"),
    ("Rudolph & Sletten", "https://www.rfrsletten.com/", "CA", "trade_partners"),
    ("Devcon Construction", "https://www.devcon-const.com/", "CA", "trade_partners"),
    ("Level 10 Construction", "https://www.level10gc.com/", "CA", "trade_partners"),
    ("Lendlease US", "https://www.lendlease.com/us/", "NY", "trade_partners"),
    ("Haskell", "https://www.haskell.com/", "FL", "trade_partners"),
    ("Robins & Morton", "https://www.robinsmorton.com/", "AL", "trade_partners"),
    ("Ryan Companies", "https://www.ryancompanies.com/", "MN", "trade_partners"),
    ("Yates Construction", "https://www.wgyates.com/", "MS", "trade_partners"),
    ("Jacobs", "https://www.jacobs.com/", "TX", "trade_partners"),
    ("HITT Contracting", "https://www.hitt-gc.com/", "VA", "trade_partners"),
    ("Structure Tone", "https://www.structuretone.com/", "NY", "trade_partners"),
]

# Keywords that indicate a trade partner outreach event (broader than SBE/DBE)
EVENT_KEYWORDS = [
    "outreach event", "trade partner", "subcontractor outreach", "networking event",
    "meet and greet", "meet & greet", "open house", "matchmaking",
    "trade partner day", "contractor day", "vendor outreach",
    "supplier diversity", "small business outreach", "sub outreach",
    "bid opportunity", "prebid", "pre-bid", "project outreach",
    "business outreach", "community outreach event",
    "construction inclusion", "contractor networking",
    "meet the contractor", "meet the gc", "meet the general",
    "trade partner outreach", "partnership opportunity",
    "gc expo", "gc showcase", "builders club",
]


def scrape_gc_page(name: str, url: str, default_state: str, category: str) -> list[dict]:
    """
    Scrape a GC's outreach/events page for trade partner events.
    """
    events = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20, allow_redirects=True)
        if resp.status_code != 200:
            print(f"    {name}: HTTP {resp.status_code}")
            return events

        soup = BeautifulSoup(resp.text, "lxml")

        # --- Strategy 1: JSON-LD structured data ---
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                import json
                ld = json.loads(script.string)
                items = ld if isinstance(ld, list) else [ld]
                for item in items:
                    if item.get("@type") in ["Event", "BusinessEvent", "SocialEvent"]:
                        title = item.get("name", "")
                        start = item.get("startDate", "")[:10]
                        loc = item.get("location", {})
                        addr = loc.get("address", {}) if isinstance(loc, dict) else {}
                        city = addr.get("addressLocality", "") if isinstance(addr, dict) else ""
                        state_code = addr.get("addressRegion", "") if isinstance(addr, dict) else ""
                        coords = get_coords(city, state_code) if city and state_code else None

                        if title and start:
                            events.append(_build_event(
                                title=title, date_str=start, url=item.get("url", url),
                                gc_name=name.split(" Events")[0].split(" SoCal")[0],
                                city=city or None, state_code=state_code or default_state,
                                coords=coords, text=title + " " + item.get("description", ""),
                                description=item.get("description", ""),
                            ))
            except Exception:
                continue

        # --- Strategy 2: Parse HTML for event-like content ---
        all_text_blocks = soup.find_all(["a", "h1", "h2", "h3", "h4", "li", "p", "div", "article", "section"])

        for tag in all_text_blocks:
            text = tag.get_text(separator=" ", strip=True)
            text_lower = text.lower()

            # Must contain event keywords
            if not any(kw in text_lower for kw in EVENT_KEYWORDS):
                continue

            # Must be a reasonable length
            if len(text) < 20 or len(text) > 3000:
                continue

            # Skip nav/footer noise
            if tag.find_parent(["nav", "footer", "header"]):
                continue

            # Try to find a date
            date_str = _extract_date(text)
            if not date_str:
                parent = tag.find_parent(["div", "section", "article", "li"])
                if parent:
                    date_str = _extract_date(parent.get_text())
            if not date_str:
                continue

            # Get title — prefer heading inside container, else use tag text
            title_tag = tag.find(["h2", "h3", "h4"]) if tag.name in ["div", "section", "article", "li"] else None
            title = title_tag.get_text(strip=True) if title_tag else text[:200]

            # Get link
            link_tag = tag if tag.name == "a" and tag.get("href") else tag.find("a", href=True)
            link = ""
            if link_tag and link_tag.get("href"):
                link = link_tag["href"]
                if not link.startswith("http"):
                    link = urljoin(url, link)

            # Get location
            city, state_code_found, coords = _extract_location(text)
            if not state_code_found:
                state_code_found = default_state

            gc_clean = name.split(" Events")[0].split(" SoCal")[0]
            event = _build_event(
                title=title, date_str=date_str, url=link or url,
                gc_name=gc_clean, city=city,
                state_code=state_code_found, coords=coords, text=text,
            )

            # Dedup by title within this page
            if not any(e["title"] == event["title"] and e["date"] == event["date"] for e in events):
                events.append(event)

    except Exception as e:
        print(f"    {name}: Error - {e}")

    return events


def _build_event(title: str, date_str: str, url: str, gc_name: str,
                 city: str | None, state_code: str, coords: tuple | None,
                 text: str, description: str = "") -> dict:
    """Build a standardized event dict."""
    text_lower = text.lower()
    state_name = STATE_NAMES.get(state_code, "")

    # Classify event type
    if any(w in text_lower for w in ["bid", "rfp", "solicitation", "prebid", "pre-bid"]):
        event_type = "bid"
    elif any(w in text_lower for w in ["workshop", "training", "certif"]):
        event_type = "certification"
    elif any(w in text_lower for w in ["conference", "convention", "summit", "expo", "show"]):
        event_type = "conference"
    else:
        event_type = "networking"

    # Build tags — broader than just SBE/DBE
    tags = [gc_name]
    if "sbe" in text_lower: tags.append("SBE")
    if "dbe" in text_lower: tags.append("DBE")
    if "mbe" in text_lower: tags.append("MBE")
    if "wbe" in text_lower: tags.append("WBE")
    if "lbe" in text_lower: tags.append("LBE")
    if "sdvob" in text_lower or "veteran" in text_lower: tags.append("Veteran")
    if "diversity" in text_lower or "inclusion" in text_lower: tags.append("DEI")
    if "trade partner" in text_lower: tags.append("Trade Partners")
    if "subcontractor" in text_lower: tags.append("Subcontractors")
    if not any(t in tags for t in ["Trade Partners", "Subcontractors"]):
        tags.append("Trade Partners")

    if not description:
        description = f"{gc_name} trade partner outreach event. Visit the source link for full details and registration."

    return {
        "title": title[:500],
        "description": description[:2000],
        "date": date_str,
        "event_type": event_type,
        "source_type": "gc_website",
        "source_url": url,
        "source_name": f"{gc_name} Website",
        "organization": gc_name,
        "city": city,
        "state": state_name,
        "state_code": state_code,
        "lat": coords[0] if coords else None,
        "lng": coords[1] if coords else None,
        "is_virtual": "virtual" in text_lower or "webinar" in text_lower,
        "tags": tags,
    }


def _extract_date(text: str) -> str | None:
    """Extract a date from text. Returns YYYY-MM-DD or None."""
    patterns = [
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2})\b',
        r'((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})',
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{4})',
    ]
    for pat in patterns:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            raw = match.group().strip().rstrip(",")
            for fmt in ["%m/%d/%Y", "%m/%d/%y", "%m-%d-%Y", "%m-%d-%y",
                        "%B %d, %Y", "%B %d %Y", "%b %d, %Y", "%b. %d, %Y",
                        "%b %d %Y"]:
                try:
                    return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
                except ValueError:
                    continue
    return None


def _extract_location(text: str) -> tuple:
    """Try to find a city/state in text."""
    text_lower = text.lower()
    for (city, sc), (lat, lng) in CITY_COORDS.items():
        if city.lower() in text_lower:
            return city, sc, (lat, lng)
    return None, None, None


def scrape_all_gc_events() -> list[dict]:
    """Scrape all GC outreach/events pages."""
    all_events = []
    for name, url, default_state, category in GC_EVENT_SOURCES:
        print(f"  Scraping {name} ({category})...")
        events = scrape_gc_page(name, url, default_state, category)
        print(f"    Found {len(events)} events")
        all_events.extend(events)
    return all_events


if __name__ == "__main__":
    print("=== GC Trade Partner Outreach Scraper ===")
    events = scrape_all_gc_events()
    print(f"\nTotal: {len(events)} events from GC websites")
    count = upsert_events(events)
    print(f"Upserted {count} events to database")
