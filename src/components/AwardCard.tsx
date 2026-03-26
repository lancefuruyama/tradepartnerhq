import { useState } from 'react';
import { Calendar, MapPin, DollarSign, ChevronDown, ChevronUp, Trophy, HardHat } from 'lucide-react';
import type { ProjectAward } from '../types/award';
import { SECTOR_COLORS } from '../types/award';

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function AwardCard({ award }: { award: ProjectAward }) {
  const [subsOpen, setSubsOpen] = useState(false);
  const colors = SECTOR_COLORS[award.sector];
  const hasSubs = award.subcontractors && award.subcontractors.length > 0;

  return (
    <div className={`bg-zinc-800 rounded-xl border border-zinc-700 border-l-4 ${colors.border} overflow-hidden`}>
      <div className="p-4 md:p-5">
        {/* Header: Sector + Category */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
              {award.sector}
            </span>
            <span className="text-xs text-zinc-400 font-medium">{award.category}</span>
          </div>
        </div>

        {/* Title + Agency */}
        <h3 className="text-base font-bold text-white mb-1">{award.title}</h3>
        <p className="text-sm text-zinc-400 mb-2 flex items-center gap-1">
          <span className="text-zinc-500">🏛</span> {award.agency}
        </p>

        {/* Description / Scope */}
        <p className="text-sm text-zinc-300 mb-3 leading-relaxed">{award.description}</p>

        {/* GC Info Box */}
        <div className="bg-zinc-900/60 border border-zinc-700 rounded-lg p-3 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">{award.gc_name}</p>
              <p className="text-xs text-emerald-400">{award.gc_location}</p>
            </div>
          </div>
          <span className="text-lg font-bold text-emerald-400">{formatAmount(award.award_amount)}</span>
        </div>

        {/* Footer: Date, Location, Amount */}
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {formatDate(award.award_date)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {award.city}, {award.state_code}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> {formatAmount(award.award_amount)}
          </span>
        </div>
      </div>

      {/* Subcontractors Chevron */}
      {hasSubs && (
        <div className="border-t border-zinc-700">
          <button
            onClick={() => setSubsOpen(!subsOpen)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/30 transition-colors"
          >
            <span className="flex items-center gap-2">
              <HardHat className="w-4 h-4" />
              {award.subcontractors!.length} Subcontractor{award.subcontractors!.length !== 1 ? 's' : ''}
            </span>
            {subsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {subsOpen && (
            <div className="px-4 pb-3 space-y-1.5">
              {award.subcontractors!.map((sub, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-zinc-900/40 rounded px-3 py-1.5">
                  <span className="text-zinc-300 font-medium">{sub.name}</span>
                  <span className="text-zinc-500 text-xs">{sub.specialty}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
