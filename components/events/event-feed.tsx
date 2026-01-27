"use client"

import { Calendar } from "lucide-react"
import { EventCard } from "./event-card"
import type { EventWithCreator } from "@/types"

interface EventFeedProps {
  events: EventWithCreator[]
}

export function EventFeed({ events }: EventFeedProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-zinc-800 p-4 mb-4">
          <Calendar className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-zinc-300">No upcoming events</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Check back later for new events on campus.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
