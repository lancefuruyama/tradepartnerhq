export type AwardSector =
  | 'FEDERAL / US GOV'
  | 'MUNICIPAL / LOCAL'
  | 'INSTITUTIONAL'
  | 'COMMERCIAL / PRIVATE'
  | 'STATE DOT'
  | 'MILITARY / DOD';

export type AwardCategory =
  | 'DAM / LEVEE'
  | 'BUILDING'
  | 'BRIDGE'
  | 'WATER / SEWER'
  | 'ELECTRICAL / UTILITY'
  | 'HIGHWAY / ROAD'
  | 'AIRPORT'
  | 'GENERAL'
  | 'TRANSIT';

export interface Subcontractor {
  name: string;
  specialty: string;
}

export interface ProjectAward {
  id: string;
  title: string;
  agency: string;
  description: string;
  sector: AwardSector;
  category: AwardCategory;
  gc_name: string;
  gc_location: string;
  award_amount: number;
  award_date: string;
  city: string;
  state: string;
  state_code: string;
  lat: number;
  lng: number;
  source_url?: string;
  subcontractors?: Subcontractor[];
}

export const SECTOR_COLORS: Record<AwardSector, { border: string; bg: string; text: string }> = {
  'FEDERAL / US GOV': { border: 'border-l-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  'MUNICIPAL / LOCAL': { border: 'border-l-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  'INSTITUTIONAL': { border: 'border-l-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  'COMMERCIAL / PRIVATE': { border: 'border-l-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  'STATE DOT': { border: 'border-l-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  'MILITARY / DOD': { border: 'border-l-red-500', bg: 'bg-red-500/10', text: 'text-red-400' },
};
