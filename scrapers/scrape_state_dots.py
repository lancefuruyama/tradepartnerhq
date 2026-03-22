"""
Scraper: State DOT SBE/DBE Programs
Pulls outreach events and bid opportunities from state transportation departments.

Each state DOT has a different website structure, so we define per-state scrapers.
Start with high-volume states and expand.
"""
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from config import HEADERS, STATE_NAMES, get_coords, upsert_events

# ─── State DOT URLs and scraping configs ──────────────────────
STATE_DOT_CONFIGS = [
    {
        "state_code": "CA",
        "name": "CalTrans",
        "dbe_url": "https://dot.ca.gov/programs/civil-rights/dbe",
        "events_url": "https://dot.ca.gov/programs/civil-rights/dbe/dbe-events",
        "bid_url": "https://dot.ca.gov/programs/design/lap-adv-and-award",
    },
    {
        "state_code": "TX",
        "name": "TxDOT",
        "dbe_url": "https://www.txdot.gov/business/letting-bids.html",
        "events_url": "https://www.txdot.gov/business/disadvantaged-underutilized/dbe.html",
    },
    {
        "state_code": "FL",
        "name": "FDOT",
        "dbe_url": "https://www.fdot.gov/equalopportunity/dbe.shtm",
        "events_url": "https://www.fdot.gov/equalopportunity/dbeevents.shtm",
    },
    {
        "state_code": "NY",
        "name": "NYSDOT",
        "dbe_url": "https://www.dot.ny.gov/main/business-center/civil-rights/dbe",
        "events_url": "https://www.dot.ny.gov/main/business-center/civil-rights/dbe/dbe-events",
    },
    {
        "state_code": "GA",
        "name": "GDOT",
        "dbe_url": "https://www.dot.ga.gov/GDOT/pages/DBE.aspx",
    },
    {
        "state_code": "WA",
        "name": "WSDOT",
        "dbe_url": "https://wsdot.wa.gov/business-wsdot/civil-rights/dbe-program",
    },
    {
        "state_code": "IL",
        "name": "IDOT",
        "dbe_url": "https://idot.illinois.gov/transportation-system/local-transportation-partners/county-engineers-and-local-public-agencies/contract-letting/disadvantaged-business-enterprise-dbe-",
    },
    {
        "state_code": "OH",
        "name": "ODOT",
        "dbe_url": "https://www.transportation.ohio.gov/programs/civil-rights/dbe",
    },
    {
        "state_code": "PA",
        "name": "PennDOT",
        "dbe_url": "https://www.penndot.pa.gov/about-us/EqualEmployment/Pages/DBE-Program.aspx",
    },
    {
        "state_code": "MA",
        "name": "MassDOT",
        "dbe_url": "https://www.mass.gov/orgs/massdot-highway-division",
    },
    {
        "state_code": "CO",
        "name": "CDOT",
        "dbe_url": "https://www.codot.gov/business/civilrights/dbe",
    },
    {
        "state_code": "NC",
        "name": "NCDOT",
        "dbe_url": "https://connect.ncdot.gov/business/SmallBusiness/Pages/default.aspx",
    },
    {
        "state_code": "AZ",
        "name": "ADOT",
        "dbe_url": "https://azdot.gov/business/civil-rights/disadvantaged-business-enterprise-dbe",
    },
    {
        "state_code": "NJ",
        "name": "NJDOT",
        "dbe_url": "https://www.nj.gov/transportation/business/civilrights/dbe.shtm",
    },
    {
        "state_code": "OR",
        "name": "ODOT-OR",
        "dbe_url": "https://www.oregon.gov/odot/Business/OCR/Pages/DBE.aspx",
    },
]


def scrape_generic_dot_page(url: str, state_code: str, dot_name: str) -> list[dict]:
    """
    Generic scraper that looks for event/outreach links on DOT pages.
    Extracts text containing keywords like 'outreach', 'networking',
    'workshop', 'DBE', 'SBE', 'bid', 'letting'.
    """
    events = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        if resp.status_code != 200:
            print(f"  {dot_name}: HTTP {resp.status_code}")
            return events

        soup = BeautifulSoup(resp.text, "lxml")

        # Look for event-like content
        keywords = ["outreach", "networking", "workshop", "dbe event", "sbe event",
                     "matchmaking", "meet and greet", "meet & greet", "open house",
                     "supportive services", "contractor workshop"]

        # Search in links and headings
        for tag in soup.find_all(["a", "h2", "h3", "h4", "li", "p", "td"]):
            text = tag.get_text(strip=True).lower()
            if any(kw in text for kw in keywords) and len(text) > 20:
                title = tag.get_text(strip=True)[:200]
                link = tag.get("href", "") if tag.name == "a" else ""
                if link and not link.startswith("http"):
                    # Make relative URL absolute
                    from urllib.parse import urljoin
                    link = urljoin(url, link)

                # Try to find a date nearby
                parent = tag.find_parent(["tr", "div", "li", "section"])
                date_str = None
                if parent:
                    parent_text = parent.get_text()
                    # Simple date extraction - look for patterns like MM/DD/YYYY or Month DD, YYYY
                    import re
                    date_match = re.search(
                        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|'
                        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{1,2},?\s+\d{4})',
                        parent_text, re.IGNORECASE
                    )
                    if date_match:
                        raw = date_match.group()
                        for fmt in ["%m/%d/%Y", "%m/%d/%y", "%m-%d-%Y", "%B %d, %Y", "%B %d %Y",
                                    "%b %d, %Y", "%b. %d, %Y"]:
                            try:
                                date_str = datetime.strptime(raw.strip().rstrip(","), fmt).strftime("%Y-%m-%d")
                                break
                            except ValueError:
                                continue

                if not date_str:
                    # Skip items without dates — they might be static content
                    continue

                # Determine event type from text
                if any(w in text for w in ["bid", "letting", "solicitation", "rfp", "rfq"]):
                    event_type = "bid"
                elif any(w in text for w in ["workshop", "training", "certif", "supportive"]):
                    event_type = "certification"
                elif any(w in text for w in ["conference", "convention", "summit", "expo"]):
                    event_type = "conference"
                else:
                    event_type = "networking"

                # Try to determine city from the text
                state_name = STATE_NAMES.get(state_code, "")
                city = None
                coords = None

                # Check if any known city appears in the title
                from config import CITY_COORDS
                for (c, sc), (lat, lng) in CITY_COORDS.items():
                    if sc == state_code and c.lower() in text:
                        city = c
                        coords = (lat, lng)
                        break

                # Build tags
                tags = ["DBE"]
                if "sbe" in text:
                    tags.append("SBE")
                if "mbe" in text:
                    tags.append("MBE")
                if "wbe" in text:
                    tags.append("WBE")
                tags.append(dot_name)

                event = {
                    "title": title,
                    "description": f"{dot_name} {state_name} — {title}. Visit the source link for full details and registration.",
                    "date": date_str,
                    "event_type": event_type,
                    "source_type": "sbe_dbe",
                    "source_url": link or url,
                    "source_name": f"{dot_name} DBE Program",
                    "organization": f"{state_name} Department of Transportation",
                    "city": city,
                    "state": state_name,
                    "state_code": state_code,
                    "lat": coords[0] if coords else None,
                    "lng": coords[1] if coords else None,
                    "is_virtual": "virtual" in text or "webinar" in text,
                    "tags": tags,
                }
                events.append(event)

    except Exception as e:
        print(f"  {dot_name}: Error - {e}")

    return events


def scrape_all_state_dots():
    """Scrape all configured state DOT pages."""
    all_events = []
    for cfg in STATE_DOT_CONFIGS:
        state = cfg["state_code"]
        name = cfg["name"]
        print(f"  Scraping {name} ({state})...")

        # Scrape DBE page
        events = scrape_generic_dot_page(cfg["dbe_url"], state, name)

        # Scrape events page if available
        if "events_url" in cfg:
            events += scrape_generic_dot_page(cfg["events_url"], state, name)

        # Scrape bid page if available
        if "bid_url" in cfg:
            events += scrape_generic_dot_page(cfg["bid_url"], state, name)

        print(f"    Found {len(events)} items from {name}")
        all_events.extend(events)

    return all_events


if __name__ == "__main__":
    print("=== State DOT SBE/DBE Scraper ===")
    events = scrape_all_state_dots()
    print(f"\nTotal: {len(events)} events from state DOTs")
    count = upsert_events(events)
    print(f"Upserted {count} events to database")
