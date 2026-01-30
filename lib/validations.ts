import { z } from 'zod'
import {
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_LOCATION_LENGTH,
  MAX_BLAST_LENGTH,
} from './constants'

// Helper to parse datetime-local string as local time consistently across browsers
const parseDatetimeLocal = (val: string): Date | null => {
  // datetime-local format: "2026-01-28T20:00" (no timezone)
  // We need to treat it as local time, not UTC
  if (!val.includes('T')) {
    return null
  }

  // Parse manually to ensure local time interpretation across all browsers
  const [datePart, timePart] = val.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)

  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
    return null
  }

  // new Date(year, month-1, day, hours, minutes) always uses local time
  return new Date(year, month - 1, day, hours, minutes)
}

// Helper to transform datetime-local input to ISO string
const datetimeTransform = z.string().min(1, 'Date/time is required').transform((val, ctx) => {
  const date = parseDatetimeLocal(val)
  if (!date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid date/time',
    })
    return z.NEVER
  }
  return date.toISOString()
})

const optionalDatetimeTransform = z
  .string()
  .optional()
  .nullable()
  .transform((val, ctx) => {
    if (!val) return null
    const date = parseDatetimeLocal(val)
    if (!date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid date/time',
      })
      return z.NEVER
    }
    return date.toISOString()
  })

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(MAX_TITLE_LENGTH),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
  location: z.string().min(1, 'Location is required').max(MAX_LOCATION_LENGTH),
  start_time: datetimeTransform,
  end_time: optionalDatetimeTransform,
  link: z
    .string()
    .url('Invalid URL')
    .optional()
    .or(z.literal(''))
    .transform((v) => v || null),
})

export const createBlastSchema = z.object({
  content: z.string().min(1, 'Content is required').max(MAX_BLAST_LENGTH),
  event_id: z.string().uuid(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type CreateBlastInput = z.infer<typeof createBlastSchema>
