"use client"

import Link from "next/link"
import { format } from "date-fns"
import { MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { EventImage } from "./event-image"
import { FavoriteButton } from "./favorite-button"
import { VerifiedBadge } from "./verified-badge"
import type { EventWithCreator } from "@/types"

interface EventCardProps {
  event: EventWithCreator
  initialFavorited?: boolean
}

export function EventCard({ event, initialFavorited = false }: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`} className="block group">
      <Card className="overflow-hidden bg-zinc-900 border-zinc-800 transition-colors hover:border-zinc-700">
        <div className="flex p-4 gap-4">
          {/* Left side - Event info */}
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="text-sm text-zinc-400">
              {format(new Date(event.start_time), "h:mm a")} EST
            </span>

            <h3 className="mt-1 font-semibold text-zinc-100 line-clamp-2 group-hover:text-red-400 transition-colors">
              {event.title}
            </h3>

            <div className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
              <span>By</span>
              <span>{event.creator?.name || "Unknown host"}</span>
              {event.creator?.is_verified_host && <VerifiedBadge />}
            </div>

            {event.location && (
              <div className="mt-1 flex items-center gap-1 text-sm text-zinc-400">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          {/* Right side - Image with favorite button */}
          <div className="relative shrink-0">
            <div className="w-28 h-28">
              <EventImage
                imageUrl={event.image_url}
                alt={event.title}
                variant="square"
                className="w-full h-full rounded-lg"
              />
            </div>
            <div
              className="absolute top-1 right-1"
              onClick={(e) => e.preventDefault()}
            >
              <FavoriteButton
                eventId={event.id}
                initialFavorited={initialFavorited}
                size="sm"
              />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
