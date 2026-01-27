import { notFound } from 'next/navigation'
import { getEvent } from '@/actions/events'
import { getBlastsForEvent } from '@/actions/blasts'
import { isFavorited } from '@/actions/favorites'
import { EventDetail } from '@/components/events/event-detail'
import { BlastFeed, BlastDialog } from '@/components/blasts'
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
  const isAuthenticated = !!user

  const [favorited, blasts] = await Promise.all([
    isAuthenticated ? isFavorited(id) : Promise.resolve(false),
    getBlastsForEvent(id)
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <EventDetail
        event={event}
        isOwner={isOwner}
        initialFavorited={favorited}
        showFavoriteButton={isAuthenticated}
      />

      {/* Blasts Section */}
      <div className="max-w-3xl mx-auto mt-8">
        {isOwner && (
          <div className="mb-6">
            <BlastDialog eventId={id} eventTitle={event.title} />
          </div>
        )}
        <BlastFeed blasts={blasts} eventId={id} isOwner={isOwner} />
      </div>
    </div>
  )
}
