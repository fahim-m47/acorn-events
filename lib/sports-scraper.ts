import type { Game, SportSchedule, SportsEventJsonLd } from '@/types/sports'
import { generateGameId } from '@/lib/game-url'
import { getSportBySlug, SPORTS_CATEGORIES } from '@/lib/sports-links'

const ATHLETICS_BASE = 'https://haverfordathletics.com'
const SCHEDULE_TXT_URL = `${ATHLETICS_BASE}/services/schedule_txt.ashx`
const SCAN_ID_MIN = 370
const SCAN_ID_MAX = 410

// --- Module-level cache for schedule ID mapping ---

let idMapCache: Map<string, number> | null = null
let idMapCacheTime = 0
const ID_MAP_TTL = 24 * 60 * 60 * 1000 // 24 hours

// --- Main entry point ---

export async function getSchedule(sportSlug: string): Promise<SportSchedule> {
  const sport = getSportBySlug(sportSlug)
  if (!sport) {
    return emptySchedule(sportSlug, 'fallback')
  }

  // Always fetch the HTML schedule page for opponent logos
  const htmlUrl = `${sport.href}/schedule`
  let logoMap = new Map<string, string>()
  let htmlText: string | null = null
  try {
    const htmlRes = await fetch(htmlUrl, { next: { revalidate: 3600 } })
    if (htmlRes.ok) {
      htmlText = await htmlRes.text()
      logoMap = extractOpponentLogos(htmlText)
    }
  } catch {
    // Logo extraction is best-effort
  }

  // Try primary source (schedule_txt with scores)
  try {
    const idMap = await discoverScheduleIds()
    const scheduleId = idMap.get(sportSlug)
    if (scheduleId) {
      const schedule = await scrapeScheduleTxt(scheduleId, sportSlug)
      if (schedule.games.length > 0) {
        applyLogos(schedule.games, logoMap)
        return schedule
      }
    }
  } catch {
    // Primary source failed, fall through to fallback
  }

  // Fallback: use JSON-LD from the HTML we already fetched (or re-fetch)
  try {
    const schedule = await scrapeScheduleJsonLd(sportSlug, htmlText)
    applyLogos(schedule.games, logoMap)
    return schedule
  } catch {
    return emptySchedule(sportSlug, 'fallback')
  }
}

// --- Opponent logo extraction from HTML schedule page ---

function extractOpponentLogos(html: string): Map<string, string> {
  const logoMap = new Map<string, string>()
  // Match opponent logo img tags followed by opponent name links/text
  // Pattern: <img ... data-src="/images/logos/foo.png?..." alt="..."> ... <a ...>OpponentName</a>
  const gameBlockRegex =
    /data-src="(\/images\/[^"]+\?[^"]*)"[^>]*alt="([^"]*)"[\s\S]*?sidearm-schedule-game-opponent-name[\s\S]*?(?:<a[^>]*>([^<]+)<\/a>|<span[^>]*>([^<]+)<\/span>)/gi
  let match
  while ((match = gameBlockRegex.exec(html)) !== null) {
    const logoPath = match[1]
    // The opponent name comes from the <a> tag (match[3]) or <span> (match[4])
    const opponentName = (match[3] || match[4] || '').trim()
    if (opponentName && logoPath) {
      const fullUrl = `${ATHLETICS_BASE}${logoPath}`
      // Store by cleaned name for fuzzy matching
      const key = opponentName.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (!logoMap.has(key)) {
        logoMap.set(key, fullUrl)
      }
    }
  }
  return logoMap
}

function applyLogos(games: Game[], logoMap: Map<string, string>): void {
  for (const game of games) {
    if (game.opponentLogo) continue
    const key = game.opponent.toLowerCase().replace(/[^a-z0-9]/g, '')
    game.opponentLogo = logoMap.get(key) ?? null
  }
}

// --- Primary source: schedule_txt.ashx ---

async function discoverScheduleIds(): Promise<Map<string, number>> {
  if (idMapCache && Date.now() - idMapCacheTime < ID_MAP_TTL) {
    return idMapCache
  }

  const ids = Array.from(
    { length: SCAN_ID_MAX - SCAN_ID_MIN + 1 },
    (_, i) => SCAN_ID_MIN + i
  )

  const results = await Promise.allSettled(
    ids.map(async (id) => {
      const res = await fetch(`${SCHEDULE_TXT_URL}?schedule=${id}`, {
        next: { revalidate: 86400 },
      })
      if (!res.ok) return null
      const text = await res.text()
      if (text.includes('Error:') || text.includes('Schedule not found')) {
        return null
      }
      return { id, text }
    })
  )

  const newMap = new Map<string, number>()

  for (const result of results) {
    if (result.status !== 'fulfilled' || !result.value) continue
    const { id, text } = result.value

    const slug = matchTxtToSlug(text)
    if (!slug) continue

    // Keep the highest ID for each sport (most recent / active schedule)
    const existing = newMap.get(slug)
    if (!existing || id > existing) {
      newMap.set(slug, id)
    }
  }

  idMapCache = newMap
  idMapCacheTime = Date.now()
  return newMap
}

function matchTxtToSlug(text: string): string | null {
  const lines = text.split('\n').map((l) => l.trim())
  // Line 2 is like "2025-26 Men's Basketball Schedule"
  const titleLine = lines[1] ?? ''

  // Remove season prefix and "Schedule" suffix
  const sportName = titleLine
    .replace(/^\d{4}-?\d{0,2}\s+/, '')
    .replace(/\s+Schedule$/i, '')
    .trim()

  if (!sportName) return null

  // Try to match against all known sports
  const allSports = SPORTS_CATEGORIES.flatMap((c) => c.sports)
  const normalized = sportName.toLowerCase()

  for (const sport of allSports) {
    const labelNorm = sport.label.toLowerCase()
    if (labelNorm === normalized) return sport.slug

    // Handle abbreviated names: "Men's Tennis" vs title might say "Men's Tennis"
    // Also handle "Baseball" matching "Baseball"
    const labelWords = labelNorm.replace(/['']/g, "'")
    const normWords = normalized.replace(/['']/g, "'")
    if (labelWords === normWords) return sport.slug
  }

  // Fuzzy: check if one contains the other
  for (const sport of allSports) {
    const labelNorm = sport.label.toLowerCase().replace(/['']/g, "'")
    const normClean = normalized.replace(/['']/g, "'")
    if (labelNorm.includes(normClean) || normClean.includes(labelNorm)) {
      return sport.slug
    }
  }

  return null
}

async function scrapeScheduleTxt(
  scheduleId: number,
  sportSlug: string
): Promise<SportSchedule> {
  const res = await fetch(`${SCHEDULE_TXT_URL}?schedule=${scheduleId}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`schedule_txt returned ${res.status}`)
  const text = await res.text()
  return parseScheduleTxt(text, sportSlug)
}

function parseScheduleTxt(text: string, sportSlug: string): SportSchedule {
  const lines = text.split('\n')
  const trimmedLines = lines.map((l) => l.trimEnd())

  // Extract title (line 2)
  const titleLine = (trimmedLines[1] ?? '').trim()
  const season = titleLine.match(/^(\d{4}-?\d{0,2})/)?.[1] ?? ''
  const sportTitle =
    getSportBySlug(sportSlug)?.label ??
    titleLine
      .replace(/^\d{4}-?\d{0,2}\s+/, '')
      .replace(/\s+Schedule$/i, '')
      .trim()

  // Extract records from lines between title and header row
  let overallRecord: string | null = null
  let conferenceRecord: string | null = null

  for (const line of trimmedLines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('Overall')) {
      overallRecord = trimmed.replace(/^Overall\s+/, '').split(/\s{2,}/)[0] ?? null
    }
    if (trimmed.startsWith('Conference')) {
      conferenceRecord = trimmed.replace(/^Conference\s+/, '').split(/\s{2,}/)[0] ?? null
    }
  }

  // Find the header row and determine column positions
  const headerIdx = trimmedLines.findIndex((l) =>
    l.trimStart().startsWith('Date')
  )
  if (headerIdx === -1) {
    return {
      sportTitle,
      season,
      overallRecord,
      conferenceRecord,
      games: [],
      dataSource: 'primary',
    }
  }

  const header = trimmedLines[headerIdx]
  const colStarts = {
    date: header.indexOf('Date'),
    time: header.indexOf('Time'),
    at: header.indexOf('At'),
    opponent: header.indexOf('Opponent'),
    location: header.indexOf('Location'),
    tournament: header.indexOf('Tournament'),
    result: header.indexOf('Result'),
  }

  const games: Game[] = []
  const currentYear = new Date().getFullYear()

  for (let i = headerIdx + 1; i < trimmedLines.length; i++) {
    const line = trimmedLines[i]
    if (!line.trim()) continue

    const dateStr = extractCol(line, colStarts.date, colStarts.time)
    const time = extractCol(line, colStarts.time, colStarts.at)
    const at = extractCol(line, colStarts.at, colStarts.opponent)
    const opponent = extractCol(line, colStarts.opponent, colStarts.location)
    const location = extractCol(line, colStarts.location, colStarts.tournament)
    const tournament = extractCol(line, colStarts.tournament, colStarts.result)
    const result = colStarts.result >= 0 ? line.slice(colStarts.result).trim() : ''

    if (!dateStr || !opponent) continue

    // Parse date into ISO format
    const isoDate = parseTxtDate(dateStr, season, currentYear)

    const isWin = result
      ? result.startsWith('W')
        ? true
        : result.startsWith('L')
          ? false
          : null
      : null

    games.push({
      id: generateGameId(sportSlug, isoDate, opponent),
      sportSlug,
      opponent: cleanOpponent(opponent),
      opponentLogo: null, // filled in later by applyLogos
      startDate: isoDate,
      time: time || 'TBD',
      isHome: at.toLowerCase() === 'home',
      location: location || '',
      tournament: tournament || null,
      result: result || null,
      isWin,
    })
  }

  return {
    sportTitle,
    season,
    overallRecord,
    conferenceRecord,
    games,
    dataSource: 'primary',
  }
}

function extractCol(line: string, start: number, end: number): string {
  if (start < 0) return ''
  const slice = end >= 0 ? line.slice(start, end) : line.slice(start)
  return slice.trim()
}

function cleanOpponent(name: string): string {
  // Remove ranking prefixes like "#8 " or "(RV) "
  return name.replace(/^#\d+\s+/, '').replace(/^\(RV\)\s+/i, '').trim()
}

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
}

function parseTxtDate(
  dateStr: string,
  season: string,
  currentYear: number
): string {
  // Format: "Nov 8 (Sat)" or "Nov 08 (Sat)"
  const match = dateStr.match(/^([A-Z][a-z]{2})\s+(\d{1,2})/)
  if (!match) return `${currentYear}-01-01`

  const month = MONTHS[match[1]] ?? 0
  const day = parseInt(match[2], 10)

  // Determine year from season string (e.g., "2025-26")
  // Fall months (Aug-Dec) use the first year, spring months (Jan-Jul) use the second
  let year = currentYear
  const seasonMatch = season.match(/^(\d{4})/)
  if (seasonMatch) {
    const startYear = parseInt(seasonMatch[1], 10)
    year = month >= 7 ? startYear : startYear + 1
  }

  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

// --- Fallback source: JSON-LD from schedule page ---

async function scrapeScheduleJsonLd(
  sportSlug: string,
  preloadedHtml?: string | null
): Promise<SportSchedule> {
  const sport = getSportBySlug(sportSlug)
  if (!sport) return emptySchedule(sportSlug, 'fallback')

  let html = preloadedHtml ?? null
  if (!html) {
    const url = `${sport.href}/schedule`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`Schedule page returned ${res.status}`)
    html = await res.text()
  }

  const events = extractJsonLd(html)
  const now = new Date()

  const games: Game[] = events
    .filter((e) => e['@type'] === 'SportsEvent')
    .map((e) => jsonLdToGame(e, sportSlug))
    .filter((g) => new Date(g.startDate) >= now)
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )

  return {
    sportTitle: sport.label,
    season: '',
    overallRecord: null,
    conferenceRecord: null,
    games,
    dataSource: 'fallback',
  }
}

function extractJsonLd(html: string): SportsEventJsonLd[] {
  const results: SportsEventJsonLd[] = []
  const regex =
    /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1])
      if (Array.isArray(parsed)) {
        results.push(...parsed)
      } else {
        results.push(parsed)
      }
    } catch {
      // skip malformed
    }
  }
  return results
}

function jsonLdToGame(e: SportsEventJsonLd, sportSlug: string): Game {
  const isHome =
    e.homeTeam?.name?.toLowerCase().includes('haverford') ?? false
  const opponent = isHome
    ? e.awayTeam?.name ?? 'TBD'
    : e.homeTeam?.name ?? 'TBD'

  const startDate = e.startDate?.split('T')[0] ?? ''
  const timePart = e.startDate?.split('T')[1]
  let time = 'TBD'
  if (timePart) {
    const [h, m] = timePart.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    time = `${h12}:${String(m).padStart(2, '0')} ${ampm}`
  }

  const location = e.location?.name ?? ''

  return {
    id: generateGameId(sportSlug, startDate, opponent),
    sportSlug,
    opponent,
    opponentLogo: null, // filled in later by applyLogos
    startDate,
    time,
    isHome,
    location,
    tournament: null,
    result: null,
    isWin: null,
  }
}

function emptySchedule(
  sportSlug: string,
  dataSource: 'primary' | 'fallback'
): SportSchedule {
  return {
    sportTitle: getSportBySlug(sportSlug)?.label ?? sportSlug,
    season: '',
    overallRecord: null,
    conferenceRecord: null,
    games: [],
    dataSource,
  }
}
