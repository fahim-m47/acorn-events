import { MessageSquare } from 'lucide-react'
import { BlastItem } from './blast-item'
import type { BlastWithCreator } from '@/types'

interface BlastFeedProps {
  blasts: BlastWithCreator[]
  eventId: string
  isOwner?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function BlastFeed({ blasts, eventId, isOwner }: BlastFeedProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-zinc-400" />
        <h2 className="text-lg font-semibold text-zinc-100">Updates from host</h2>
      </div>

      {blasts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-zinc-500">No updates yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {blasts.map((blast) => (
            <BlastItem
              key={blast.id}
              blast={blast}
              canDelete={isOwner}
            />
          ))}
        </div>
      )}
    </section>
  )
}
