export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          is_verified_host: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          is_verified_host?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          is_verified_host?: boolean
          created_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          host_display_name: string | null
          location: string
          start_time: string
          end_time: string | null
          capacity: number | null
          image_url: string | null
          link: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          host_display_name?: string | null
          location: string
          start_time: string
          end_time?: string | null
          capacity?: number | null
          image_url?: string | null
          link?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          host_display_name?: string | null
          location?: string
          start_time?: string
          end_time?: string | null
          capacity?: number | null
          image_url?: string | null
          link?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'events_creator_id_fkey'
            columns: ['creator_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          event_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'favorites_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'favorites_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          }
        ]
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: 'going' | 'waitlist'
          created_at: string
          updated_at: string
          waitlisted_at: string | null
          going_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status: 'going' | 'waitlist'
          created_at?: string
          updated_at?: string
          waitlisted_at?: string | null
          going_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: 'going' | 'waitlist'
          created_at?: string
          updated_at?: string
          waitlisted_at?: string | null
          going_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'event_registrations_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'event_registrations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      blasts: {
        Row: {
          id: string
          event_id: string
          creator_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          creator_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          creator_id?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'blasts_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'blasts_creator_id_fkey'
            columns: ['creator_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      notification_reads: {
        Row: {
          id: string
          user_id: string
          last_read_at: string
        }
        Insert: {
          id?: string
          user_id: string
          last_read_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          last_read_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notification_reads_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_event_capacity_snapshot: {
        Args: {
          p_event_id: string
        }
        Returns: {
          capacity: number
          seats_remaining: number
          going_count: number
          waitlist_count: number
          is_full: boolean
          user_status: string | null
          waitlist_position: number | null
        }[]
      }
      join_event: {
        Args: {
          p_event_id: string
        }
        Returns: string
      }
      leave_event: {
        Args: {
          p_event_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
