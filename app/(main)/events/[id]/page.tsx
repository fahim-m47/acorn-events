import { notFound, redirect } from 'next/navigation'
import { getEvent } from '@/actions/events'
import { getBlastsForEvent } from '@/actions/blasts'
import { isFavorited } from '@/actions/favorites'
import { getEventCapacitySnapshot, getRsvpAttendees } from '@/actions/rsvps'
import { EventDetail } from '@/components/events/event-detail'
import { RsvpAttendeesList } from '@/components/events/rsvp-attendees-list'
import { BlastFeed, BlastDialog } from '@/components/blasts'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ intent?: string | string[] }>
}) {
  const { id } = await params
  const { intent: rawIntent } = await searchParams
  const event = await getEvent(id)

  if (!event) notFound()

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === event.creator_id
  const intent = Array.isArray(rawIntent) ? rawIntent[0] : rawIntent

  if (user && !isOwner && event.capacity !== null && (intent === 'rsvp' || intent === 'waitlist')) {
    const { error } = await supabase.rpc('join_event', {
      p_event_id: id,
    })

    if (error) {
      console.error('Auto-join after sign-in failed:', error)
    }

    redirect(`/events/${id}`)
  }

  const isAuthenticated = !!user

  const [favorited, blasts, capacitySnapshot, rsvpAttendees] = await Promise.all([
    isAuthenticated ? isFavorited(id) : Promise.resolve(false),
    getBlastsForEvent(id),
    event.capacity !== null ? getEventCapacitySnapshot(id) : Promise.resolve(null),
    isOwner && event.capacity !== null ? getRsvpAttendees(id) : Promise.resolve([]),
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
            <BlastDialog eventId={id} eventTitle={event.title} />
          </div>
        )}
        {isOwner && capacitySnapshot && (
          <div className="mb-6">
            <RsvpAttendeesList attendees={rsvpAttendees} />
          </div>
        )}
        <BlastFeed blasts={blasts} eventId={id} isOwner={isOwner} />
      </div>
    </div>
  )
}
