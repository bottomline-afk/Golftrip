import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import RetroHeader from '../components/layout/RetroHeader';
import NeonText from '../components/ui/NeonText';

function getEventIcon(type: string): string {
  switch (type) {
    case 'travel': return '(plane)';
    case 'dinner': return '(fork)';
    case 'round': return '(golf)';
    default: return '(*)';
  }
}

function getEventBadgeColor(type: string): string {
  switch (type) {
    case 'travel': return 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan';
    case 'dinner': return 'text-neon-orange bg-neon-orange/10 border-neon-orange';
    case 'round': return 'text-neon-green bg-neon-green/10 border-neon-green';
    default: return 'text-dim-white bg-surface-light border-surface-light';
  }
}

export default function SchedulePage() {
  const { trip, loading } = useTrip();

  // Group events by date
  const eventsByDate = useMemo(() => {
    if (!trip) return {};
    const grouped: Record<string, typeof trip.schedule> = {};
    for (const event of trip.schedule) {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    }
    return grouped;
  }, [trip]);

  const sortedDates = useMemo(() => Object.keys(eventsByDate).sort(), [eventsByDate]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-void">
        <p className="font-heading text-dim-white text-xs animate-flicker">LOADING...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-void">
        <p className="font-heading text-neon-orange text-xs">NO TRIP DATA</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-void flex flex-col">
      <RetroHeader title="SCHEDULE" showBack backTo="/home" />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {sortedDates.map((date) => {
          const dayEvents = eventsByDate[date];
          const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          });

          return (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <NeonText color="green" size="sm" as="h2">
                  {dayLabel.toUpperCase()}
                </NeonText>
                <div className="flex-1 h-px bg-neon-green/20" />
              </div>

              {/* Events for this date */}
              <div className="space-y-2 ml-2 border-l-2 border-surface-light pl-4">
                {dayEvents.map((event, idx) => {
                  const badgeColor = getEventBadgeColor(event.type);
                  const icon = getEventIcon(event.type);
                  const isRound = event.type === 'round' && event.roundId;

                  const content = (
                    <div
                      className="
                        bg-surface/80 border border-surface-light rounded-sm p-3
                        hover:bg-surface-light transition-colors relative
                      "
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[1.4rem] top-4 w-2 h-2 rounded-full bg-neon-green" />

                      <div className="flex items-start gap-3">
                        {/* Icon badge */}
                        <span
                          className={`
                            font-body text-xs border rounded-sm px-1.5 py-0.5
                            ${badgeColor} shrink-0
                          `}
                        >
                          {icon}
                        </span>

                        <div className="flex-1 min-w-0">
                          {/* Time */}
                          <p className="font-heading text-[9px] text-dim-white/50 mb-1">
                            {event.time}
                          </p>
                          {/* Description */}
                          <p className="font-body text-lg text-neon-green/90">
                            {event.description}
                          </p>
                        </div>

                        {isRound && (
                          <span className="font-heading text-[8px] text-neon-cyan shrink-0">
                            VIEW &gt;
                          </span>
                        )}
                      </div>
                    </div>
                  );

                  return isRound ? (
                    <Link key={idx} to={`/round/${event.roundId}`}>
                      {content}
                    </Link>
                  ) : (
                    <div key={idx}>{content}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
