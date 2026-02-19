"use client"

import Link from "next/link"
import { formatInTimeZone } from "date-fns-tz"
import { TIMEZONE } from "@/lib/constants"
import { MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EventImage } from "./event-image"
import { FavoriteButton } from "./favorite-button"
import { VerifiedBadge } from "./verified-badge"
import { ShareEventButton } from "./share-event-button"
import { getEventPath } from "@/lib/event-url"
import { getEventHostDisplayName, hasHostDisplayNameOverride } from "@/lib/event-host"
import type { EventWithCreator, RegistrationStatus } from "@/types"

interface EventCardProps {
  event: EventWithCreator
  initialFavorited?: boolean
  registrationStatus?: RegistrationStatus | null
}

// Format host name for display: two lines if needed, truncate/initial for long names
const formatHostName = (name: string | null | undefined): { firstName: string; lastName?: string } => {
  if (!name) return { firstName: "Unknown host" }

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    // Single name - truncate if too long
    const firstName = parts[0]
    if (firstName.length > 10) {
      return { firstName: firstName.slice(0, 7) + "..." }
    }
    return { firstName }
  }

  // Multiple parts - first name + last name handling
  const firstName = parts[0]
  const lastName = parts.slice(1).join(" ")

  // If first name is too long, truncate and skip last name
  if (firstName.length > 10) {
    return { firstName: firstName.slice(0, 7) + "..." }
  }

  // If last name is too long, use initial
  if (lastName.length > 8) {
    return { firstName, lastName: lastName[0].toUpperCase() + "." }
  }

  return { firstName, lastName }
}

export function EventCard({
  event,
  initialFavorited = false,
  registrationStatus = null,
}: EventCardProps) {
  const eventPath = getEventPath(event)
  const hostDisplayName = getEventHostDisplayName(event)
  const formattedHostName = formatHostName(hostDisplayName)
  const showVerifiedBadge = event.creator?.is_verified_host && !hasHostDisplayNameOverride(event)
  const registrationLabel =
    registrationStatus === "going"
      ? "Going"
      : registrationStatus === "waitlist"
      ? "Waitlisted"
      : null
  const handlePreventNavigation = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Link href={eventPath} className="block group w-full">
      <Card className="overflow-hidden bg-zinc-900 border-zinc-800 transition-colors hover:border-zinc-700">
        <div className="flex p-4 gap-4">
          {/* Left side - Event info */}
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="text-sm text-zinc-400">
              {formatInTimeZone(new Date(event.start_time), TIMEZONE, "h:mm a")} EST
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

            <div className="mt-auto pt-3 flex flex-wrap items-center gap-2">
              <div onClick={handlePreventNavigation}>
                <ShareEventButton
                  eventId={event.id}
                  eventTitle={event.title}
                  size="sm"
                  className="h-8 px-3"
                />
              </div>
              {event.link && (
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3"
                  onClick={(e) => {
                    handlePreventNavigation(e)
                    window.open(event.link!, "_blank", "noopener,noreferrer")
                  }}
                >
                  RSVP
                </Button>
              )}
            </div>
          </div>

          {/* Right side - Image with favorite button */}
          <div className="relative shrink-0">
            <div className="w-28 md:w-32">
              <EventImage
                imageUrl={event.image_url}
                alt={event.title}
                variant="poster"
                className="w-full rounded-lg"
              />
            </div>
            {registrationLabel && (
              <div
                className={`absolute bottom-1 right-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border backdrop-blur-sm ${
                  registrationStatus === "going"
                    ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-100"
                    : "border-amber-300/60 bg-amber-500/20 text-amber-100"
                }`}
              >
                {registrationLabel}
              </div>
            )}
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
