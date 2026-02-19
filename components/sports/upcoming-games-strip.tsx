'use client'

import type { CSSProperties } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { format, parse } from 'date-fns'
import Link from 'next/link'
import { Home, MapPin, Plane } from 'lucide-react'
import { getGamePath } from '@/lib/game-url'
import type { UpcomingGame } from '@/types/sports'

const TRACK_GAP_PX = 12
const MIN_BLOCK_WIDTH_PX = 220
const SCROLL_SPEED_PX_PER_SECOND = 44

interface UpcomingGamesStripProps {
  games: UpcomingGame[]
}

function formatGameDate(dateKey: string): string {
  const parsed = parse(dateKey, 'yyyy-MM-dd', new Date())
  if (Number.isNaN(parsed.getTime())) return dateKey
  return format(parsed, 'EEE, MMM d')
}

export function UpcomingGamesStrip({ games }: UpcomingGamesStripProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [blockWidth, setBlockWidth] = useState(MIN_BLOCK_WIDTH_PX)
  const [visibleBlocks, setVisibleBlocks] = useState(1)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width
      const estimatedVisible = Math.floor(
        (width + TRACK_GAP_PX) / (MIN_BLOCK_WIDTH_PX + TRACK_GAP_PX)
      )
      const nextVisible = Math.max(
        1,
        Math.min(games.length || 1, estimatedVisible || 1)
      )
      const nextBlockWidth = Math.floor(
        (width - TRACK_GAP_PX * (nextVisible - 1)) / nextVisible
      )

      setVisibleBlocks(nextVisible)
      setBlockWidth(Math.max(160, nextBlockWidth))
    })

    observer.observe(viewport)
    return () => observer.disconnect()
  }, [games.length])

  const shouldAnimate = games.length > visibleBlocks
  const renderedGames = useMemo(
    () => (shouldAnimate ? [...games, ...games] : games),
    [games, shouldAnimate]
  )

  const loopWidth = games.length * (blockWidth + TRACK_GAP_PX)
  const durationSeconds = Math.max(22, loopWidth / SCROLL_SPEED_PX_PER_SECOND)

  const trackStyle: CSSProperties = {
    ['--upcoming-games-gap' as string]: `${TRACK_GAP_PX}px`,
    ['--upcoming-games-loop-width' as string]: `${loopWidth}px`,
    ['--upcoming-games-duration' as string]: `${durationSeconds}s`,
  }

  return (
    <section className="rounded-xl border border-zinc-800/90 bg-zinc-950/60 p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
          Upcoming Games
        </h2>
      </div>

      {games.length === 0 ? (
        <p className="px-1 py-2 text-sm text-zinc-500">
          No upcoming games are available right now.
        </p>
      ) : (
        <div className="upcoming-games-marquee relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-zinc-950/95 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-zinc-950/95 to-transparent" />
          <div ref={viewportRef} className="overflow-hidden">
            <div
              className="upcoming-games-track"
              data-animate={shouldAnimate}
              style={trackStyle}
            >
              {renderedGames.map((game, index) => (
                <Link
                  key={`${game.id}-${index}`}
                  href={getGamePath(game.sportSlug, game.id)}
                  className="group block shrink-0 rounded-lg border border-zinc-800 bg-zinc-900/90 p-3 transition-colors hover:border-zinc-600 hover:bg-zinc-900"
                  style={{ width: `${blockWidth}px` }}
                >
                  <span className="text-[10px] uppercase tracking-[0.14em] text-red-300/90">
                    {game.sportLabel}
                  </span>
                  <h3 className="mt-1 truncate text-base font-semibold text-red-300 transition-colors group-hover:text-red-200">
                    vs. {game.opponent}
                  </h3>

                  <div className="mt-0.5 flex items-center gap-2 text-sm text-zinc-400">
                    <span>{game.time}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="inline-flex items-center gap-1">
                      {game.isHome ? (
                        <Home className="h-3.5 w-3.5" />
                      ) : (
                        <Plane className="h-3.5 w-3.5" />
                      )}
                      {game.isHome ? 'Home' : 'Away'}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-start gap-1 text-xs text-zinc-500">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-2">
                      {game.location || 'Location TBD'}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-zinc-600">
                    {formatGameDate(game.startDate)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
