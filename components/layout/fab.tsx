'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export function FAB() {
  const { user, loading } = useAuth()

  // Don't render if not authenticated or still loading
  if (loading || !user) {
    return null
  }

  return (
    <Link
      href="/events/new"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-background"
      aria-label="Create new event"
    >
      <Plus className="h-6 w-6" />
    </Link>
  )
}
