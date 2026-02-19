import { z } from 'zod'
import { fromZonedTime } from 'date-fns-tz'
import { addMonths, isAfter } from 'date-fns'
import {
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_LOCATION_LENGTH,
  MAX_HOST_DISPLAY_NAME_LENGTH,
  MAX_BLAST_LENGTH,
  MAX_EVENT_MONTHS_AHEAD,
  TIMEZONE,
} from './constants'

// Helper to parse datetime-local string as local time consistently across browsers
const parseDatetimeLocal = (val: string): Date | null => {
  // datetime-local format: "2026-01-28T20:00" (no timezone)
  // We treat this as the time in New York (EST/EDT)
  if (!val.includes('T')) {
    return null
  }

  try {
    const date = fromZonedTime(val, TIMEZONE)
    if (isNaN(date.getTime())) return null
    return date
  } catch {
    return null
  }
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

  // Check if date is more than 6 months from now
  const maxDate = addMonths(new Date(), MAX_EVENT_MONTHS_AHEAD)
  if (isAfter(date, maxDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Event must be within 6 months of creation date',
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

const optionalCapacityTransform = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val, ctx) => {
    if (!val) return null

    const parsed = Number(val)
    if (!Number.isInteger(parsed) || parsed < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Capacity must be a whole number of at least 1',
      })
      return z.NEVER
    }

    return parsed
  })

const optionalHostDisplayNameTransform = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => (typeof val === 'string' ? val.trim() : ''))
  .refine((val) => val.length <= MAX_HOST_DISPLAY_NAME_LENGTH, {
    message: `Host name must be ${MAX_HOST_DISPLAY_NAME_LENGTH} characters or less`,
  })
  .transform((val) => val || null)

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(MAX_TITLE_LENGTH),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
  location: z.string().min(1, 'Location is required').max(MAX_LOCATION_LENGTH),
  host_display_name: optionalHostDisplayNameTransform,
  start_time: datetimeTransform,
  end_time: optionalDatetimeTransform,
  capacity: optionalCapacityTransform,
  link: z
    .string()
    .url('Invalid RSVP URL')
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
