"use client"

import Link from "next/link"
import { formatInTimeZone } from "date-fns-tz"
import { TIMEZONE } from "@/lib/constants"
import { MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { EventImage } from "./event-image"
import { VerifiedBadge } from "./verified-badge"
import { getEventPath } from "@/lib/event-url"
import { getEventHostDisplayName, hasHostDisplayNameOverride } from "@/lib/event-host"
import type { EventWithCreator } from "@/types"

interface PastEventCardProps {
  event: EventWithCreator
}

// Format host name for display
const formatHostName = (name: string | null | undefined): { firstName: string; lastName?: string } => {
  if (!name) return { firstName: "Unknown host" }

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    const firstName = parts[0]
    if (firstName.length > 10) {
      return { firstName: firstName.slice(0, 7) + "..." }
    }
    return { firstName }
  }

  const firstName = parts[0]
  const lastName = parts.slice(1).join(" ")

  if (firstName.length > 10) {
    return { firstName: firstName.slice(0, 7) + "..." }
  }

  if (lastName.length > 8) {
    return { firstName, lastName: lastName[0].toUpperCase() + "." }
  }

  return { firstName, lastName }
}

export function PastEventCard({ event }: PastEventCardProps) {
  const hostDisplayName = getEventHostDisplayName(event)
  const formattedHostName = formatHostName(hostDisplayName)
  const showVerifiedBadge = event.creator?.is_verified_host && !hasHostDisplayNameOverride(event)

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
              <span className="flex items-start gap-1">
                <span className="shrink-0">By</span>
                <span className="flex flex-col leading-tight">
                  <span>{formattedHostName.firstName}</span>
                  {formattedHostName.lastName && <span>{formattedHostName.lastName}</span>}
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
        </div>
      </Card>
    </Link>
  )
}
