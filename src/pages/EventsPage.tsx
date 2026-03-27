import { useState, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents';
import { EventMap } from '../components/EventMap';
import { EventCard } from '../components/EventCard';
import { StatsBar } from '../components/StatsBar';
import { FilterBar } from '../components/FilterBar';
import type { FilterState } from '../types/event';

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  stateCode: '',
  city: '',
  eventTypes: [],
  sourceTypes: [],
  radiusMiles: 0,
  centerLat: null,
  centerLng: null,
  dateFrom: '',
  dateTo: '',
};

export default function EventsPage() {
  const { events, loading } = useEvents();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [savedEventIds] = useState<Set<string>>(new Set());

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const match =
          event.title.toLowerCase().includes(q) ||
          event.organization.toLowerCase().includes(q) ||
          event.description.toLowerCase().includes(q) ||
          event.city.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filters.stateCode && event.stateCode !== filters.stateCode) return false;
      if (filters.city && event.city !== filters.city) return false;
      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.eventType)) return false;
      if (filters.sourceTypes.length > 0 && !filters.sourceTypes.includes(event.sourceType)) return false;
      if (filters.dateFrom && event.date < filters.dateFrom) return false;
      if (filters.dateTo && event.date > filters.dateTo) return false;
      return true;
    });
  }, [events, filters]);

  const handleFilterChange = (partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleSave = (_id: string) => {
    // Save functionality placeholder
  };

  return (
    <div className="bg-zinc-900 min-h-screen">
      {/* Map */}
      <EventMap events={filteredEvents} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-black text-white">Outreach Events</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Upcoming construction networking events, bid opportunities, and conferences
          </p>
        </div>

        {loading && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 text-xs text-amber-400 animate-pulse">
            Loading events...
          </div>
        )}

        {/* Stats */}
        <StatsBar events={events} filteredCount={filteredEvents.length} />

        {/* Filters */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          events={events}
        />

        {/* Event Cards */}
        <div className="grid gap-3">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isLoggedIn={false}
              isSaved={savedEventIds.has(event.id)}
              onSave={handleSave}
            />
          ))}
          {filteredEvents.length === 0 && !loading && (
            <div className="text-center py-16">
              <p className="text-zinc-400 text-lg font-semibold mb-2">No events found</p>
              <p className="text-zinc-500 text-sm">Try adjusting your filters or check back soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
