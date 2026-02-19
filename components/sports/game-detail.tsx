'use client'

import { MapPin, Calendar, Clock, Home, Plane, ExternalLink } from 'lucide-react'
import { OpponentAvatar } from './opponent-avatar'
import { ShareGameButton } from './share-game-button'
import type { Game } from '@/types/sports'
import type { SportLink } from '@/lib/sports-links'

interface GameDetailProps {
  game: Game
  sport: SportLink
}

export function GameDetail({ game, sport }: GameDetailProps) {
  const hasResult = game.result !== null && game.result !== ''

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-4">
        <OpponentAvatar opponent={game.opponent} logoUrl={game.opponentLogo} size="md" />
        <div>
          <p className="text-sm text-zinc-500">{game.sportSlug ? sport.label : 'Game'}</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            vs. {game.opponent}
          </h1>
        </div>
      </div>

      {hasResult && (
        <div
          className={`mt-4 inline-flex rounded-lg px-4 py-2 text-lg font-bold ${
            game.isWin
              ? 'bg-emerald-950/50 text-emerald-400'
              : 'bg-red-950/50 text-red-400'
          }`}
        >
          {game.result}
        </div>
      )}

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 text-zinc-300">
          <Calendar className="h-5 w-5 text-zinc-500" />
          <span>{game.startDate}</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-300">
          <Clock className="h-5 w-5 text-zinc-500" />
          <span>{game.time}</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-300">
          {game.isHome ? (
            <Home className="h-5 w-5 text-zinc-500" />
          ) : (
            <Plane className="h-5 w-5 text-zinc-500" />
          )}
          <span>{game.isHome ? 'Home Game' : 'Away Game'}</span>
        </div>
        {game.location && (
          <div className="flex items-center gap-3 text-zinc-300">
            <MapPin className="h-5 w-5 text-zinc-500" />
            <span>{game.location}</span>
          </div>
        )}
        {game.tournament && (
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="ml-8 text-sm">{game.tournament}</span>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <ShareGameButton
          gameId={game.id}
          sportSlug={game.sportSlug}
          opponent={game.opponent}
        />
        <a
          href={`${sport.href}/schedule`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
        >
          <ExternalLink className="h-4 w-4" />
          Haverford Athletics
        </a>
      </div>
    </div>
  )
}
