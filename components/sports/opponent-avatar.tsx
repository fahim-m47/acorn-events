/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils'

const AVATAR_COLORS = [
  'bg-red-900/60 text-red-200',
  'bg-blue-900/60 text-blue-200',
  'bg-emerald-900/60 text-emerald-200',
  'bg-amber-900/60 text-amber-200',
  'bg-purple-900/60 text-purple-200',
  'bg-cyan-900/60 text-cyan-200',
  'bg-pink-900/60 text-pink-200',
  'bg-orange-900/60 text-orange-200',
  'bg-teal-900/60 text-teal-200',
  'bg-indigo-900/60 text-indigo-200',
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getInitials(name: string): string {
  const words = name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

interface OpponentAvatarProps {
  opponent: string
  logoUrl?: string | null
  size?: 'sm' | 'md'
  className?: string
}

export function OpponentAvatar({
  opponent,
  logoUrl,
  size = 'md',
  className,
}: OpponentAvatarProps) {
  const sizeClasses = size === 'md' ? 'h-11 w-11' : 'h-8 w-8'

  if (logoUrl) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800',
          sizeClasses,
          className
        )}
      >
        <img
          src={logoUrl}
          alt={`${opponent} logo`}
          className="h-full w-full object-contain p-1"
        />
      </div>
    )
  }

  const colorIndex = hashString(opponent) % AVATAR_COLORS.length
  const color = AVATAR_COLORS[colorIndex]
  const initials = getInitials(opponent)

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        sizeClasses,
        size === 'md' ? 'text-sm' : 'text-xs',
        color,
        className
      )}
    >
      {initials}
    </div>
  )
}
