'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  hasUnseenNotifications,
  getFavoritedEventIdsForNotifications,
} from '@/actions/notifications'
import { useAuth } from './auth-context'

interface NotificationContextType {
  hasUnseen: boolean
  isLoading: boolean
}

const NotificationContext = createContext<NotificationContextType>({
  hasUnseen: false,
  isLoading: true,
})

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [hasUnseen, setHasUnseen] = useState(false)
  const [favoritedEventIds, setFavoritedEventIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const { user } = useAuth()

  // Fetch notification state
  const fetchNotificationState = useCallback(async () => {
    if (!user) {
      setHasUnseen(false)
      setIsLoading(false)
      return
    }

    try {
      const [unseenResult, eventIds] = await Promise.all([
        hasUnseenNotifications(),
        getFavoritedEventIdsForNotifications(),
      ])
      setHasUnseen(unseenResult)
      setFavoritedEventIds(eventIds)
    } catch (error) {
      console.error('Error fetching notification state:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Refetch when pathname changes (to detect navigation to/from notifications)
  useEffect(() => {
    fetchNotificationState()
  }, [pathname, fetchNotificationState])

  // Set up real-time subscription
  useEffect(() => {
    if (!user || favoritedEventIds.length === 0) return

    const supabase = createClient()

    const channel = supabase
      .channel('notification-blasts-context')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blasts',
        },
        (payload) => {
          if (favoritedEventIds.includes(payload.new.event_id as string)) {
            setHasUnseen(true)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, favoritedEventIds])

  return (
    <NotificationContext.Provider value={{ hasUnseen, isLoading }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
