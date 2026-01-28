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
      {/* Vertical timeline line */}
      <div className="timeline-line absolute left-[4.5rem] top-0 bottom-0" />

      {/* Date groups */}
      <div className="relative">
        {sortedDateKeys.map((dateKey) => {
          const dateEvents = groupedEvents[dateKey]
          const date = new Date(dateKey)

          return (
            <div key={dateKey}>
              <TimelineDateHeader date={date} />

              {/* Events for this date */}
              <div className="ml-24 space-y-4 pb-6">
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
