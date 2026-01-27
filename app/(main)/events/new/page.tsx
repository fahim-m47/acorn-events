import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { EventForm } from '@/components/events/event-form'
import { createEvent } from '@/actions/events'

export const dynamic = 'force-dynamic'

export default async function NewEventPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create Event</h1>
      <EventForm action={createEvent} />
    </div>
  )
}
