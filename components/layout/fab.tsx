'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { CREATE_EVENT_PATH } from '@/lib/auth-redirect'

export function FAB() {
  const { user, loading, signIn } = useAuth()
  const fabClasses =
    'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-background'

  if (loading) {
    return null
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => signIn(CREATE_EVENT_PATH)}
        className={fabClasses}
        aria-label="Sign in to create a new event"
      >
        <Plus className="h-6 w-6" />
      </button>
    )
  }

  return (
    <Link
      href={CREATE_EVENT_PATH}
      className={fabClasses}
      aria-label="Create new event"
    >
      <Plus className="h-6 w-6" />
    </Link>
  )
}
