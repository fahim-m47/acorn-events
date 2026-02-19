import type { Event } from '@/types'

const UUID_PATTERN = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
const UUID_REGEX = new RegExp(`^${UUID_PATTERN}$`, 'i')
const SLUG_WITH_UUID_SUFFIX_REGEX = new RegExp(`--(${UUID_PATTERN})$`, 'i')

type EventLinkData = Pick<Event, 'id' | 'title'>

export function slugifyEventTitle(title: string): string {
  const normalized = title
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')

  return normalized || 'event'
}

export function getEventSlugParam(event: EventLinkData): string {
  return `${slugifyEventTitle(event.title)}--${event.id}`
}

export function getEventPath(event: EventLinkData): string {
  return `/events/${getEventSlugParam(event)}`
}

export function getEventEditPath(event: EventLinkData): string {
  return `${getEventPath(event)}/edit`
}

export function getEventIdFromParam(param: string): string | null {
  const decodedParam = decodeEventParam(param)

  if (UUID_REGEX.test(decodedParam)) {
    return decodedParam
  }

  const slugMatch = decodedParam.match(SLUG_WITH_UUID_SUFFIX_REGEX)
  return slugMatch?.[1] ?? null
}

export function isCanonicalEventParam(event: EventLinkData, param: string): boolean {
  return getEventSlugParam(event) === decodeEventParam(param)
}

function decodeEventParam(param: string): string {
  try {
    return decodeURIComponent(param)
  } catch {
    return param
  }
}
