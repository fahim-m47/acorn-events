import { getEvents } from '@/actions/events'
import { EventFeed } from '@/components/events/event-feed'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const events = await getEvents()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <p className="text-muted-foreground mt-1">
          {events.length} event{events.length !== 1 ? 's' : ''} coming up
        </p>
      </div>
      <EventFeed events={events} />
    </div>
  )
}
