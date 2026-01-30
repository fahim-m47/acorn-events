'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/contexts/notification-context'

export function NotificationBell() {
  const { hasUnseen, isLoading } = useNotifications()
  const pathname = usePathname()
  const isOnNotificationsPage = pathname === '/notifications'

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10 hover:text-white"
        aria-label="Notifications"
        disabled
      >
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative text-white hover:bg-white/10 hover:text-white"
      aria-label="Notifications"
    >
      <Link href="/notifications">
        <Bell className="h-5 w-5" />
        {hasUnseen && !isOnNotificationsPage && (
          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-black" />
        )}
      </Link>
    </Button>
  )
}
