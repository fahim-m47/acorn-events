import { redirect } from 'next/navigation'
import { buildLoginPath, CREATE_EVENT_PATH } from '@/lib/auth-redirect'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { canUserOverrideEventHost } from '@/lib/host-override-access'
import { EventForm } from '@/components/events/event-form'
import { createEvent } from '@/actions/events'

export const dynamic = 'force-dynamic'

export default async function NewEventPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(buildLoginPath(CREATE_EVENT_PATH))
  const canOverrideHostDisplayName = canUserOverrideEventHost(user)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Create Event</h1>
      <EventForm action={createEvent} allowHostNameOverride={canOverrideHostDisplayName} />
    </div>
  )
}
