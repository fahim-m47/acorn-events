import { notFound } from 'next/navigation'
import { getSchedule } from '@/lib/sports-scraper'
import { getSportBySlug } from '@/lib/sports-links'
import { GameDetail } from '@/components/sports/game-detail'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; gameId: string }>
}): Promise<Metadata> {
  const { slug, gameId } = await params
  const sport = getSportBySlug(slug)
  if (!sport) return {}

  const schedule = await getSchedule(slug)
  const game = schedule.games.find(
    (g) => g.id === decodeURIComponent(gameId)
  )
  if (!game) return { title: `${sport.label} | Acorn` }

  return {
    title: `${sport.label} vs. ${game.opponent} | Acorn`,
    description: `${sport.label} ${game.isHome ? 'home' : 'away'} game vs. ${game.opponent} on ${game.startDate}`,
  }
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string; gameId: string }>
}) {
  const { slug, gameId } = await params
  const sport = getSportBySlug(slug)
  if (!sport) notFound()

  const schedule = await getSchedule(slug)
  const game = schedule.games.find(
    (g) => g.id === decodeURIComponent(gameId)
  )
  if (!game) notFound()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <GameDetail game={game} sport={sport} />
    </div>
  )
}
