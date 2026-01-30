export * from './database'

import type { Database } from './database'

// Type aliases for convenience
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Event = Database['public']['Tables']['events']['Row']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type EventUpdate = Database['public']['Tables']['events']['Update']

export type Favorite = Database['public']['Tables']['favorites']['Row']
export type FavoriteInsert = Database['public']['Tables']['favorites']['Insert']
export type FavoriteUpdate = Database['public']['Tables']['favorites']['Update']

export type Blast = Database['public']['Tables']['blasts']['Row']
export type BlastInsert = Database['public']['Tables']['blasts']['Insert']
export type BlastUpdate = Database['public']['Tables']['blasts']['Update']

export type NotificationRead = Database['public']['Tables']['notification_reads']['Row']
export type NotificationReadInsert = Database['public']['Tables']['notification_reads']['Insert']
export type NotificationReadUpdate = Database['public']['Tables']['notification_reads']['Update']

// Extended types with relationships
export type EventWithCreator = Event & {
  creator: User
}

export type BlastWithCreator = Blast & {
  creator: User
}

export type EventWithBlasts = EventWithCreator & {
  blasts: BlastWithCreator[]
}

// Notification types
export type NotificationWithEvent = BlastWithCreator & {
  event: {
    id: string
    title: string
    start_time: string
  }
}
