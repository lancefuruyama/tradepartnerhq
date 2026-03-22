"""
Shared configuration for all Trade Partner HQ scrapers.
"""
import os
import re
import html as html_mod
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Common request headers
HEADERS = {
    "User-Agent": "TradePartnerHQ/1.0 (https://tradepartnerhq.com; outreach aggregator)"
}

# US state code → name mapping
STATE_NAMES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming", "DC": "District of Columbia",
}

# Geocoding cache (city, state_code) → (lat, lng)
# In production, use a geocoding API; these are major cities
CITY_COORDS = {
    ("San Francisco", "CA"): (37.7749, -122.4194),
    ("Los Angeles", "CA"): (34.0522, -118.2437),
    ("Sacramento", "CA"): (38.5816, -121.4944),
    ("Oakland", "CA"): (37.8044, -122.2712),
    ("San Diego", "CA"): (32.7157, -117.1611),
    ("Dallas", "TX"): (32.7767, -96.7970),
    ("Houston", "TX"): (29.7604, -95.3698),
    ("Austin", "TX"): (30.2672, -97.7431),
    ("San Antonio", "TX"): (29.4241, -98.4936),
    ("New York", "NY"): (40.7128, -74.0060),
    ("Bronx", "NY"): (40.8448, -73.8648),
    ("Buffalo", "NY"): (42.8864, -78.8784),
    ("Miami", "FL"): (25.7617, -80.1918),
    ("Orlando", "FL"): (28.5383, -81.3792),
    ("Tampa", "FL"): (27.9506, -82.4572),
    ("Jacksonville", "FL"): (30.3322, -81.6557),
    ("Atlanta", "GA"): (33.7490, -84.3880),
    ("Chicago", "IL"): (41.8781, -87.6298),
    ("Denver", "CO"): (39.7392, -104.9903),
    ("Seattle", "WA"): (47.6062, -122.3321),
    ("Portland", "OR"): (45.5152, -122.6784),
    ("Phoenix", "AZ"): (33.4484, -112.0740),
    ("Las Vegas", "NV"): (36.1699, -115.1398),
    ("Nashville", "TN"): (36.1627, -86.7816),
    ("Columbus", "OH"): (39.9612, -82.9988),
    ("Boston", "MA"): (42.3601, -71.0589),
    ("Minneapolis", "MN"): (44.9778, -93.2650),
    ("Bethesda", "MD"): (38.9847, -77.0947),
    ("Washington", "DC"): (38.9072, -77.0369),
    ("New Orleans", "LA"): (29.9511, -90.0715),
    ("Philadelphia", "PA"): (39.9526, -75.1652),
    ("Charlotte", "NC"): (35.2271, -80.8431),
    ("Detroit", "MI"): (42.3314, -83.0458),
    ("Indianapolis", "IN"): (39.7684, -86.1581),
    ("Kansas City", "MO"): (39.0997, -94.5786),
    ("Salt Lake City", "UT"): (40.7608, -111.8910),
    # Additional cities for expanded GC/ABC/Eventbrite scraping
    ("Baltimore", "MD"): (39.2904, -76.6122),
    ("Raleigh", "NC"): (35.7796, -78.6382),
    ("Richmond", "VA"): (37.5407, -77.4360),
    ("Fort Lauderdale", "FL"): (26.1224, -80.1373),
    ("Birmingham", "AL"): (33.5186, -86.8104),
    ("Tucson", "AZ"): (32.2226, -110.9747),
    ("Albuquerque", "NM"): (35.0844, -106.6504),
    ("St. Louis", "MO"): (38.6270, -90.1994),
    ("Milwaukee", "WI"): (43.0389, -87.9065),
    ("Pittsburgh", "PA"): (40.4406, -79.9959),
    ("Cincinnati", "OH"): (39.1031, -84.5120),
    ("Cleveland", "OH"): (41.4993, -81.6944),
    ("Providence", "RI"): (41.8240, -71.4128),
    ("Omaha", "NE"): (41.2565, -95.9345),
    ("Boise", "ID"): (43.6150, -116.2023),
    ("Honolulu", "HI"): (21.3069, -157.8583),
    ("Riverside", "CA"): (33.9533, -117.3962),
    ("San Jose", "CA"): (37.3382, -121.8863),
    ("Fresno", "CA"): (36.7378, -119.7871),
    ("Provo", "UT"): (40.2338, -111.6585),
    ("Auburn", "WA"): (47.3073, -122.2285),
    ("Virginia Beach", "VA"): (36.8529, -75.9780),
    ("Memphis", "TN"): (35.1495, -90.0490),
    ("Louisville", "KY"): (38.2527, -85.7585),
    ("Oklahoma City", "OK"): (35.4676, -97.5164),
    ("Hartford", "CT"): (41.7658, -72.6734),
    ("Anchorage", "AK"): (61.2181, -149.9003),
    ("Savannah", "GA"): (32.0809, -81.0912),
    ("Charleston", "SC"): (32.7765, -79.9311),
    ("Jackson", "MS"): (32.2988, -90.1848),
}


def get_coords(city: str, state_code: str) -> tuple[float, float] | None:
    """Look up coordinates for a city. Returns (lat, lng) or None."""
    return CITY_COORDS.get((city, state_code))


def clean_title(title: str) -> str:
    """Clean up an event title: decode HTML entities, strip emojis,
    remove redundant inline dates, and normalize whitespace."""
    if not title:
        return title
    t = html_mod.unescape(title)
    # Remove emojis
    t = re.sub(
        r'[\U0001F300-\U0001FAFF\U00002702-\U000027B0'
        r'\U0000FE00-\U0000FE0F\U0001F900-\U0001F9FF]', '', t
    )
    # Strip inline "Month Day, Year ..." that got stuffed into the title
    t = re.sub(
        r'\s*(January|February|March|April|May|June|July|August|'
        r'September|October|November|December)\s+\d{1,2},?\s*\d{4}.*',
        '', t, flags=re.IGNORECASE,
    )
    # Strip trailing date patterns like " 4/3/2026" or " - 04/16/2026"
    t = re.sub(r'\s*-?\s*\d{1,2}/\d{1,2}/\d{4}\s*$', '', t)
    # Strip full date range titles like "3/22/2026 - 3/22/2027"
    t = re.sub(r'^\d{1,2}/\d{1,2}/\d{4}\s*-\s*\d{1,2}/\d{1,2}/\d{4}\s*$', '', t)
    # Strip "Mar 12 4:30 PM 16:30" style prefixes
    t = re.sub(
        r'^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+'
        r'\d{1,2}:\d{2}\s*(?:AM|PM)?\s*\d{2}:\d{2}\s*', '', t, flags=re.IGNORECASE,
    )
    # Normalize whitespace and trim
    t = re.sub(r'\s+', ' ', t).strip().rstrip(' -')
    # Truncate excessively long titles (max 120 chars)
    if len(t) > 120:
        t = t[:117] + '...'
    return t


def clean_text(text: str) -> str:
    """Clean description or other text fields."""
    if not text:
        return text
    t = html_mod.unescape(text)
    t = re.sub(
        r'[\U0001F300-\U0001FAFF\U00002702-\U000027B0'
        r'\U0000FE00-\U0000FE0F\U0001F900-\U0001F9FF]', '', t
    )
    t = re.sub(r'\s+', ' ', t).strip()
    return t


# Keywords that indicate an event is a social outing or awards ceremony
# rather than a trade-partner/SBE outreach event.  Case-insensitive match
# against the cleaned title.
EXCLUDE_TITLE_KEYWORDS = [
    "golf outing", "golf tournament", "golf classic", "golf scramble",
    "tailgate", "tailgating",
    "clay shoot", "skeet shoot", "trap shoot", "sporting clays",
    "awards", "award ceremony", "award gala",
    "holiday party", "christmas party", "holiday celebration",
    "retirement party", "farewell party",
    "happy hour", "cocktail hour", "wine tasting", "beer tasting",
    "fishing tournament", "poker tournament",
    "5k run", "fun run", "charity run",
    "open house",
    "bowling", "cornhole", "pickleball",
]


def is_excluded_event(title: str) -> bool:
    """Return True if the event title matches an exclusion keyword."""
    if not title:
        return False
    t = title.lower()
    return any(kw in t for kw in EXCLUDE_TITLE_KEYWORDS)


def upsert_events(events: list[dict]) -> int:
    """
    Upsert events into Supabase. Returns count of events upserted.
    Cleans titles/descriptions before inserting.
    Uses the (title, date, organization) unique constraint for dedup.
    """
    if not events:
        return 0

    # Clean all titles and descriptions before upserting
    for e in events:
        if e.get("title"):
            e["title"] = clean_title(e["title"])
        if e.get("description"):
            e["description"] = clean_text(e["description"])

    # Remove events with empty titles after cleaning
    events = [e for e in events if e.get("title")]

    # Remove awards, social outings, and other non-outreach events
    events = [e for e in events if not is_excluded_event(e.get("title", ""))]

    if not events:
        return 0

    # Supabase upsert with on_conflict
    result = supabase.table("events").upsert(
        events,
        on_conflict="title,date,organization"
    ).execute()

    return len(result.data) if result.data else 0
