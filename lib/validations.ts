import { z } from 'zod'
import {
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_LOCATION_LENGTH,
  MAX_BLAST_LENGTH,
} from './constants'

// Helper to validate datetime strings (accepts ISO strings or datetime-local format)
// Client now sends ISO strings with timezone, so we just validate and pass through
const datetimeTransform = z.string().min(1, 'Date/time is required').transform((val, ctx) => {
  const date = new Date(val)
  if (isNaN(date.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid date/time',
    })
    return z.NEVER
  }
  // If it's already an ISO string (has Z or +/-), return as-is
  // Otherwise convert to ISO (for backward compatibility)
  return val.includes('Z') || val.includes('+') || /T\d{2}:\d{2}:\d{2}/.test(val)
    ? val
    : date.toISOString()
})

const optionalDatetimeTransform = z
  .string()
  .optional()
  .nullable()
  .transform((val, ctx) => {
    if (!val) return null
    const date = new Date(val)
    if (isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid date/time',
      })
      return z.NEVER
    }
    // If it's already an ISO string (has Z or +/-), return as-is
    // Otherwise convert to ISO (for backward compatibility)
    return val.includes('Z') || val.includes('+') || /T\d{2}:\d{2}:\d{2}/.test(val)
      ? val
      : date.toISOString()
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
