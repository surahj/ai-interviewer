export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      interview_sessions: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          interview_id: string | null
          is_active: boolean | null
          session_token: string
          system_prompt: string
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          interview_id?: string | null
          is_active?: boolean | null
          session_token: string
          system_prompt: string
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          interview_id?: string | null
          is_active?: boolean | null
          session_token?: string
          system_prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          candidate_name: string | null
          completed_at: string | null
          created_at: string | null
          custom_requirements: string | null
          duration: number
          feedback: Json | null
          focus_area: string
          id: string
          interview_type: Database["public"]["Enums"]["interview_type"]
          level: string
          role: string
          status: Database["public"]["Enums"]["interview_status"] | null
          total_questions: number
          transcript: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          candidate_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          custom_requirements?: string | null
          duration?: number
          feedback?: Json | null
          focus_area?: string
          id?: string
          interview_type?: Database["public"]["Enums"]["interview_type"]
          level: string
          role: string
          status?: Database["public"]["Enums"]["interview_status"] | null
          total_questions?: number
          transcript?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          candidate_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          custom_requirements?: string | null
          duration?: number
          feedback?: Json | null
          focus_area?: string
          id?: string
          interview_type?: Database["public"]["Enums"]["interview_type"]
          level?: string
          role?: string
          status?: Database["public"]["Enums"]["interview_status"] | null
          total_questions?: number
          transcript?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          category: Database["public"]["Enums"]["question_category"]
          created_at: string | null
          difficulty: number
          id: string
          level: string
          question: string
          role: string
          tags: string[] | null
          type: Database["public"]["Enums"]["interview_type"]
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["question_category"]
          created_at?: string | null
          difficulty: number
          id?: string
          level: string
          question: string
          role: string
          tags?: string[] | null
          type: Database["public"]["Enums"]["interview_type"]
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["question_category"]
          created_at?: string | null
          difficulty?: number
          id?: string
          level?: string
          question?: string
          role?: string
          tags?: string[] | null
          type?: Database["public"]["Enums"]["interview_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          experience_level: string | null
          full_name: string | null
          id: string
          preferred_role: string | null
          skills: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          experience_level?: string | null
          full_name?: string | null
          id: string
          preferred_role?: string | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          experience_level?: string | null
          full_name?: string | null
          id?: string
          preferred_role?: string | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_interview_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_interviews: number
          average_duration: number
          completed_interviews: number
          most_common_role: string
          total_interviews: number
        }[]
      }
      get_questions_by_role_level: {
        Args: {
          p_level: string
          p_limit?: number
          p_role: string
          p_type?: Database["public"]["Enums"]["interview_type"]
        }
        Returns: {
          category: Database["public"]["Enums"]["question_category"]
          difficulty: number
          id: string
          question: string
          type: Database["public"]["Enums"]["interview_type"]
        }[]
      }
      get_user_interview_stats: {
        Args: { user_uuid: string }
        Returns: {
          average_score: number
          completed_interviews: number
          total_duration: number
          total_interviews: number
        }[]
      }
    }
    Enums: {
      interview_status: "active" | "completed" | "cancelled"
      interview_type: "technical" | "behavioral" | "mixed" | "case-study"
      question_category:
        | "technical"
        | "behavioral"
        | "problem-solving"
        | "communication"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      interview_status: ["active", "completed", "cancelled"],
      interview_type: ["technical", "behavioral", "mixed", "case-study"],
      question_category: [
        "technical",
        "behavioral",
        "problem-solving",
        "communication",
      ],
    },
  },
} as const

