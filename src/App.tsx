import { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StatsBar } from './components/StatsBar';
import { EventMap } from './components/EventMap';
import { EventCard } from './components/EventCard';
import { Footer } from './components/Footer';
import { useEvents } from './hooks/useEvents';
import { useAuth } from './hooks/useAuth';
import { US_STATES } from './types/event';
import { MapPin } from 'lucide-react';

export default function App() {
  const { events, allEvents, loading, isLive } = useEvents();
  const auth = useAuth();
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
  const [selectedState, setSelectedState] = useState('');

  const displayEvents = useMemo(() => {
    if (!selectedState) return events;
    return events.filter((e) => e.stateCode === selectedState);
  }, [events, selectedState]);

  const statesWithEvents = useMemo(() => {
    const codes = new Set(events.map((e) => e.stateCode));
    return US_STATES.filter((s) => codes.has(s.code)).sort((a, b) => a.name.localeCompare(b.name));
  }, [events]);

  const handleToggleSave = useCallback((id: string) => {
    setSavedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleLogin = useCallback(async (email: string) => {
    await auth.signIn(email, 'password');
  }, [auth]);

  const handleLogout = useCallback(async () => {
    await auth.signOut();
    setSavedEventIds(new Set());
  }, [auth]);

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

        <StatsBar events={allEvents} filteredCount={displayEvents.length} />

        <div id="map">
          <EventMap events={events} />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm bg-white border border-zinc-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none cursor-pointer"
            >
              <option value="">All States</option>
              {statesWithEvents.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          {selectedState && (
            <button
              onClick={() => setSelectedState('')}
              className="text-xs text-amber-600 hover:text-amber-800 font-medium"
            >
              Clear filter
            </button>
          )}
        </div>

        <div id="events" className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-700">
            {displayEvents.length} event{displayEvents.length !== 1 ? 's' : ''} found
            {selectedState ? ` in ${US_STATES.find((s) => s.code === selectedState)?.name || selectedState}` : ''}
          </h3>
        </div>

        <div className="grid gap-3">
          {displayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isLoggedIn={auth.isLoggedIn}
              isSaved={savedEventIds.has(event.id)}
              onSave={handleToggleSave}
            />
          ))}
          {displayEvents.length === 0 && !loading && (
            <div className="text-center py-16">
              <p className="text-zinc-400 text-lg font-semibold mb-2">No events available</p>
              <p className="text-zinc-400 text-sm">
                {selectedState ? 'Try selecting a different state.' : 'Check back soon for new events.'}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
