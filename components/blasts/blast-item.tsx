'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { deleteBlast } from '@/actions/blasts'
import type { BlastWithCreator } from '@/types'

interface BlastItemProps {
  blast: BlastWithCreator
  canDelete?: boolean
  onDelete?: (blastId: string) => void
}

export function BlastItem({ blast, canDelete, onDelete }: BlastItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteBlast(blast.id)
      if (result?.error) {
        setError(result.error)
        setIsDeleting(false)
      } else {
        onDelete?.(blast.id)
      }
    } catch {
      setError('Failed to delete blast')
      setIsDeleting(false)
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={blast.creator?.avatar_url || undefined} alt={blast.creator?.name || 'User'} />
          <AvatarFallback className="bg-zinc-800 text-zinc-400">
            {getInitials(blast.creator?.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-zinc-100 truncate">
                {blast.creator?.name || 'Unknown'}
              </span>
              <span className="text-sm text-zinc-500 shrink-0">
                {formatDistanceToNow(new Date(blast.created_at), { addSuffix: true })}
              </span>
            </div>

            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 shrink-0 text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          <p className="mt-2 text-zinc-100 whitespace-pre-wrap">{blast.content}</p>

          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
