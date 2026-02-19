"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Calendar, Heart, Pencil, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EventImage } from "./event-image"
import { BlastDialog } from "@/components/blasts"
import { getEventEditPath, getEventPath } from "@/lib/event-url"
import type { EventWithSaveCount } from "@/actions/events"

interface MyEventsListProps {
  events: EventWithSaveCount[]
}

export function MyEventsList({ events }: MyEventsListProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-zinc-800 p-4 mb-4">
          <Calendar className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-zinc-300">No events yet</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Create your first event to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden bg-zinc-900 border-zinc-800">
          <Link href={getEventPath(event)}>
            <EventImage imageUrl={event.image_url} alt={event.title} />
          </Link>
          <CardContent className="p-4">
            <Link href={getEventPath(event)}>
              <h3 className="font-semibold text-lg text-zinc-100 line-clamp-1 hover:text-red-400 transition-colors">
                {event.title}
              </h3>
            </Link>

            <div className="mt-2 flex items-center gap-4 text-sm text-zinc-400">
              <span>{format(new Date(event.start_time), "MMM d, h:mm a")}</span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {event.save_count} {event.save_count === 1 ? "save" : "saves"}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={getEventEditPath(event)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
              <BlastDialog
                eventId={event.id}
                eventTitle={event.title}
                trigger={
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Send Update
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
