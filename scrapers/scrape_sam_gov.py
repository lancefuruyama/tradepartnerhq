"""
Scraper: SAM.gov (System for Award Management)
Pulls federal contracting opportunities with small business set-asides.

SAM.gov has a public API: https://open.gsa.gov/api/get-opportunities-public-api/
No API key required for basic searches.
"""
import requests
import json
from datetime import datetime, timedelta
from config import HEADERS, STATE_NAMES, get_coords, upsert_events

SAM_API_BASE = "https://api.sam.gov/opportunities/v2/search"

# Set-aside codes for small/disadvantaged businesses
SET_ASIDE_CODES = [
    "SBA",    # Total Small Business Set-Aside
    "8A",     # 8(a) Set-Aside
    "8AN",    # 8(a) Sole Source
    "HZC",    # HUBZone Set-Aside
    "HZS",    # HUBZone Sole Source
    "SDVOSBC", # Service-Disabled Veteran-Owned Small Business Set-Aside
    "SDVOSBS", # SDVOSB Sole Source
    "WOSB",   # Women-Owned Small Business
    "EDWOSB", # Economically Disadvantaged WOSB
    "SBP",    # Small Business Set-Aside (Partial)
]

# Construction-related NAICS codes
CONSTRUCTION_NAICS = [
    "236220",  # Commercial and Institutional Building Construction
    "236210",  # Industrial Building Construction
    "236115",  # New Single-Family Housing Construction
    "236116",  # New Multifamily Housing Construction
    "236118",  # Residential Remodelers
    "237310",  # Highway, Street, and Bridge Construction
    "237110",  # Water and Sewer Line Construction
    "237130",  # Power and Communication Line Construction
    "237990",  # Other Heavy and Civil Engineering Construction
    "238110",  # Poured Concrete Foundation and Structure Contractors
    "238120",  # Structural Steel and Precast Concrete Contractors
    "238130",  # Framing Contractors
    "238140",  # Masonry Contractors
    "238150",  # Glass and Glazing Contractors
    "238160",  # Roofing Contractors
    "238170",  # Siding Contractors
    "238190",  # Other Foundation, Structure, and Building Exterior Contractors
    "238210",  # Electrical Contractors
    "238220",  # Plumbing, Heating, and Air-Conditioning Contractors
    "238290",  # Other Building Equipment Contractors
    "238310",  # Drywall and Insulation Contractors
    "238320",  # Painting and Wall Covering Contractors
    "238330",  # Flooring Contractors
    "238340",  # Tile and Terrazzo Contractors
    "238350",  # Finish Carpentry Contractors
    "238390",  # Other Building Finishing Contractors
    "238910",  # Site Preparation Contractors
    "238990",  # All Other Specialty Trade Contractors
]


def scrape_sam_gov():
    """
    Query SAM.gov API for construction-related opportunities
    with small business set-asides.
    """
    events = []
    today = datetime.now().strftime("%m/%d/%Y")
    future = (datetime.now() + timedelta(days=90)).strftime("%m/%d/%Y")

    for naics in CONSTRUCTION_NAICS[:10]:  # Top 10 NAICS to stay within rate limits
        params = {
            "api_key": "",  # Public API, no key needed for basic
            "postedFrom": today,
            "postedTo": future,
            "ncode": naics,
            "ptype": "o",  # Opportunities
            "limit": 25,
            "offset": 0,
        }

        try:
            resp = requests.get(SAM_API_BASE, params=params, headers=HEADERS, timeout=30)
            if resp.status_code == 429:
                print(f"  Rate limited on NAICS {naics}, skipping")
                continue
            if resp.status_code != 200:
                print(f"  SAM.gov returned {resp.status_code} for NAICS {naics}")
                continue

            data = resp.json()
            opps = data.get("opportunitiesData", [])

            for opp in opps:
                set_aside = opp.get("typeOfSetAside", "")
                # Only include opportunities with SB set-asides
                if not any(code in (set_aside or "") for code in SET_ASIDE_CODES):
                    continue

                title = opp.get("title", "").strip()
                if not title:
                    continue

                # Extract location
                place = opp.get("placeOfPerformance", {})
                city_info = place.get("city", {})
                state_info = place.get("state", {})
                city = city_info.get("name", "") if isinstance(city_info, dict) else str(city_info)
                state_code = state_info.get("code", "") if isinstance(state_info, dict) else str(state_info)

                coords = get_coords(city, state_code) if city and state_code else None

                # Parse response date
                response_date = opp.get("responseDeadLine", "")
                try:
                    date_obj = datetime.strptime(response_date[:10], "%Y-%m-%d") if response_date else None
                except (ValueError, IndexError):
                    date_obj = None

                # Build tags from set-aside type
                tags = []
                if "8A" in (set_aside or ""):
                    tags.append("8(a)")
                if "HZ" in (set_aside or ""):
                    tags.append("HUBZone")
                if "SDVOSB" in (set_aside or ""):
                    tags.append("SDVOSB")
                if "WOSB" in (set_aside or "") or "EDWOSB" in (set_aside or ""):
                    tags.append("WOSB")
                if "SBA" in (set_aside or "") or "SBP" in (set_aside or ""):
                    tags.append("Small Business")
                tags.append("Federal")
                tags.append(f"NAICS {naics}")

                event = {
                    "title": title[:500],
                    "description": opp.get("description", "")[:2000] or f"Federal solicitation via SAM.gov. Set-aside: {set_aside}. NAICS: {naics}.",
                    "date": date_obj.strftime("%Y-%m-%d") if date_obj else datetime.now().strftime("%Y-%m-%d"),
                    "time_info": f"Bid Due: {response_date}" if response_date else None,
                    "event_type": "bid",
                    "source_type": "government",
                    "source_url": f"https://sam.gov/opp/{opp.get('noticeId', '')}",
                    "source_name": "SAM.gov",
                    "organization": opp.get("department", "") or opp.get("subtier", "") or "Federal Government",
                    "city": city or None,
                    "state": STATE_NAMES.get(state_code, "") or None,
                    "state_code": state_code or None,
                    "lat": coords[0] if coords else None,
                    "lng": coords[1] if coords else None,
                    "is_virtual": False,
                    "tags": tags,
                }
                events.append(event)

        except Exception as e:
            print(f"  Error scraping NAICS {naics}: {e}")
            continue

    return events


if __name__ == "__main__":
    print("=== SAM.gov Scraper ===")
    events = scrape_sam_gov()
    print(f"Found {len(events)} opportunities")
    count = upsert_events(events)
    print(f"Upserted {count} events to database")
