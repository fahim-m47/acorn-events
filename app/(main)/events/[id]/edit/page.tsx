import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { EventForm } from '@/components/events/event-form'
import { getEvent, updateEvent } from '@/actions/events'

export const dynamic = 'force-dynamic'

export default async function EditEventPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const event = await getEvent(id)

  if (!event) notFound()

  // Verify user owns this event
  if (event.creator_id !== user.id) {
    redirect(`/events/${id}`)
  }

  // Bind updateEvent to the event ID
  const updateEventWithId = updateEvent.bind(null, id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Edit Event</h1>
      <EventForm
        initialData={event}
        action={updateEventWithId}
        submitLabel="Update Event"
      />
    </div>
  )
}
