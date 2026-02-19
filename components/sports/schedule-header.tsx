import { ExternalLink } from 'lucide-react'
import type { SportSchedule } from '@/types/sports'
import type { SportLink } from '@/lib/sports-links'

interface ScheduleHeaderProps {
  schedule: SportSchedule
  sport: SportLink
}

export function ScheduleHeader({ schedule, sport }: ScheduleHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            {schedule.sportTitle}
          </h1>
          {schedule.season && (
            <p className="mt-0.5 text-sm text-zinc-500">{schedule.season} Season</p>
          )}
        </div>
        <a
          href={`${sport.href}/schedule`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          Haverford Athletics
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {(schedule.overallRecord || schedule.conferenceRecord) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {schedule.overallRecord && (
            <span className="rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm font-medium text-zinc-300">
              {schedule.overallRecord} Overall
            </span>
          )}
          {schedule.conferenceRecord && (
            <span className="rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm font-medium text-zinc-300">
              {schedule.conferenceRecord} Conference
            </span>
          )}
        </div>
      )}
    </div>
  )
}
