#!/usr/bin/env python3
"""
Scraper: ENR Top 400 GC Website Crawler for Trade Partner Events

Crawls each GC's website looking for:
- Outreach/events pages
- Trade partner / subcontractor pages
- PDF flyers for upcoming events
- Meet the Prime / Meet the GC events

For each GC:
1. Try known outreach URLs (curated list of ~50 GCs with known pages)
2. Google search for "{company} trade partner outreach events"
3. Crawl discovered pages for event data
4. Download PDFs and host them locally for linking
"""
import os
import re
import json
import time
import hashlib
import requests
from pathlib import Path
from datetime import datetime, date
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup

from config import (
    HEADERS, STATE_NAMES, get_coords, upsert_events,
    CITY_COORDS, is_excluded_event, clean_title,
)
from enr_top_400 import ENR_TOP_400


# ─── Known GC outreach/events URLs (curated for high-value pages) ──────
# These are GCs with known, dedicated outreach or events pages.
# Format: company_name_lower → list of URLs to scrape
KNOWN_OUTREACH_URLS = {
    "turner construction": [
        "https://www.turnerconstruction.com/opportunity",
        "https://www.turnerconstruction.com/community/building-with-the-community",
    ],
    "whiting-turner": [
        "https://www.whiting-turner.com/subcontractors/",
    ],
    "dpr construction": [
        "https://www.dpr.com/media/events",
    ],
    "hitt contracting": [
        "https://www.hitt-gc.com/trade-partners",
    ],
    "pcl construction": [
        "https://www.pcl.com/us/en/build-with-us/trade-partners",
    ],
    "skanska": [
        "https://www.usa.skanska.com/who-we-are/diversity-and-inclusion/supplier-diversity/",
    ],
    "hensel phelps": [
        "https://www.henselphelps.com/subcontractor-outreach-2-2/",
        "https://www.henselphelps.com/trade-partners-southern-california-region/",
        "https://www.henselphelps.com/trade-partners/",
    ],
    "holder construction": [
        "https://www.holder.com/trade-partners",
    ],
    "gilbane": [
        "https://www.gilbaneco.com/subcontractors/",
    ],
    "je dunn": [
        "https://www.jedunn.com/trade-partners",
    ],
    "clark": [
        "https://www.clarkconstruction.com/our-business/trade-partners",
    ],
    "mccarthy": [
        "https://www.mccarthy.com/trade-partners",
    ],
    "mortenson": [
        "https://www.mortenson.com/contact/trade-partner-program/bid-list",
        "https://www.mortenson.com/events",
    ],
    "brasfield & gorrie": [
        "https://www.brasfieldgorrie.com/trade-partners/",
    ],
    "walsh group": [
        "https://www.walshgroup.com/trade-partners.html",
    ],
    "suffolk": [
        "https://suffolk.com/trade-partners",
    ],
    "swinerton": [
        "https://swinerton.com/about-us/community-outreach/",
        "https://swinerton.com/tradeshows/",
    ],
    "austin industries": [
        "https://www.austin-ind.com/trade-partners",
    ],
    "balfour beatty": [
        "https://www.balfourbeattyus.com/our-work/trade-partners",
    ],
    "barton malow": [
        "https://www.bartonmalow.com/trade-partners",
    ],
    "sundt": [
        "https://www.sundt.com/trade-partners/",
    ],
    "kiewit": [
        "https://www.kiewit.com/business-with-us/subcontractors-and-suppliers/",
    ],
    "granite construction": [
        "https://www.graniteconstruction.com/suppliers-subcontractors",
    ],
    "flatiron": [
        "https://www.flatironcorp.com/subcontractors/",
    ],
    "webcor": [
        "https://www.webcor.com/outreach",
    ],
    "layton construction": [
        "https://www.laytonconstructionevents.com/outreach",
    ],
    "clancy & theys": [
        "https://www.clancytheys.com/trade-partners/",
    ],
    "robins & morton": [
        "https://www.robinsmorton.com/trade-partners",
    ],
    "ryan companies": [
        "https://www.ryancompanies.com/trade-partners",
    ],
    "pepper construction": [
        "https://www.pepperconstruction.com/trade-partners",
    ],
    "messer": [
        "https://www.messer.com/trade-partners/",
    ],
    "consigli": [
        "https://www.consigli.com/trade-partners/",
    ],
    "shawmut": [
        "https://www.shawmut.com/trade-partners",
    ],
    "boldt": [
        "https://www.boldt.com/trade-partners/",
    ],
    "hoar": [
        "https://www.hoar.com/trade-partners",
    ],
    "choate": [
        "https://www.choateco.com/trade-partners",
    ],
    "alston": [
        "https://www.alston.com/trade-partners",
    ],
    "weitz": [
        "https://www.weitz.com/trade-partners",
    ],
    "clayco": [
        "https://www.claycorp.com/trade-partners",
    ],
    "hoffman construction": [
        "https://www.hoffmancorp.com/trade-partners/",
    ],
    "haskell": [
        "https://www.haskell.com/trade-partners/",
    ],
    "power construction": [
        "https://www.powerconstruction.net/trade-partners",
    ],
    "okland": [
        "https://www.okland.com/trade-partners",
    ],
    "big-d": [
        "https://www.big-d.com/trade-partners",
    ],
    "moss": [
        "https://www.mosscm.com/trade-partners",
    ],
    "fortis": [
        "https://www.fortisconstruction.com/trade-partners",
    ],
    "samet": [
        "https://www.sametcorp.com/trade-partners/",
    ],
    "beck group": [
        "https://www.beckgroup.com/trade-partners",
    ],
    "harvey cleary": [
        "https://www.harveycleary.com/trade-partners",
    ],
    "coastal construction": [
        "https://www.coastalconstruction.com/trade-partners",
    ],
    "adolfson & peterson": [
        "https://www.a-p.com/trade-partners/",
    ],
    "level 10": [
        "https://www.level10gc.com/trade-partners",
    ],
    "mcgough": [
        "https://www.mcgough.com/trade-partners",
    ],
    "rogers-obrien": [
        "https://www.r-o.com/trade-partners",
    ],
    "joeris": [
        "https://www.joeris.com/trade-partners",
    ],
    "mccowngordon": [
        "https://www.mccowngordon.com/trade-partners",
    ],
    "rodgers builders": [
        "https://www.rodgersbuilders.com/trade-partners",
    ],
    "willmeng": [
        "https://www.willmeng.com/trade-partners",
    ],
}


# ─── Event keywords to look for on GC pages ────────────────────────
EVENT_KEYWORDS = [
    "outreach event", "trade partner", "subcontractor outreach",
    "networking event", "meet and greet", "meet & greet",
    "matchmaking", "trade partner day", "contractor day",
    "vendor outreach", "supplier diversity", "small business outreach",
    "sub outreach", "bid opportunity", "prebid", "pre-bid",
    "project outreach", "business outreach", "community outreach event",
    "construction inclusion", "contractor networking",
    "meet the contractor", "meet the gc", "meet the general",
    "meet the prime", "trade partner outreach",
    "partnership opportunity", "gc expo", "gc showcase",
    "builders club", "meet the builder",
    "subcontractor fair", "vendor fair", "contractor fair",
    "open bid", "bid event", "project meet",
]

# Paths on GC websites that often contain events
EVENT_PATH_PATTERNS = [
    "/events", "/outreach", "/trade-partners", "/trade-partner",
    "/subcontractors", "/subcontractor", "/diversity",
    "/supplier-diversity", "/community", "/news/events",
    "/about/events", "/insights", "/media/events",
    "/bid-opportunities", "/opportunities",
]

# PDF directory for downloaded event flyers
PDF_DIR = Path(__file__).resolve().parent.parent / "public" / "pdfs"


def ensure_pdf_dir():
    """Create the PDF hosting directory if it doesn't exist."""
    PDF_DIR.mkdir(parents=True, exist_ok=True)


def download_pdf(url: str, company_slug: str) -> str | None:
    """
    Download a PDF and save it to public/pdfs/.
    Returns the public URL path (e.g., /pdfs/turner-outreach-abc123.pdf) or None.
    """
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30, stream=True)
        if resp.status_code != 200:
            return None
        content_type = resp.headers.get("Content-Type", "")
        if "pdf" not in content_type.lower() and not url.lower().endswith(".pdf"):
            return None

        # Generate a unique filename
        url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
        filename = f"{company_slug}-{url_hash}.pdf"
        filepath = PDF_DIR / filename

        # Download (limit to 10MB)
        content = resp.content
        if len(content) > 10 * 1024 * 1024:
            return None

        filepath.write_bytes(content)
        return f"/pdfs/{filename}"

    except Exception:
        return None


def google_search_gc_events(company_name: str) -> list[str]:
    """
    Use Google search to find event/outreach pages for a GC.
    Returns a list of URLs to crawl.
    """
    urls = []
    queries = [
        f'"{company_name}" "trade partner" outreach event 2026',
        f'"{company_name}" "subcontractor outreach" event',
        f'"{company_name}" "meet the prime" OR "meet the general"',
    ]

    for query in queries[:1]:  # Just use first query to be polite to Google
        try:
            search_url = f"https://www.google.com/search?q={requests.utils.quote(query)}&num=5"
            resp = requests.get(search_url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }, timeout=15)
            if resp.status_code != 200:
                continue

            soup = BeautifulSoup(resp.text, "lxml")
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if "/url?q=" in href:
                    actual = href.split("/url?q=")[1].split("&")[0]
                    if actual.startswith("http") and "google" not in actual:
                        urls.append(actual)
            time.sleep(2)  # Be respectful
        except Exception:
            continue

    return urls[:5]


def discover_event_pages(base_url: str, company_name: str) -> list[str]:
    """
    Given a GC's base URL, discover pages that might contain events.
    Checks common paths and also looks for event/outreach links on the homepage.
    """
    discovered = []
    parsed = urlparse(base_url)
    base = f"{parsed.scheme}://{parsed.netloc}"

    # Try common event paths
    for path in EVENT_PATH_PATTERNS:
        discovered.append(base + path)

    # Also scrape the homepage for relevant links
    try:
        resp = requests.get(base_url, headers=HEADERS, timeout=15)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "lxml")
            for a in soup.find_all("a", href=True):
                href = a.get("href", "")
                text = a.get_text(strip=True).lower()
                href_lower = href.lower()

                # Check if link text or URL contains relevant keywords
                is_relevant = any(kw in text for kw in [
                    "trade partner", "subcontractor", "outreach",
                    "event", "diversity", "small business",
                    "bid opportunit", "supplier",
                ]) or any(p in href_lower for p in [
                    "trade-partner", "subcontractor", "outreach",
                    "events", "diversity", "supplier",
                ])

                if is_relevant:
                    full_url = urljoin(base_url, href)
                    if full_url.startswith("http") and parsed.netloc in full_url:
                        discovered.append(full_url)
    except Exception:
        pass

    # Deduplicate
    seen = set()
    unique = []
    for url in discovered:
        normalized = url.rstrip("/").lower()
        if normalized not in seen:
            seen.add(normalized)
            unique.append(url)

    return unique


def scrape_page_for_events(url: str, company_name: str, hq_city: str,
                           hq_state: str, company_slug: str) -> list[dict]:
    """
    Scrape a single page for trade partner events.
    Handles both HTML event listings and PDF links.
    """
    events = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20, allow_redirects=True)
        if resp.status_code != 200:
            return events

        # Check if this is a PDF
        content_type = resp.headers.get("Content-Type", "")
        if "pdf" in content_type.lower() or url.lower().endswith(".pdf"):
            pdf_path = download_pdf(url, company_slug)
            if pdf_path:
                # We'll create an event entry pointing to the hosted PDF
                events.append(_build_event(
                    title=f"{company_name} Trade Partner Event",
                    date_str=None,
                    url=f"https://tradepartnerhq.com{pdf_path}",
                    gc_name=company_name,
                    city=hq_city, state_code=hq_state,
                    coords=get_coords(hq_city, hq_state),
                    text=f"{company_name} trade partner outreach",
                    description=f"Event flyer from {company_name}. View the PDF for full details.",
                ))
            return events

        soup = BeautifulSoup(resp.text, "lxml")

        # ── Strategy 1: JSON-LD structured data ──
        for script in soup.find_all("script", type="application/ld+json"):
            try:
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
                        event_url = item.get("url", url)

                        if title and start:
                            events.append(_build_event(
                                title=title, date_str=start, url=event_url,
                                gc_name=company_name,
                                city=city or hq_city,
                                state_code=state_code or hq_state,
                                coords=coords or get_coords(hq_city, hq_state),
                                text=title + " " + item.get("description", ""),
                                description=item.get("description", ""),
                            ))
            except Exception:
                continue

        # ── Strategy 2: Find PDF links (event flyers) ──
        for a in soup.find_all("a", href=True):
            href = a.get("href", "")
            text = a.get_text(strip=True).lower()

            if href.lower().endswith(".pdf"):
                # Check if the link text or context suggests it's an event
                is_event_pdf = any(kw in text for kw in [
                    "outreach", "event", "trade partner", "flyer",
                    "subcontractor", "meet", "networking", "bid",
                    "register", "rsvp", "invitation",
                ])
                # Also check surrounding context
                parent = a.find_parent(["div", "section", "article", "li", "td"])
                if parent:
                    parent_text = parent.get_text(strip=True).lower()
                    is_event_pdf = is_event_pdf or any(
                        kw in parent_text for kw in EVENT_KEYWORDS
                    )

                if is_event_pdf:
                    pdf_url = urljoin(url, href)
                    ensure_pdf_dir()
                    pdf_path = download_pdf(pdf_url, company_slug)
                    link = f"https://tradepartnerhq.com{pdf_path}" if pdf_path else pdf_url

                    # Try to extract a title from the link text
                    title = a.get_text(strip=True) or f"{company_name} Outreach Event"
                    date_str = _extract_date(
                        (parent.get_text() if parent else "") + " " + title
                    )

                    events.append(_build_event(
                        title=title, date_str=date_str, url=link,
                        gc_name=company_name, city=hq_city,
                        state_code=hq_state,
                        coords=get_coords(hq_city, hq_state),
                        text=title,
                        description=f"Event flyer from {company_name}. View for full details and registration.",
                    ))

        # ── Strategy 3: Parse HTML for event-like content ──
        for tag in soup.find_all(
            ["a", "h1", "h2", "h3", "h4", "li", "p", "div", "article", "section"]
        ):
            text = tag.get_text(separator=" ", strip=True)
            text_lower = text.lower()

            if not any(kw in text_lower for kw in EVENT_KEYWORDS):
                continue
            if len(text) < 20 or len(text) > 3000:
                continue
            if tag.find_parent(["nav", "footer", "header"]):
                continue

            date_str = _extract_date(text)
            if not date_str:
                parent = tag.find_parent(["div", "section", "article", "li"])
                if parent:
                    date_str = _extract_date(parent.get_text())
            if not date_str:
                continue

            # Get title
            title_tag = tag.find(["h2", "h3", "h4"]) if tag.name in [
                "div", "section", "article", "li"
            ] else None
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
                state_code_found = hq_state
            if not city:
                city = hq_city

            event = _build_event(
                title=title, date_str=date_str, url=link or url,
                gc_name=company_name, city=city,
                state_code=state_code_found,
                coords=coords or get_coords(hq_city, hq_state),
                text=text,
            )

            # Dedup by title within this page
            if not any(
                e["title"] == event["title"] and e["date"] == event["date"]
                for e in events
            ):
                events.append(event)

    except requests.exceptions.Timeout:
        pass
    except Exception as e:
        if "ConnectionError" not in str(type(e).__name__):
            pass  # Silently skip connection errors

    return events


def _build_event(title: str, date_str: str | None, url: str, gc_name: str,
                 city: str | None, state_code: str, coords: tuple | None,
                 text: str, description: str = "") -> dict:
    """Build a standardized event dict."""
    text_lower = text.lower()
    state_name = STATE_NAMES.get(state_code, "")

    # If no date, skip (will be filtered out later)
    if not date_str:
        date_str = ""

    # Classify event type
    if any(w in text_lower for w in ["bid", "rfp", "solicitation", "prebid", "pre-bid"]):
        event_type = "bid"
    elif any(w in text_lower for w in ["workshop", "training", "certif"]):
        event_type = "certification"
    elif any(w in text_lower for w in ["conference", "convention", "summit", "expo", "show"]):
        event_type = "conference"
    else:
        event_type = "networking"

    # Build tags
    tags = [gc_name]
    tag_checks = {
        "sbe": "SBE", "dbe": "DBE", "mbe": "MBE", "wbe": "WBE",
        "lbe": "LBE", "diversity": "DEI", "inclusion": "DEI",
    }
    for keyword, tag in tag_checks.items():
        if keyword in text_lower and tag not in tags:
            tags.append(tag)
    if "sdvob" in text_lower or "veteran" in text_lower:
        tags.append("Veteran")
    if "trade partner" in text_lower:
        tags.append("Trade Partners")
    if "subcontractor" in text_lower:
        tags.append("Subcontractors")
    if not any(t in tags for t in ["Trade Partners", "Subcontractors"]):
        tags.append("Trade Partners")

    if not description:
        description = (
            f"{gc_name} trade partner outreach event. "
            "Visit the source link for full details and registration."
        )

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
        r'((?:January|February|March|April|May|June|July|August|'
        r'September|October|November|December)\s+\d{1,2},?\s+\d{4})',
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{4})',
    ]
    for pat in patterns:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            raw = match.group().strip().rstrip(",")
            for fmt in [
                "%m/%d/%Y", "%m/%d/%y", "%m-%d-%Y", "%m-%d-%y",
                "%B %d, %Y", "%B %d %Y", "%b %d, %Y", "%b. %d, %Y",
                "%b %d %Y",
            ]:
                try:
                    dt = datetime.strptime(raw, fmt)
                    return dt.strftime("%Y-%m-%d")
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


def scrape_single_gc(rank: int, company_name: str, hq_city: str,
                     hq_state: str) -> list[dict]:
    """
    Scrape a single GC for trade partner events.
    Uses known URLs first, then discovers pages.
    """
    events = []
    company_slug = re.sub(r'[^a-z0-9]', '-', company_name.lower()).strip('-')
    company_lower = company_name.lower()

    # Collect URLs to scrape
    urls_to_try = set()

    # 1. Check known outreach URLs
    for key, known_urls in KNOWN_OUTREACH_URLS.items():
        if key in company_lower:
            for u in known_urls:
                urls_to_try.add(u)
            break

    # 2. Try Google search for this company's events (for top 100 only, to stay fast)
    if rank <= 100 and not urls_to_try:
        google_urls = google_search_gc_events(company_name)
        for u in google_urls:
            urls_to_try.add(u)

    # 3. Discover event pages from the company's homepage
    # (only if we don't already have known URLs)
    if not urls_to_try:
        # Try to construct likely homepage
        from enr_top_400 import get_company_domain_guesses
        for domain in get_company_domain_guesses(company_name):
            try:
                resp = requests.head(domain, headers=HEADERS, timeout=10,
                                     allow_redirects=True)
                if resp.status_code < 400:
                    discovered = discover_event_pages(domain, company_name)
                    for u in discovered[:5]:  # Limit to 5 pages per GC
                        urls_to_try.add(u)
                    break
            except Exception:
                continue

    # Scrape each URL
    for url in list(urls_to_try)[:8]:  # Max 8 URLs per GC
        page_events = scrape_page_for_events(
            url, company_name, hq_city, hq_state, company_slug
        )
        events.extend(page_events)

    # Dedup within this GC
    seen = set()
    unique = []
    for e in events:
        key = (clean_title(e["title"]), e["date"])
        if key not in seen:
            seen.add(key)
            unique.append(e)

    return unique


def scrape_all_enr_gc_events(max_gcs: int = 400, top_n_google: int = 100) -> list[dict]:
    """
    Scrape all ENR Top 400 GCs for trade partner events.

    Args:
        max_gcs: Maximum number of GCs to scrape (default: all 400)
        top_n_google: Use Google search for the top N GCs (default: 100)
    """
    ensure_pdf_dir()
    all_events = []
    today = date.today().isoformat()

    print(f"  Scanning {min(max_gcs, len(ENR_TOP_400))} ENR Top 400 GCs...")

    for i, (rank, name, city, state) in enumerate(ENR_TOP_400[:max_gcs]):
        if i % 50 == 0 and i > 0:
            print(f"    ... processed {i}/{min(max_gcs, len(ENR_TOP_400))} GCs")

        events = scrape_single_gc(rank, name, city, state)

        # Filter: must have date, must be future, must have URL
        for e in events:
            if (e.get("date") and e["date"] >= today
                    and e.get("source_url")
                    and e["source_url"].startswith("http")
                    and not is_excluded_event(clean_title(e.get("title", "")))):
                all_events.append(e)

    # Global dedup
    seen = set()
    unique = []
    for e in all_events:
        key = (clean_title(e["title"]), e["date"], e["organization"])
        if key not in seen:
            seen.add(key)
            unique.append(e)

    print(f"    ... done. {len(unique)} events from {min(max_gcs, len(ENR_TOP_400))} GCs")
    return unique


if __name__ == "__main__":
    print("=== ENR Top 400 GC Trade Partner Event Scraper ===")
    print(f"Total GCs in list: {len(ENR_TOP_400)}")
    events = scrape_all_enr_gc_events()
    print(f"\nTotal: {len(events)} events")
    if events:
        count = upsert_events(events)
        print(f"Upserted {count} events to database")
    for e in events[:10]:
        print(f"  {e['date']} | {e['organization']:30s} | {e['title'][:60]}")
