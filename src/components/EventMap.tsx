import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { TradeEvent } from '../types/event';
import { EVENT_TYPE_COLORS } from '../types/event';

// Continental US bounds â used to fit the map on load
const CONUS_BOUNDS: L.LatLngBoundsExpression = [
  [24.396308, -125.0], // SW corner
  [49.384358, -66.93457], // NE cornerh
];

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createColoredIcon(color: string) {
  return L.divIcon({
    html: `<div style="
      width: 24px; height: 24px; border-radius: 50% 50% 50% 0;
      background: ${color}; transform: rotate(-45deg);
      border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "><div style="
      width: 10px; height: 10px; border-radius: 50%;
      background: white; position: absolute; top: 5px; left: 5px;
    "></div></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

/**
 * Locks the map to continental US bounds and disables ALL interactions.
 * The map is display-only â no dragging, zooming, clicking, or pin dropping.
 */
function LockMap() {
  const map = useMap();
  useEffect(() => {
    // Fit to continental US
    map.fitBounds(CONUS_BOUNDS, { padding: [10, 10] });
    map.setMaxBounds(L.latLngBounds(CONUS_BOUNDS).pad(0.1) as L.LatLngBoundsExpression);
    map.setMinZoom(map.getZoom());
    map.setMaxZoom(map.getZoom());

    // Disable every interaction handler
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    if ((map as any).tap) (map as any).tap.disable();

    // Re-lock on resize so it stays fitted
    const handleResize = () => {
      map.invalidateSize();
      map.fitBounds(CONUS_BOUNDS, { padding: [10, 10] });
      map.setMinZoom(map.getZoom());
      map.setMaxZoom(map.getZoom());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);
  return null;
}

interface EventMapProps {
  events: TradeEvent[];
}

export function EventMap({ events }: EventMapProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-zinc-200 shadow-sm" style={{ height: '450px' }}>
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LockMap />

        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.lat, event.lng]}
            icon={createColoredIcon(EVENT_TYPE_COLORS[event.eventType])}
          >
            <Popup maxWidth={280}>
              <div className="text-sm">
                <p className="font-bold text-zinc-900 mb-1">{event.title}</p>
                <p className="text-zinc-600 text-xs mb-1">{event.organization}</p>
                <p className="text-zinc-500 text-xs mb-1">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {event.time ? ` Â· ${event.time}` : ''}
                </p>
                <p className="text-zinc-500 text-xs">
                  {event.isVirtual ? 'Virtual' : `${event.city}, ${event.stateCode}`}
                </p>
                {event.sourceUrl && (
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 text-xs font-medium mt-1 inline-block hover:underline"
                  >
                    View source â
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
