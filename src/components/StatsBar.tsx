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
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-amber-500 p-2 rounded-lg">
          <CalendarDays className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-lg font-black text-zinc-900">{filteredCount}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Events</p>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-blue-500 p-2 rounded-lg">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-lg font-black text-zinc-900">{cities}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Cities</p>
        </div>
      </div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg">
          <MapPin className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-lg font-black text-zinc-900">{states}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">States</p>
        </div>
      </div>
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-violet-500 p-2 rounded-lg">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-lg font-black text-zinc-900">{orgs}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Organizations</p>
        </div>
      </div>
    </div>
  );
}
import type { TradeEvent } from '../types/event';
import { CalendarDays, MapPin, Building2, Zap } from 'lucide-react';

interface StatsBarProps {
  events: TradeEvent[];
  filteredCount: number;
}

export function StatsBar({ events, filteredCount }: StatsBarProps) {
  const totalEvents = events.length;
  const states = new Set(events.map((e) => e.stateCode)).size;
  const orgs = new Set(events.map((e) => e.organization)).size;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-amber-500 p-2 rounded-lg">
          <CalendarDays className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-lg font-black text-zinc-900">{filteredCount}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Events</p>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-blue-500 p-2 rounded-lg">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-lg font-black text-zinc-900">{totalEvents}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Cities</p>
        </div>
      </div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg">
          <MapPin className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-lg font-black text-zinc-900">{states}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">States</p>
        </div>
      </div>
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-violet-500 p-2 rounded-lg">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-lg font-black text-zinc-900">{orgs}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Organizations</p>
        </div>
      </div>
    </div>
  );
}
