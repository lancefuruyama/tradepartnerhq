import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { StatsBar } from './components/StatsBar';
import { EventMap } from './components/EventMap';
import { EventCard } from './components/EventCard';
import { Footer } from './components/Footer';
import { useEvents } from './hooks/useEvents';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { events, allEvents, loading, isLive } = useEvents();
  const auth = useAuth();
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());

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

        <StatsBar events={allEvents} filteredCount={events.length} />

        <div id="map">
          <EventMap events={events} />
        </div>

        <div id="events" className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-700">
            {events.length} event{events.length !== 1 ? 's' : ''} found
          </h3>
        </div>

        <div className="grid gap-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isLoggedIn={auth.isLoggedIn}
              isSaved={savedEventIds.has(event.id)}
              onSave={handleToggleSave}
            />
          ))}
          {events.length === 0 && !loading && (
            <div className="text-center py-16">
              <p className="text-zinc-400 text-lg font-semibold mb-2">No events available</p>
              <p className="text-zinc-400 text-sm">Check back soon for new events.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
