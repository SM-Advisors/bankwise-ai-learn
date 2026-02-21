export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_memories: {
        Row: {
          content: string
          context: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_pinned: boolean | null
          source: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          context?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_pinned?: boolean | null
          source?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          context?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_pinned?: boolean | null
          source?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_user_preferences: {
        Row: {
          additional_instructions: string | null
          created_at: string | null
          formatting_preference: string | null
          id: string
          role_context: string | null
          tone: string | null
          updated_at: string | null
          user_id: string
          verbosity: string | null
        }
        Insert: {
          additional_instructions?: string | null
          created_at?: string | null
          formatting_preference?: string | null
          id?: string
          role_context?: string | null
          tone?: string | null
          updated_at?: string | null
          user_id: string
          verbosity?: string | null
        }
        Update: {
          additional_instructions?: string | null
          created_at?: string | null
          formatting_preference?: string | null
          id?: string
          role_context?: string | null
          tone?: string | null
          updated_at?: string | null
          user_id?: string
          verbosity?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      bank_policies: {
        Row: {
          content: string
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          policy_type: string
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          policy_type: string
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          policy_type?: string
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          event_type: string
          id: string
          instructor: string | null
          is_active: boolean | null
          live_session_id: string | null
          location: string | null
          max_attendees: number | null
          scheduled_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          event_type: string
          id?: string
          instructor?: string | null
          is_active?: boolean | null
          live_session_id?: string | null
          location?: string | null
          max_attendees?: number | null
          scheduled_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          event_type?: string
          id?: string
          instructor?: string | null
          is_active?: boolean | null
          live_session_id?: string | null
          location?: string | null
          max_attendees?: number | null
          scheduled_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_live_session_id_fkey"
            columns: ["live_session_id"]
            isOneToOne: false
            referencedRelation: "live_training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_content_chunks: {
        Row: {
          chunk_index: number
          created_at: string
          id: string
          lesson_id: string
          metadata: Json | null
          module_id: string | null
          source: string | null
          text: string
          updated_at: string
        }
        Insert: {
          chunk_index?: number
          created_at?: string
          id?: string
          lesson_id: string
          metadata?: Json | null
          module_id?: string | null
          source?: string | null
          text: string
          updated_at?: string
        }
        Update: {
          chunk_index?: number
          created_at?: string
          id?: string
          lesson_id?: string
          metadata?: Json | null
          module_id?: string | null
          source?: string | null
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_training_sessions: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          instructor: string
          is_active: boolean
          max_attendees: number | null
          scheduled_date: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor: string
          is_active?: boolean
          max_attendees?: number | null
          scheduled_date: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor?: string
          is_active?: boolean
          max_attendees?: number | null
          scheduled_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      practice_conversations: {
        Row: {
          created_at: string
          id: string
          is_submitted: boolean
          messages: Json
          module_id: string
          session_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_submitted?: boolean
          messages?: Json
          module_id: string
          session_id: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_submitted?: boolean
          messages?: Json
          module_id?: string
          session_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_events: {
        Row: {
          created_at: string | null
          event_type: string
          exception_flag: boolean | null
          exception_type: string | null
          id: string
          module_id: string | null
          session_id: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          exception_flag?: boolean | null
          exception_type?: string | null
          id?: string
          module_id?: string | null
          session_id?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          exception_flag?: boolean | null
          exception_type?: string | null
          id?: string
          module_id?: string | null
          session_id?: number | null
          user_id?: string
        }
        Relationships: []
      }
      training_progress: {
        Row: {
          created_at: string | null
          id: string
          session_1_completed: boolean | null
          session_1_progress: Json | null
          session_2_completed: boolean | null
          session_2_progress: Json | null
          session_3_completed: boolean | null
          session_3_progress: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_1_completed?: boolean | null
          session_1_progress?: Json | null
          session_2_completed?: boolean | null
          session_2_progress?: Json | null
          session_3_completed?: boolean | null
          session_3_progress?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          session_1_completed?: boolean | null
          session_1_progress?: Json | null
          session_2_completed?: boolean | null
          session_2_progress?: Json | null
          session_3_completed?: boolean | null
          session_3_progress?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_ideas: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          id: string
          roi_impact: string | null
          status: string
          submitter_department: string | null
          submitter_name: string | null
          title: string
          updated_at: string | null
          user_id: string
          votes: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          roi_impact?: string | null
          status?: string
          submitter_department?: string | null
          submitter_name?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          votes?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          roi_impact?: string | null
          status?: string
          submitter_department?: string | null
          submitter_name?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          votes?: number | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          ai_proficiency_level: number | null
          bank_role: string | null
          created_at: string | null
          current_session: number | null
          display_name: string | null
          employer_bank_name: string | null
          id: string
          learning_style:
            | Database["public"]["Enums"]["learning_style_type"]
            | null
          line_of_business:
            | Database["public"]["Enums"]["line_of_business"]
            | null
          onboarding_completed: boolean | null
          tech_learning_style:
            | Database["public"]["Enums"]["learning_style_type"]
            | null
          tour_completed: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_proficiency_level?: number | null
          bank_role?: string | null
          created_at?: string | null
          current_session?: number | null
          display_name?: string | null
          employer_bank_name?: string | null
          id?: string
          learning_style?:
            | Database["public"]["Enums"]["learning_style_type"]
            | null
          line_of_business?:
            | Database["public"]["Enums"]["line_of_business"]
            | null
          onboarding_completed?: boolean | null
          tech_learning_style?:
            | Database["public"]["Enums"]["learning_style_type"]
            | null
          tour_completed?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_proficiency_level?: number | null
          bank_role?: string | null
          created_at?: string | null
          current_session?: number | null
          display_name?: string | null
          employer_bank_name?: string | null
          id?: string
          learning_style?:
            | Database["public"]["Enums"]["learning_style_type"]
            | null
          line_of_business?:
            | Database["public"]["Enums"]["line_of_business"]
            | null
          onboarding_completed?: boolean | null
          tech_learning_style?:
            | Database["public"]["Enums"]["learning_style_type"]
            | null
          tour_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      learning_style_type:
        | "example-based"
        | "explanation-based"
        | "hands-on"
        | "logic-based"
      line_of_business:
        | "accounting_finance"
        | "credit_administration"
        | "executive_leadership"
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
  public: {
    Enums: {
      app_role: ["admin", "user"],
      learning_style_type: [
        "example-based",
        "explanation-based",
        "hands-on",
        "logic-based",
      ],
      line_of_business: [
        "accounting_finance",
        "credit_administration",
        "executive_leadership",
      ],
    },
  },
} as const
