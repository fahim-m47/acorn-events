import { notFound } from 'next/navigation'
import { getSchedule } from '@/lib/sports-scraper'
import { getSportBySlug } from '@/lib/sports-links'
import { ScheduleHeader } from '@/components/sports/schedule-header'
import { GameList } from '@/components/sports/game-list'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const sport = getSportBySlug(slug)
  if (!sport) return {}
  return {
    title: `${sport.label} Schedule | Acorn`,
    description: `Upcoming and past games for Haverford College ${sport.label}`,
  }
}

export default async function SportSchedulePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sport = getSportBySlug(slug)
  if (!sport) notFound()

  const schedule = await getSchedule(slug)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ScheduleHeader schedule={schedule} sport={sport} />
      <GameList games={schedule.games} />
    </div>
  )
}
