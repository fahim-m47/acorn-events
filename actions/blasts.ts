'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createBlastSchema } from '@/lib/validations'
import type { BlastWithCreator, BlastInsert } from '@/types'

// Get all blasts for an event with creator info
export async function getBlastsForEvent(eventId: string): Promise<BlastWithCreator[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('blasts')
    .select(`
      *,
      creator:users(*)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as BlastWithCreator[]
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
}
