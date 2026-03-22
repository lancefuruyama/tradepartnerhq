"""
Scraper: ABC Chapter "Meet the Generals" + GC Showcase Events
Also scrapes CASF (Construction Association of South Florida),
ASA (American Subcontractors Association) chapters, and similar regional
organizations that host GC-to-trade-partner networking events.

These are the BEST events for connecting trade partners with GCs.
"""
import requests
import re
import json
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import urljoin
from config import HEADERS, STATE_NAMES, get_coords, upsert_events, CITY_COORDS


# ─── ABC Chapters with "Meet the Generals" or GC Showcase events ─
ABC_CHAPTER_SOURCES = [
    # Chapter name, events URL, default state
    ("ABC Greater Baltimore", "https://events.abcbaltimore.org/", "MD"),
    ("ABC Carolinas", "https://abccarolinas.org/events-calendar/", "NC"),
    ("ABC Metro Washington", "https://www.abcmetrowashington.org/Events/Event-Calendar", "DC"),
    ("ABC Keystone (PA)", "https://abckeystone.org/events/", "PA"),
    ("ABC Nevada", "https://www.abcnv.net/events/", "NV"),
    ("ABC Florida East Coast", "https://abceastflorida.com/events/", "FL"),
    ("ABC Central Florida", "https://abccentralflorida.com/events/", "FL"),
    ("ABC Texas Coastal Bend", "https://www.abctcb.org/events/", "TX"),
    ("ABC Northern California", "https://www.abcnorcal.org/events/", "CA"),
    ("ABC Southern California", "https://www.abcsocal.org/events/", "CA"),
    ("ABC Georgia", "https://www.abcga.org/events/", "GA"),
    ("ABC Ohio Valley", "https://www.abcov.org/events/", "OH"),
    ("ABC Minnesota/North Dakota", "https://www.abcmnd.org/events/", "MN"),
    ("ABC Indiana/Kentucky", "https://abcindianakentucky.org/events/", "IN"),
    ("ABC KCMO", "https://www.abcksmo.org/events/", "MO"),
]

# ─── Subcontractor associations and regional orgs ─────────────
REGIONAL_ORG_SOURCES = [
    # CASF / Construction associations
    ("CASF South Florida", "https://www.casf.org/events/", "FL"),
    ("ASA Arizona", "https://www.asa-az.org/events", "AZ"),
    ("ASA National", "https://www.asaonline.com/Events", "DC"),
    ("United Contractors (CA)", "https://www.unitedcontractors.org/calendar", "CA"),
    ("Bay Area BX", "https://bayareabx.com/events", "CA"),
    ("AGC Minnesota Summit", "https://www.agcmn.org/events/", "MN"),
    ("NAMC National", "https://www.namcnational.org/events", "DC"),
    ("Associated Subs of MA", "https://www.associatedsubs.com/events/", "MA"),
    ("KCASA (Kansas City)", "https://www.kcasa.org/calendar-of-events", "MO"),
]

# Keywords that indicate GC-trade partner networking
GC_EVENT_KEYWORDS = [
    "meet the generals", "meet the general contractor", "meet the gc",
    "gc showcase", "gc expo", "general contractor showcase",
    "trade partner", "subcontractor outreach", "contractor networking",
    "speed networking", "matchmaking", "meet & greet", "meet and greet",
    "contractor connections", "building connections",
    "supplier diversity", "construction networking",
    "open house", "contractor day", "business outreach",
    "small business construction", "construction expo",
    "construction summit", "builders club",
]


def scrape_chapter_events(name: str, url: str, default_state: str) -> list[dict]:
    """Scrape a chapter's events page for GC networking events."""
    events = []
    try:
        resp = requests.get(url, headers={
            **HEADERS,
            "Accept": "text/html,application/xhtml+xml",
        }, timeout=20, allow_redirects=True)

        if resp.status_code != 200:
            print(f"    {name}: HTTP {resp.status_code}")
            return events

        soup = BeautifulSoup(resp.text, "lxml")

        # --- Strategy 1: JSON-LD ---
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string)
                items = data if isinstance(data, list) else [data]
                for item in items:
                    if item.get("@type") not in ["Event", "BusinessEvent", "SocialEvent"]:
                        continue
                    title = item.get("name", "")
                    start = item.get("startDate", "")[:10]
                    if not title or not start:
                        continue

                    full_text = (title + " " + item.get("description", "")).lower()
                    if not any(kw in full_text for kw in GC_EVENT_KEYWORDS):
                        continue

                    loc = item.get("location", {})
                    addr = loc.get("address", {}) if isinstance(loc, dict) else {}
                    city = addr.get("addressLocality", "") if isinstance(addr, dict) else ""
                    state_code = addr.get("addressRegion", "") if isinstance(addr, dict) else default_state
                    coords = get_coords(city, state_code) if city else None

                    events.append(_build_event(
                        title=title, date_str=start,
                        url=item.get("url", url), org_name=name,
                        city=city or None, state_code=state_code,
                        coords=coords, text=full_text,
                        description=item.get("description", ""),
                    ))
            except Exception:
                continue

        # --- Strategy 2: HTML parsing ---
        containers = soup.find_all(
            ["div", "article", "li", "section", "tr"],
            class_=lambda c: c and any(w in str(c).lower() for w in
                ["event", "calendar", "listing", "card", "item"])
        )

        # Also look at all links and headings
        for tag in list(containers) + list(soup.find_all(["a", "h2", "h3", "h4"])):
            text = tag.get_text(separator=" ", strip=True)
            text_lower = text.lower()

            if not any(kw in text_lower for kw in GC_EVENT_KEYWORDS):
                continue

            if len(text) < 15 or len(text) > 3000:
                continue

            date_str = _extract_date(text)
            if not date_str:
                parent = tag.find_parent(["div", "section", "article", "tr", "li"])
                if parent:
                    date_str = _extract_date(parent.get_text())
            if not date_str:
                continue

            title_tag = tag.find(["h2", "h3", "h4"]) if tag.name not in ["a", "h2", "h3", "h4"] else tag
            title = title_tag.get_text(strip=True) if title_tag else text[:200]

            link_tag = tag if tag.name == "a" and tag.get("href") else tag.find("a", href=True)
            link = ""
            if link_tag and link_tag.get("href"):
                link = link_tag["href"]
                if not link.startswith("http"):
                    link = urljoin(url, link)

            city, state_code_found, coords = _extract_location(text)
            if not state_code_found:
                state_code_found = default_state

            event = _build_event(
                title=title, date_str=date_str, url=link or url,
                org_name=name, city=city, state_code=state_code_found,
                coords=coords, text=text,
            )

            if not any(e["title"] == event["title"] and e["date"] == event["date"] for e in events):
                events.append(event)

    except Exception as e:
        print(f"    {name}: Error - {e}")

    return events


def _build_event(title: str, date_str: str, url: str, org_name: str,
                 city: str | None, state_code: str, coords: tuple | None,
                 text: str, description: str = "") -> dict:
    """Build standardized event dict."""
    text_lower = text.lower()
    state_name = STATE_NAMES.get(state_code, "")

    if any(w in text_lower for w in ["bid", "rfp", "solicitation"]):
        event_type = "bid"
    elif any(w in text_lower for w in ["workshop", "training", "certif"]):
        event_type = "certification"
    elif any(w in text_lower for w in ["conference", "convention", "summit"]):
        event_type = "conference"
    else:
        event_type = "networking"

    tags = []
    if "abc" in org_name.lower(): tags.append("ABC")
    if "agc" in org_name.lower(): tags.append("AGC")
    if "asa" in org_name.lower(): tags.append("ASA")
    if "casf" in org_name.lower(): tags.append("CASF")
    if "meet the general" in text_lower or "meet the gc" in text_lower: tags.append("Meet the GC")
    if "gc showcase" in text_lower or "gc expo" in text_lower: tags.append("GC Showcase")
    if "speed networking" in text_lower: tags.append("Speed Networking")
    if "trade partner" in text_lower: tags.append("Trade Partners")
    if "subcontractor" in text_lower: tags.append("Subcontractors")
    if "diversity" in text_lower or "inclusion" in text_lower: tags.append("DEI")
    if not tags:
        tags.append("GC Networking")

    if not description:
        description = f"{org_name} event for connecting trade partners with general contractors. Visit the source link for full details and registration."

    return {
        "title": title[:500],
        "description": description[:2000],
        "date": date_str,
        "event_type": event_type,
        "source_type": "abc_chapter",
        "source_url": url,
        "source_name": org_name,
        "organization": org_name,
        "city": city,
        "state": state_name,
        "state_code": state_code,
        "lat": coords[0] if coords else None,
        "lng": coords[1] if coords else None,
        "is_virtual": "virtual" in text_lower or "webinar" in text_lower,
        "tags": tags,
    }


def _extract_date(text: str) -> str | None:
    patterns = [
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
        r'((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})',
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{4})',
    ]
    for pat in patterns:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            raw = match.group().strip().rstrip(",")
            for fmt in ["%m/%d/%Y", "%m/%d/%y", "%B %d, %Y", "%B %d %Y",
                        "%b %d, %Y", "%b. %d, %Y"]:
                try:
                    return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
                except ValueError:
                    continue
    return None


def _extract_location(text: str) -> tuple:
    text_lower = text.lower()
    for (city, sc), (lat, lng) in CITY_COORDS.items():
        if city.lower() in text_lower:
            return city, sc, (lat, lng)
    return None, None, None


def scrape_all_abc_chapters() -> list[dict]:
    """Scrape all ABC chapters and regional orgs for GC networking events."""
    all_events = []

    print("  --- ABC Chapters ---")
    for name, url, state in ABC_CHAPTER_SOURCES:
        print(f"  Scraping {name}...")
        events = scrape_chapter_events(name, url, state)
        print(f"    Found {len(events)} events")
        all_events.extend(events)

    print("  --- Regional Organizations ---")
    for name, url, state in REGIONAL_ORG_SOURCES:
        print(f"  Scraping {name}...")
        events = scrape_chapter_events(name, url, state)
        print(f"    Found {len(events)} events")
        all_events.extend(events)

    return all_events


if __name__ == "__main__":
    print("=== ABC Chapters & Regional Orgs Scraper ===")
    events = scrape_all_abc_chapters()
    print(f"\nTotal: {len(events)} events")
    count = upsert_events(events)
    print(f"Upserted {count} events to database")
