"use client"

import Link from "next/link"
import { formatInTimeZone } from "date-fns-tz"
import { TIMEZONE } from "@/lib/constants"
import { MapPin, Calendar, Clock, ExternalLink, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EventImage } from "./event-image"
import { VerifiedBadge } from "./verified-badge"
import { FavoriteButton } from "./favorite-button"
import { DeleteEventButton } from "./delete-event-button"
import { RsvpControls } from "./rsvp-controls"
import { ShareEventButton } from "./share-event-button"
import { getEventEditPath, getEventPath } from "@/lib/event-url"
import { getEventHostDisplayName, hasHostDisplayNameOverride } from "@/lib/event-host"
import type { EventWithCreator, EventCapacitySnapshot } from "@/types"

interface EventDetailProps {
  event: EventWithCreator
  isOwner?: boolean
  canDeleteAnyEvent?: boolean
  currentUserId?: string | null
  initialFavorited?: boolean
  showFavoriteButton?: boolean
  capacitySnapshot?: EventCapacitySnapshot | null
}

export function EventDetail({
  event,
  isOwner,
  canDeleteAnyEvent = false,
  currentUserId,
  initialFavorited,
  showFavoriteButton,
  capacitySnapshot,
}: EventDetailProps) {
  const isCreator = isOwner ?? (currentUserId ? event.creator_id === currentUserId : false)
  const canDeleteEvent = isCreator || canDeleteAnyEvent
  const isAuthenticated = !!currentUserId
  const startDate = new Date(event.start_time)
  const endDate = event.end_time ? new Date(event.end_time) : null
  const eventPath = getEventPath(event)
  const eventEditPath = getEventEditPath(event)
  const hostDisplayName = getEventHostDisplayName(event)
  const hasHostNameOverride = hasHostDisplayNameOverride(event)
  const showVerifiedBadge = event.creator?.is_verified_host && !hasHostNameOverride

  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <EventImage
        imageUrl={event.image_url}
        alt={event.title}
        variant="poster"
        className="mx-auto max-h-[80vh] rounded-xl"
        priority
      />

      <div className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-zinc-100">{event.title}</h1>
          {showFavoriteButton && (
            <FavoriteButton
              eventId={event.id}
              initialFavorited={initialFavorited ?? false}
              size="default"
            />
          )}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3 text-zinc-300">
            <Calendar className="h-5 w-5 text-zinc-500" />
            <span>{formatInTimeZone(startDate, TIMEZONE, "EEEE, MMMM d, yyyy")}</span>
          </div>

          <div className="flex items-center gap-3 text-zinc-300">
            <Clock className="h-5 w-5 text-zinc-500" />
            <span>
              {formatInTimeZone(startDate, TIMEZONE, "h:mm a")}
              {endDate && ` - ${formatInTimeZone(endDate, TIMEZONE, "h:mm a")}`}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-3 text-zinc-300">
              <MapPin className="h-5 w-5 text-zinc-500" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {capacitySnapshot && (
          <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
                  Seats Remaining
                </h2>
                <p className="text-zinc-200">
                  {capacitySnapshot.seatsRemaining} of {capacitySnapshot.capacity} seats left
                </p>
                {capacitySnapshot.isFull && (
                  <p className="text-sm text-amber-300">This event is at max capacity.</p>
                )}
                {capacitySnapshot.userStatus === "waitlist" && capacitySnapshot.waitlistPosition && (
                  <p className="text-sm text-amber-300">
                    Your waitlist position: #{capacitySnapshot.waitlistPosition}
                  </p>
                )}
              </div>

              {!isCreator && (
                <RsvpControls
                  eventId={event.id}
                  eventPath={eventPath}
                  isAuthenticated={isAuthenticated}
                  isFull={capacitySnapshot.isFull}
                  userStatus={capacitySnapshot.userStatus}
                  waitlistPosition={capacitySnapshot.waitlistPosition}
                />
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <Avatar>
            <AvatarImage src={hasHostNameOverride ? undefined : event.creator?.avatar_url || undefined} />
            <AvatarFallback className="bg-zinc-800 text-zinc-300">
              {getInitials(hostDisplayName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-200">
                {hostDisplayName}
              </span>
              {showVerifiedBadge && <VerifiedBadge />}
            </div>
            <span className="text-sm text-zinc-500">Event host</span>
          </div>
        </div>

        {event.description && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-zinc-200">About this event</h2>
            <p className="mt-2 text-zinc-400 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ShareEventButton eventId={event.id} eventTitle={event.title} />
          {event.link && (
            <Button asChild className="gap-2">
              <a href={event.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                RSVP
              </a>
            </Button>
          )}
        </div>

        {canDeleteEvent && (
          <div className="mt-8 flex gap-3 pt-6 border-t border-zinc-800">
            {isCreator && (
              <Button asChild variant="outline" className="gap-2">
                <Link href={eventEditPath}>
                  <Pencil className="h-4 w-4" />
                  Edit Event
                </Link>
              </Button>
            )}
            <DeleteEventButton eventId={event.id} />
          </div>
        )}
      </div>
    </div>
  )
}
