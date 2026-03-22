import { Button } from '@/components/ui/button';
import { Bookmark, Bell, Save, X } from 'lucide-react';
import type { FilterState } from '../types/event';

interface SavedFilter {
  id: string;
  name: string;
  filters: Partial<FilterState>;
  hasAlert: boolean;
}

interface SavedFiltersBarProps {
  isLoggedIn: boolean;
  savedFilters: SavedFilter[];
  onApplyFilter: (filters: Partial<FilterState>) => void;
  onSaveCurrentFilter: () => void;
  onDeleteFilter: (id: string) => void;
  onToggleAlert: (id: string) => void;
  savedEventCount: number;
}

export function SavedFiltersBar({
  isLoggedIn,
  savedFilters,
  onApplyFilter,
  onSaveCurrentFilter,
  onDeleteFilter,
  onToggleAlert,
  savedEventCount,
}: SavedFiltersBarProps) {
  if (!isLoggedIn) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
        <Bookmark className="w-4 h-4" />
        <span>{savedEventCount} saved events</span>
      </div>

      <div className="h-4 w-px bg-amber-300" />

      {savedFilters.map((sf) => (
        <div key={sf.id} className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs border-amber-300 bg-white hover:bg-amber-100"
            onClick={() => onApplyFilter(sf.filters)}
          >
            {sf.name}
          </Button>
          <button
            onClick={() => onToggleAlert(sf.id)}
            className={`p-1 rounded ${sf.hasAlert ? 'text-amber-600' : 'text-zinc-400'}`}
            title={sf.hasAlert ? 'Alerts on' : 'Alerts off'}
          >
            <Bell className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDeleteFilter(sf.id)}
            className="p-1 rounded text-zinc-400 hover:text-red-500"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs border-amber-300 bg-white hover:bg-amber-100 text-amber-700"
        onClick={onSaveCurrentFilter}
      >
        <Save className="w-3 h-3 mr-1" />
        Save current filters
      </Button>
    </div>
  );
}
