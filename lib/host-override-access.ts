import 'server-only'
import type { User } from '@supabase/supabase-js'

const parseAllowlist = (value: string | undefined, lowerCase = false): string[] => {
  if (!value) return []

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => (lowerCase ? entry.toLowerCase() : entry))
}

const allowedUserIds = parseAllowlist(process.env.EVENT_HOST_OVERRIDE_ALLOWED_USER_IDS)
const allowedEmails = parseAllowlist(process.env.EVENT_HOST_OVERRIDE_ALLOWED_EMAILS, true)

export function canUserOverrideEventHost(user: Pick<User, 'id' | 'email'> | null | undefined): boolean {
  if (!user) return false

  const normalizedEmail = user.email?.toLowerCase()
  return allowedUserIds.includes(user.id) || (normalizedEmail ? allowedEmails.includes(normalizedEmail) : false)
}
