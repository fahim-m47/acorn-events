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
import { QuickDeleteEventButton } from "./quick-delete-event-button"
import { getEventPath } from "@/lib/event-url"
import { getEventHostDisplayName, hasHostDisplayNameOverride } from "@/lib/event-host"
import type { EventWithCreator, RegistrationStatus } from "@/types"

interface EventCardProps {
  event: EventWithCreator
  initialFavorited?: boolean
  registrationStatus?: RegistrationStatus | null
  showQuickDelete?: boolean
}

export function EventCard({
  event,
  initialFavorited = false,
  registrationStatus = null,
  showQuickDelete = false,
}: EventCardProps) {
  const eventPath = getEventPath(event)
  const hostDisplayName = getEventHostDisplayName(event)
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
          <div className="shrink-0 flex flex-col items-end gap-1">
            <div className="relative w-28 md:w-32">
              <EventImage
                imageUrl={event.image_url}
                alt={event.title}
                variant="poster"
                className="w-full rounded-lg"
              />
              {registrationLabel && (
                <div
                  className={`absolute bottom-1 left-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border backdrop-blur-sm ${
                    registrationStatus === "going"
                      ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-100"
                      : "border-amber-300/60 bg-amber-500/20 text-amber-100"
                  }`}
                >
                  {registrationLabel}
                </div>
              )}
            </div>
            <div onClick={(e) => e.preventDefault()}>
              <FavoriteButton
                eventId={event.id}
                initialFavorited={initialFavorited}
                size="sm"
              />
            </div>
          </div>
          {showQuickDelete && (
            <div
              className="shrink-0 self-start"
              onClick={handlePreventNavigation}
            >
              <QuickDeleteEventButton eventId={event.id} />
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
