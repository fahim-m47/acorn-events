import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getSavedEvents } from '@/actions/favorites'
import { SavedEventsList } from '@/components/events/saved-events-list'
import { canUserOverrideEventHost } from '@/lib/host-override-access'

export const dynamic = 'force-dynamic'

export default async function SavedEventsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  const canDeleteAnyEvent = canUserOverrideEventHost(user)

  const events = await getSavedEvents()

  // Split into upcoming and past
  const now = new Date()
  const upcoming = events.filter((e) => new Date(e.start_time) >= now)
  const past = events.filter((e) => new Date(e.start_time) < now)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Saved Events</h1>
        <p className="text-muted-foreground mt-1">
          {events.length} saved event{events.length !== 1 ? 's' : ''}
        </p>
      </div>
      <SavedEventsList upcoming={upcoming} past={past} canDeleteAnyEvent={canDeleteAnyEvent} />
    </div>
  )
}
