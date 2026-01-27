import { notFound } from 'next/navigation'
import { getEvent } from '@/actions/events'
import { EventDetail } from '@/components/events/event-detail'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function EventPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = await getEvent(id)

  if (!event) notFound()

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === event.creator_id

  return (
    <div className="container mx-auto px-4 py-8">
      <EventDetail event={event} isOwner={isOwner} />
    </div>
  )
}
