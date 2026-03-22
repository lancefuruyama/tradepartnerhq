export type EventType = 'networking' | 'bid' | 'certification' | 'conference';
export type SourceType = 'sbe_dbe' | 'linkedin_company' | 'linkedin_personal' | 'trade_association' | 'government';

export interface TradeEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  time?: string;
  eventType: EventType;
  sourceType: SourceType;
  sourceUrl: string;
  sourceName: string;
  organization: string;
  city: string;
  state: string;
  stateCode: string;
  lat: number;
  lng: number;
  isVirtual: boolean;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  tags: string[];
  scrapedAt: string;
}

export interface FilterState {
  searchQuery: string;
  stateCode: string;
  city: string;
  eventTypes: EventType[];
  sourceTypes: SourceType[];
  radiusMiles: number;
  centerLat: number | null;
  centerLng: number | null;
  dateFrom: string;
  dateTo: string;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  networking: 'Networking / Meet & Greet',
  bid: 'Bid Opportunity',
  certification: 'Certification Workshop',
  conference: 'Conference / Trade Show',
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  sbe_dbe: 'SBE/DBE Agency',
  linkedin_company: 'LinkedIn (Company)',
  linkedin_personal: 'LinkedIn (Post)',
  trade_association: 'Trade Association',
  government: 'Government Procurement',
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  networking: '#F59E0B',
  bid: '#3B82F6',
  certification: '#10B981',
  conference: '#8B5CF6',
};

export const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'District of Columbia' },
];
