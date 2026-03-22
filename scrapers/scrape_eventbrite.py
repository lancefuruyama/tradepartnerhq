"""
Scraper: Eventbrite Construction Events
Searches Eventbrite for trade partner outreach, GC networking,
and construction subcontractor events.

Uses Eventbrite's public search pages (no API key required).
"""
import requests
import re
import json
from bs4 import BeautifulSoup
from datetime import datetime
from config import HEADERS, STATE_NAMES, get_coords, upsert_events, CITY_COORDS


# ─── Search queries for Eventbrite ────────────────────────────
EVENTBRITE_SEARCHES = [
    "trade partner outreach construction",
    "subcontractor outreach construction",
    "meet the general contractor",
    "contractor networking construction",
    "GC networking construction",
    "construction subcontractor meet and greet",
    "construction inclusion week",
    "small business construction expo",
    "contractor matchmaking construction",
    "construction trade show networking",
]

# Major metro areas to search in
SEARCH_LOCATIONS = [
    ("San Francisco", "CA"), ("Los Angeles", "CA"), ("San Diego", "CA"),
    ("New York", "NY"), ("Miami", "FL"), ("Orlando", "FL"), ("Tampa", "FL"),
    ("Atlanta", "GA"), ("Chicago", "IL"), ("Dallas", "TX"), ("Houston", "TX"),
    ("Austin", "TX"), ("San Antonio", "TX"), ("Denver", "CO"), ("Seattle", "WA"),
    ("Portland", "OR"), ("Phoenix", "AZ"), ("Las Vegas", "NV"),
    ("Nashville", "TN"), ("Boston", "MA"), ("Washington", "DC"),
    ("Philadelphia", "PA"), ("Charlotte", "NC"), ("Minneapolis", "MN"),
    ("Detroit", "MI"), ("Indianapolis", "IN"), ("Columbus", "OH"),
    ("Salt Lake City", "UT"), ("Kansas City", "MO"),
    ("Baltimore", "MD"), ("Raleigh", "NC"), ("Richmond", "VA"),
    ("Sacramento", "CA"), ("Oakland", "CA"),
    ("Fort Lauderdale", "FL"), ("Jacksonville", "FL"),
]


def search_eventbrite(query: str) -> list[dict]:
    """
    Search Eventbrite for construction networking events.
    Parses the public search results page.
    """
    events = []
    search_url = f"https://www.eventbrite.com/d/united-states/{query.replace(' ', '-')}/"

    try:
        resp = requests.get(search_url, headers={
            **HEADERS,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9",
        }, timeout=20)

        if resp.status_code != 200:
            print(f"    Eventbrite search HTTP {resp.status_code} for '{query}'")
            return events

        soup = BeautifulSoup(resp.text, "lxml")

        # Look for JSON-LD event data
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string)
                items = data if isinstance(data, list) else [data]
                for item in items:
                    if item.get("@type") != "Event":
                        continue

                    title = item.get("name", "")
                    if not title:
                        continue

                    # Filter: must be construction/contractor related
                    full_text = (title + " " + item.get("description", "")).lower()
                    if not any(kw in full_text for kw in [
                        "construction", "contractor", "trade partner", "subcontractor",
                        "general contractor", "builder", "gc ", "outreach",
                    ]):
                        continue

                    start = item.get("startDate", "")[:10]
                    if not start:
                        continue

                    end = item.get("endDate", "")[:10] if item.get("endDate") else None
                    event_url = item.get("url", "")

                    # Location
                    loc = item.get("location", {})
                    if isinstance(loc, dict):
                        addr = loc.get("address", {})
                        if isinstance(addr, dict):
                            city = addr.get("addressLocality", "")
                            state_code = addr.get("addressRegion", "")
                        elif isinstance(addr, str):
                            city, state_code = _parse_address_string(addr)
                        else:
                            city, state_code = "", ""
                        venue = loc.get("name", "")
                    else:
                        city, state_code, venue = "", "", ""

                    coords = get_coords(city, state_code) if city and state_code else None
                    is_virtual = "virtual" in full_text or "online" in full_text or (
                        isinstance(loc, dict) and loc.get("@type") == "VirtualLocation"
                    )

                    events.append({
                        "title": title[:500],
                        "description": (item.get("description", "") or f"Construction event on Eventbrite. Visit source for details.")[:2000],
                        "date": start,
                        "end_date": end,
                        "event_type": _classify_event(title + " " + item.get("description", "")),
                        "source_type": "eventbrite",
                        "source_url": event_url or search_url,
                        "source_name": "Eventbrite",
                        "organization": item.get("organizer", {}).get("name", "Eventbrite") if isinstance(item.get("organizer"), dict) else "Eventbrite",
                        "city": city or None,
                        "state": STATE_NAMES.get(state_code, "") if state_code else None,
                        "state_code": state_code or None,
                        "lat": coords[0] if coords else None,
                        "lng": coords[1] if coords else None,
                        "is_virtual": is_virtual,
                        "tags": _build_tags(title + " " + item.get("description", "")),
                    })

            except (json.JSONDecodeError, TypeError):
                continue

        # Fallback: parse HTML event cards
        for card in soup.find_all(["article", "div", "section"], class_=lambda c: c and "event" in str(c).lower()):
            title_tag = card.find(["h2", "h3", "a"])
            if not title_tag:
                continue
            title = title_tag.get_text(strip=True)
            if len(title) < 10:
                continue

            # Check relevance
            full_text = card.get_text(separator=" ", strip=True).lower()
            if not any(kw in full_text for kw in [
                "construction", "contractor", "trade partner", "subcontractor",
                "general contractor", "builder", "outreach",
            ]):
                continue

            link = title_tag.get("href", "") if title_tag.name == "a" else ""
            if not link:
                link_tag = card.find("a", href=True)
                link = link_tag["href"] if link_tag else ""

            date_str = _extract_date(card.get_text())
            if not date_str:
                continue

            city, state_code, coords = _extract_location(card.get_text())

            # Dedup
            if any(e["title"] == title and e["date"] == date_str for e in events):
                continue

            events.append({
                "title": title[:500],
                "description": f"Construction event on Eventbrite. Visit source for full details and registration.",
                "date": date_str,
                "event_type": _classify_event(full_text),
                "source_type": "eventbrite",
                "source_url": link or search_url,
                "source_name": "Eventbrite",
                "organization": "Eventbrite",
                "city": city,
                "state": STATE_NAMES.get(state_code, "") if state_code else None,
                "state_code": state_code,
                "lat": coords[0] if coords else None,
                "lng": coords[1] if coords else None,
                "is_virtual": "virtual" in full_text or "online" in full_text,
                "tags": _build_tags(full_text),
            })

    except Exception as e:
        print(f"    Eventbrite error for '{query}': {e}")

    return events


def _classify_event(text: str) -> str:
    t = text.lower()
    if any(w in t for w in ["bid", "rfp", "solicitation", "prebid"]):
        return "bid"
    if any(w in t for w in ["workshop", "training", "certif", "safety", "osha"]):
        return "certification"
    if any(w in t for w in ["conference", "convention", "summit", "expo", "show"]):
        return "conference"
    return "networking"


def _build_tags(text: str) -> list[str]:
    tags = []
    t = text.lower()
    if "trade partner" in t: tags.append("Trade Partners")
    if "subcontractor" in t: tags.append("Subcontractors")
    if "sbe" in t: tags.append("SBE")
    if "dbe" in t: tags.append("DBE")
    if "mbe" in t: tags.append("MBE")
    if "wbe" in t: tags.append("WBE")
    if "diversity" in t or "inclusion" in t: tags.append("DEI")
    if "meet the general" in t or "meet the gc" in t: tags.append("Meet the GC")
    if "expo" in t or "showcase" in t: tags.append("Expo")
    if not tags:
        tags.append("Networking")
    return tags


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


def _parse_address_string(addr: str) -> tuple[str, str]:
    """Parse an address string like 'City, ST' into (city, state_code)."""
    parts = addr.split(",")
    if len(parts) >= 2:
        city = parts[-2].strip()
        state = parts[-1].strip().split()[0].upper() if parts[-1].strip() else ""
        if state in STATE_NAMES:
            return city, state
    return "", ""


def scrape_all_eventbrite() -> list[dict]:
    """Search Eventbrite for construction networking events."""
    all_events = []
    seen = set()

    for query in EVENTBRITE_SEARCHES:
        print(f"  Searching Eventbrite: '{query}'...")
        events = search_eventbrite(query)

        # Dedup across searches
        for e in events:
            key = (e["title"], e["date"])
            if key not in seen:
                seen.add(key)
                all_events.append(e)

        print(f"    Found {len(events)} events")

    return all_events


if __name__ == "__main__":
    print("=== Eventbrite Construction Events Scraper ===")
    events = scrape_all_eventbrite()
    print(f"\nTotal: {len(events)} events from Eventbrite")
    count = upsert_events(events)
    print(f"Upserted {count} events to database")
