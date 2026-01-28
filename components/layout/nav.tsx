'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface NavProps {
  mobile?: boolean
  onLinkClick?: () => void
}

const publicLinks = [
  { href: '/', label: 'Home' },
]

const authLinks = [
  { href: '/saved', label: 'Saved' },
  { href: '/my-events', label: 'My Events' },
]

export function Nav({ mobile = false, onLinkClick }: NavProps) {
  const pathname = usePathname()
  const { user } = useAuth()

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
            'text-sm font-medium transition-colors',
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
        </Link>
      ))}
    </nav>
  )
}
