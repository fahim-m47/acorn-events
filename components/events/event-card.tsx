"use client"

import Link from "next/link"
import { format } from "date-fns"
import { MapPin, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { EventImage } from "./event-image"
import { VerifiedBadge } from "./verified-badge"
import type { EventWithCreator } from "@/types"

interface EventCardProps {
  event: EventWithCreator
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`} className="block group">
      <Card className="overflow-hidden bg-zinc-900 border-zinc-800 transition-colors hover:border-zinc-700">
        <EventImage imageUrl={event.image_url} alt={event.title} />
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-zinc-100 line-clamp-2 group-hover:text-red-400 transition-colors">
            {event.title}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{format(new Date(event.start_time), "EEE, MMM d 'at' h:mm a")}</span>
          </div>

          {event.location && (
            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-zinc-500">
              {event.creator?.name || "Unknown host"}
            </span>
            {event.creator?.is_verified_host && <VerifiedBadge />}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
