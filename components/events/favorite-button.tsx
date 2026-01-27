'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleFavorite } from '@/actions/favorites'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  eventId: string
  initialFavorited: boolean
  size?: 'sm' | 'default'
}

export function FavoriteButton({ eventId, initialFavorited, size = 'default' }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleToggle = () => {
    // Optimistic update
    const previousState = isFavorited
    setIsFavorited(!isFavorited)

    startTransition(async () => {
      const result = await toggleFavorite(eventId)

      if (result.error) {
        // Revert on error
        setIsFavorited(previousState)
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        // Update to actual server state
        setIsFavorited(result.isFavorited)
      }
    })
  }

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const buttonSize = size === 'sm' ? 'sm' : 'default'

  return (
    <Button
      variant="ghost"
      size={buttonSize === 'sm' ? 'sm' : 'icon'}
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        'transition-colors',
        isFavorited
          ? 'text-red-500 hover:text-red-400'
          : 'text-zinc-400 hover:text-zinc-100'
      )}
      aria-label={isFavorited ? 'Remove from saved events' : 'Save event'}
    >
      <Heart
        className={cn(
          iconSize,
          isFavorited && 'fill-current'
        )}
      />
    </Button>
  )
}
