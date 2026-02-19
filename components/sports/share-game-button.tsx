'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ClipboardCopy, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { getGamePath } from '@/lib/game-url'
import { cn } from '@/lib/utils'

interface ShareGameButtonProps {
  gameId: string
  sportSlug: string
  opponent: string
  size?: 'default' | 'sm'
  className?: string
}

export function ShareGameButton({
  gameId,
  sportSlug,
  opponent,
  size = 'default',
  className,
}: ShareGameButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState(getGamePath(sportSlug, gameId))
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const gamePath = getGamePath(sportSlug, gameId)
    const origin = window.location.origin
    setShareUrl(`${origin}${gamePath}`)
  }, [sportSlug, gameId])

  useEffect(() => {
    if (!isOpen) return

    const timeoutId = window.setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [isOpen, shareUrl])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: 'Link copied',
        description: 'Game link copied to clipboard.',
      })
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not copy the game link. Please copy it manually.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        setIsOpen(nextOpen)
        if (!nextOpen) {
          setCopied(false)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          size={size}
          className={cn(
            'gap-2 bg-red-700 text-white hover:bg-red-800',
            className
          )}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Share Game</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Share the {opponent} game with friends.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={shareUrl}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
            className="border-zinc-700 bg-zinc-950 text-blue-300 selection:bg-blue-500 selection:text-blue-100"
            aria-label="Game details link"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleCopy}
            className="shrink-0 border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
            aria-label="Copy game link"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <ClipboardCopy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
