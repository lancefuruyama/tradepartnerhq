import { useState, useEffect, useMemo } from 'react';
import { fetchEvents } from '../lib/supabase';
import { mockEvents } from '../data/mockEvents';
import type { TradeEvent } from '../types/event';

const USE_SUPABASE = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function dbEventToTradeEvent(e: any): TradeEvent {
  return {
    id: e.id,
    title: e.title,
    description: e.description || '',
    date: e.date,
    endDate: e.end_date || undefined,
    time: e.time_info || undefined,
    eventType: e.event_type,
    sourceType: e.source_type,
    sourceUrl: e.source_url || '',
    sourceName: e.source_name || '',
    organization: e.organization || '',
    city: e.city || '',
    state: e.state || '',
    stateCode: e.state_code || '',
    lat: e.lat || 0,
    lng: e.lng || 0,
    isVirtual: e.is_virtual || false,
    address: e.address || undefined,
    contactEmail: e.contact_email || undefined,
    contactPhone: e.contact_phone || undefined,
    tags: e.tags || [],
    scrapedAt: e.scraped_at || '',
  };
}

/** Normalize a title for dedup comparison */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s*[ââ\-]\s*.+$/, '')   // Strip suffixes after em-dash/en-dash/hyphen
    .replace(/\b\d{4}\b/g, '')         // Strip year numbers
    .replace(/[^a-z\s]/g, '')          // Keep only letters and spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/** Remove duplicate events (same normalized title + city + date) */
function deduplicateEvents(events: TradeEvent[]): TradeEvent[] {
  const seen = new Map<string, TradeEvent>();
  for (const event of events) {
    const key = `${normalizeTitle(event.title)}|${event.city.toLowerCase()}|${event.date}`;
    if (!seen.has(key)) {
      seen.set(key, event);
    }
  }
  return Array.from(seen.values());
}

export function useEvents() {
  const [allEvents, setAllEvents] = useState<TradeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!USE_SUPABASE) {
        setAllEvents(mockEvents);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchEvents();
        if (!cancelled) {
          setAllEvents(data.map(dbEventToTradeEvent));
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to fetch events:', err);
          setError(err.message);
          setAllEvents(mockEvents);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const events = useMemo(() => {
    const deduped = deduplicateEvents(allEvents);
    deduped.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return deduped;
  }, [allEvents]);

  return { events, allEvents, loading, error, isLive: USE_SUPABASE };
}
