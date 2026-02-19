'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getEventPath } from '@/lib/event-url'
import type { NotificationWithEvent } from '@/types'

interface NotificationItemProps {
  notification: NotificationWithEvent
}

export function NotificationItem({ notification }: NotificationItemProps) {
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
      {/* Event title as link */}
      <Link
        href={getEventPath(notification.event)}
        className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
      >
        {notification.event.title}
      </Link>

      <div className="flex items-start gap-3 mt-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage
            src={notification.creator?.avatar_url || undefined}
            alt={notification.creator?.name || 'User'}
          />
          <AvatarFallback className="bg-zinc-800 text-zinc-400">
            {getInitials(notification.creator?.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-zinc-100 truncate">
              {notification.creator?.name || 'Unknown'}
            </span>
            <span className="text-sm text-zinc-500 shrink-0">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>

          <p className="mt-2 text-zinc-100 whitespace-pre-wrap">{notification.content}</p>
        </div>
      </div>
    </div>
  )
}
