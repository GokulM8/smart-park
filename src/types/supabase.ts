// Auto-generated TypeScript types for Supabase

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
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'user' | 'staff' | 'admin'
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'user' | 'staff' | 'admin'
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'user' | 'staff' | 'admin'
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          user_id: string
          license_plate: string
          make: string
          model: string
          color: string | null
          vehicle_type: 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'other'
          year: number | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          license_plate: string
          make: string
          model: string
          color?: string | null
          vehicle_type: 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'other'
          year?: number | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          license_plate?: string
          make?: string
          model?: string
          color?: string | null
          vehicle_type?: 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'other'
          year?: number | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      parking_slots: {
        Row: {
          id: string
          slot_number: string
          level: number
          zone: string
          capacity: 'compact' | 'standard' | 'large'
          status: 'available' | 'occupied' | 'reserved' | 'maintenance'
          current_vehicle_id: string | null
          hourly_rate: number
          is_handicap: boolean
          is_reserved: boolean
          features: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slot_number: string
          level: number
          zone: string
          capacity: 'compact' | 'standard' | 'large'
          status?: 'available' | 'occupied' | 'reserved' | 'maintenance'
          current_vehicle_id?: string | null
          hourly_rate?: number
          is_handicap?: boolean
          is_reserved?: boolean
          features?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slot_number?: string
          level?: number
          zone?: string
          capacity?: 'compact' | 'standard' | 'large'
          status?: 'available' | 'occupied' | 'reserved' | 'maintenance'
          current_vehicle_id?: string | null
          hourly_rate?: number
          is_handicap?: boolean
          is_reserved?: boolean
          features?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      entry_exit_logs: {
        Row: {
          id: string
          user_id: string
          vehicle_id: string
          slot_id: string
          entry_time: string
          exit_time: string | null
          duration_minutes: number | null
          cost: number | null
          payment_status: 'pending' | 'paid' | 'cancelled'
          entry_photo_url: string | null
          exit_photo_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicle_id: string
          slot_id: string
          entry_time: string
          exit_time?: string | null
          duration_minutes?: number | null
          cost?: number | null
          payment_status?: 'pending' | 'paid' | 'cancelled'
          entry_photo_url?: string | null
          exit_photo_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vehicle_id?: string
          slot_id?: string
          entry_time?: string
          exit_time?: string | null
          duration_minutes?: number | null
          cost?: number | null
          payment_status?: 'pending' | 'paid' | 'cancelled'
          entry_photo_url?: string | null
          exit_photo_url?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          entry_exit_log_id: string | null
          amount: number
          tax: number
          total: number
          status: 'pending' | 'paid' | 'overdue' | 'cancelled'
          issued_at: string
          due_at: string | null
          paid_at: string | null
          payment_method: 'credit_card' | 'debit_card' | 'upi' | 'wallet' | 'cash' | null
          receipt_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_exit_log_id?: string | null
          amount: number
          tax?: number
          total: number
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          issued_at?: string
          due_at?: string | null
          paid_at?: string | null
          payment_method?: 'credit_card' | 'debit_card' | 'upi' | 'wallet' | 'cash' | null
          receipt_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_exit_log_id?: string | null
          amount?: number
          tax?: number
          total?: number
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          issued_at?: string
          due_at?: string | null
          paid_at?: string | null
          payment_method?: 'credit_card' | 'debit_card' | 'upi' | 'wallet' | 'cash' | null
          receipt_url?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          user_id: string
          slot_id: string
          reserved_from: string
          reserved_until: string
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slot_id: string
          reserved_from: string
          reserved_until: string
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slot_id?: string
          reserved_from?: string
          reserved_until?: string
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          report_type: 'occupancy' | 'revenue' | 'user_activity' | 'slot_usage'
          period_start: string
          period_end: string
          data: Json
          generated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          report_type: 'occupancy' | 'revenue' | 'user_activity' | 'slot_usage'
          period_start: string
          period_end: string
          data: Json
          generated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          report_type?: 'occupancy' | 'revenue' | 'user_activity' | 'slot_usage'
          period_start?: string
          period_end?: string
          data?: Json
          generated_at?: string
          created_at?: string
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

// Extracted types for easier use
export type User = Database['public']['Tables']['users']['Row']
export type Vehicle = Database['public']['Tables']['vehicles']['Row']
export type ParkingSlot = Database['public']['Tables']['parking_slots']['Row']
export type EntryExitLog = Database['public']['Tables']['entry_exit_logs']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type Reservation = Database['public']['Tables']['reservations']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
