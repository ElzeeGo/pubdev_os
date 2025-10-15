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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_preview: string
          last_used_at: string | null
          name: string
          organization_id: string
          project_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_preview: string
          last_used_at?: string | null
          name: string
          organization_id: string
          project_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_preview?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_balances: {
        Row: {
          balance_usd: number
          created_at: string | null
          id: string
          organization_id: string
          total_generations: number | null
          total_images: number | null
          total_purchased_usd: number | null
          total_spent_usd: number | null
          total_tokens: number | null
          total_videos: number | null
          updated_at: string | null
        }
        Insert: {
          balance_usd?: number
          created_at?: string | null
          id?: string
          organization_id: string
          total_generations?: number | null
          total_images?: number | null
          total_purchased_usd?: number | null
          total_spent_usd?: number | null
          total_tokens?: number | null
          total_videos?: number | null
          updated_at?: string | null
        }
        Update: {
          balance_usd?: number
          created_at?: string | null
          id?: string
          organization_id?: string
          total_generations?: number | null
          total_images?: number | null
          total_purchased_usd?: number | null
          total_spent_usd?: number | null
          total_tokens?: number | null
          total_videos?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_balances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_purchases: {
        Row: {
          amount_usd: number
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string
          payment_id: string | null
          payment_method: string | null
          status: string
        }
        Insert: {
          amount_usd: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          payment_id?: string | null
          payment_method?: string | null
          status?: string
        }
        Update: {
          amount_usd?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          payment_id?: string | null
          payment_method?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_purchases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      drafts: {
        Row: {
          context: Json
          created_at: string
          created_by: string
          id: string
          images: Json | null
          project_id: string
          range: string | null
          scan_id: string | null
          status: string
          updated_at: string
          variants: Json
          videos: Json | null
        }
        Insert: {
          context?: Json
          created_at?: string
          created_by: string
          id?: string
          images?: Json | null
          project_id: string
          range?: string | null
          scan_id?: string | null
          status?: string
          updated_at?: string
          variants?: Json
          videos?: Json | null
        }
        Update: {
          context?: Json
          created_at?: string
          created_by?: string
          id?: string
          images?: Json | null
          project_id?: string
          range?: string | null
          scan_id?: string | null
          status?: string
          updated_at?: string
          variants?: Json
          videos?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "drafts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drafts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drafts_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_logs: {
        Row: {
          completion_tokens: number | null
          cost_usd: number
          created_at: string | null
          draft_id: string | null
          duration_ms: number
          error: string | null
          id: string
          images_generated: number | null
          metadata: Json | null
          model: string
          organization_id: string
          project_id: string
          prompt_tokens: number | null
          scan_id: string | null
          status: string
          total_tokens: number | null
          type: string
          user_id: string
          video_seconds: number | null
          videos_generated: number | null
        }
        Insert: {
          completion_tokens?: number | null
          cost_usd?: number
          created_at?: string | null
          draft_id?: string | null
          duration_ms: number
          error?: string | null
          id?: string
          images_generated?: number | null
          metadata?: Json | null
          model: string
          organization_id: string
          project_id: string
          prompt_tokens?: number | null
          scan_id?: string | null
          status?: string
          total_tokens?: number | null
          type: string
          user_id: string
          video_seconds?: number | null
          videos_generated?: number | null
        }
        Update: {
          completion_tokens?: number | null
          cost_usd?: number
          created_at?: string | null
          draft_id?: string | null
          duration_ms?: number
          error?: string | null
          id?: string
          images_generated?: number | null
          metadata?: Json | null
          model?: string
          organization_id?: string
          project_id?: string
          prompt_tokens?: number | null
          scan_id?: string | null
          status?: string
          total_tokens?: number | null
          type?: string
          user_id?: string
          video_seconds?: number | null
          videos_generated?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "generation_logs_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_logs_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      identities: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          oauth1a_secret: string | null
          oauth1a_token: string | null
          provider: string
          provider_user: string
          refresh_token: string | null
          scopes: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: string
          oauth1a_secret?: string | null
          oauth1a_token?: string | null
          provider: string
          provider_user: string
          refresh_token?: string | null
          scopes?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          oauth1a_secret?: string | null
          oauth1a_token?: string | null
          provider?: string
          provider_user?: string
          refresh_token?: string | null
          scopes?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_state: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          state: Json
        }
        Insert: {
          created_at?: string
          expires_at: string
          id: string
          state: Json
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          state?: Json
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          created_at: string
          created_by: string
          draft_id: string | null
          error: string | null
          id: string
          media_ids: string[]
          permalink: string | null
          project_id: string
          provider: string
          status: string
          text: string
          updated_at: string
          variant_pick: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          draft_id?: string | null
          error?: string | null
          id?: string
          media_ids?: string[]
          permalink?: string | null
          project_id: string
          provider: string
          status?: string
          text: string
          updated_at?: string
          variant_pick?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          draft_id?: string | null
          error?: string | null
          id?: string
          media_ids?: string[]
          permalink?: string | null
          project_id?: string
          provider?: string
          status?: string
          text?: string
          updated_at?: string
          variant_pick?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_config: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          model: string
          price_per_image: number | null
          price_per_million_completion_tokens: number | null
          price_per_million_prompt_tokens: number | null
          price_per_video_base: number | null
          price_per_video_second: number | null
          provider: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          model: string
          price_per_image?: number | null
          price_per_million_completion_tokens?: number | null
          price_per_million_prompt_tokens?: number | null
          price_per_video_base?: number | null
          price_per_video_second?: number | null
          provider: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          model?: string
          price_per_image?: number | null
          price_per_million_completion_tokens?: number | null
          price_per_million_prompt_tokens?: number | null
          price_per_video_base?: number | null
          price_per_video_second?: number | null
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          settings: Json
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          settings?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          settings?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scans: {
        Row: {
          api_key_id: string | null
          changes: Json
          commit_author: string | null
          commit_message: string | null
          commit_sha: string
          commit_timestamp: string | null
          created_at: string | null
          error: string | null
          features: Json
          id: string
          processed_at: string | null
          project_id: string
          status: string
        }
        Insert: {
          api_key_id?: string | null
          changes?: Json
          commit_author?: string | null
          commit_message?: string | null
          commit_sha: string
          commit_timestamp?: string | null
          created_at?: string | null
          error?: string | null
          features?: Json
          id?: string
          processed_at?: string | null
          project_id: string
          status?: string
        }
        Update: {
          api_key_id?: string | null
          changes?: Json
          commit_author?: string | null
          commit_message?: string | null
          commit_sha?: string
          commit_timestamp?: string | null
          created_at?: string | null
          error?: string | null
          features?: Json
          id?: string
          processed_at?: string | null
          project_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scans_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          how_found_us: string | null
          id: string
          name: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          primary_use_case: string | null
          role: string | null
          settings: Json
          team_size: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          how_found_us?: string | null
          id: string
          name?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          primary_use_case?: string | null
          role?: string | null
          settings?: Json
          team_size?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          how_found_us?: string | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          primary_use_case?: string | null
          role?: string | null
          settings?: Json
          team_size?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount_usd: number
          p_organization_id: string
          p_purchase_id: string
        }
        Returns: undefined
      }
      calculate_image_generation_cost: {
        Args: { p_images_count: number; p_model: string }
        Returns: number
      }
      calculate_text_generation_cost: {
        Args: {
          p_completion_tokens: number
          p_model: string
          p_prompt_tokens: number
        }
        Returns: number
      }
      calculate_video_generation_cost: {
        Args: {
          p_model: string
          p_video_count: number
          p_video_seconds?: number
        }
        Returns: number
      }
      check_credits_available: {
        Args: { p_estimated_cost?: number; p_organization_id: string }
        Returns: boolean
      }
      check_quota_available: {
        Args: { p_organization_id: string; p_type?: string }
        Returns: boolean
      }
      cleanup_expired_oauth_states: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_organization_with_membership: {
        Args: { org_name: string; org_slug: string; user_id: string }
        Returns: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }[]
      }
      reset_monthly_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
    Enums: {},
  },
} as const
