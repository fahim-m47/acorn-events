'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Create client only on client-side
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null
    return createClient()
  }, [])

  useEffect(() => {
    // If supabase client couldn't be created, stop loading
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        // Check admin status if user is logged in
        if (session?.user) {
          try {
            const { data } = await supabase
              .from('users')
              .select('is_admin')
              .eq('id', session.user.id)
              .single()
            setIsAdmin(data?.is_admin ?? false)
          } catch {
            setIsAdmin(false)
          }
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Auth error:', error)
        setUser(null)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          setUser(session?.user ?? null)

          // Check admin status if user is logged in
          if (session?.user) {
            try {
              const { data } = await supabase
                .from('users')
                .select('is_admin')
                .eq('id', session.user.id)
                .single()
              setIsAdmin(data?.is_admin ?? false)
            } catch {
              setIsAdmin(false)
            }
          } else {
            setIsAdmin(false)
          }
        } catch (error) {
          console.error('Auth state change error:', error)
          setUser(null)
          setIsAdmin(false)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = useCallback(() => {
    router.push('/login')
  }, [router])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.refresh()
  }, [supabase, router])

  return {
    user,
    isAdmin,
    loading,
    signIn,
    signOut,
  }
}
