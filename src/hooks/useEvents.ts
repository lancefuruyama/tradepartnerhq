import { useState, useEffect, useMemo } from 'react';
import { fetchEvents } from '../lib/supabase';
import { mockEvents } from '../data/mockEvents';
import type { TradeEvent, FilterState } from '../types/event';

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

export function useEvents(filters: FilterState) {
  const [allEvents, setAllEvents] = useState<TradeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events from Supabase or use mock data
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
        const data = await fetchEvents({
          stateCode: filters.stateCode || undefined,
          city: filters.city || undefined,
          eventTypes: filters.eventTypes,
          sourceTypes: filters.sourceTypes,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          centerLat: filters.centerLat || undefined,
          centerLng: filters.centerLng || undefined,
          radiusMiles: filters.radiusMiles,
        });
        if (!cancelled) {
          setAllEvents(data.map(dbEventToTradeEvent));
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to fetch events:', err);
          setError(err.message);
          // Fallback to mock data
          setAllEvents(mockEvents);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [
    filters.stateCode, filters.city, filters.eventTypes, filters.sourceTypes,
    filters.dateFrom, filters.dateTo, filters.centerLat, filters.centerLng,
    filters.radiusMiles,
  ]);

  // Client-side search filter (text search always runs client-side)
  const filteredEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    // Always filter out events with no source URL and past events
    let result = allEvents.filter(
      (e) => e.sourceUrl && e.sourceUrl.trim() !== '' && e.date >= today
    );

    // Text search
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter((e) => {
        const searchable = [e.title, e.description, e.organization, e.city, e.state, ...e.tags]
          .join(' ')
          .toLowerCase();
        return searchable.includes(q);
      });
    }

    // If not using Supabase, apply all filters client-side
    if (!USE_SUPABASE) {
      result = result.filter((e) => {
        if (!filters.eventTypes.includes(e.eventType as any)) return false;
        if (!filters.sourceTypes.includes(e.sourceType as any)) return false;
        if (filters.stateCode && e.stateCode !== filters.stateCode) return false;
        if (filters.city && e.city !== filters.city) return false;
        if (filters.dateFrom && e.date < filters.dateFrom) return false;
        if (filters.dateTo && e.date > filters.dateTo) return false;
        if (filters.centerLat && filters.centerLng) {
          const dist = haversineDistance(filters.centerLat, filters.centerLng, e.lat, e.lng);
          if (dist > filters.radiusMiles) return false;
        }
        return true;
      });
    }

    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return result;
  }, [allEvents, filters]);

  return { events: filteredEvents, allEvents, loading, error, isLive: USE_SUPABASE };
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
