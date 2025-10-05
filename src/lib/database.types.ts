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
      establishments: {
        Row: {
          id: number
          name: string
          cnpj: string
          establishment_type_id: number
          address_street: string
          address_number: string
          address_complement: string | null
          address_neighborhood: string
          address_city: string
          address_state: string
          address_zip_code: string
          subscription_plan_id: number
          operational_status: 'active' | 'inactive' | 'suspended'
          table_capacity: number | null
          accepts_delivery: boolean
          accepts_reservations: boolean
          service_fee_percentage: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          cnpj: string
          establishment_type_id: number
          address_street: string
          address_number: string
          address_complement?: string | null
          address_neighborhood: string
          address_city: string
          address_state: string
          address_zip_code: string
          subscription_plan_id: number
          operational_status?: 'active' | 'inactive' | 'suspended'
          table_capacity?: number | null
          accepts_delivery?: boolean
          accepts_reservations?: boolean
          service_fee_percentage?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          cnpj?: string
          establishment_type_id?: number
          address_street?: string
          address_number?: string
          address_complement?: string | null
          address_neighborhood?: string
          address_city?: string
          address_state?: string
          address_zip_code?: string
          subscription_plan_id?: number
          operational_status?: 'active' | 'inactive' | 'suspended'
          table_capacity?: number | null
          accepts_delivery?: boolean
          accepts_reservations?: boolean
          service_fee_percentage?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          establishment_id: number | null
          full_name: string | null
          email: string
          phone_number: string | null
          role_id: number | null
          salary: number | null
          admission_date: string | null
          status: 'active' | 'inactive' | 'suspended'
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          establishment_id?: number | null
          full_name?: string | null
          email: string
          phone_number?: string | null
          role_id?: number | null
          salary?: number | null
          admission_date?: string | null
          status?: 'active' | 'inactive' | 'suspended'
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          establishment_id?: number | null
          full_name?: string | null
          email?: string
          phone_number?: string | null
          role_id?: number | null
          salary?: number | null
          admission_date?: string | null
          status?: 'active' | 'inactive' | 'suspended'
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      establishment_types: {
        Row: {
          id: number
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number
          features: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          price: number
          features?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          price?: number
          features?: Json | null
          created_at?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}