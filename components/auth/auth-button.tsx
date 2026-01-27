'use client'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { UserMenu } from './user-menu'

export function AuthButton() {
  const { user, loading, signIn, signOut } = useAuth()

  if (loading) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
    )
  }

  if (!user) {
    return (
      <Button onClick={signIn} variant="default">
        Sign in
      </Button>
    )
  }

  return <UserMenu user={user} onSignOut={signOut} />
}
