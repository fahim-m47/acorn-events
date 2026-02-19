'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { subMonths, subDays } from 'date-fns'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createEventSchema } from '@/lib/validations'
import { MAX_EVENT_MONTHS_AHEAD, EVENT_WINDOW_DAYS } from '@/lib/constants'
import { getEventPath } from '@/lib/event-url'
import type { EventWithCreator, EventInsert, EventUpdate } from '@/types'

// Get upcoming events (next 14 days)
export async function getEvents(): Promise<EventWithCreator[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      creator:users(*)
    `)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })

  if (error) throw error
  return data as unknown as EventWithCreator[]
}

// Get single event with creator
export async function getEvent(id: string): Promise<EventWithCreator | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      creator:users(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw error
  }

  return data as unknown as EventWithCreator
}

// Create new event
export async function createEvent(formData: FormData): Promise<{ error?: string } | void> {
  const supabase = await createServerSupabaseClient()

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Parse and validate
  const raw = {
    title: formData.get('title'),
    description: formData.get('description'),
    location: formData.get('location'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    capacity: formData.get('capacity'),
    link: formData.get('link'),
  }

  let validated
  try {
    validated = createEventSchema.parse(raw)
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues[0]
      return { error: firstError.message }
    }
    return { error: 'Invalid form data' }
  }

  // Handle image upload if provided
  const imageFile = formData.get('image') as File | null
  let image_url: string | null = null
  if (imageFile && imageFile.size > 0) {
    // Upload to Supabase storage
    const fileName = `${user.id}/${Date.now()}-${imageFile.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(fileName, imageFile)

    if (!uploadError && uploadData) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('event-images').getPublicUrl(uploadData.path)
      image_url = publicUrl
    }
  }

  // Insert event
  const insertData: EventInsert = {
    creator_id: user.id,
    title: validated.title,
    description: validated.description,
    location: validated.location,
    start_time: validated.start_time,
    end_time: validated.end_time,
    capacity: validated.capacity,
    link: validated.link,
    image_url,
  }

  const { data, error } = await supabase
    .from('events')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    return { error: 'Failed to create event. Please try again.' }
  }

  const createdEvent = data as { id: string; title: string }
  const createdEventPath = getEventPath(createdEvent)

  revalidatePath('/')
  revalidatePath(createdEventPath)
  redirect(createdEventPath)
}

// Update event (verify ownership)
export async function updateEvent(eventId: string, formData: FormData): Promise<{ error?: string } | void> {
  const supabase = await createServerSupabaseClient()

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify ownership
  const { data: existingEvent, error: fetchError } = await supabase
    .from('events')
    .select('creator_id, image_url')
    .eq('id', eventId)
    .single()

  if (fetchError) {
    console.error('Fetch error:', fetchError)
    return { error: 'Event not found' }
  }
  if (!existingEvent) {
    return { error: 'Event not found' }
  }

  const existing = existingEvent as { creator_id: string; image_url: string | null }
  if (existing.creator_id !== user.id) {
    return { error: 'You do not have permission to update this event' }
  }

  // Parse and validate
  const raw = {
    title: formData.get('title'),
    description: formData.get('description'),
    location: formData.get('location'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    capacity: formData.get('capacity'),
    link: formData.get('link'),
  }

  let validated
  try {
    validated = createEventSchema.parse(raw)
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues[0]
      return { error: firstError.message }
    }
    return { error: 'Invalid form data' }
  }

  // Handle image upload if provided
  // Handle image upload if provided
  const imageFile = formData.get('image') as File | null
  const removeImage = formData.get('remove_image') === 'true'
  
  let image_url: string | null = existing.image_url

  if (imageFile && imageFile.size > 0) {
    // Upload to Supabase storage
    const fileName = `${user.id}/${Date.now()}-${imageFile.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(fileName, imageFile)

    if (uploadError) {
      console.error('Image upload error:', uploadError)
      return { error: 'Failed to upload image. Please try again.' }
    }

    if (uploadData) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('event-images').getPublicUrl(uploadData.path)
      image_url = publicUrl
    }
  } else if (removeImage) {
    image_url = null
  }

  // Update event
  const updateData: EventUpdate = {
    title: validated.title,
    description: validated.description,
    location: validated.location,
    start_time: validated.start_time,
    end_time: validated.end_time,
    capacity: validated.capacity,
    link: validated.link,
    image_url,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', eventId)
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    return { error: 'Failed to update event. Please try again.' }
  }

  const updatedEvent = data as { id: string; title: string }
  const updatedEventPath = getEventPath(updatedEvent)

  revalidatePath('/')
  revalidatePath(`/events/${eventId}`)
  revalidatePath(updatedEventPath)
  redirect(updatedEventPath)
}

// Delete event (verify ownership)
export async function deleteEvent(eventId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient()

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify ownership
  const { data: existingEvent, error: fetchError } = await supabase
    .from('events')
    .select('creator_id, image_url')
    .eq('id', eventId)
    .single()

  if (fetchError) {
    console.error('Fetch error:', fetchError)
    return { error: 'Event not found' }
  }
  if (!existingEvent) return { error: 'Event not found' }

  const existing = existingEvent as { creator_id: string; image_url: string | null }
  if (existing.creator_id !== user.id) {
    return { error: 'You do not have permission to delete this event' }
  }

  // Delete the image from storage if it exists
  if (existing.image_url) {
    // Extract the file path from the URL
    const urlParts = existing.image_url.split('/event-images/')
    if (urlParts.length > 1) {
      const filePath = urlParts[1]
      await supabase.storage.from('event-images').remove([filePath])
    }
  }

  // Delete event (cascades to favorites and blasts via RLS)
  const { error } = await supabase.from('events').delete().eq('id', eventId)

  if (error) {
    console.error('Delete error:', error)
    return { error: 'Failed to delete event. Please try again.' }
  }

  revalidatePath('/')
  return { success: true }
}

// Extended type for events with save count
export type EventWithSaveCount = EventWithCreator & { save_count: number }

// Get events created by current user (with save counts)
// Filters out events older than 6 months
export async function getMyEvents(): Promise<EventWithSaveCount[]> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Calculate cutoff date (6 months ago)
  const cutoffDate = subMonths(new Date(), MAX_EVENT_MONTHS_AHEAD)

  // Get events with favorites count, excluding events older than 6 months
  const { data, error } = await supabase
    .from('events')
    .select(
      `
      *,
      creator:users(*),
      favorites(count)
    `
    )
    .eq('creator_id', user.id)
    .gte('start_time', cutoffDate.toISOString())
    .order('start_time', { ascending: true })

  if (error) throw error

  return (data || []).map((event) => ({
    ...event,
    save_count: (event.favorites as { count: number }[])?.[0]?.count || 0,
    creator: event.creator,
  })) as unknown as EventWithSaveCount[]
}

// Get past events (last 14 days)
export async function getPastEvents(): Promise<EventWithCreator[]> {
  const supabase = await createServerSupabaseClient()

  const now = new Date()
  const cutoffDate = subDays(now, EVENT_WINDOW_DAYS)

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      creator:users(*)
    `)
    .lt('start_time', now.toISOString())
    .gte('start_time', cutoffDate.toISOString())
    .order('start_time', { ascending: false })

  if (error) throw error
  return data as unknown as EventWithCreator[]
}
