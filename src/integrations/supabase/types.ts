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
      admin_andrea_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          organization_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          organization_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          organization_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_andrea_conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_andrea_notes: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          summary: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          summary: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_andrea_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_test_conversations: {
        Row: {
          agent_id: string
          created_at: string
          evaluation_notes: string | null
          id: string
          messages: Json
          result: string | null
          test_type: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          evaluation_notes?: string | null
          id?: string
          messages?: Json
          result?: string | null
          test_type?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          evaluation_notes?: string | null
          id?: string
          messages?: Json
          result?: string | null
          test_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_test_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "user_agents"
            referencedColumns: ["id"]
          },
        ]
      }
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
      andrea_trigger_log: {
        Row: {
          dismissed: boolean
          engaged: boolean
          id: string
          surfaced_at: string
          trigger_context: Json
          trigger_type: string
          user_id: string
        }
        Insert: {
          dismissed?: boolean
          engaged?: boolean
          id?: string
          surfaced_at?: string
          trigger_context?: Json
          trigger_type: string
          user_id: string
        }
        Update: {
          dismissed?: boolean
          engaged?: boolean
          id?: string
          surfaced_at?: string
          trigger_context?: Json
          trigger_type?: string
          user_id?: string
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
          source_file_path: string | null
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
          source_file_path?: string | null
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
          source_file_path?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_type: string
          created_at: string
          earned_at: string
          id: string
          metadata: Json | null
          session_id: number
          user_id: string
        }
        Insert: {
          certificate_type?: string
          created_at?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          session_id: number
          user_id: string
        }
        Update: {
          certificate_type?: string
          created_at?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          session_id?: number
          user_id?: string
        }
        Relationships: []
      }
      community_replies: {
        Row: {
          author_name: string
          author_role: string | null
          body: string
          created_at: string
          id: string
          topic_id: string
          user_id: string
        }
        Insert: {
          author_name: string
          author_role?: string | null
          body: string
          created_at?: string
          id?: string
          topic_id: string
          user_id: string
        }
        Update: {
          author_name?: string
          author_role?: string | null
          body?: string
          created_at?: string
          id?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "community_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      community_topics: {
        Row: {
          author_name: string
          author_role: string | null
          body: string
          category: string
          created_at: string
          id: string
          linked_content_id: string | null
          linked_content_type: string | null
          reply_count: number
          source_type: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name: string
          author_role?: string | null
          body: string
          category?: string
          created_at?: string
          id?: string
          linked_content_id?: string | null
          linked_content_type?: string | null
          reply_count?: number
          source_type?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string
          author_role?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          linked_content_id?: string | null
          linked_content_type?: string | null
          reply_count?: number
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dashboard_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      department_roles: {
        Row: {
          created_at: string
          department_id: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          department_id: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          department_id?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          industry_id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          industry_id: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          industry_id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
        ]
      }
      elective_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          module_id: string
          path_id: string
          progress_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id: string
          path_id: string
          progress_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string
          path_id?: string
          progress_data?: Json | null
          updated_at?: string
          user_id?: string
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
      executive_submissions: {
        Row: {
          body: string
          community_topic_id: string | null
          created_at: string
          department_id: string | null
          id: string
          idea_id: string | null
          preview_generated_at: string | null
          preview_html: string | null
          preview_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          submission_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          community_topic_id?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          idea_id?: string | null
          preview_generated_at?: string | null
          preview_html?: string | null
          preview_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          submission_type?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          community_topic_id?: string | null
          created_at?: string
          department_id?: string | null
          id?: string
          idea_id?: string | null
          preview_generated_at?: string | null
          preview_html?: string | null
          preview_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          submission_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_submissions_community_topic_id_fkey"
            columns: ["community_topic_id"]
            isOneToOne: false
            referencedRelation: "community_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_submissions_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "user_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_module_content: {
        Row: {
          content: Json
          created_at: string
          department_slug: string
          id: string
          industry_slug: string
          module_id: string
          org_id: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          department_slug: string
          id?: string
          industry_slug: string
          module_id: string
          org_id: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          department_slug?: string
          id?: string
          industry_slug?: string
          module_id?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_module_content_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      industries: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_content_chunks: {
        Row: {
          chunk_index: number
          created_at: string
          embedding: string | null
          id: string
          learning_style: string | null
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
          embedding?: string | null
          id?: string
          learning_style?: string | null
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
          embedding?: string | null
          id?: string
          learning_style?: string | null
          lesson_id?: string
          metadata?: Json | null
          module_id?: string | null
          source?: string | null
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      level_change_requests: {
        Row: {
          created_at: string
          current_level: string
          evidence_summary: string
          expires_at: string
          id: string
          proposed_level: string
          rationale: string
          responded_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level: string
          evidence_summary: string
          expires_at?: string
          id?: string
          proposed_level: string
          rationale: string
          responded_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: string
          evidence_summary?: string
          expires_at?: string
          id?: string
          proposed_level?: string
          rationale?: string
          responded_at?: string | null
          status?: string
          user_id?: string
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
      org_resources: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          organization_id: string
          resource_type: string
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          resource_type?: string
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          resource_type?: string
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_resources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          allowed_models: Json | null
          audience_type: string | null
          created_at: string
          id: string
          industry: string | null
          name: string
          org_type: string | null
          platform: string
          slug: string
        }
        Insert: {
          allowed_models?: Json | null
          audience_type?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          org_type?: string | null
          platform?: string
          slug: string
        }
        Update: {
          allowed_models?: Json | null
          audience_type?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          org_type?: string | null
          platform?: string
          slug?: string
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
      proficiency_responses: {
        Row: {
          assessment_version: string | null
          computed_score: number
          confidence_level: number
          created_at: string
          id: string
          performance_scores: Json
          self_report_answers: Json
          user_id: string
        }
        Insert: {
          assessment_version?: string | null
          computed_score?: number
          confidence_level?: number
          created_at?: string
          id?: string
          performance_scores?: Json
          self_report_answers?: Json
          user_id: string
        }
        Update: {
          assessment_version?: string | null
          computed_score?: number
          confidence_level?: number
          created_at?: string
          id?: string
          performance_scores?: Json
          self_report_answers?: Json
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
      rate_limit_events: {
        Row: {
          created_at: string
          function_name: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      registration_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string
          current_uses: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          organization_id: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          current_uses?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          organization_id: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          current_uses?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_codes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      response_feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          message_index: number | null
          message_preview: string | null
          module_id: string | null
          rating: number
          session_id: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          message_index?: number | null
          message_preview?: string | null
          module_id?: string | null
          rating: number
          session_id?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          message_index?: number | null
          message_preview?: string | null
          module_id?: string | null
          rating?: number
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      retrieval_responses: {
        Row: {
          id: string
          module_id: string
          quality: number
          question_id: string
          response: string | null
          seen_at: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          module_id: string
          quality: number
          question_id: string
          response?: string | null
          seen_at?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          module_id?: string
          quality?: number
          question_id?: string
          response?: string | null
          seen_at?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      skill_observations: {
        Row: {
          created_at: string
          evidence: string
          id: string
          module_id: string | null
          observed_level: string
          observed_skill: string
          session_number: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          evidence: string
          id?: string
          module_id?: string | null
          observed_level: string
          observed_skill: string
          session_number?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          evidence?: string
          id?: string
          module_id?: string | null
          observed_level?: string
          observed_skill?: string
          session_number?: number | null
          user_id?: string
        }
        Relationships: []
      }
      submission_scores: {
        Row: {
          attempt_number: number | null
          created_at: string
          id: string
          module_id: string | null
          scores: Json
          session_id: string
          summary: string | null
          user_id: string
        }
        Insert: {
          attempt_number?: number | null
          created_at?: string
          id?: string
          module_id?: string | null
          scores: Json
          session_id: string
          summary?: string | null
          user_id: string
        }
        Update: {
          attempt_number?: number | null
          created_at?: string
          id?: string
          module_id?: string | null
          scores?: Json
          session_id?: string
          summary?: string | null
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
          session_3_skill_created: boolean | null
          session_4_completed: boolean | null
          session_4_progress: Json | null
          session_5_completed: boolean | null
          session_5_progress: Json | null
          session_6_completed: boolean | null
          session_6_completed_at: string | null
          session_6_progress: Json | null
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
          session_3_skill_created?: boolean | null
          session_4_completed?: boolean | null
          session_4_progress?: Json | null
          session_5_completed?: boolean | null
          session_5_progress?: Json | null
          session_6_completed?: boolean | null
          session_6_completed_at?: string | null
          session_6_progress?: Json | null
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
          session_3_skill_created?: boolean | null
          session_4_completed?: boolean | null
          session_4_progress?: Json | null
          session_5_completed?: boolean | null
          session_5_progress?: Json | null
          session_6_completed?: boolean | null
          session_6_completed_at?: string | null
          session_6_progress?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_agents: {
        Row: {
          created_at: string
          deployed_at: string | null
          description: string | null
          id: string
          is_deployed: boolean
          is_shared: boolean
          last_test_results: Json | null
          name: string
          parent_version_id: string | null
          shared_at: string | null
          status: string
          system_prompt: string
          template_data: Json
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          deployed_at?: string | null
          description?: string | null
          id?: string
          is_deployed?: boolean
          is_shared?: boolean
          last_test_results?: Json | null
          name?: string
          parent_version_id?: string | null
          shared_at?: string | null
          status?: string
          system_prompt?: string
          template_data?: Json
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          deployed_at?: string | null
          description?: string | null
          id?: string
          is_deployed?: boolean
          is_shared?: boolean
          last_test_results?: Json | null
          name?: string
          parent_version_id?: string | null
          shared_at?: string | null
          status?: string
          system_prompt?: string
          template_data?: Json
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_agents_parent_version_id_fkey"
            columns: ["parent_version_id"]
            isOneToOne: false
            referencedRelation: "user_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          created_at: string
          file_data: string | null
          file_name: string | null
          file_type: string | null
          id: string
          message: string | null
          status: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string
          file_data?: string | null
          file_name?: string | null
          file_type?: string | null
          id?: string
          message?: string | null
          status?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string
          file_data?: string | null
          file_name?: string | null
          file_type?: string | null
          id?: string
          message?: string | null
          status?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      user_ideas: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          id: string
          linked_agent_id: string | null
          preview_generated_at: string | null
          preview_html: string | null
          preview_status: string
          roi_impact: string | null
          source: string
          source_context: string | null
          status: string
          submitted_to_exec: boolean
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
          linked_agent_id?: string | null
          preview_generated_at?: string | null
          preview_html?: string | null
          preview_status?: string
          roi_impact?: string | null
          source?: string
          source_context?: string | null
          status?: string
          submitted_to_exec?: boolean
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
          linked_agent_id?: string | null
          preview_generated_at?: string | null
          preview_html?: string | null
          preview_status?: string
          roi_impact?: string | null
          source?: string
          source_context?: string | null
          status?: string
          submitted_to_exec?: boolean
          submitter_department?: string | null
          submitter_name?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_ideas_linked_agent_id_fkey"
            columns: ["linked_agent_id"]
            isOneToOne: false
            referencedRelation: "user_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          ai_proficiency_level: number | null
          created_at: string | null
          current_session: number | null
          department: string | null
          department_id: string | null
          display_name: string | null
          employer_name: string | null
          id: string
          intake_motivation: string[] | null
          intake_orientation: string | null
          intake_responses: Json | null
          intake_role_key: string | null
          interests: string[] | null
          is_active: boolean
          is_super_admin: boolean
          job_role: string | null
          last_login_at: string | null
          learning_style:
            | Database["public"]["Enums"]["learning_style_type"]
            | null
          onboarding_completed: boolean | null
          organization_id: string | null
          preferred_model: string | null
          safe_use_flag: boolean | null
          tech_learning_style:
            | Database["public"]["Enums"]["learning_style_type"]
            | null
          tour_completed: boolean | null
          tours_completed: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_proficiency_level?: number | null
          created_at?: string | null
          current_session?: number | null
          department?: string | null
          department_id?: string | null
          display_name?: string | null
          employer_name?: string | null
          id?: string
          intake_motivation?: string[] | null
          intake_orientation?: string | null
          intake_responses?: Json | null
          intake_role_key?: string | null
          interests?: string[] | null
          is_active?: boolean
          is_super_admin?: boolean
          job_role?: string | null
          last_login_at?: string | null
          learning_style?:
            | Database["public"]["Enums"]["learning_style_type"]
            | null
          onboarding_completed?: boolean | null
          organization_id?: string | null
          preferred_model?: string | null
          safe_use_flag?: boolean | null
          tech_learning_style?:
            | Database["public"]["Enums"]["learning_style_type"]
            | null
          tour_completed?: boolean | null
          tours_completed?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_proficiency_level?: number | null
          created_at?: string | null
          current_session?: number | null
          department?: string | null
          department_id?: string | null
          display_name?: string | null
          employer_name?: string | null
          id?: string
          intake_motivation?: string[] | null
          intake_orientation?: string | null
          intake_responses?: Json | null
          intake_role_key?: string | null
          interests?: string[] | null
          is_active?: boolean
          is_super_admin?: boolean
          job_role?: string | null
          last_login_at?: string | null
          learning_style?:
            | Database["public"]["Enums"]["learning_style_type"]
            | null
          onboarding_completed?: boolean | null
          organization_id?: string | null
          preferred_model?: string | null
          safe_use_flag?: boolean | null
          tech_learning_style?:
            | Database["public"]["Enums"]["learning_style_type"]
            | null
          tour_completed?: boolean | null
          tours_completed?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_prompts: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_favorite: boolean | null
          metadata: Json | null
          source: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          metadata?: Json | null
          source?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          metadata?: Json | null
          source?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
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
      user_workflows: {
        Row: {
          created_at: string
          description: string | null
          id: string
          module_id: string | null
          name: string
          status: string
          test_results: Json | null
          updated_at: string
          user_id: string
          workflow_data: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          module_id?: string | null
          name?: string
          status?: string
          test_results?: Json | null
          updated_at?: string
          user_id: string
          workflow_data?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          module_id?: string | null
          name?: string
          status?: string
          test_results?: Json | null
          updated_at?: string
          user_id?: string
          workflow_data?: Json
        }
        Relationships: []
      }
      value_signals: {
        Row: {
          created_at: string
          id: string
          org_id: string | null
          signal_data: Json
          signal_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id?: string | null
          signal_data?: Json
          signal_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string | null
          signal_data?: Json
          signal_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "value_signals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_org_id: { Args: never; Returns: string }
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
      is_super_admin: { Args: never; Returns: boolean }
      match_lesson_chunks: {
        Args: {
          filter_learning_style?: string
          filter_lesson_id?: string
          filter_module_id?: string
          match_count?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          id: string
          metadata: Json
          similarity: number
          source: string
          text: string
        }[]
      }
      validate_registration_code: {
        Args: { input_code: string }
        Returns: Json
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
