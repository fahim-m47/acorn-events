import { getEvents } from '@/actions/events'
import { getFavoritedEventIds } from '@/actions/favorites'
import { EventFeed } from '@/components/events/event-feed'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [events, favoritedEventIds] = await Promise.all([
    getEvents(),
    getFavoritedEventIds(),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <EventFeed events={events} favoritedEventIds={favoritedEventIds} />
    </div>
  )
}
