import type { TradeEvent } from '../types/event';
import { EVENT_TYPE_LABELS, SOURCE_TYPE_LABELS, EVENT_TYPE_COLORS } from '../types/event';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  ExternalLink,
  Clock,
  Building2,
  Bookmark,
  Monitor,
} from 'lucide-react';

interface EventCardProps {
  event: TradeEvent;
  isLoggedIn: boolean;
  isSaved: boolean;
  onSave: (id: string) => void;
}

export function EventCard({ event, isLoggedIn, isSaved, onSave }: EventCardProps) {
  const typeColor = EVENT_TYPE_COLORS[event.eventType];

  return (
    <Card className="group hover:shadow-md transition-all border-l-4 overflow-hidden" style={{ borderLeftColor: typeColor }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{ backgroundColor: typeColor + '22', color: typeColor }}
              >
                {EVENT_TYPE_LABELS[event.eventType]}
              </span>
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                via {SOURCE_TYPE_LABELS[event.sourceType]}
              </span>
            </div>

            <h3 className="font-bold text-zinc-900 text-sm leading-snug mb-1 group-hover:text-amber-700 transition-colors">
              {event.title}
            </h3>

            <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
              <Building2 className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{event.organization}</span>
            </div>

            <p className="text-xs text-zinc-600 line-clamp-2 mb-3">{event.description}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(event.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {event.endDate && (
                  <>
                    {' - '}
                    {new Date(event.endDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </>
                )}
              </span>
              {event.time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.time}
                </span>
              )}
              <span className="flex items-center gap-1">
                {event.isVirtual ? (
                  <>
                    <Monitor className="w-3 h-3" />
                    Virtual
                  </>
                ) : (
                  <>
                    <MapPin className="w-3 h-3" />
                    {event.city}, {event.stateCode}
                  </>
                )}
              </span>
            </div>

            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {event.tags.slice(0, 5).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 bg-zinc-100 text-zinc-600 font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
                {event.tags.length > 5 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    +{event.tags.length - 5}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 flex-shrink-0">
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onSave(event.id)}
                title={isSaved ? 'Unsave' : 'Save event'}
              >
                <Bookmark
                  className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-zinc-400 hover:text-amber-600'}`}
                />
              </Button>
            )}
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 flex items-center justify-center"
              title="View source"
            >
              <ExternalLink className="w-4 h-4 text-zinc-400 hover:text-amber-600" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
