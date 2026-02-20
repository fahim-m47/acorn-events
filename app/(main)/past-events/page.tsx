import { getPastEvents } from '@/actions/events'
import { PastEventsFeed } from '@/components/events/past-events-feed'
import { canUserOverrideEventHost } from '@/lib/host-override-access'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function PastEventsPage() {
  const supabase = await createServerSupabaseClient()
  const [{ data: { user } }, events] = await Promise.all([
    supabase.auth.getUser(),
    getPastEvents(),
  ])
  const canDeleteAnyEvent = canUserOverrideEventHost(user)

  return (
    <div className="min-h-screen flex justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Past Events</h1>
          <p className="text-muted-foreground mt-1">
            Events from the last 14 days
          </p>
        </div>
        <PastEventsFeed events={events} canDeleteAnyEvent={canDeleteAnyEvent} />
      </div>
    </div>
  )
}
