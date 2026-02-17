'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useNotifications } from '@/contexts/notification-context'
import { cn } from '@/lib/utils'

interface NavProps {
  mobile?: boolean
  onLinkClick?: () => void
}

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/past-events', label: 'Past Events' },
]

const authLinks = [
  { href: '/saved', label: 'Saved' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/my-events', label: 'My Events' },
]

export function Nav({ mobile = false, onLinkClick }: NavProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { hasUnseen } = useNotifications()
  const isOnNotificationsPage = pathname === '/notifications'

  const links = user ? [...publicLinks, ...authLinks] : publicLinks

  return (
    <nav
      className={cn(
        mobile
          ? 'flex flex-col space-y-4'
          : 'hidden md:flex md:flex-row md:items-center md:space-x-6'
      )}
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onLinkClick}
          className={cn(
            'relative text-sm font-medium transition-colors',
            mobile
              ? pathname === link.href
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
              : pathname === link.href
                ? 'text-white'
                : 'text-white/70 hover:text-white'
          )}
        >
          {link.label}
          {link.href === '/notifications' && hasUnseen && !isOnNotificationsPage && (
            <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Link>
      ))}
    </nav>
  )
}
