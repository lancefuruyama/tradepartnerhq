import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Event queries ───────────────────────────────────────────

export interface DbEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  end_date: string | null;
  time_info: string | null;
  event_type: string;
  source_type: string;
  source_url: string | null;
  source_name: string | null;
  organization: string | null;
  city: string | null;
  state: string | null;
  state_code: string | null;
  lat: number | null;
  lng: number | null;
  is_virtual: boolean;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  tags: string[];
  scraped_at: string;
}

export async function fetchEvents(filters?: {
  stateCode?: string;
  city?: string;
  eventTypes?: string[];
  sourceTypes?: string[];
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
  centerLat?: number;
  centerLng?: number;
  radiusMiles?: number;
}) {
  // Today's date for filtering out past events
  const today = new Date().toISOString().split('T')[0];

  // If radius search, use the PostGIS function
  if (filters?.centerLat && filters?.centerLng && filters?.radiusMiles) {
    const { data, error } = await supabase.rpc('events_within_radius', {
      center_lat: filters.centerLat,
      center_lng: filters.centerLng,
      radius_miles: filters.radiusMiles,
    });
    if (error) throw error;
    // Filter out past events and events with no source URL
    const filtered = (data || []).filter(
      (e: any) => e.source_url && e.source_url.trim() !== '' && e.date >= today
    );
    return applyClientFilters(filtered, filters);
  }

  // Otherwise use standard query
  let query = supabase
    .from('events')
    .select('*')
    .not('source_url', 'is', null)
    .neq('source_url', '')
    .gte('date', today)
    .order('date', { ascending: true });

  if (filters?.stateCode) query = query.eq('state_code', filters.stateCode);
  if (filters?.city) query = query.eq('city', filters.city);
  if (filters?.dateFrom) query = query.gte('date', filters.dateFrom);
  if (filters?.dateTo) query = query.lte('date', filters.dateTo);
  if (filters?.eventTypes && filters.eventTypes.length > 0 && filters.eventTypes.length < 4) {
    query = query.in('event_type', filters.eventTypes);
  }
  if (filters?.sourceTypes && filters.sourceTypes.length > 0 && filters.sourceTypes.length < 8) {
    query = query.in('source_type', filters.sourceTypes);
  }
  if (filters?.searchQuery) {
    query = query.textSearch('title', filters.searchQuery, { type: 'websearch' });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

function applyClientFilters(events: DbEvent[], filters: any): DbEvent[] {
  return events.filter((e) => {
    if (filters.stateCode && e.state_code !== filters.stateCode) return false;
    if (filters.city && e.city !== filters.city) return false;
    if (filters.eventTypes?.length && !filters.eventTypes.includes(e.event_type)) return false;
    if (filters.sourceTypes?.length && !filters.sourceTypes.includes(e.source_type)) return false;
    return true;
  });
}

// ─── Saved events ────────────────────────────────────────────

export async function getSavedEventIds(userId: string) {
  const { data } = await supabase
    .from('saved_events')
    .select('event_id')
    .eq('user_id', userId);
  return new Set((data || []).map((d) => d.event_id));
}

export async function toggleSavedEvent(userId: string, eventId: string, isSaved: boolean) {
  if (isSaved) {
    await supabase.from('saved_events').delete().match({ user_id: userId, event_id: eventId });
  } else {
    await supabase.from('saved_events').insert({ user_id: userId, event_id: eventId });
  }
}

// ─── Saved filters ───────────────────────────────────────────

export async function getSavedFilters(userId: string) {
  const { data } = await supabase
    .from('saved_filters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function saveFiler(userId: string, name: string, filters: any) {
  return supabase.from('saved_filters').insert({ user_id: userId, name, filters });
}

export async function deleteFilter(filterId: string) {
  return supabase.from('saved_filters').delete().eq('id', filterId);
}

export async function toggleFilterAlert(filterId: string, hasAlert: boolean) {
  return supabase.from('saved_filters').update({ has_alert: !hasAlert }).eq('id', filterId);
}
