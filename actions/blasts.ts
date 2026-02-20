'use server'

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createPublicServerSupabaseClient } from '@/lib/supabase/public-server'
import { createBlastSchema } from '@/lib/validations'
import type { BlastWithCreator, BlastInsert } from '@/types'

const BLASTS_CACHE_TAG = 'blasts'
const BLASTS_CACHE_TTL_SECONDS = 30

const getBlastsForEventCached = unstable_cache(
  async (eventId: string): Promise<BlastWithCreator[]> => {
    const supabase = createPublicServerSupabaseClient()

    const { data, error } = await supabase
      .from('blasts')
      .select(`
        *,
        creator:users(id, name, avatar_url, is_verified_host)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as unknown as BlastWithCreator[]
  },
  ['blasts:by-event:v1'],
  {
    revalidate: BLASTS_CACHE_TTL_SECONDS,
    tags: [BLASTS_CACHE_TAG],
  }
)

// Get all blasts for an event with creator info
export async function getBlastsForEvent(eventId: string): Promise<BlastWithCreator[]> {
  return getBlastsForEventCached(eventId)
}

// Create a new blast (only event creator can create)
export async function createBlast(formData: FormData): Promise<{ error?: string } | void> {
  const supabase = await createServerSupabaseClient()

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Parse and validate
  const raw = {
    content: formData.get('content'),
    event_id: formData.get('event_id'),
  }

  let validated
  try {
    validated = createBlastSchema.parse(raw)
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues[0]
      return { error: firstError.message }
    }
    return { error: 'Invalid form data' }
  }

  // Verify user is the event creator
  const { data: event, error: fetchError } = await supabase
    .from('events')
    .select('creator_id')
    .eq('id', validated.event_id)
    .single()

  if (fetchError) {
    console.error('Fetch error:', fetchError)
    return { error: 'Event not found' }
  }
  if (!event) {
    return { error: 'Event not found' }
  }

  const eventData = event as { creator_id: string }
  if (eventData.creator_id !== user.id) {
    return { error: 'You do not have permission to create blasts for this event' }
  }

  // Insert blast
  const insertData: BlastInsert = {
    creator_id: user.id,
    event_id: validated.event_id,
    content: validated.content,
  }

  const { error } = await supabase
    .from('blasts')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    return { error: 'Failed to create blast. Please try again.' }
  }

  revalidatePath(`/events/${validated.event_id}`)
  revalidatePath('/notifications')
  revalidateTag(BLASTS_CACHE_TAG)
}

// Delete a blast (only blast creator can delete)
export async function deleteBlast(blastId: string): Promise<{ error?: string } | void> {
  const supabase = await createServerSupabaseClient()

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch blast to get creator_id and event_id
  const { data: blast, error: fetchError } = await supabase
    .from('blasts')
    .select('creator_id, event_id')
    .eq('id', blastId)
    .single()

  if (fetchError) {
    console.error('Fetch error:', fetchError)
    return { error: 'Blast not found' }
  }
  if (!blast) {
    return { error: 'Blast not found' }
  }

  const blastData = blast as { creator_id: string; event_id: string }
  if (blastData.creator_id !== user.id) {
    return { error: 'You do not have permission to delete this blast' }
  }

  // Delete blast
  const { error } = await supabase
    .from('blasts')
    .delete()
    .eq('id', blastId)

  if (error) {
    console.error('Database error:', error)
    return { error: 'Failed to delete blast. Please try again.' }
  }

  revalidatePath(`/events/${blastData.event_id}`)
  revalidatePath('/notifications')
  revalidateTag(BLASTS_CACHE_TAG)
}
