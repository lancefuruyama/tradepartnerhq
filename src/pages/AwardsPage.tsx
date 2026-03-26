import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import { useAwards } from '../hooks/useAwards';
import { AwardCard } from '../components/AwardCard';
import { SECTOR_COLORS, type AwardSector } from '../types/award';
import { US_STATES } from '../types/event';
import 'leaflet/dist/leaflet.css';

const SECTOR_MAP_COLORS: Record<AwardSector, string> = {
  'FEDERAL / US GOV': '#F59E0B',
  'MUNICIPAL / LOCAL': '#10B981',
  'INSTITUTIONAL': '#8B5CF6',
  'COMMERCIAL / PRIVATE': '#3B82F6',
  'STATE DOT': '#F97316',
  'MILITARY / DOD': '#EF4444',
};

export default function AwardsPage() {
  const { awards, loading } = useAwards();
  const [selectedState, setSelectedState] = useState('');

  const filteredAwards = useMemo(() => {
    if (!selectedState) return awards;
    return awards.filter((a) => a.state_code === selectedState);
  }, [awards, selectedState]);

  const statesWithAwards = useMemo(() => {
    const codes = new Set(awards.map((a) => a.state_code));
    return US_STATES.filter((s) => codes.has(s.code)).sort((a, b) => a.name.localeCompare(b.name));
  }, [awards]);

  return (
    <div className="bg-zinc-900 min-h-screen">
      {/* Map */}
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
          {awards.map((award) =>
            award.lat && award.lng ? (
              <CircleMarker
                key={award.id}
                center={[award.lat, award.lng]}
                radius={6}
                fillColor={SECTOR_MAP_COLORS[award.sector]}
                fillOpacity={0.8}
                stroke={true}
                color="#000"
                weight={1}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{award.title}</strong>
                    <br />
                    {award.gc_name} — ${(award.award_amount / 1_000_000).toFixed(1)}M
                  </div>
                </Popup>
              </CircleMarker>
            ) : null
          )}
        </MapContainer>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {loading && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 text-xs text-amber-400 animate-pulse">
            Loading awards...
          </div>
        )}

        {/* Filter + Count */}
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-sm font-bold text-zinc-300">
            {filteredAwards.length} award{filteredAwards.length !== 1 ? 's' : ''} found
            {selectedState
              ? ` in ${US_STATES.find((s) => s.code === selectedState)?.name || selectedState}`
              : ''}
          </h3>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none cursor-pointer"
            >
              <option value="">All States</option>
              {statesWithAwards.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          {selectedState && (
            <button
              onClick={() => setSelectedState('')}
              className="text-xs text-amber-500 hover:text-amber-400 font-medium"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Sector Legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(SECTOR_COLORS).map(([sector, colors]) => (
            <span key={sector} className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
              {sector}
            </span>
          ))}
        </div>

        {/* Award Cards */}
        <div className="grid gap-3">
          {filteredAwards.map((award) => (
            <AwardCard key={award.id} award={award} />
          ))}
          {filteredAwards.length === 0 && !loading && (
            <div className="text-center py-16">
              <p className="text-zinc-400 text-lg font-semibold mb-2">No awards found</p>
              <p className="text-zinc-500 text-sm">
                {selectedState ? 'Try selecting a different state.' : 'Check back soon for new awards.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
