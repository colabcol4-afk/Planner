export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          full_name: string | null
          avatar_url: string | null
          timezone: string
          onboarding_completed: boolean
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          onboarding_completed?: boolean
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          onboarding_completed?: boolean
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      routines: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          day_type: 'weekday' | 'weekend' | 'both'
          time_of_day: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime' | null
          start_time: string | null
          end_time: string | null
          duration_minutes: number | null
          energy_level: 'low' | 'medium' | 'high' | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          day_type: 'weekday' | 'weekend' | 'both'
          time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime' | null
          start_time?: string | null
          end_time?: string | null
          duration_minutes?: number | null
          energy_level?: 'low' | 'medium' | 'high' | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          day_type?: 'weekday' | 'weekend' | 'both'
          time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime' | null
          start_time?: string | null
          end_time?: string | null
          duration_minutes?: number | null
          energy_level?: 'low' | 'medium' | 'high' | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          user_id: string
          plan_date: string
          plan_type: 'daily' | 'weekly'
          status: 'active' | 'completed' | 'cancelled'
          notes: string | null
          generated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_date: string
          plan_type: 'daily' | 'weekly'
          status?: 'active' | 'completed' | 'cancelled'
          notes?: string | null
          generated_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_date?: string
          plan_type?: 'daily' | 'weekly'
          status?: 'active' | 'completed' | 'cancelled'
          notes?: string | null
          generated_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          plan_id: string | null
          title: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          due_time: string | null
          duration_minutes: number | null
          estimated_energy: 'low' | 'medium' | 'high' | null
          tags: string[] | null
          source: 'manual' | 'conversation' | 'system'
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id?: string | null
          title: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          due_time?: string | null
          duration_minutes?: number | null
          estimated_energy?: 'low' | 'medium' | 'high' | null
          tags?: string[] | null
          source?: 'manual' | 'conversation' | 'system'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string | null
          title?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          due_time?: string | null
          duration_minutes?: number | null
          estimated_energy?: 'low' | 'medium' | 'high' | null
          tags?: string[] | null
          source?: 'manual' | 'conversation' | 'system'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          action_type: string
          source: 'manual' | 'conversation' | 'system'
          raw_text: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id?: string | null
          action_type: string
          source?: 'manual' | 'conversation' | 'system'
          raw_text?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string | null
          action_type?: string
          source?: 'manual' | 'conversation' | 'system'
          raw_text?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          session_id: string
          role: 'user' | 'assistant' | 'system' | 'tool'
          content: string
          tool_calls: Json | null
          tool_call_id: string | null
          tokens_used: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          role: 'user' | 'assistant' | 'system' | 'tool'
          content: string
          tool_calls?: Json | null
          tool_call_id?: string | null
          tokens_used?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          role?: 'user' | 'assistant' | 'system' | 'tool'
          content?: string
          tool_calls?: Json | null
          tool_call_id?: string | null
          tokens_used?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
