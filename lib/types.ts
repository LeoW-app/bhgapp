export type AvatarColor =
  | '#C66B3D'   // terracotta
  | '#5A8C6F'   // sage
  | '#E8B84A'   // sun
  | '#6B95B8'   // sky
  | '#9B8EC4'   // lavender
  | '#C85A5A'   // rose

export const AVATAR_COLORS: { name: string; value: AvatarColor }[] = [
  { name: 'Terracotta', value: '#C66B3D' },
  { name: 'Sage',       value: '#5A8C6F' },
  { name: 'Sun',        value: '#E8B84A' },
  { name: 'Sky',        value: '#6B95B8' },
  { name: 'Lavender',   value: '#9B8EC4' },
  { name: 'Rose',       value: '#C85A5A' },
]

// Lightweight row types for use in components — not the full Supabase Database generic
// (avoids the self-referential Omit issue with supabase-js v2.104+)

export type Database = {
  public: {
    Tables: {
      households: {
        Row: {
          id: string
          name: string
          child_name: string | null
          child_age: number | null
          kindergarten_name: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['households']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['households']['Insert']>
      }
      memberships: {
        Row: {
          id: string
          household_id: string
          user_id: string
          role: 'parent' | 'viewer'
          display_name: string | null
          avatar_color: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['memberships']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['memberships']['Insert']>
      }
      invite_codes: {
        Row: {
          code: string
          household_id: string
          role: string
          created_by: string | null
          expires_at: string
          used_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['invite_codes']['Row'], never>
        Update: Partial<Database['public']['Tables']['invite_codes']['Insert']>
      }
      events: {
        Row: {
          id: string
          household_id: string
          type: 'closure' | 'vacation' | 'absence' | 'event' | 'note'
          title: string
          starts_on: string
          ends_on: string | null
          notes: string | null
          checklist_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      checklists: {
        Row: {
          id: string
          household_id: string
          kind: 'daily' | 'event' | 'weather'
          name: string
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['checklists']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['checklists']['Insert']>
      }
      checklist_items: {
        Row: {
          id: string
          checklist_id: string
          emoji: string | null
          title: string
          notes: string | null
          critical: boolean
          position: number
        }
        Insert: Omit<Database['public']['Tables']['checklist_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['checklist_items']['Insert']>
      }
      check_states: {
        Row: {
          id: string
          household_id: string
          item_id: string
          on_date: string
          checked_by: string | null
          checked_at: string
        }
        Insert: Omit<Database['public']['Tables']['check_states']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['check_states']['Insert']>
      }
      inventory_items: {
        Row: {
          id: string
          household_id: string
          name: string
          emoji: string | null
          bg_color: string | null
          category: string | null
          quantity: number
          min_quantity: number
          notes: string | null
          photo_url: string | null
          last_verified_by: string | null
          last_verified_at: string
        }
        Insert: Omit<Database['public']['Tables']['inventory_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['inventory_items']['Insert']>
      }
    }
  }
}

export type Membership = Database['public']['Tables']['memberships']['Row']
export type ChecklistItem = Database['public']['Tables']['checklist_items']['Row']
export type CheckState = Database['public']['Tables']['check_states']['Row']
