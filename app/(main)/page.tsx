import { getEvents } from '@/actions/events'
import { getFavoritedEventIds } from '@/actions/favorites'
import { EventFeed } from '@/components/events/event-feed'
import { canUserOverrideEventHost } from '@/lib/host-override-access'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUpcomingGames } from '@/lib/upcoming-games'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const [{ data: { user } }, events, favoritedEventIds, upcomingGames] = await Promise.all([
    supabase.auth.getUser(),
    getEvents(),
    getFavoritedEventIds(),
    getUpcomingGames(10),
  ])
  const canDeleteAnyEvent = canUserOverrideEventHost(user)

  return (
    <div className="min-h-screen flex justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <EventFeed
          events={events}
          favoritedEventIds={favoritedEventIds}
          upcomingGames={upcomingGames}
          canDeleteAnyEvent={canDeleteAnyEvent}
        />
      </div>
    </div>
  )
}
