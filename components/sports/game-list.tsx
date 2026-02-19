'use client'

import { useMemo, useState } from 'react'
import { format, parse } from 'date-fns'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GameCard } from './game-card'
import type { Game } from '@/types/sports'

const INITIAL_VISIBLE = 20
const LOAD_MORE_COUNT = 20

interface GameListProps {
  games: Game[]
}

export function GameList({ games }: GameListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)

  // Reorder: upcoming games first (soonest at top), then past games (most recent first)
  const reordered = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const upcoming = games.filter((g) => g.startDate >= today)
    const past = games.filter((g) => g.startDate < today)
    // Upcoming: chronological (soonest first). Past: reverse chronological (most recent first).
    upcoming.sort((a, b) => a.startDate.localeCompare(b.startDate))
    past.sort((a, b) => b.startDate.localeCompare(a.startDate))
    return [...upcoming, ...past]
  }, [games])

  const { visibleGames, hasMore } = useMemo(() => {
    const sliced = reordered.slice(0, visibleCount)
    return { visibleGames: sliced, hasMore: visibleCount < reordered.length }
  }, [reordered, visibleCount])

  // Group visible games by date, preserving the upcoming-then-past order
  const grouped = useMemo(() => {
    const ordered: [string, Game[]][] = []
    const seen = new Set<string>()
    for (const game of visibleGames) {
      const dateKey = game.startDate
      if (!seen.has(dateKey)) {
        seen.add(dateKey)
        ordered.push([dateKey, []])
      }
      ordered.find(([k]) => k === dateKey)![1].push(game)
    }
    return ordered
  }, [visibleGames])

  if (games.length === 0) {
    return (
      <p className="py-12 text-center text-zinc-500">
        No games scheduled at this time.
      </p>
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        {grouped.map(([dateKey, dateGames]) => {
          const date = parse(dateKey, 'yyyy-MM-dd', new Date())

          return (
            <div key={dateKey} className="flex gap-4 pb-6">
              {/* Date column */}
              <div className="w-16 shrink-0 pt-1 text-right">
                <div className="text-base font-semibold text-zinc-200">
                  {format(date, 'MMM d')}
                </div>
                <div className="text-sm text-zinc-500">
                  {format(date, 'EEEE')}
                </div>
              </div>

              {/* Timeline dot + line */}
              <div className="relative flex flex-col items-center">
                <div className="timeline-dot mt-1.5" />
                <div className="timeline-line absolute bottom-0 left-1/2 top-4 -translate-x-1/2" />
              </div>

              {/* Game cards */}
              <div className="min-w-0 flex-1 space-y-3">
                {dateGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2 pb-4">
          <Button
            variant="outline"
            className="gap-2 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            onClick={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
          >
            <ChevronDown className="h-4 w-4" />
            Show More
          </Button>
        </div>
      )}
    </div>
  )
}
