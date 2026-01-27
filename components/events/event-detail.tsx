"use client"

import Link from "next/link"
import { format } from "date-fns"
import { MapPin, Calendar, Clock, ExternalLink, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EventImage } from "./event-image"
import { VerifiedBadge } from "./verified-badge"
import type { EventWithCreator } from "@/types"

interface EventDetailProps {
  event: EventWithCreator
  isOwner?: boolean
  currentUserId?: string | null
  onDelete?: () => void
}

export function EventDetail({ event, isOwner, currentUserId, onDelete }: EventDetailProps) {
  const isCreator = isOwner ?? (currentUserId ? event.creator_id === currentUserId : false)
  const startDate = new Date(event.start_time)
  const endDate = event.end_time ? new Date(event.end_time) : null

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
        className="rounded-xl"
        priority
      />

      <div className="mt-6">
        <h1 className="text-3xl font-bold text-zinc-100">{event.title}</h1>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3 text-zinc-300">
            <Calendar className="h-5 w-5 text-zinc-500" />
            <span>{format(startDate, "EEEE, MMMM d, yyyy")}</span>
          </div>

          <div className="flex items-center gap-3 text-zinc-300">
            <Clock className="h-5 w-5 text-zinc-500" />
            <span>
              {format(startDate, "h:mm a")}
              {endDate && ` - ${format(endDate, "h:mm a")}`}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-3 text-zinc-300">
              <MapPin className="h-5 w-5 text-zinc-500" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <Avatar>
            <AvatarImage src={event.creator?.avatar_url || undefined} />
            <AvatarFallback className="bg-zinc-800 text-zinc-300">
              {getInitials(event.creator?.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-200">
                {event.creator?.name || "Unknown host"}
              </span>
              {event.creator?.is_verified_host && <VerifiedBadge />}
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

        {event.link && (
          <div className="mt-6">
            <Button asChild variant="outline" className="gap-2">
              <a href={event.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Event Link
              </a>
            </Button>
          </div>
        )}

        {isCreator && (
          <div className="mt-8 flex gap-3 pt-6 border-t border-zinc-800">
            <Button asChild variant="outline" className="gap-2">
              <Link href={`/events/${event.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit Event
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete Event
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
