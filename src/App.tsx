import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { EventMap } from './components/EventMap';
import { EventCard } from './components/EventCard';
import { SavedFiltersBar } from './components/SavedFiltersBar';
import { Footer } from './components/Footer';
import { useEvents } from './hooks/useEvents';
import { useAuth } from './hooks/useAuth';
import type { FilterState, EventType, SourceType } from './types/event';

const ALL_EVENT_TYPES: EventType[] = ['networking', 'bid', 'certification', 'conference'];
const ALL_SOURCE_TYPES: SourceType[] = ['sbe_dbe', 'linkedin_company', 'linkedin_personal', 'trade_association', 'government'];

const defaultFilters: FilterState = {
  searchQuery: '',
  stateCode: '',
  city: '',
  eventTypes: [],
  sourceTypes: [],
  radiusMiles: 100,
  centerLat: null,
  centerLng: null,
  dateFrom: '',
  dateTo: '',
};

interface SavedFilter {
  id: string;
  name: string;
  filters: Partial<FilterState>;
  hasAlert: boolean;
}

export default function App() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const { events: filteredEvents, allEvents, loading, isLive } = useEvents(filters);
  const auth = useAuth();

  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'relevance'>('date');

  const handleFilterChange = useCallback((partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleToggleSave = useCallback((id: string) => {
    setSavedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleLogin = useCallback(async (email: string) => {
    // For now, use simple demo auth; Supabase auth wired in useAuth
    await auth.signIn(email, 'password');
  }, [auth]);

  const handleLogout = useCallback(async () => {
    await auth.signOut();
    setSavedEventIds(new Set());
  }, [auth]);

  const handleSaveCurrentFilter = useCallback(() => {
    const name = prompt('Name this filter:');
    if (!name) return;
    setSavedFilters((prev) => [
      ...prev,
      {
        id: `sf-${Date.now()}`,
        name,
        filters: { ...filters },
        hasAlert: false,
      },
    ]);
  }, [filters]);

  const handleApplyFilter = useCallback((partial: Partial<FilterState>) => {
    setFilters(() => ({ ...defaultFilters, ...partial }));
  }, []);

  const handleDeleteFilter = useCallback((id: string) => {
    setSavedFilters((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleToggleAlert = useCallback((id: string) => {
    setSavedFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, hasAlert: !f.hasAlert } : f))
    );
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header
        isLoggedIn={auth.isLoggedIn}
        userEmail={auth.userEmail}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <Hero />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Data source indicator */}
        {!isLive && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700">
            Showing demo data. Connect Supabase to see live scraped events.
          </div>
        )}
        {loading && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-700 animate-pulse">
            Loading events...
          </div>
        )}

        <StatsBar events={allEvents} filteredCount={filteredEvents.length} />

        <SavedFiltersBar
          isLoggedIn={auth.isLoggedIn}
          savedFilters={savedFilters}
          onApplyFilter={handleApplyFilter}
          onSaveCurrentFilter={handleSaveCurrentFilter}
          onDeleteFilter={handleDeleteFilter}
          onToggleAlert={handleToggleAlert}
          savedEventCount={savedEventIds.size}
        />

        <div id="events">
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            events={allEvents}
          />
        </div>

        <div id="map">
          <EventMap events={filteredEvents} />
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-700">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs border border-zinc-200 rounded-md px-2 py-1 text-zinc-600 bg-white"
          >
            <option value="date">Sort by date</option>
            <option value="relevance">Sort by relevance</option>
          </select>
        </div>

        <div className="grid gap-3">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isLoggedIn={auth.isLoggedIn}
              isSaved={savedEventIds.has(event.id)}
              onSave={handleToggleSave}
            />
          ))}
          {filteredEvents.length === 0 && !loading && (
            <div className="text-center py-16">
              <p className="text-zinc-400 text-lg font-semibold mb-2">No events match your filters</p>
              <p className="text-zinc-400 text-sm mb-4">Try broadening your search or clearing filters.</p>
              <button
                onClick={handleClearFilters}
                className="text-amber-600 font-semibold text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
