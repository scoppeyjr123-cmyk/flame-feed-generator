export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          admin_id: string | null;
          after_data: Json | null;
          before_data: Json | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          metadata: Json;
        };
        Insert: {
          action: string;
          admin_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          metadata?: Json;
        };
        Update: {
          action?: string;
          admin_id?: string | null;
          after_data?: Json | null;
          before_data?: Json | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      checkout_settings: {
        Row: {
          alternate_enabled: boolean;
          alternate_url: string | null;
          created_at: string;
          id: string;
          plan_id: string;
          primary_enabled: boolean;
          primary_url: string | null;
          provider: string | null;
          provider_checkout_id: string | null;
          public_parameters: Json;
          updated_at: string;
        };
        Insert: {
          alternate_enabled?: boolean;
          alternate_url?: string | null;
          created_at?: string;
          id?: string;
          plan_id: string;
          primary_enabled?: boolean;
          primary_url?: string | null;
          provider?: string | null;
          provider_checkout_id?: string | null;
          public_parameters?: Json;
          updated_at?: string;
        };
        Update: {
          alternate_enabled?: boolean;
          alternate_url?: string | null;
          created_at?: string;
          id?: string;
          plan_id?: string;
          primary_enabled?: boolean;
          primary_url?: string | null;
          provider?: string | null;
          provider_checkout_id?: string | null;
          public_parameters?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checkout_settings_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: true;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      episodes: {
        Row: {
          access_type: Database["public"]["Enums"]["episode_access_type"];
          bunny_library_id: number | null;
          bunny_video_id: string | null;
          created_at: string;
          description: string | null;
          duration_seconds: number | null;
          episode_number: number;
          id: string;
          plan_id: string | null;
          scheduled_at: string | null;
          series_id: string;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          thumbnail_url: string | null;
          title: string;
          updated_at: string;
          video_provider: string | null;
          video_url: string | null;
          video_processing_status: string;
          video_encode_progress: number | null;
          video_storage_bytes: number | null;
          video_error: string | null;
          video_ready_at: string | null;
          video_source: string;
          telegram_chat_id: string | null;
          telegram_message_id: number | null;
          telegram_file_id: string | null;
          telegram_import_status: string;
          telegram_import_error: string | null;
        };
        Insert: {
          access_type?: Database["public"]["Enums"]["episode_access_type"];
          bunny_library_id?: number | null;
          bunny_video_id?: string | null;
          created_at?: string;
          description?: string | null;
          duration_seconds?: number | null;
          episode_number: number;
          id?: string;
          plan_id?: string | null;
          scheduled_at?: string | null;
          series_id: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          thumbnail_url?: string | null;
          title: string;
          updated_at?: string;
          video_provider?: string | null;
          video_url?: string | null;
          video_processing_status?: string;
          video_encode_progress?: number | null;
          video_storage_bytes?: number | null;
          video_error?: string | null;
          video_ready_at?: string | null;
          video_source?: string;
          telegram_chat_id?: string | null;
          telegram_message_id?: number | null;
          telegram_file_id?: string | null;
          telegram_import_status?: string;
          telegram_import_error?: string | null;
        };
        Update: {
          access_type?: Database["public"]["Enums"]["episode_access_type"];
          bunny_library_id?: number | null;
          bunny_video_id?: string | null;
          created_at?: string;
          description?: string | null;
          duration_seconds?: number | null;
          episode_number?: number;
          id?: string;
          plan_id?: string | null;
          scheduled_at?: string | null;
          series_id?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          thumbnail_url?: string | null;
          title?: string;
          updated_at?: string;
          video_provider?: string | null;
          video_url?: string | null;
          video_processing_status?: string;
          video_encode_progress?: number | null;
          video_storage_bytes?: number | null;
          video_error?: string | null;
          video_ready_at?: string | null;
          video_source?: string;
          telegram_chat_id?: string | null;
          telegram_message_id?: number | null;
          telegram_file_id?: string | null;
          telegram_import_status?: string;
          telegram_import_error?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "episodes_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "episodes_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
        ];
      };
      home_sections: {
        Row: {
          configuration: Json;
          created_at: string;
          id: string;
          section_key: string;
          section_type: string;
          sort_order: number;
          title: string;
          updated_at: string;
          visible: boolean;
        };
        Insert: {
          configuration?: Json;
          created_at?: string;
          id?: string;
          section_key: string;
          section_type: string;
          sort_order?: number;
          title: string;
          updated_at?: string;
          visible?: boolean;
        };
        Update: {
          configuration?: Json;
          created_at?: string;
          id?: string;
          section_key?: string;
          section_type?: string;
          sort_order?: number;
          title?: string;
          updated_at?: string;
          visible?: boolean;
        };
        Relationships: [];
      };
      media: {
        Row: {
          alt_text: string | null;
          bucket_id: string;
          created_at: string;
          created_by: string | null;
          episode_id: string | null;
          id: string;
          media_type: string;
          mime_type: string | null;
          public_url: string | null;
          series_id: string | null;
          size_bytes: number | null;
          storage_path: string;
        };
        Insert: {
          alt_text?: string | null;
          bucket_id?: string;
          created_at?: string;
          created_by?: string | null;
          episode_id?: string | null;
          id?: string;
          media_type: string;
          mime_type?: string | null;
          public_url?: string | null;
          series_id?: string | null;
          size_bytes?: number | null;
          storage_path: string;
        };
        Update: {
          alt_text?: string | null;
          bucket_id?: string;
          created_at?: string;
          created_by?: string | null;
          episode_id?: string | null;
          id?: string;
          media_type?: string;
          mime_type?: string | null;
          public_url?: string | null;
          series_id?: string | null;
          size_bytes?: number | null;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_episode_id_fkey";
            columns: ["episode_id"];
            isOneToOne: false;
            referencedRelation: "episodes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          active: boolean;
          benefits: Json;
          billing_interval: Database["public"]["Enums"]["billing_interval"];
          created_at: string;
          currency: string;
          description: string | null;
          featured: boolean;
          id: string;
          name: string;
          price: number;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          benefits?: Json;
          billing_interval: Database["public"]["Enums"]["billing_interval"];
          created_at?: string;
          currency?: string;
          description?: string | null;
          featured?: boolean;
          id?: string;
          name: string;
          price: number;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          benefits?: Json;
          billing_interval?: Database["public"]["Enums"]["billing_interval"];
          created_at?: string;
          currency?: string;
          description?: string | null;
          featured?: boolean;
          id?: string;
          name?: string;
          price?: number;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          last_login_at: string | null;
          name: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id: string;
          last_login_at?: string | null;
          name?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          last_login_at?: string | null;
          name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      series: {
        Row: {
          age_rating: string | null;
          banner_url: string | null;
          category: string | null;
          cover_url: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          featured: boolean;
          genre: string | null;
          id: string;
          published_at: string | null;
          short_description: string | null;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          thumbnail_url: string | null;
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          age_rating?: string | null;
          banner_url?: string | null;
          category?: string | null;
          cover_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          featured?: boolean;
          genre?: string | null;
          id?: string;
          published_at?: string | null;
          short_description?: string | null;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          thumbnail_url?: string | null;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          age_rating?: string | null;
          banner_url?: string | null;
          category?: string | null;
          cover_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          featured?: boolean;
          genre?: string | null;
          id?: string;
          published_at?: string | null;
          short_description?: string | null;
          slug?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          thumbnail_url?: string | null;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          content_settings: Json;
          favicon_url: string | null;
          id: boolean;
          institutional_texts: Json;
          logo_url: string | null;
          media_settings: Json;
          platform_name: string;
          public_parameters: Json;
          subscription_settings: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          content_settings?: Json;
          favicon_url?: string | null;
          id?: boolean;
          institutional_texts?: Json;
          logo_url?: string | null;
          media_settings?: Json;
          platform_name?: string;
          public_parameters?: Json;
          subscription_settings?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          content_settings?: Json;
          favicon_url?: string | null;
          id?: boolean;
          institutional_texts?: Json;
          logo_url?: string | null;
          media_settings?: Json;
          platform_name?: string;
          public_parameters?: Json;
          subscription_settings?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      subscription_history: {
        Row: {
          action: string;
          after_data: Json | null;
          before_data: Json | null;
          created_at: string;
          id: string;
          performed_by: string | null;
          subscription_id: string | null;
          user_id: string;
        };
        Insert: {
          action: string;
          after_data?: Json | null;
          before_data?: Json | null;
          created_at?: string;
          id?: string;
          performed_by?: string | null;
          subscription_id?: string | null;
          user_id: string;
        };
        Update: {
          action?: string;
          after_data?: Json | null;
          before_data?: Json | null;
          created_at?: string;
          id?: string;
          performed_by?: string | null;
          subscription_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscription_history_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          created_at: string;
          created_by: string | null;
          expires_at: string | null;
          id: string;
          notes: string | null;
          origin: string;
          plan_id: string | null;
          provider_subscription_id: string | null;
          renews_at: string | null;
          starts_at: string | null;
          status: Database["public"]["Enums"]["subscription_status"];
          updated_at: string;
          updated_by: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          notes?: string | null;
          origin?: string;
          plan_id?: string | null;
          provider_subscription_id?: string | null;
          renews_at?: string | null;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
          updated_by?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          expires_at?: string | null;
          id?: string;
          notes?: string | null;
          origin?: string;
          plan_id?: string | null;
          provider_subscription_id?: string | null;
          renews_at?: string | null;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
          updated_by?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      watch_progress: {
        Row: {
          user_id: string;
          episode_id: string;
          position_seconds: number;
          duration_seconds: number;
          completed: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          episode_id: string;
          position_seconds?: number;
          duration_seconds?: number;
          completed?: boolean;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          episode_id?: string;
          position_seconds?: number;
          duration_seconds?: number;
          completed?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "watch_progress_episode_id_fkey";
            columns: ["episode_id"];
            isOneToOne: false;
            referencedRelation: "episodes";
            referencedColumns: ["id"];
          },
        ];
      };
      watchlist: {
        Row: {
          user_id: string;
          series_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          series_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          series_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "watchlist_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_published_episode_catalog: {
        Args: { target_series_id?: string | null };
        Returns: {
          id: string;
          series_id: string;
          episode_number: number;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          duration_seconds: number | null;
          status: Database["public"]["Enums"]["content_status"];
          access_type: Database["public"]["Enums"]["episode_access_type"];
          plan_id: string | null;
          plan_name: string | null;
          sort_order: number;
        }[];
      };
    };
    Enums: {
      app_role: "admin" | "customer";
      billing_interval: "week" | "month" | "year" | "lifetime";
      content_status: "draft" | "published" | "scheduled" | "hidden";
      episode_access_type: "free" | "subscriber" | "specific_plan";
      subscription_status: "active" | "pending" | "paused" | "cancelled" | "expired" | "lifetime";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
      billing_interval: ["week", "month", "year", "lifetime"],
      content_status: ["draft", "published", "scheduled", "hidden"],
      episode_access_type: ["free", "subscriber", "specific_plan"],
      subscription_status: ["active", "pending", "paused", "cancelled", "expired", "lifetime"],
    },
  },
} as const;
