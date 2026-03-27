import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { TradeEvent } from '../types/event';
import { EVENT_TYPE_COLORS } from '../types/event';
import 'leaflet/dist/leaflet.css';

interface EventMapProps {
  events: TradeEvent[];
}

export function EventMap({ events }: EventMapProps) {
  return (
    <div className="h-[350px] w-full">
      <MapContainer
        center={[39.5, -98.5]}
        zoom={4}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {events.map((event) =>
          event.lat && event.lng ? (
            <CircleMarker
              key={event.id}
              center={[event.lat, event.lng]}
              radius={6}
              fillColor={EVENT_TYPE_COLORS[event.eventType]}
              fillOpacity={0.8}
              stroke={true}
              color="#000"
              weight={1}
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
            </CircleMarker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}
