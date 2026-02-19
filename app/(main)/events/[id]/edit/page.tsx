import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { EventForm } from '@/components/events/event-form'
import { getEvent, updateEvent } from '@/actions/events'
import { canUserOverrideEventHost } from '@/lib/host-override-access'
import {
  getEventEditPath,
  getEventIdFromParam,
  getEventPath,
  isCanonicalEventParam,
} from '@/lib/event-url'

export const dynamic = 'force-dynamic'

export default async function EditEventPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id: rawEventParam } = await params
  const eventId = getEventIdFromParam(rawEventParam)
  if (!eventId) notFound()

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  const canOverrideHostDisplayName = canUserOverrideEventHost(user)

  const event = await getEvent(eventId)

  if (!event) notFound()

  if (!isCanonicalEventParam(event, rawEventParam)) {
    redirect(getEventEditPath(event))
  }

  // Verify user owns this event
  if (event.creator_id !== user.id) {
    redirect(getEventPath(event))
  }

  // Bind updateEvent to the event ID
  const updateEventWithId = updateEvent.bind(null, eventId)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Edit Event</h1>
      <EventForm
        initialData={event}
        action={updateEventWithId}
        submitLabel="Update Event"
        allowHostNameOverride={canOverrideHostDisplayName}
      />
    </div>
  )
}
