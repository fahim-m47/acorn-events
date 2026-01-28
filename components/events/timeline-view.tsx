"use client"

import { format } from 'date-fns'
import { EventCard } from './event-card'
import { TimelineDateHeader } from './timeline-date-header'
import type { EventWithCreator } from '@/types'

interface TimelineViewProps {
  events: EventWithCreator[]
  favoritedEventIds?: string[]
}

export function TimelineView({ events, favoritedEventIds = [] }: TimelineViewProps) {
  // Group events by date
  const groupedEvents = events.reduce<Record<string, EventWithCreator[]>>((groups, event) => {
    const dateKey = format(new Date(event.start_time), 'yyyy-MM-dd')
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
          const date = new Date(dateKey)

          return (
            <div key={dateKey}>
              <TimelineDateHeader date={date} />

              {/* Events for this date with dot trail */}
              <div className="flex">
                {/* Dot trail column */}
                <div className="w-16 shrink-0" />
                <div className="flex flex-col items-center mr-4 py-2">
                  {dateEvents.map((_, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="timeline-dot-small" />
                      {index < dateEvents.length - 1 && (
                        <div className="h-28 flex flex-col items-center justify-around py-2">
                          <div className="timeline-dot-small opacity-60" />
                          <div className="timeline-dot-small opacity-40" />
                          <div className="timeline-dot-small opacity-60" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Events column */}
                <div className="flex-1 space-y-4 pb-6">
                  {dateEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      initialFavorited={favoritedEventIds.includes(event.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
