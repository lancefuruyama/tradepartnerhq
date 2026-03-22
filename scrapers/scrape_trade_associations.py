"""
Scraper: Trade Associations (AGC, ABC, NAHB chapters)
Pulls events from major construction trade association websites.

These sites typically have event calendars/RSS feeds.
"""
import requests
import feedparser
from bs4 import BeautifulSoup
from datetime import datetime
from config import HEADERS, STATE_NAMES, get_coords, upsert_events, CITY_COORDS

# ─── Trade association event sources ──────────────────────────
ASSOCIATION_SOURCES = [
    {
        "name": "AGC of America",
        "org": "Associated General Contractors of America",
        "events_url": "https://www.agc.org/learn/education-training/events",
        "type": "html",
    },
    {
        "name": "ABC National",
        "org": "Associated Builders and Contractors",
        "events_url": "https://www.abc.org/Conferences-and-Events",
        "type": "html",
    },
    {
        "name": "NAHB",
        "org": "National Association of Home Builders",
        "events_url": "https://www.nahb.org/events",
        "type": "html",
    },
    # Regional AGC chapters with active SBE outreach
    {
        "name": "AGC California",
        "org": "AGC of California",
        "events_url": "https://www.agc-ca.org/events/",
        "type": "html",
    },
    {
        "name": "AGC New York",
        "org": "AGC New York State",
        "events_url": "https://www.agcnys.org/events/",
        "type": "html",
    },
    {
        "name": "AGC Texas",
        "org": "AGC of Texas",
        "events_url": "https://www.agctx.org/events/",
        "type": "html",
    },
    {
        "name": "AGC Oregon-Columbia",
        "org": "AGC Oregon-Columbia Chapter",
        "events_url": "https://www.agc-oregon.org/events/",
        "type": "html",
    },
    {
        "name": "AGC Georgia",
        "org": "AGC of Georgia",
        "events_url": "https://www.agcga.org/events",
        "type": "html",
    },
    {
        "name": "AGC Colorado",
        "org": "AGC of Colorado",
        "events_url": "https://www.agccolorado.org/events/",
        "type": "html",
    },
    {
        "name": "AGC Washington",
        "org": "AGC of Washington",
        "events_url": "https://www.agcwa.com/events/",
        "type": "html",
    },
]


def scrape_html_events(source: dict) -> list[dict]:
    """
    Generic HTML event scraper for trade association websites.
    Looks for event cards/listings containing dates and titles.
    """
    events = []
    url = source["events_url"]
    name = source["name"]
    org = source["org"]

    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        if resp.status_code != 200:
            print(f"  {name}: HTTP {resp.status_code}")
            return events

        soup = BeautifulSoup(resp.text, "lxml")

        # Common event listing patterns
        # Look for elements with event-related class names
        event_containers = soup.find_all(
            ["div", "article", "li", "section"],
            class_=lambda c: c and any(w in str(c).lower() for w in
                ["event", "calendar", "listing", "card", "item"])
        )

        # Also look for structured data (JSON-LD)
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                import json
                ld = json.loads(script.string)
                items = ld if isinstance(ld, list) else [ld]
                for item in items:
                    if item.get("@type") in ["Event", "BusinessEvent", "EducationEvent"]:
                        title = item.get("name", "")
                        start = item.get("startDate", "")[:10]
                        end = item.get("endDate", "")[:10] if item.get("endDate") else None
                        loc = item.get("location", {})
                        addr = loc.get("address", {}) if isinstance(loc, dict) else {}

                        city = addr.get("addressLocality", "") if isinstance(addr, dict) else ""
                        state_code = addr.get("addressRegion", "") if isinstance(addr, dict) else ""
                        coords = get_coords(city, state_code) if city and state_code else None

                        if title and start:
                            events.append({
                                "title": title[:500],
                                "description": item.get("description", "")[:2000] or f"Event by {org}. Visit source for details.",
                                "date": start,
                                "end_date": end,
                                "event_type": classify_event(title),
                                "source_type": "trade_association",
                                "source_url": item.get("url", url),
                                "source_name": name,
                                "organization": org,
                                "city": city or None,
                                "state": STATE_NAMES.get(state_code, "") or None,
                                "state_code": state_code or None,
                                "lat": coords[0] if coords else None,
                                "lng": coords[1] if coords else None,
                                "is_virtual": "virtual" in title.lower() or "online" in title.lower(),
                                "tags": build_tags(title, org),
                            })
            except (json.JSONDecodeError, TypeError):
                continue

        # Parse HTML event containers
        import re
        for container in event_containers:
            text = container.get_text(separator=" ", strip=True)

            # Look for title (usually in h2/h3/h4 or a link)
            title_tag = container.find(["h2", "h3", "h4", "a"])
            if not title_tag:
                continue
            title = title_tag.get_text(strip=True)
            if len(title) < 10 or len(title) > 500:
                continue

            # Look for date
            date_match = re.search(
                r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|'
                r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{1,2},?\s+\d{4})',
                text, re.IGNORECASE
            )
            if not date_match:
                continue

            raw_date = date_match.group()
            date_str = None
            for fmt in ["%m/%d/%Y", "%m/%d/%y", "%m-%d-%Y", "%B %d, %Y", "%B %d %Y",
                        "%b %d, %Y", "%b. %d, %Y"]:
                try:
                    date_str = datetime.strptime(raw_date.strip().rstrip(","), fmt).strftime("%Y-%m-%d")
                    break
                except ValueError:
                    continue

            if not date_str:
                continue

            # Find link
            link_tag = container.find("a", href=True)
            link = link_tag["href"] if link_tag else ""
            if link and not link.startswith("http"):
                from urllib.parse import urljoin
                link = urljoin(url, link)

            # Determine location
            city, state_code, coords = extract_location(text)

            events.append({
                "title": title,
                "description": f"{org} event: {title}. Visit source for full details.",
                "date": date_str,
                "event_type": classify_event(title),
                "source_type": "trade_association",
                "source_url": link or url,
                "source_name": name,
                "organization": org,
                "city": city,
                "state": STATE_NAMES.get(state_code, "") if state_code else None,
                "state_code": state_code,
                "lat": coords[0] if coords else None,
                "lng": coords[1] if coords else None,
                "is_virtual": "virtual" in title.lower() or "webinar" in title.lower(),
                "tags": build_tags(title, org),
            })

    except Exception as e:
        print(f"  {name}: Error - {e}")

    return events


def classify_event(title: str) -> str:
    """Classify event type based on title keywords."""
    t = title.lower()
    if any(w in t for w in ["bid", "rfp", "solicitation", "procurement", "letting"]):
        return "bid"
    if any(w in t for w in ["workshop", "training", "certif", "safety", "osha"]):
        return "certification"
    if any(w in t for w in ["convention", "conference", "expo", "summit", "show", "gala", "awards"]):
        return "conference"
    return "networking"


def build_tags(title: str, org: str) -> list[str]:
    """Build tags from title content."""
    tags = []
    t = title.lower()
    if "sbe" in t: tags.append("SBE")
    if "dbe" in t: tags.append("DBE")
    if "mbe" in t: tags.append("MBE")
    if "wbe" in t: tags.append("WBE")
    if "diversity" in t or "inclusion" in t: tags.append("DEI")
    if "safety" in t: tags.append("Safety")
    if "agc" in org.lower(): tags.append("AGC")
    if "abc" in org.lower(): tags.append("ABC")
    if "nahb" in org.lower(): tags.append("NAHB")
    if not tags:
        tags.append("Trade Association")
    return tags


def extract_location(text: str) -> tuple:
    """Try to find a city/state in the text."""
    text_lower = text.lower()
    for (city, state_code), (lat, lng) in CITY_COORDS.items():
        if city.lower() in text_lower:
            return city, state_code, (lat, lng)
    return None, None, None


def scrape_all_trade_associations():
    """Scrape all configured trade association sources."""
    all_events = []
    for source in ASSOCIATION_SOURCES:
        name = source["name"]
        print(f"  Scraping {name}...")
        events = scrape_html_events(source)
        print(f"    Found {len(events)} events from {name}")
        all_events.extend(events)
    return all_events


if __name__ == "__main__":
    print("=== Trade Association Scraper ===")
    events = scrape_all_trade_associations()
    print(f"\nTotal: {len(events)} events from trade associations")
    count = upsert_events(events)
    print(f"Upserted {count} events to database")
