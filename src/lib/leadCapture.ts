import { supabase } from './supabase';

// ─── Types ───────────────────────────────────────────────────
export interface LeadInfo {
  email: string;
  fullName: string;
  companyName: string;
}

export interface LeadSubmission extends LeadInfo {
  toolSlug: string;
  exportType: 'pdf' | 'excel';
}

// ─── Local storage key for returning users ───────────────────
const STORAGE_KEY = 'tphq_lead_info';

/** Check if user has already provided their info */
export function getSavedLeadInfo(): LeadInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LeadInfo;
    // Validate all fields present
    if (parsed.email && parsed.fullName && parsed.companyName) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/** Save lead info locally so returning users skip the gate */
export function saveLeadInfoLocally(info: LeadInfo): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  } catch {
    // Storage full or blocked — not critical
  }
}

/** Clear saved lead info (e.g. from admin/debug) */
export function clearSavedLeadInfo(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

/** Extract UTM params from current URL */
function getUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }
  return utm;
}

/**
 * Submit lead to Supabase (upsert — safe to call multiple times).
 * Returns true on success, false on failure (download still proceeds).
 */
export async function submitLead(submission: LeadSubmission): Promise<boolean> {
  try {
    const utm = getUtmParams();

    const { error } = await supabase
      .from('tool_leads')
      .upsert(
        {
          email: submission.email.toLowerCase().trim(),
          full_name: submission.fullName.trim(),
          company_name: submission.companyName.trim(),
          tool_slug: submission.toolSlug,
          export_type: submission.exportType,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          utm_source: utm.utm_source || null,
          utm_medium: utm.utm_medium || null,
          utm_campaign: utm.utm_campaign || null,
        },
        {
          onConflict: 'email,tool_slug,export_type',
          ignoreDuplicates: false, // update timestamp on repeat
        }
      );

    if (error) {
      console.warn('[TPHQ] Lead capture failed:', error.message);
      return false;
    }

    // Save locally so they skip the gate next time
    saveLeadInfoLocally({
      email: submission.email,
      fullName: submission.fullName,
      companyName: submission.companyName,
    });

    return true;
  } catch (err) {
    console.warn('[TPHQ] Lead capture error:', err);
    return false;
  }
}
