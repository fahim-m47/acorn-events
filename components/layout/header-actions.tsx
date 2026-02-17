'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { CREATE_EVENT_PATH } from '@/lib/auth-redirect'
import { CurrentTime } from './current-time'
import { UserMenu } from '@/components/auth/user-menu'
import { NotificationBell } from './notification-bell'

export function HeaderActions() {
  const { user, loading, signIn, signOut } = useAuth()
  const createEventButtonClasses =
    'bg-red-600 px-4 text-white hover:bg-red-700 hover:text-white'

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <CurrentTime />
        <div className="h-9 w-9 animate-pulse rounded-full bg-white/20" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <CurrentTime />

      {/* Create Event Link */}
      {user ? (
        <Button asChild className={createEventButtonClasses}>
          <Link href={CREATE_EVENT_PATH} className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            <span>Create Event</span>
          </Link>
        </Button>
      ) : (
        <Button
          onClick={() => signIn(CREATE_EVENT_PATH)}
          className={createEventButtonClasses}
        >
          <Plus className="h-5 w-5" />
          <span>Create Event</span>
        </Button>
      )}

      {user && (
        <>
          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          <UserMenu user={user} onSignOut={signOut} />
        </>
      )}
    </div>
  )
}
