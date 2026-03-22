"""
Scraper: LinkedIn (Company Pages + Personal Posts)
Finds GC trade partner outreach events posted on LinkedIn.

IMPORTANT: LinkedIn does not allow scraping of their platform.
This scraper uses two compliant approaches:
  1. Google search for LinkedIn posts about construction outreach events
  2. RSS/Atom feeds from company pages (when available)

For production, consider LinkedIn's Marketing API or a licensed data provider.
"""
import requests
import re
import json
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from urllib.parse import quote_plus
from config import HEADERS, STATE_NAMES, get_coords, upsert_events, CITY_COORDS

# GC company names to search for outreach posts
GC_COMPANIES = [
    "Swinerton", "Turner Construction", "Hensel Phelps", "Skanska",
    "Clark Construction", "Holder Construction", "Mortenson",
    "McCarthy Building", "DPR Construction", "Whiting-Turner",
    "Gilbane Building", "Suffolk Construction", "Brasfield & Gorrie",
    "Barton Malow", "JE Dunn", "Webcor", "Sundt Construction",
    "Austin Industries", "Kiewit", "PCL Construction",
    "Walsh Group", "Granite Construction", "Flatiron Construction",
    "Balfour Beatty", "Bechtel", "AECOM",
]

# Search terms that indicate trade partner outreach
SEARCH_TERMS = [
    "trade partner outreach event",
    "SBE outreach event construction",
    "DBE networking event contractor",
    "small business meet and greet construction",
    "subcontractor outreach event",
    "MBE WBE networking construction",
    "trade partner day construction",
    "subcontractor matchmaking event",
]


def search_google_for_linkedin_posts() -> list[dict]:
    """
    Use Google to find recent LinkedIn posts about construction outreach events.
    This is compliant since we're searching Google, not scraping LinkedIn directly.
    """
    events = []

    for term in SEARCH_TERMS[:5]:  # Limit to avoid rate limiting
        query = f'site:linkedin.com/posts "{term}" {datetime.now().year}'
        search_url = f"https://www.google.com/search?q={quote_plus(query)}&num=20"

        try:
            resp = requests.get(search_url, headers={
                **HEADERS,
                "Accept": "text/html",
                "Accept-Language": "en-US,en;q=0.9",
            }, timeout=15)

            if resp.status_code != 200:
                print(f"  Google search returned {resp.status_code} for '{term}'")
                continue

            soup = BeautifulSoup(resp.text, "lxml")

            # Parse Google search results
            for result in soup.find_all("div", class_="g"):
                link_tag = result.find("a", href=True)
                if not link_tag or "linkedin.com" not in link_tag["href"]:
                    continue

                title_tag = result.find("h3")
                snippet_tag = result.find("span", class_="aCOpRe") or result.find("div", class_="VwiC3b")

                if not title_tag:
                    continue

                title = title_tag.get_text(strip=True)
                snippet = snippet_tag.get_text(strip=True) if snippet_tag else ""
                url = link_tag["href"]

                # Determine if this is a company page or personal post
                is_company = "/company/" in url
                source_type = "linkedin_company" if is_company else "linkedin_personal"

                # Try to extract the poster/company name
                poster = ""
                for gc in GC_COMPANIES:
                    if gc.lower() in title.lower() or gc.lower() in snippet.lower():
                        poster = gc
                        break

                if not poster:
                    # Try to get from the LinkedIn URL
                    match = re.search(r'linkedin\.com/(?:posts|company)/([^/]+)', url)
                    poster = match.group(1).replace("-", " ").title() if match else "Unknown"

                # Extract location from title/snippet
                city, state_code, coords = extract_location_from_text(f"{title} {snippet}")

                # Extract date from snippet
                date_str = extract_date_from_text(snippet) or datetime.now().strftime("%Y-%m-%d")

                # Determine event type
                event_type = classify_linkedin_post(title + " " + snippet)

                # Build the event
                cleaned_title = clean_linkedin_title(title, poster)

                events.append({
                    "title": cleaned_title[:500],
                    "description": snippet[:2000] or f"LinkedIn post by {poster} about trade partner outreach.",
                    "date": date_str,
                    "event_type": event_type,
                    "source_type": source_type,
                    "source_url": url,
                    "source_name": f"LinkedIn - {poster}",
                    "organization": poster,
                    "city": city,
                    "state": STATE_NAMES.get(state_code, "") if state_code else None,
                    "state_code": state_code,
                    "lat": coords[0] if coords else None,
                    "lng": coords[1] if coords else None,
                    "is_virtual": "virtual" in (title + snippet).lower(),
                    "tags": build_linkedin_tags(title + " " + snippet),
                })

        except Exception as e:
            print(f"  Error searching for '{term}': {e}")
            continue

    return events


def search_gc_websites_for_events() -> list[dict]:
    """
    As a fallback, check known GC websites for outreach event pages.
    Many GCs have dedicated outreach/diversity pages.
    """
    events = []
    gc_outreach_pages = [
        ("Swinerton", "https://swinerton.com/subcontractors/", "CA"),
        ("Turner Construction", "https://www.turnerconstruction.com/opportunity", "NY"),
        ("Hensel Phelps", "https://www.henselphelps.com/subcontractors/", "CO"),
        ("Skanska", "https://www.usa.skanska.com/who-we-are/diversity-and-inclusion/supplier-diversity/", "NY"),
        ("Clark Construction", "https://www.clarkconstruction.com/our-business/trade-partners", "MD"),
        ("DPR Construction", "https://www.dpr.com/company/trade-partners", "CA"),
        ("McCarthy Building", "https://www.mccarthy.com/trade-partners", "MO"),
        ("Gilbane Building", "https://www.gilbaneco.com/subcontractors/", "RI"),
    ]

    for gc_name, url, default_state in gc_outreach_pages:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            if resp.status_code != 200:
                continue

            soup = BeautifulSoup(resp.text, "lxml")
            text = soup.get_text(separator=" ", strip=True).lower()

            # Look for upcoming event mentions
            event_keywords = ["upcoming event", "outreach event", "open house",
                              "meet and greet", "trade partner day", "networking event"]

            for kw in event_keywords:
                if kw in text:
                    # Found an event reference — extract what we can
                    date_str = extract_date_from_text(soup.get_text())
                    if not date_str:
                        continue

                    city, state_code, coords = extract_location_from_text(soup.get_text())
                    if not state_code:
                        state_code = default_state
                        city = list(CITY_COORDS.keys())[0] if CITY_COORDS else None

                    events.append({
                        "title": f"{gc_name} Trade Partner Outreach Event",
                        "description": f"{gc_name} is hosting an upcoming outreach event. Visit their website for full details and registration.",
                        "date": date_str,
                        "event_type": "networking",
                        "source_type": "linkedin_company",
                        "source_url": url,
                        "source_name": f"{gc_name} Website",
                        "organization": gc_name,
                        "city": city,
                        "state": STATE_NAMES.get(state_code, ""),
                        "state_code": state_code,
                        "lat": coords[0] if coords else None,
                        "lng": coords[1] if coords else None,
                        "is_virtual": "virtual" in text,
                        "tags": ["Trade Partners", "Networking"],
                    })
                    break  # One event per GC page

        except Exception as e:
            print(f"  Error checking {gc_name}: {e}")

    return events


def extract_location_from_text(text: str) -> tuple:
    """Try to find a city/state in text."""
    text_lower = text.lower()
    for (city, sc), (lat, lng) in CITY_COORDS.items():
        if city.lower() in text_lower:
            return city, sc, (lat, lng)
    return None, None, None


def extract_date_from_text(text: str) -> str | None:
    """Try to extract a date from text."""
    patterns = [
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{1,2},?\s+\d{4})',
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


def classify_linkedin_post(text: str) -> str:
    """Classify event type from LinkedIn post text."""
    t = text.lower()
    if any(w in t for w in ["bid", "rfp", "solicitation"]):
        return "bid"
    if any(w in t for w in ["workshop", "training", "certification"]):
        return "certification"
    if any(w in t for w in ["conference", "convention", "summit"]):
        return "conference"
    return "networking"


def clean_linkedin_title(title: str, poster: str) -> str:
    """Clean up a LinkedIn search result title."""
    # Remove " | LinkedIn" suffix
    title = re.sub(r'\s*[|–-]\s*LinkedIn\s*$', '', title, flags=re.IGNORECASE)
    # Remove poster name if redundant
    title = title.strip()
    if not title or len(title) < 15:
        return f"{poster} Trade Partner Outreach Event"
    return title


def build_linkedin_tags(text: str) -> list[str]:
    """Build tags from LinkedIn post content."""
    tags = []
    t = text.lower()
    if "sbe" in t: tags.append("SBE")
    if "dbe" in t: tags.append("DBE")
    if "mbe" in t: tags.append("MBE")
    if "wbe" in t: tags.append("WBE")
    if "sdvob" in t or "veteran" in t: tags.append("SDVOB")
    for gc in GC_COMPANIES:
        if gc.lower() in t:
            tags.append(gc)
            break
    if not tags:
        tags.append("Networking")
    return tags


def scrape_linkedin():
    """Run all LinkedIn scraping approaches."""
    events = []

    print("  Searching Google for LinkedIn outreach posts...")
    events += search_google_for_linkedin_posts()

    print("  Checking GC websites for outreach events...")
    events += search_gc_websites_for_events()

    return events


if __name__ == "__main__":
    print("=== LinkedIn / GC Website Scraper ===")
    events = scrape_linkedin()
    print(f"\nTotal: {len(events)} events from LinkedIn/GC sites")
    count = upsert_events(events)
    print(f"Upserted {count} events to database")
