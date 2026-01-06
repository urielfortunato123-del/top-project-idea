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
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      extracted_entities: {
        Row: {
          ai_suggestion: string | null
          confidence_level: string
          confidence_score: number
          created_at: string
          entity_type: string
          entity_value: string
          id: string
          is_validated: boolean | null
          photo_record_id: string
          updated_at: string
          validated_value: string | null
        }
        Insert: {
          ai_suggestion?: string | null
          confidence_level?: string
          confidence_score?: number
          created_at?: string
          entity_type: string
          entity_value: string
          id?: string
          is_validated?: boolean | null
          photo_record_id: string
          updated_at?: string
          validated_value?: string | null
        }
        Update: {
          ai_suggestion?: string | null
          confidence_level?: string
          confidence_score?: number
          created_at?: string
          entity_type?: string
          entity_value?: string
          id?: string
          is_validated?: boolean | null
          photo_record_id?: string
          updated_at?: string
          validated_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_entities_photo_record_id_fkey"
            columns: ["photo_record_id"]
            isOneToOne: false
            referencedRelation: "photo_records"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_cache: {
        Row: {
          created_at: string
          expires_at: string
          extracted_entities: Json | null
          id: string
          image_hash: string
          ocr_confidence: number | null
          ocr_processed_text: string | null
          ocr_raw_text: string | null
          template_type: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          extracted_entities?: Json | null
          id?: string
          image_hash: string
          ocr_confidence?: number | null
          ocr_processed_text?: string | null
          ocr_raw_text?: string | null
          template_type?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          extracted_entities?: Json | null
          id?: string
          image_hash?: string
          ocr_confidence?: number | null
          ocr_processed_text?: string | null
          ocr_raw_text?: string | null
          template_type?: string | null
        }
        Relationships: []
      }
      ocr_reports: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          overall_confidence: number | null
          photo_record_id: string
          report_data: Json
          report_type: string
          status: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          overall_confidence?: number | null
          photo_record_id: string
          report_data?: Json
          report_type?: string
          status?: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          overall_confidence?: number | null
          photo_record_id?: string
          report_data?: Json
          report_type?: string
          status?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocr_reports_photo_record_id_fkey"
            columns: ["photo_record_id"]
            isOneToOne: false
            referencedRelation: "photo_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocr_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_records: {
        Row: {
          accuracy: number | null
          activity_text: string | null
          company_id: string | null
          company_name: string | null
          created_at: string
          device_timestamp: string
          file_path: string
          file_url: string
          id: string
          latitude: number | null
          longitude: number | null
          ocr_confidence: number | null
          ocr_processed_text: string | null
          ocr_raw_text: string | null
          ocr_status: string | null
          processing_completed_at: string | null
          processing_error: string | null
          processing_started_at: string | null
          project_id: string | null
          project_name: string | null
          server_timestamp: string
          show_stamp: boolean
          status: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          activity_text?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          device_timestamp: string
          file_path: string
          file_url: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          ocr_confidence?: number | null
          ocr_processed_text?: string | null
          ocr_raw_text?: string | null
          ocr_status?: string | null
          processing_completed_at?: string | null
          processing_error?: string | null
          processing_started_at?: string | null
          project_id?: string | null
          project_name?: string | null
          server_timestamp?: string
          show_stamp?: boolean
          status?: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          accuracy?: number | null
          activity_text?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          device_timestamp?: string
          file_path?: string
          file_url?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          ocr_confidence?: number | null
          ocr_processed_text?: string | null
          ocr_raw_text?: string | null
          ocr_status?: string | null
          processing_completed_at?: string | null
          processing_error?: string | null
          processing_started_at?: string | null
          project_id?: string | null
          project_name?: string | null
          server_timestamp?: string
          show_stamp?: boolean
          status?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_records_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      rdo_equipment: {
        Row: {
          created_at: string
          equipment_name: string
          id: string
          is_contracted: boolean | null
          quantity: number
          rdo_id: string
        }
        Insert: {
          created_at?: string
          equipment_name: string
          id?: string
          is_contracted?: boolean | null
          quantity?: number
          rdo_id: string
        }
        Update: {
          created_at?: string
          equipment_name?: string
          id?: string
          is_contracted?: boolean | null
          quantity?: number
          rdo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rdo_equipment_rdo_id_fkey"
            columns: ["rdo_id"]
            isOneToOne: false
            referencedRelation: "rdo_records"
            referencedColumns: ["id"]
          },
        ]
      }
      rdo_occurrences: {
        Row: {
          complement: string | null
          created_at: string
          description: string
          end_time: string | null
          id: string
          impact_hours: number | null
          rdo_id: string
          start_time: string | null
        }
        Insert: {
          complement?: string | null
          created_at?: string
          description: string
          end_time?: string | null
          id?: string
          impact_hours?: number | null
          rdo_id: string
          start_time?: string | null
        }
        Update: {
          complement?: string | null
          created_at?: string
          description?: string
          end_time?: string | null
          id?: string
          impact_hours?: number | null
          rdo_id?: string
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rdo_occurrences_rdo_id_fkey"
            columns: ["rdo_id"]
            isOneToOne: false
            referencedRelation: "rdo_records"
            referencedColumns: ["id"]
          },
        ]
      }
      rdo_records: {
        Row: {
          company_id: string
          condition_afternoon: string | null
          condition_morning: string | null
          condition_night: string | null
          contract_number: string | null
          created_at: string
          date: string
          id: string
          is_work_day: boolean
          observations: string | null
          project_id: string
          status: string
          updated_at: string
          user_id: string
          weather_afternoon: string | null
          weather_morning: string | null
          weather_night: string | null
          work_end_time: string | null
          work_start_time: string | null
        }
        Insert: {
          company_id: string
          condition_afternoon?: string | null
          condition_morning?: string | null
          condition_night?: string | null
          contract_number?: string | null
          created_at?: string
          date: string
          id?: string
          is_work_day?: boolean
          observations?: string | null
          project_id: string
          status?: string
          updated_at?: string
          user_id: string
          weather_afternoon?: string | null
          weather_morning?: string | null
          weather_night?: string | null
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Update: {
          company_id?: string
          condition_afternoon?: string | null
          condition_morning?: string | null
          condition_night?: string | null
          contract_number?: string | null
          created_at?: string
          date?: string
          id?: string
          is_work_day?: boolean
          observations?: string | null
          project_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          weather_afternoon?: string | null
          weather_morning?: string | null
          weather_night?: string | null
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rdo_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rdo_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rdo_workers: {
        Row: {
          created_at: string
          id: string
          quantity: number
          rdo_id: string
          role_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number
          rdo_id: string
          role_name: string
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          rdo_id?: string
          role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "rdo_workers_rdo_id_fkey"
            columns: ["rdo_id"]
            isOneToOne: false
            referencedRelation: "rdo_records"
            referencedColumns: ["id"]
          },
        ]
      }
      template_configs: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          id: string
          template_id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value?: Json
          created_at?: string
          id?: string
          template_id: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          id?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_configs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_projects: {
        Row: {
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      cleanup_expired_ocr_cache: { Args: never; Returns: number }
      has_project_access: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
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
      app_role: "admin" | "colaborador"
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
      app_role: ["admin", "colaborador"],
    },
  },
} as const
