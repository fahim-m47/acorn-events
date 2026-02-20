"use client"

import Link from "next/link"
import { formatInTimeZone } from "date-fns-tz"
import { TIMEZONE } from "@/lib/constants"
import { MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { EventImage } from "./event-image"
import { VerifiedBadge } from "./verified-badge"
import { QuickDeleteEventButton } from "./quick-delete-event-button"
import { getEventPath } from "@/lib/event-url"
import { getEventHostDisplayName, hasHostDisplayNameOverride } from "@/lib/event-host"
import type { EventWithCreator } from "@/types"

interface PastEventCardProps {
  event: EventWithCreator
  showQuickDelete?: boolean
}

export function PastEventCard({ event, showQuickDelete = false }: PastEventCardProps) {
  const hostDisplayName = getEventHostDisplayName(event)
  const showVerifiedBadge = event.creator?.is_verified_host && !hasHostDisplayNameOverride(event)
  const handlePreventNavigation = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Link href={getEventPath(event)} className="block group w-full">
      <Card className="overflow-hidden bg-zinc-900 border-zinc-800 transition-colors hover:border-zinc-700 opacity-75">
        <div className="flex p-4 gap-4">
          {/* Left side - Event info */}
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="text-sm text-zinc-400">
              {formatInTimeZone(new Date(event.start_time), TIMEZONE, "h:mm a z")}
            </span>

            <h3 className="mt-1 font-semibold text-zinc-100 line-clamp-2 group-hover:text-red-400 transition-colors">
              {event.title}
            </h3>

            <div className="mt-1 text-sm text-zinc-500">
              <span className="flex min-w-0 items-start gap-1">
                <span className="shrink-0">By</span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block line-clamp-2 break-words">
                    {hostDisplayName}
                  </span>
                </span>
                {showVerifiedBadge && <VerifiedBadge className="shrink-0 mt-0.5" />}
              </span>
            </div>

            {event.location && (
              <div className="mt-1 flex items-start gap-1 text-sm text-zinc-400 min-w-0">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{event.location}</span>
              </div>
            )}
          </div>

          {/* Right side - Image WITHOUT favorite button */}
          <div className="relative shrink-0">
            <div className="w-28 md:w-32">
              <EventImage
                imageUrl={event.image_url}
                alt={event.title}
                variant="poster"
                className="w-full rounded-lg"
              />
            </div>
          </div>
          {showQuickDelete && (
            <div className="shrink-0 self-start" onClick={handlePreventNavigation}>
              <QuickDeleteEventButton eventId={event.id} />
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
