'use client'

import Link from 'next/link'
import { MapPin, Home, Plane } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { OpponentAvatar } from './opponent-avatar'
import { ShareGameButton } from './share-game-button'
import { getGamePath } from '@/lib/game-url'
import type { Game } from '@/types/sports'

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  const gamePath = getGamePath(game.sportSlug, game.id)
  const hasResult = game.result !== null && game.result !== ''

  const handlePreventNavigation = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Link href={gamePath} className="group block w-full">
      <Card className="overflow-hidden border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700">
        <div className="flex items-start gap-3 p-4">
          <OpponentAvatar opponent={game.opponent} logoUrl={game.opponentLogo} />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-zinc-100 transition-colors group-hover:text-red-400">
                  vs. {game.opponent}
                </h3>
                <div className="mt-0.5 flex items-center gap-2 text-sm text-zinc-400">
                  <span>{game.time}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="inline-flex items-center gap-1">
                    {game.isHome ? (
                      <Home className="h-3 w-3" />
                    ) : (
                      <Plane className="h-3 w-3" />
                    )}
                    {game.isHome ? 'Home' : 'Away'}
                  </span>
                </div>
              </div>

              {hasResult && (
                <div
                  className={`shrink-0 rounded-md px-2.5 py-1 text-sm font-bold tracking-tight ${
                    game.isWin
                      ? 'bg-emerald-950/50 text-emerald-400'
                      : 'bg-red-950/50 text-red-400'
                  }`}
                >
                  {game.result}
                </div>
              )}
            </div>

            {game.location && (
              <div className="mt-1.5 flex items-start gap-1 text-sm text-zinc-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{game.location}</span>
              </div>
            )}

            {game.tournament && (
              <span className="mt-1 text-xs text-zinc-600">
                {game.tournament}
              </span>
            )}

            <div className="mt-3 flex items-center gap-2">
              <div onClick={handlePreventNavigation}>
                <ShareGameButton
                  gameId={game.id}
                  sportSlug={game.sportSlug}
                  opponent={game.opponent}
                  size="sm"
                  className="h-8 px-3"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
