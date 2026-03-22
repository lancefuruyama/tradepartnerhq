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
    # ENR Top 400 HQ cities
    ("Reston", "VA"): (38.9586, -77.3570),
    ("Greeley", "CO"): (40.4233, -104.7091),
    ("Coral Gables", "FL"): (25.7217, -80.2684),
    ("Falls Church", "VA"): (38.8823, -77.1711),
    ("McLean", "VA"): (38.9339, -77.1773),
    ("Lake Oswego", "OR"): (45.4207, -122.6706),
    ("Concord", "CA"): (37.9780, -122.0311),
    ("Southfield", "MI"): (42.4734, -83.2219),
    ("Overland Park", "KS"): (38.9822, -94.6708),
    ("Tempe", "AZ"): (33.4255, -111.9400),
    ("Westerville", "OH"): (40.1262, -82.9291),
    ("Broomfield", "CO"): (39.9205, -105.0867),
    ("Milford", "MA"): (42.1398, -71.5163),
    ("Burnsville", "MN"): (44.7677, -93.2777),
    ("North Kansas City", "MO"): (39.1317, -94.5672),
    ("Sugar Land", "TX"): (29.6197, -95.6349),
    ("Tulsa", "OK"): (36.1540, -95.9928),
    ("Livonia", "MI"): (42.3684, -83.3527),
    ("Neenah", "WI"): (44.1858, -88.4626),
    ("Lansing", "MI"): (42.7325, -84.5555),
    ("Des Moines", "IA"): (41.5868, -93.6250),
    ("Appleton", "WI"): (44.2619, -88.4154),
    ("Bloomington", "MN"): (44.8408, -93.2983),
    ("Montgomery", "AL"): (32.3792, -86.3077),
    ("Greensboro", "NC"): (36.0726, -79.7920),
    ("Milpitas", "CA"): (37.4323, -121.8996),
    ("Auburn Hills", "MI"): (42.6875, -83.2341),
    ("Sanford", "FL"): (28.8001, -81.2698),
    ("St. Paul", "MN"): (44.9537, -93.0900),
    ("Brea", "CA"): (33.9167, -117.9001),
    ("Madison", "WI"): (43.0731, -89.4012),
    ("McKinney", "TX"): (33.1972, -96.6397),
    ("Springfield", "MA"): (42.1015, -72.5898),
    ("Knoxville", "TN"): (35.9606, -83.9207),
    ("Baton Rouge", "LA"): (30.4515, -91.1871),
    ("Evansville", "IN"): (37.9716, -87.5711),
    ("St. Joseph", "MO"): (39.7687, -94.8468),
    ("Selma", "TX"): (29.5888, -98.3062),
    ("Wenatchee", "WA"): (47.4235, -120.3103),
    ("Meridian", "ID"): (43.6121, -116.3915),
    ("Gainesville", "GA"): (34.2979, -83.8241),
    ("Blue Bell", "PA"): (40.1523, -75.2662),
    ("Janesville", "WI"): (42.6828, -89.0187),
    ("Odessa", "TX"): (31.8457, -102.3676),
    ("Lafayette", "LA"): (30.2241, -92.0198),
    ("Roanoke", "VA"): (37.2710, -79.9414),
    ("Lubbock", "TX"): (33.5779, -101.8552),
    ("Newport News", "VA"): (37.0871, -76.4730),
    ("Grand Rapids", "MI"): (42.9634, -85.6681),
    ("Naples", "FL"): (26.1420, -81.7948),
    ("Sunnyvale", "CA"): (37.3688, -122.0363),
    ("Rocky Mount", "NC"): (35.9382, -77.7906),
    ("San Mateo", "CA"): (37.5630, -122.3255),
    ("Oakbrook Terrace", "IL"): (41.8500, -87.9645),
    ("Grand Junction", "CO"): (39.0639, -108.5506),
    ("Woodstock", "GA"): (34.1015, -84.5194),
    ("Red Bank", "NJ"): (40.3470, -74.0643),
    ("Delray Beach", "FL"): (26.4615, -80.0728),
    ("San Fernando", "CA"): (34.2886, -118.4390),
    ("Frisco", "TX"): (33.1507, -96.8236),
    ("West Palm Beach", "FL"): (26.7153, -80.0534),
    ("Fond du Lac", "WI"): (43.7730, -88.4471),
    ("Alexandria", "VA"): (38.8048, -77.0469),
    ("Spokane", "WA"): (47.6588, -117.4260),
    ("Colorado Springs", "CO"): (38.8339, -104.8214),
    ("Fort Wayne", "IN"): (41.0793, -85.1394),
    ("Santa Ana", "CA"): (33.7455, -117.8677),
    ("Sioux City", "IA"): (42.4963, -96.4049),
    ("Irvine", "CA"): (33.6846, -117.8265),
    ("Chattanooga", "TN"): (35.0456, -85.3097),
    ("Greenwood Village", "CO"): (39.6172, -104.9511),
    ("Wichita", "KS"): (37.6872, -97.3301),
    ("Winston-Salem", "NC"): (36.0999, -80.2442),
    ("Greenville", "SC"): (34.8526, -82.3940),
    ("Santa Monica", "CA"): (34.0195, -118.4912),
    ("Lancaster", "PA"): (40.0379, -76.3055),
    ("York", "PA"): (39.9626, -76.7277),
    ("South Burlington", "VT"): (44.4669, -73.1710),
    ("Brentwood", "TN"): (35.9988, -86.7828),
    ("Waipahu", "HI"): (21.3866, -157.9998),
    ("Orangeburg", "SC"): (33.4918, -80.8556),
    ("Puyallup", "WA"): (47.1854, -122.2929),
    ("Miamisburg", "OH"): (39.6428, -84.2866),
    ("Santa Rosa", "CA"): (38.4404, -122.7141),
    ("Farmington", "CT"): (41.7198, -72.8320),
    ("Bellingham", "WA"): (48.7519, -122.4787),
    ("Peachtree Corners", "GA"): (33.9701, -84.2215),
    # Batch 2 seed cities
    ("Wisconsin Dells", "WI"): (43.6275, -89.7710),
    ("Indian Wells", "CA"): (33.7178, -116.3453),
    ("Dayton", "OH"): (39.7589, -84.1916),
    ("Tacoma", "WA"): (47.2529, -122.4443),
    ("Glendale", "AZ"): (33.5387, -112.1860),
    ("Bonita Springs", "FL"): (26.3398, -81.7787),
    ("Anaheim", "CA"): (33.8366, -117.9143),
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
