export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      interviews: {
        Row: {
          id: string
          user_id: string | null
          role: string
          level: string
          candidate_name: string | null
          interview_type: Database["public"]["Enums"]["interview_type"]
          duration: number
          focus_area: string
          custom_requirements: string | null
          total_questions: number
          transcript: Json | null
          feedback: Json | null
          status: Database["public"]["Enums"]["interview_status"] | null
          created_at: string | null
          updated_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          role: string
          level: string
          candidate_name?: string | null
          interview_type?: Database["public"]["Enums"]["interview_type"]
          duration?: number
          focus_area?: string
          custom_requirements?: string | null
          total_questions?: number
          transcript?: Json | null
          feedback?: Json | null
          status?: Database["public"]["Enums"]["interview_status"] | null
          created_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          role?: string
          level?: string
          candidate_name?: string | null
          interview_type?: Database["public"]["Enums"]["interview_type"]
          duration?: number
          focus_area?: string
          custom_requirements?: string | null
          total_questions?: number
          transcript?: Json | null
          feedback?: Json | null
          status?: Database["public"]["Enums"]["interview_status"] | null
          created_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          user_id: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          preferred_role: string | null
          experience_level: string | null
          skills: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          preferred_role?: string | null
          experience_level?: string | null
          skills?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          preferred_role?: string | null
          experience_level?: string | null
          skills?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_packages: {
        Row: {
          id: string
          name: string
          description: string | null
          credits: number
          price_cents: number
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          credits: number
          price_cents: number
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          credits?: number
          price_cents?: number
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          user_id: string
          available_credits: number
          total_credits_earned: number
          total_credits_used: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          available_credits?: number
          total_credits_earned?: number
          total_credits_used?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          available_credits?: number
          total_credits_earned?: number
          total_credits_used?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type: string
          credits: number
          description: string | null
          package_id: string | null
          interview_id: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type: string
          credits: number
          description?: string | null
          package_id?: string | null
          interview_id?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          transaction_type?: string
          credits?: number
          description?: string | null
          package_id?: string | null
          interview_id?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      initialize_user_credits: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      calculate_interview_credits: {
        Args: { duration_minutes: number }
        Returns: number
      }
      check_user_credits: {
        Args: { user_uuid: string; required_credits: number }
        Returns: boolean
      }
      deduct_interview_credits: {
        Args: { user_uuid: string; interview_uuid: string; duration_minutes: number }
        Returns: boolean
      }
      add_user_credits: {
        Args: { user_uuid: string; credits_to_add: number; package_uuid?: string; description?: string }
        Returns: undefined
      }
    }
    Enums: {
      interview_status: "active" | "completed" | "cancelled"
      interview_type: "technical" | "behavioral" | "mixed" | "case-study"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
