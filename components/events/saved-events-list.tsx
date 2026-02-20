"use client"

import { Heart } from "lucide-react"
import { EventCard } from "./event-card"
import type { SavedEventWithStatus } from "@/types"

interface SavedEventsListProps {
  upcoming: SavedEventWithStatus[]
  past: SavedEventWithStatus[]
  canDeleteAnyEvent?: boolean
}

export function SavedEventsList({ upcoming, past, canDeleteAnyEvent = false }: SavedEventsListProps) {
  if (upcoming.length === 0 && past.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-zinc-800 p-4 mb-4">
          <Heart className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-zinc-300">No saved events</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Events you save will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-zinc-200 mb-4">UPCOMING</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                initialFavorited={event.isFavorited}
                registrationStatus={event.registrationStatus}
                showQuickDelete={canDeleteAnyEvent}
              />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-zinc-200 mb-4">PAST</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-60">
            {past.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                initialFavorited={event.isFavorited}
                registrationStatus={event.registrationStatus}
                showQuickDelete={canDeleteAnyEvent}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
