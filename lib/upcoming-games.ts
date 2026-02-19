import { formatInTimeZone } from 'date-fns-tz'
import { TIMEZONE } from '@/lib/constants'
import { SPORTS_CATEGORIES } from '@/lib/sports-links'
import { getSchedule } from '@/lib/sports-scraper'
import type { UpcomingGame } from '@/types/sports'

const UPCOMING_GAMES_CACHE_TTL = 10 * 60 * 1000 // 10 minutes

let cachedUpcomingGames: UpcomingGame[] | null = null
let cachedAt = 0

function parseTimeMinutes(time: string): number {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return Number.POSITIVE_INFINITY

  let hours = Number.parseInt(match[1], 10) % 12
  const minutes = Number.parseInt(match[2], 10)
  const meridiem = match[3].toUpperCase()

  if (meridiem === 'PM') {
    hours += 12
  }

  return hours * 60 + minutes
}

function compareUpcomingGames(a: UpcomingGame, b: UpcomingGame): number {
  const dateCompare = a.startDate.localeCompare(b.startDate)
  if (dateCompare !== 0) return dateCompare

  const timeCompare = parseTimeMinutes(a.time) - parseTimeMinutes(b.time)
  if (timeCompare !== 0) return timeCompare

  const sportCompare = a.sportLabel.localeCompare(b.sportLabel)
  if (sportCompare !== 0) return sportCompare

  return a.opponent.localeCompare(b.opponent)
}

async function fetchUpcomingGames(): Promise<UpcomingGame[]> {
  const sports = SPORTS_CATEGORIES.flatMap((category) => category.sports)
  const today = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd')

  const schedules = await Promise.allSettled(
    sports.map((sport) => getSchedule(sport.slug))
  )

  const upcomingGames: UpcomingGame[] = []

  for (let i = 0; i < schedules.length; i++) {
    const scheduleResult = schedules[i]
    if (scheduleResult.status !== 'fulfilled') continue

    const sport = sports[i]

    for (const game of scheduleResult.value.games) {
      if (game.startDate < today) continue
      upcomingGames.push({
        ...game,
        sportLabel: sport.label,
      })
    }
  }

  upcomingGames.sort(compareUpcomingGames)
  return upcomingGames
}

export async function getUpcomingGames(limit = 10): Promise<UpcomingGame[]> {
  if (
    cachedUpcomingGames !== null &&
    Date.now() - cachedAt < UPCOMING_GAMES_CACHE_TTL
  ) {
    return cachedUpcomingGames.slice(0, limit)
  }

  const fetchedGames = await fetchUpcomingGames()
  cachedUpcomingGames = fetchedGames
  cachedAt = Date.now()

  return fetchedGames.slice(0, limit)
}
