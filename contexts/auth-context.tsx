'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  loading: boolean
  signIn: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!isMounted) return

        setUser(session?.user ?? null)

        if (session?.user) {
          const { data } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', session.user.id)
            .single()

          if (isMounted) {
            setIsAdmin(data?.is_admin ?? false)
          }
        }
      } catch (error) {
        console.error('[AUTH] Init error:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return

        setUser(session?.user ?? null)

        if (session?.user) {
          const { data } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', session.user.id)
            .single()

          if (isMounted) setIsAdmin(data?.is_admin ?? false)
        } else {
          setIsAdmin(false)
        }

        setLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(() => router.push('/login'), [router])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    setUser(null)
    setIsAdmin(false)
    await supabase.auth.signOut()
    router.refresh()
  }, [router])

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
