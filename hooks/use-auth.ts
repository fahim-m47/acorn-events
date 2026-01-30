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
    // Track if component is still mounted
    let isMounted = true
    let timeoutId: NodeJS.Timeout | null = null

    // If supabase client couldn't be created, stop loading
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        // Set a 5-second safety timeout
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.error('[AUTH] Session fetch timed out after 5s - forcing loading to false')
            setLoading(false)
          }
        }, 5000)

        const { data: { session } } = await supabase.auth.getSession()

        if (!isMounted) return // Component unmounted, don't update state

        setUser(session?.user ?? null)

        // Check admin status if user is logged in
        if (session?.user) {
          try {
            const { data } = await supabase
              .from('users')
              .select('is_admin')
              .eq('id', session.user.id)
              .single()

            if (isMounted) {
              setIsAdmin(data?.is_admin ?? false)
            }
          } catch (err) {
            console.error('[AUTH] Failed to fetch admin status:', err)
            if (isMounted) {
              setIsAdmin(false)
            }
          }
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Auth error:', error)
        if (isMounted) {
          setUser(null)
          setIsAdmin(false)
        }
      } finally {
        // Clear timeout since we completed
        if (timeoutId) clearTimeout(timeoutId)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          if (!isMounted) return

          setUser(session?.user ?? null)

          // Check admin status if user is logged in
          if (session?.user) {
            try {
              const { data } = await supabase
                .from('users')
                .select('is_admin')
                .eq('id', session.user.id)
                .single()
              if (isMounted) {
                setIsAdmin(data?.is_admin ?? false)
              }
            } catch {
              if (isMounted) {
                setIsAdmin(false)
              }
            }
          } else {
            setIsAdmin(false)
          }
        } catch (error) {
          console.error('Auth state change error:', error)
          if (isMounted) {
            setUser(null)
            setIsAdmin(false)
          }
        } finally {
          if (isMounted) {
            setLoading(false)
          }
        }
      }
    )

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = useCallback(() => {
    router.push('/login')
  }, [router])

  const signOut = useCallback(async () => {
    if (!supabase) return

    // Clear local state immediately (optimistic update)
    setUser(null)
    setIsAdmin(false)

    // Create a timeout promise
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn('[AUTH] Sign out timed out after 3s - proceeding anyway')
        resolve()
      }, 3000)
    })

    // Race between signOut and timeout
    try {
      await Promise.race([
        supabase.auth.signOut(),
        timeoutPromise
      ])
    } catch (error) {
      console.error('[AUTH] Sign out error:', error)
    }

    // Always refresh regardless of outcome
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
