import { notFound, redirect } from 'next/navigation'
import { getEvent } from '@/actions/events'
import { getBlastsForEvent } from '@/actions/blasts'
import { isFavorited } from '@/actions/favorites'
import { getEventCapacitySnapshot, getRsvpAttendees } from '@/actions/rsvps'
import { EventDetail } from '@/components/events/event-detail'
import { RsvpAttendeesList } from '@/components/events/rsvp-attendees-list'
import { BlastFeed, BlastDialog } from '@/components/blasts'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getEventIdFromParam, getEventPath, isCanonicalEventParam } from '@/lib/event-url'

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ intent?: string | string[] }>
}) {
  const { id: rawEventParam } = await params
  const { intent: rawIntent } = await searchParams
  const eventId = getEventIdFromParam(rawEventParam)
  if (!eventId) notFound()

  const event = await getEvent(eventId)

  if (!event) notFound()

  const canonicalEventPath = getEventPath(event)
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === event.creator_id
  const intent = Array.isArray(rawIntent) ? rawIntent[0] : rawIntent

  if (user && !isOwner && event.capacity !== null && (intent === 'rsvp' || intent === 'waitlist')) {
    const { error } = await supabase.rpc('join_event', {
      p_event_id: eventId,
    })

    if (error) {
      console.error('Auto-join after sign-in failed:', error)
    }

    redirect(canonicalEventPath)
  }

  if (!isCanonicalEventParam(event, rawEventParam)) {
    if (intent) {
      redirect(`${canonicalEventPath}?intent=${encodeURIComponent(intent)}`)
    }
    redirect(canonicalEventPath)
  }

  const isAuthenticated = !!user

  const [favorited, blasts, capacitySnapshot, rsvpAttendees] = await Promise.all([
    isAuthenticated ? isFavorited(eventId) : Promise.resolve(false),
    getBlastsForEvent(eventId),
    event.capacity !== null ? getEventCapacitySnapshot(eventId) : Promise.resolve(null),
    isOwner && event.capacity !== null ? getRsvpAttendees(eventId) : Promise.resolve([]),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <EventDetail
        event={event}
        isOwner={isOwner}
        currentUserId={user?.id ?? null}
        initialFavorited={favorited}
        showFavoriteButton={isAuthenticated}
        capacitySnapshot={capacitySnapshot}
      />

      {/* Blasts Section */}
      <div className="max-w-3xl mx-auto mt-8">
        {isOwner && (
          <div className="mb-6">
            <BlastDialog eventId={eventId} eventTitle={event.title} />
          </div>
        )}
        {isOwner && capacitySnapshot && (
          <div className="mb-6">
            <RsvpAttendeesList attendees={rsvpAttendees} />
          </div>
        )}
        <BlastFeed blasts={blasts} eventId={eventId} isOwner={isOwner} />
      </div>
    </div>
  )
}
