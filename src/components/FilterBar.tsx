import type { FilterState, EventType, SourceType, TradeEvent } from '../types/event';
import { EVENT_TYPE_LABELS, SOURCE_TYPE_LABELS, US_STATES } from '../types/event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useState, useMemo } from 'react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  events: TradeEvent[];
}

export function FilterBar({ filters, onFilterChange, onClearFilters, events }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const cities = useMemo(() => {
    const stateEvents = filters.stateCode
      ? events.filter((e) => e.stateCode === filters.stateCode)
      : events;
    return [...new Set(stateEvents.map((e) => e.city))].sort();
  }, [events, filters.stateCode]);

  const activeFilterCount =
    (filters.searchQuery ? 1 : 0) +
    (filters.stateCode ? 1 : 0) +
    (filters.city ? 1 : 0) +
    (filters.eventTypes.length < 4 ? 1 : 0) +
    (filters.sourceTypes.length < 5 ? 1 : 0) +
    (filters.radiusMiles < 500 && filters.centerLat ? 1 : 0);

  const toggleEventType = (type: EventType) => {
    const current = filters.eventTypes;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFilterChange({ eventTypes: updated.length > 0 ? updated : [type] });
  };

  const toggleSourceType = (type: SourceType) => {
    const current = filters.sourceTypes;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFilterChange({ sourceTypes: updated.length > 0 ? updated : [type] });
  };

  const eventTypeColors: Record<EventType, string> = {
    networking: 'bg-amber-500/20 text-amber-700 border-amber-500/40 hover:bg-amber-500/30',
    bid: 'bg-blue-500/20 text-blue-700 border-blue-500/40 hover:bg-blue-500/30',
    certification: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40 hover:bg-emerald-500/30',
    conference: 'bg-violet-500/20 text-violet-700 border-violet-500/40 hover:bg-violet-500/30',
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-4 space-y-4">
      {/* Top row: search + state + city */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search events, organizations, trades..."
            className="pl-10"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          />
        </div>

        <Select
          value={filters.stateCode || 'all'}
          onValueChange={(v) => onFilterChange({ stateCode: v === 'all' ? '' : v, city: '' })}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {US_STATES.map((s) => (
              <SelectItem key={s.code} value={s.code}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.city || 'all'}
          onValueChange={(v) => onFilterChange({ city: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="relative"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-amber-500 text-zinc-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-zinc-500">
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Event type chips - always visible */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((type) => (
          <button
            key={type}
            onClick={() => toggleEventType(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              filters.eventTypes.includes(type)
                ? eventTypeColors[type]
                : 'bg-zinc-100 text-zinc-400 border-zinc-200 hover:bg-zinc-200'
            }`}
          >
            {EVENT_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="border-t border-zinc-200 pt-4 space-y-4">
          <div>
            <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
              Source
            </Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SOURCE_TYPE_LABELS) as SourceType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleSourceType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    filters.sourceTypes.includes(type)
                      ? 'bg-zinc-800 text-white border-zinc-700'
                      : 'bg-zinc-100 text-zinc-400 border-zinc-200 hover:bg-zinc-200'
                  }`}
                >
                  {SOURCE_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {filters.centerLat && (
            <div>
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
                Radius: {filters.radiusMiles} miles
              </Label>
              <Slider
                value={[filters.radiusMiles]}
                onValueChange={([v]) => onFilterChange({ radiusMiles: v })}
                min={10}
                max={500}
                step={10}
                className="w-full max-w-sm"
              />
              <p className="text-xs text-zinc-400 mt-1">
                Click on the map to set your center point, then adjust the radius.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">
                From
              </Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">
                To
              </Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFilterChange({ dateTo: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
