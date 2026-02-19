export interface Game {
  id: string
  sportSlug: string
  opponent: string
  opponentLogo: string | null // e.g., "https://haverfordathletics.com/images/logos/rutgers-camden.png?width=80&height=80&mode=max"
  startDate: string // ISO 8601 or "Mon DD (Day)" format date string
  time: string // e.g., "1:00 PM"
  isHome: boolean
  location: string
  tournament: string | null
  result: string | null // e.g., "W 111-79", "L 50-75"
  isWin: boolean | null // null if game hasn't been played
}

export interface UpcomingGame extends Game {
  sportLabel: string
}

export interface SportSchedule {
  sportTitle: string
  season: string
  overallRecord: string | null
  conferenceRecord: string | null
  games: Game[]
  dataSource: 'primary' | 'fallback'
}

export interface SportsEventJsonLd {
  '@type': string
  name: string
  url: string | null
  homeTeam: { '@type': string; name: string }
  awayTeam: { '@type': string; name: string }
  startDate: string
  endDate: string
  eventStatus: string | null
  location: {
    '@type': string
    name: string
    address: {
      streetAddress?: string
      postalCode?: string | null
      addressLocality?: string | null
      addressRegion?: string | null
      '@type': string
    }
  }
  description: string
  image: { url: string; width: number; height: number; '@type': string }
}
