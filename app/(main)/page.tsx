import { getEvents } from '@/actions/events'
import { getFavoritedEventIds } from '@/actions/favorites'
import { EventFeed } from '@/components/events/event-feed'
import { getUpcomingGames } from '@/lib/upcoming-games'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [events, favoritedEventIds, upcomingGames] = await Promise.all([
    getEvents(),
    getFavoritedEventIds(),
    getUpcomingGames(10),
  ])

  return (
    <div className="min-h-screen flex justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <EventFeed
          events={events}
          favoritedEventIds={favoritedEventIds}
          upcomingGames={upcomingGames}
        />
      </div>
    </div>
  )
}
