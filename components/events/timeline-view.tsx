"use client"

import { format, parse } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { TIMEZONE } from "@/lib/constants"
import { EventCard } from './event-card'
import type { EventWithCreator } from '@/types'

interface TimelineViewProps {
  events: EventWithCreator[]
  favoritedEventIds?: string[]
}

export function TimelineView({ events, favoritedEventIds = [] }: TimelineViewProps) {
  // Group events by date
  const groupedEvents = events.reduce<Record<string, EventWithCreator[]>>((groups, event) => {
    // Use EST date for grouping so events appear in the correct bucket
    const dateKey = formatInTimeZone(new Date(event.start_time), TIMEZONE, 'yyyy-MM-dd')
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(event)
    return groups
  }, {})

  // Sort date keys chronologically
  const sortedDateKeys = Object.keys(groupedEvents).sort()

  return (
    <div className="relative">
      {/* Date groups */}
      <div className="relative">
        {sortedDateKeys.map((dateKey) => {
          const dateEvents = groupedEvents[dateKey]
          // Parse as local date to ensure it displays exactly as listed (prevent timezone shifts)
          const date = parse(dateKey, 'yyyy-MM-dd', new Date())

          return (
            <div key={dateKey} className="flex gap-4 pb-6">
              {/* Date column */}
              <div className="w-16 text-right shrink-0 pt-1">
                <div className="text-base font-semibold text-zinc-200">
                  {format(date, 'MMM d')}
                </div>
                <div className="text-sm text-zinc-500">
                  {format(date, 'EEEE')}
                </div>
              </div>

              {/* Dot + Line column - uses relative container with absolute line */}
              <div className="relative flex flex-col items-center">
                <div className="timeline-dot mt-1.5" />
                <div className="timeline-line absolute top-4 bottom-0 left-1/2 -translate-x-1/2" />
              </div>

              {/* All events in one column - ensures consistent alignment */}
              <div className="flex-1 min-w-0 space-y-4">
                {dateEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    initialFavorited={favoritedEventIds.includes(event.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
