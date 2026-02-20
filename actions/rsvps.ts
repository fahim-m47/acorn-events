'use server'

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createPublicServerSupabaseClient } from '@/lib/supabase/public-server'
import type { EventCapacitySnapshot, RegistrationStatus, RsvpAttendee } from '@/types'

const EVENT_CAPACITY_CACHE_TAG = 'event-capacity'
const EVENT_CAPACITY_CACHE_TTL_SECONDS = 5

const getPublicEventCapacitySnapshotCached = unstable_cache(
  async (eventId: string): Promise<EventCapacitySnapshot | null> => {
    const supabase = createPublicServerSupabaseClient()

    const { data, error } = await supabase.rpc('get_event_capacity_snapshot', {
      p_event_id: eventId,
    })

    if (error) {
      console.error('Failed to load public event capacity snapshot:', error)
      return null
    }

    const snapshot = data?.[0]
    if (!snapshot) {
      return null
    }

    return {
      capacity: snapshot.capacity,
      seatsRemaining: snapshot.seats_remaining,
      goingCount: snapshot.going_count,
      waitlistCount: snapshot.waitlist_count,
      isFull: snapshot.is_full,
      userStatus: null,
      waitlistPosition: null,
    }
  },
  ['rsvp:public-capacity:v1'],
  {
    revalidate: EVENT_CAPACITY_CACHE_TTL_SECONDS,
    tags: [EVENT_CAPACITY_CACHE_TAG],
  }
)

export async function getPublicEventCapacitySnapshot(
  eventId: string
): Promise<EventCapacitySnapshot | null> {
  return getPublicEventCapacitySnapshotCached(eventId)
}

export async function getEventCapacitySnapshot(
  eventId: string
): Promise<EventCapacitySnapshot | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.rpc('get_event_capacity_snapshot', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Failed to load event capacity snapshot:', error)
    return null
  }

  const snapshot = data?.[0]
  if (!snapshot) {
    return null
  }

  const userStatus =
    snapshot.user_status === 'going' || snapshot.user_status === 'waitlist'
      ? (snapshot.user_status as RegistrationStatus)
      : null

  return {
    capacity: snapshot.capacity,
    seatsRemaining: snapshot.seats_remaining,
    goingCount: snapshot.going_count,
    waitlistCount: snapshot.waitlist_count,
    isFull: snapshot.is_full,
    userStatus,
    waitlistPosition: snapshot.waitlist_position,
  }
}

export async function getRsvpAttendees(eventId: string): Promise<RsvpAttendee[]> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('creator_id')
    .eq('id', eventId)
    .single()

  if (eventError || !eventData || eventData.creator_id !== user.id) {
    return []
  }

  const { data, error } = await supabase
    .from('event_registrations')
    .select('user:users(id, name, email)')
    .eq('event_id', eventId)
    .eq('status', 'going')
    .neq('user_id', eventData.creator_id)
    .order('going_at', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to load RSVP attendees:', error)
    return []
  }

  return (data || [])
    .map((row) => row.user as RsvpAttendee | null)
    .filter((attendee): attendee is RsvpAttendee => !!attendee)
}

export async function joinEvent(eventId: string): Promise<{ status: RegistrationStatus | null; error?: string }> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { status: null, error: 'Please sign in to RSVP' }
  }

  const { data, error } = await supabase.rpc('join_event', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Failed to join event:', error)
    if (error.message.includes('Creator cannot RSVP')) {
      return { status: null, error: 'Event creators cannot RSVP to their own events.' }
    }
    return { status: null, error: 'Unable to RSVP right now. Please try again.' }
  }

  const status: RegistrationStatus | null = data === 'going' || data === 'waitlist' ? data : null

  revalidatePath(`/events/${eventId}`)
  revalidatePath('/saved')
  revalidateTag(EVENT_CAPACITY_CACHE_TAG)

  return { status }
}

export async function leaveEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Please sign in to update your RSVP' }
  }

  const { error } = await supabase.rpc('leave_event', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Failed to leave event:', error)
    return { success: false, error: 'Unable to update your RSVP right now.' }
  }

  revalidatePath(`/events/${eventId}`)
  revalidatePath('/saved')
  revalidateTag(EVENT_CAPACITY_CACHE_TAG)

  return { success: true }
}
