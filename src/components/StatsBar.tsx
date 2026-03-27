import type { TradeEvent } from '../types/event';
import { CalendarDays, MapPin, Building2, Zap } from 'lucide-react';

interface StatsBarProps {
  events: TradeEvent[];
  filteredCount: number;
}

export function StatsBar({ events, filteredCount }: StatsBarProps) {
  const cities = new Set(events.map((e) => e.city).filter(Boolean)).size;
  const states = new Set(events.map((e) => e.stateCode)).size;
  const orgs = new Set(events.map((e) => e.organization)).size;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-amber-500 p-2 rounded-lg shadow-md shadow-amber-500/20">
          <CalendarDays className="w-4 h-4 text-zinc-900" />
        </div>
        <div>
          <p className="text-lg font-black text-white">{filteredCount}</p>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Total Events</p>
        </div>
      </div>
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-blue-500 p-2 rounded-lg shadow-md shadow-blue-500/20">
          <Zap className="w-4 h-4 text-zinc-900" />
        </div>
        <div>
          <p className="text-lg font-black text-white">{cities}</p>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Total Cities</p>
        </div>
      </div>
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg shadow-md shadow-emerald-500/20">
          <MapPin className="w-4 h-4 text-zinc-900" />
        </div>
        <div>
          <p className="text-lg font-black text-white">{states}</p>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">States</p>
        </div>
      </div>
      <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-violet-500 p-2 rounded-lg shadow-md shadow-violet-500/20">
          <Building2 className="w-4 h-4 text-zinc-900" />
        </div>
        <div>
          <p className="text-lg font-black text-white">{orgs}</p>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Organizations</p>
        </div>
      </div>
    </div>
  );
}

