export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_type: string | null
          created_at: string
          duration: number | null
          end_time: string
          google_event_id: string | null
          id: string
          notes: string | null
          patient_id: string | null
          start_time: string
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          appointment_type?: string | null
          created_at?: string
          duration?: number | null
          end_time: string
          google_event_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          start_time: string
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          appointment_type?: string | null
          created_at?: string
          duration?: number | null
          end_time?: string
          google_event_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          start_time?: string
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          content: string
          created_at: string | null
          id: string
          jid: string
          role: string
          status: string | null
          tenant_id: string | null
          whatsapp_instance: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          jid: string
          role: string
          status?: string | null
          tenant_id?: string | null
          whatsapp_instance?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          jid?: string
          role?: string
          status?: string | null
          tenant_id?: string | null
          whatsapp_instance?: string | null
        }
        Relationships: []
      }
      debug_payloads: {
        Row: {
          created_at: string | null
          function_name: string | null
          id: string
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          function_name?: string | null
          id?: string
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          function_name?: string | null
          id?: string
          payload?: Json | null
        }
        Relationships: []
      }
      odontograms: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          patient_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          patient_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          patient_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "odontograms_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          alergias: string | null
          antecedentes: string | null
          created_at: string
          dni: string | null
          email: string | null
          estado: string | null
          fecha_nacimiento: string | null
          historia_clinica_url: string | null
          id: string
          nombre: string
          notas: string | null
          numero_afiliado: string | null
          obra_social: string | null
          telefono: string | null
          ultima_visita: string | null
          user_id: string | null
        }
        Insert: {
          alergias?: string | null
          antecedentes?: string | null
          created_at?: string
          dni?: string | null
          email?: string | null
          estado?: string | null
          fecha_nacimiento?: string | null
          historia_clinica_url?: string | null
          id?: string
          nombre: string
          notas?: string | null
          numero_afiliado?: string | null
          obra_social?: string | null
          telefono?: string | null
          ultima_visita?: string | null
          user_id?: string | null
        }
        Update: {
          alergias?: string | null
          antecedentes?: string | null
          created_at?: string
          dni?: string | null
          email?: string | null
          estado?: string | null
          fecha_nacimiento?: string | null
          historia_clinica_url?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          numero_afiliado?: string | null
          obra_social?: string | null
          telefono?: string | null
          ultima_visita?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepted_insurances: string[] | null
          apikey_evolution: string | null
          avatar_url: string | null
          business_name: string | null
          chatbot_context_url: string | null
          contact_phone: string | null
          full_name: string | null
          google_refresh_token: string | null
          id: string
          notification_phone: string | null
          services: Json | null
          system_prompt: string | null
          updated_at: string | null
          website: string | null
          whatsapp_instance: string | null
          whatsapp_status: string | null
        }
        Insert: {
          accepted_insurances?: string[] | null
          apikey_evolution?: string | null
          avatar_url?: string | null
          business_name?: string | null
          chatbot_context_url?: string | null
          contact_phone?: string | null
          full_name?: string | null
          google_refresh_token?: string | null
          id: string
          notification_phone?: string | null
          services?: Json | null
          system_prompt?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp_instance?: string | null
          whatsapp_status?: string | null
        }
        Update: {
          accepted_insurances?: string[] | null
          apikey_evolution?: string | null
          avatar_url?: string | null
          business_name?: string | null
          chatbot_context_url?: string | null
          contact_phone?: string | null
          full_name?: string | null
          google_refresh_token?: string | null
          id?: string
          notification_phone?: string | null
          services?: Json | null
          system_prompt?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp_instance?: string | null
          whatsapp_status?: string | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tenant_faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          question: string
          tenant_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question: string
          tenant_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          tenant_id?: string
        }
        Relationships: []
      }
      treatment_history: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          patient_id: string | null
          procedure_type: string | null
          tooth_number: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          patient_id?: string | null
          procedure_type?: string | null
          tooth_number?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          patient_id?: string | null
          procedure_type?: string | null
          tooth_number?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
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

// Convenience aliases
export type PatientRow = Tables<'patients'>
export type PatientInsert = TablesInsert<'patients'>
export type PatientUpdate = TablesUpdate<'patients'>

export type AppointmentRow = Tables<'appointments'>
export type AppointmentInsert = TablesInsert<'appointments'>
export type AppointmentUpdate = TablesUpdate<'appointments'>

export type ProfileRow = Tables<'profiles'>
export type ScheduleRow = Tables<'schedules'>
export type OdontogramRow = Tables<'odontograms'>
export type TreatmentHistoryRow = Tables<'treatment_history'>
export type TenantFaqRow = Tables<'tenant_faqs'>
export type ChatHistoryRow = Tables<'chat_history'>
