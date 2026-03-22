"""
Shared configuration for all Trade Partner HQ scrapers.
"""
import os
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
}


def get_coords(city: str, state_code: str) -> tuple[float, float] | None:
    """Look up coordinates for a city. Returns (lat, lng) or None."""
    return CITY_COORDS.get((city, state_code))


def upsert_events(events: list[dict]) -> int:
    """
    Upsert events into Supabase. Returns count of events upserted.
    Uses the (title, date, organization) unique constraint for dedup.
    """
    if not events:
        return 0

    # Supabase upsert with on_conflict
    result = supabase.table("events").upsert(
        events,
        on_conflict="title,date,organization"
    ).execute()

    return len(result.data) if result.data else 0
