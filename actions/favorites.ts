'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { RegistrationStatus, SavedEventWithStatus } from '@/types'

// Get user's saved events
export async function getSavedEvents(): Promise<SavedEventWithStatus[]> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [favoritesResult, registrationsResult] = await Promise.all([
    supabase
      .from('favorites')
      .select(
        `
        event:events(
          *,
          creator:users(*)
        )
      `
      )
      .eq('user_id', user.id),
    supabase
      .from('event_registrations')
      .select(
        `
        status,
        event:events(
          *,
          creator:users(*)
        )
      `
      )
      .eq('user_id', user.id)
      .in('status', ['going', 'waitlist']),
  ])

  if (favoritesResult.error) throw favoritesResult.error
  if (registrationsResult.error) throw registrationsResult.error

  const eventMap = new Map<string, SavedEventWithStatus>()

  for (const favorite of favoritesResult.data || []) {
    const event = favorite.event
    if (!event) continue

    eventMap.set(event.id, {
      ...(event as SavedEventWithStatus),
      isFavorited: true,
      registrationStatus: null,
    })
  }

  for (const registration of registrationsResult.data || []) {
    const event = registration.event
    if (!event) continue
    if (event.creator_id === user.id) continue

    const existing = eventMap.get(event.id)
    const status = registration.status as RegistrationStatus

    if (existing) {
      eventMap.set(event.id, {
        ...existing,
        registrationStatus: status,
      })
      continue
    }

    eventMap.set(event.id, {
      ...(event as SavedEventWithStatus),
      isFavorited: false,
      registrationStatus: status,
    })
  }

  return Array.from(eventMap.values()).sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  })
}

// Toggle favorite status
export async function toggleFavorite(
  eventId: string
): Promise<{ isFavorited: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { isFavorited: false, error: 'Please sign in to save events' }
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .single()

  if (existing) {
    // Remove favorite
    const { error } = await supabase.from('favorites').delete().eq('id', existing.id)

    if (error) {
      return { isFavorited: true, error: 'Failed to unsave event' }
    }

    revalidatePath('/saved')
    revalidatePath(`/events/${eventId}`)
    return { isFavorited: false }
  } else {
    // Add favorite
    const { error } = await supabase.from('favorites').insert({ user_id: user.id, event_id: eventId })

    if (error) {
      return { isFavorited: false, error: 'Failed to save event' }
    }

    revalidatePath('/saved')
    revalidatePath(`/events/${eventId}`)
    return { isFavorited: true }
  }
}

// Check if event is favorited (for initial state)
export async function isFavorited(eventId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .single()

  return !!data
}

// Get IDs of events the current user has favorited
export async function getFavoritedEventIds(): Promise<string[]> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('favorites')
    .select('event_id')
    .eq('user_id', user.id)

  return (data || []).map((f) => f.event_id)
}
