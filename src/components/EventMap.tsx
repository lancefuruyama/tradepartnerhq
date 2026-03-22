import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { TradeEvent } from '../types/event';
import { EVENT_TYPE_COLORS } from '../types/event';

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

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface FlyToProps {
  center: [number, number] | null;
}

function FlyTo({ center }: FlyToProps) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 12, { duration: 1 });
    }
  }, [center, map]);
  return null;
}

interface EventMapProps {
  events: TradeEvent[];
  centerLat: number | null;
  centerLng: number | null;
  radiusMiles: number;
  onMapClick: (lat: number, lng: number) => void;
  flyTo: [number, number] | null;
}

export function EventMap({ events, centerLat, centerLng, radiusMiles, onMapClick, flyTo }: EventMapProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-zinc-200 shadow-sm" style={{ height: '450px' }}>
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={onMapClick} />
        <FlyTo center={flyTo} />

        {centerLat && centerLng && (
          <>
            <Marker position={[centerLat, centerLng]} />
            <Circle
              center={[centerLat, centerLng]}
              radius={radiusMiles * 1609.34}
              pathOptions={{
                color: '#F59E0B',
                fillColor: '#F59E0B',
                fillOpacity: 0.08,
                weight: 2,
                dashArray: '6 4',
              }}
            />
          </>
        )}

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
                  {event.time ? ` · ${event.time}` : ''}
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
                    View source →
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
