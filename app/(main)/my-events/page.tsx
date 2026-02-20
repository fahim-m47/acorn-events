import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getMyEvents } from '@/actions/events'
import { MyEventsList } from '@/components/events/my-events-list'
import { Button } from '@/components/ui/button'
import { canUserOverrideEventHost } from '@/lib/host-override-access'

export const dynamic = 'force-dynamic'

export default async function MyEventsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  const canDeleteAnyEvent = canUserOverrideEventHost(user)

  const events = await getMyEvents()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground mt-1">
            {events.length} event{events.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>
      <MyEventsList events={events} canDeleteAnyEvent={canDeleteAnyEvent} />
    </div>
  )
}
