import { format } from 'date-fns'

interface TimelineDateHeaderProps {
  date: Date
}

export function TimelineDateHeader({ date }: TimelineDateHeaderProps) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className="w-16 text-right shrink-0">
        <div className="text-base font-semibold text-zinc-200">
          {format(date, 'MMM d')}
        </div>
        <div className="text-sm text-zinc-500">
          {format(date, 'EEEE')}
        </div>
      </div>
      <div className="timeline-dot mt-2" />
    </div>
  )
}
