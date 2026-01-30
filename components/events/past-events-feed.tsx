"use client"

import { Calendar } from "lucide-react"
import { PastEventsTimelineView } from "./past-events-timeline-view"
import type { EventWithCreator } from "@/types"

interface PastEventsFeedProps {
  events: EventWithCreator[]
}

export function PastEventsFeed({ events }: PastEventsFeedProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-zinc-800 p-4 mb-4">
          <Calendar className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-zinc-300">No past events</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Check back later to see events that have already happened.
        </p>
      </div>
    )
  }

  return <PastEventsTimelineView events={events} />
}
