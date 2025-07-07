export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ab_experiments: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          experiment_type: string
          id: string
          name: string
          results: Json | null
          start_date: string | null
          status: string | null
          success_metrics: Json | null
          target_audience: Json | null
          traffic_allocation: Json | null
          updated_at: string | null
          variants: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          experiment_type: string
          id?: string
          name: string
          results?: Json | null
          start_date?: string | null
          status?: string | null
          success_metrics?: Json | null
          target_audience?: Json | null
          traffic_allocation?: Json | null
          updated_at?: string | null
          variants?: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          experiment_type?: string
          id?: string
          name?: string
          results?: Json | null
          start_date?: string | null
          status?: string | null
          success_metrics?: Json | null
          target_audience?: Json | null
          traffic_allocation?: Json | null
          updated_at?: string | null
          variants?: Json
        }
        Relationships: []
      }
      abandoned_cart_campaigns: {
        Row: {
          campaign_name: string
          created_at: string | null
          created_by: string | null
          discount_code: string | null
          discount_percentage: number | null
          email_template: string | null
          follow_up_sequence: Json | null
          id: string
          is_active: boolean | null
          sms_template: string | null
          trigger_delay_minutes: number | null
          updated_at: string | null
          whatsapp_template: string | null
        }
        Insert: {
          campaign_name: string
          created_at?: string | null
          created_by?: string | null
          discount_code?: string | null
          discount_percentage?: number | null
          email_template?: string | null
          follow_up_sequence?: Json | null
          id?: string
          is_active?: boolean | null
          sms_template?: string | null
          trigger_delay_minutes?: number | null
          updated_at?: string | null
          whatsapp_template?: string | null
        }
        Update: {
          campaign_name?: string
          created_at?: string | null
          created_by?: string | null
          discount_code?: string | null
          discount_percentage?: number | null
          email_template?: string | null
          follow_up_sequence?: Json | null
          id?: string
          is_active?: boolean | null
          sms_template?: string | null
          trigger_delay_minutes?: number | null
          updated_at?: string | null
          whatsapp_template?: string | null
        }
        Relationships: []
      }
      ambulance_bookings: {
        Row: {
          admin_notes: string | null
          ambulance_id: string | null
          booking_time: string | null
          completion_time: string | null
          contact_phone: string
          created_at: string | null
          current_condition: string | null
          destination_address: string
          destination_coordinates: Json | null
          driver_notes: string | null
          emergency_contact: string | null
          emergency_type: string
          estimated_distance: number | null
          id: string
          medical_history: string | null
          patient_age: number | null
          patient_name: string
          pickup_address: string
          pickup_coordinates: Json | null
          pickup_time: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          ambulance_id?: string | null
          booking_time?: string | null
          completion_time?: string | null
          contact_phone: string
          created_at?: string | null
          current_condition?: string | null
          destination_address: string
          destination_coordinates?: Json | null
          driver_notes?: string | null
          emergency_contact?: string | null
          emergency_type: string
          estimated_distance?: number | null
          id?: string
          medical_history?: string | null
          patient_age?: number | null
          patient_name: string
          pickup_address: string
          pickup_coordinates?: Json | null
          pickup_time?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          ambulance_id?: string | null
          booking_time?: string | null
          completion_time?: string | null
          contact_phone?: string
          created_at?: string | null
          current_condition?: string | null
          destination_address?: string
          destination_coordinates?: Json | null
          driver_notes?: string | null
          emergency_contact?: string | null
          emergency_type?: string
          estimated_distance?: number | null
          id?: string
          medical_history?: string | null
          patient_age?: number | null
          patient_name?: string
          pickup_address?: string
          pickup_coordinates?: Json | null
          pickup_time?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambulance_bookings_ambulance_id_fkey"
            columns: ["ambulance_id"]
            isOneToOne: false
            referencedRelation: "ambulance_services"
            referencedColumns: ["id"]
          },
        ]
      }
      ambulance_services: {
        Row: {
          base_fare: number
          created_at: string | null
          driver_name: string
          driver_phone: string
          equipment_list: string[] | null
          id: string
          is_active: boolean | null
          is_available: boolean | null
          location: Json | null
          name_en: string
          name_te: string
          paramedic_name: string | null
          paramedic_phone: string | null
          price_per_km: number
          service_type: string
          updated_at: string | null
          vehicle_number: string
        }
        Insert: {
          base_fare?: number
          created_at?: string | null
          driver_name: string
          driver_phone: string
          equipment_list?: string[] | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          location?: Json | null
          name_en: string
          name_te: string
          paramedic_name?: string | null
          paramedic_phone?: string | null
          price_per_km?: number
          service_type: string
          updated_at?: string | null
          vehicle_number: string
        }
        Update: {
          base_fare?: number
          created_at?: string | null
          driver_name?: string
          driver_phone?: string
          equipment_list?: string[] | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          location?: Json | null
          name_en?: string
          name_te?: string
          paramedic_name?: string | null
          paramedic_phone?: string | null
          price_per_km?: number
          service_type?: string
          updated_at?: string | null
          vehicle_number?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_category: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          location_id: string | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_category?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          location_id?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_category?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          location_id?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_banks: {
        Row: {
          address: string
          created_at: string | null
          email: string | null
          emergency_contact: string | null
          hospital_id: string | null
          id: string
          is_active: boolean | null
          is_government: boolean | null
          license_number: string
          name_en: string
          name_te: string
          operating_hours: string | null
          phone: string
          storage_capacity: number | null
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          hospital_id?: string | null
          id?: string
          is_active?: boolean | null
          is_government?: boolean | null
          license_number: string
          name_en: string
          name_te: string
          operating_hours?: string | null
          phone: string
          storage_capacity?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          hospital_id?: string | null
          id?: string
          is_active?: boolean | null
          is_government?: boolean | null
          license_number?: string
          name_en?: string
          name_te?: string
          operating_hours?: string | null
          phone?: string
          storage_capacity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blood_banks_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_inventory: {
        Row: {
          blood_bank_id: string
          blood_group: string
          component_type: string
          created_at: string | null
          expiry_date: string | null
          id: string
          last_updated: string | null
          units_available: number
          units_reserved: number | null
        }
        Insert: {
          blood_bank_id: string
          blood_group: string
          component_type: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          last_updated?: string | null
          units_available?: number
          units_reserved?: number | null
        }
        Update: {
          blood_bank_id?: string
          blood_group?: string
          component_type?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          last_updated?: string | null
          units_available?: number
          units_reserved?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blood_inventory_blood_bank_id_fkey"
            columns: ["blood_bank_id"]
            isOneToOne: false
            referencedRelation: "blood_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_requests: {
        Row: {
          admin_notes: string | null
          blood_group: string
          component_type: string
          contact_phone: string
          created_at: string | null
          doctor_name: string | null
          hospital_name: string | null
          id: string
          medical_reason: string | null
          patient_age: number | null
          patient_name: string
          preferred_blood_bank_id: string | null
          required_by: string | null
          status: string | null
          units_required: number
          updated_at: string | null
          urgency_level: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          blood_group: string
          component_type: string
          contact_phone: string
          created_at?: string | null
          doctor_name?: string | null
          hospital_name?: string | null
          id?: string
          medical_reason?: string | null
          patient_age?: number | null
          patient_name: string
          preferred_blood_bank_id?: string | null
          required_by?: string | null
          status?: string | null
          units_required: number
          updated_at?: string | null
          urgency_level?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          blood_group?: string
          component_type?: string
          contact_phone?: string
          created_at?: string | null
          doctor_name?: string | null
          hospital_name?: string | null
          id?: string
          medical_reason?: string | null
          patient_age?: number | null
          patient_name?: string
          preferred_blood_bank_id?: string | null
          required_by?: string | null
          status?: string | null
          units_required?: number
          updated_at?: string | null
          urgency_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blood_requests_preferred_blood_bank_id_fkey"
            columns: ["preferred_blood_bank_id"]
            isOneToOne: false
            referencedRelation: "blood_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_certifications: {
        Row: {
          caregiver_id: string | null
          certificate_url: string | null
          certification_name: string
          created_at: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_authority: string | null
          status: Database["public"]["Enums"]["qualification_status"] | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          caregiver_id?: string | null
          certificate_url?: string | null
          certification_name: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          status?: Database["public"]["Enums"]["qualification_status"] | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          caregiver_id?: string | null
          certificate_url?: string | null
          certification_name?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          status?: Database["public"]["Enums"]["qualification_status"] | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_certifications_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caregiver_certifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      caregivers: {
        Row: {
          availability_schedule: Json | null
          created_at: string | null
          distance_km: number | null
          experience_years: number
          hourly_rate: number
          id: string
          image_url: string | null
          is_emergency_available: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          location: string | null
          name: string
          phone: string | null
          rating: number | null
          specialization: string
          status: Database["public"]["Enums"]["caregiver_status"] | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability_schedule?: Json | null
          created_at?: string | null
          distance_km?: number | null
          experience_years: number
          hourly_rate: number
          id?: string
          image_url?: string | null
          is_emergency_available?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          location?: string | null
          name: string
          phone?: string | null
          rating?: number | null
          specialization: string
          status?: Database["public"]["Enums"]["caregiver_status"] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability_schedule?: Json | null
          created_at?: string | null
          distance_km?: number | null
          experience_years?: number
          hourly_rate?: number
          id?: string
          image_url?: string | null
          is_emergency_available?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          location?: string | null
          name?: string
          phone?: string | null
          rating?: number | null
          specialization?: string
          status?: Database["public"]["Enums"]["caregiver_status"] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caregivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_documents: {
        Row: {
          claim_id: string | null
          document_name: string
          document_type: Database["public"]["Enums"]["document_type"]
          extracted_text: string | null
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          claim_id?: string | null
          document_name: string
          document_type: Database["public"]["Enums"]["document_type"]
          extracted_text?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          claim_id?: string | null
          document_name?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          extracted_text?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_documents_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "insurance_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          consultation_type:
            | Database["public"]["Enums"]["consultation_type"]
            | null
          created_at: string | null
          doctor_id: string | null
          duration_minutes: number | null
          feedback: string | null
          fees_paid: number | null
          follow_up_date: string | null
          id: string
          meeting_link: string | null
          notes: string | null
          patient_id: string | null
          patient_symptoms: string | null
          payment_status: string | null
          prescription: Json | null
          rating: number | null
          scheduled_at: string
          status: Database["public"]["Enums"]["consultation_status"] | null
          updated_at: string | null
        }
        Insert: {
          consultation_type?:
            | Database["public"]["Enums"]["consultation_type"]
            | null
          created_at?: string | null
          doctor_id?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          fees_paid?: number | null
          follow_up_date?: string | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          patient_id?: string | null
          patient_symptoms?: string | null
          payment_status?: string | null
          prescription?: Json | null
          rating?: number | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["consultation_status"] | null
          updated_at?: string | null
        }
        Update: {
          consultation_type?:
            | Database["public"]["Enums"]["consultation_type"]
            | null
          created_at?: string | null
          doctor_id?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          fees_paid?: number | null
          follow_up_date?: string | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          patient_id?: string | null
          patient_symptoms?: string | null
          payment_status?: string | null
          prescription?: Json | null
          rating?: number | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["consultation_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string | null
          discount_applied: number
          id: string
          order_id: string | null
          transaction_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          coupon_id?: string | null
          discount_applied: number
          id?: string
          order_id?: string | null
          transaction_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_id?: string | null
          discount_applied?: number
          id?: string
          order_id?: string | null
          transaction_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "pos_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applicable_categories: Json | null
          applicable_products: Json | null
          coupon_code: string
          coupon_name: string
          coupon_status: Database["public"]["Enums"]["coupon_status"] | null
          coupon_type: Database["public"]["Enums"]["coupon_type"]
          created_at: string | null
          created_by: string | null
          description_en: string | null
          description_te: string | null
          discount_value: number
          excluded_categories: Json | null
          excluded_products: Json | null
          id: string
          is_auto_apply: boolean | null
          max_discount_amount: number | null
          min_order_amount: number | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          user_usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_categories?: Json | null
          applicable_products?: Json | null
          coupon_code: string
          coupon_name: string
          coupon_status?: Database["public"]["Enums"]["coupon_status"] | null
          coupon_type: Database["public"]["Enums"]["coupon_type"]
          created_at?: string | null
          created_by?: string | null
          description_en?: string | null
          description_te?: string | null
          discount_value: number
          excluded_categories?: Json | null
          excluded_products?: Json | null
          id?: string
          is_auto_apply?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          user_usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_categories?: Json | null
          applicable_products?: Json | null
          coupon_code?: string
          coupon_name?: string
          coupon_status?: Database["public"]["Enums"]["coupon_status"] | null
          coupon_type?: Database["public"]["Enums"]["coupon_type"]
          created_at?: string | null
          created_by?: string | null
          description_en?: string | null
          description_te?: string | null
          discount_value?: number
          excluded_categories?: Json | null
          excluded_products?: Json | null
          id?: string
          is_auto_apply?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          user_usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_orders: {
        Row: {
          assigned_vendor_id: string | null
          billing_address: Json | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          customer_id: string | null
          delivered_at: string | null
          delivery_charges: number | null
          delivery_date: string | null
          delivery_instructions: string | null
          discount_amount: number | null
          estimated_delivery: string | null
          id: string
          notes: string | null
          order_date: string | null
          order_number: string
          order_priority: Database["public"]["Enums"]["order_priority"] | null
          order_status: Database["public"]["Enums"]["order_status"] | null
          order_type: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          prescription_required: boolean | null
          prescription_uploaded: boolean | null
          prescription_urls: Json | null
          refund_amount: number | null
          shipping_address: Json | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_vendor_id?: string | null
          billing_address?: Json | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          delivery_charges?: number | null
          delivery_date?: string | null
          delivery_instructions?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number: string
          order_priority?: Database["public"]["Enums"]["order_priority"] | null
          order_status?: Database["public"]["Enums"]["order_status"] | null
          order_type?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          prescription_required?: boolean | null
          prescription_uploaded?: boolean | null
          prescription_urls?: Json | null
          refund_amount?: number | null
          shipping_address?: Json | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_vendor_id?: string | null
          billing_address?: Json | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          delivery_charges?: number | null
          delivery_date?: string | null
          delivery_instructions?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string
          order_priority?: Database["public"]["Enums"]["order_priority"] | null
          order_status?: Database["public"]["Enums"]["order_status"] | null
          order_type?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          prescription_required?: boolean | null
          prescription_uploaded?: boolean | null
          prescription_urls?: Json | null
          refund_amount?: number | null
          shipping_address?: Json | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_orders_assigned_vendor_id_fkey"
            columns: ["assigned_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_segments: {
        Row: {
          created_at: string | null
          criteria: Json
          customer_count: number | null
          description: string | null
          id: string
          is_dynamic: boolean | null
          last_updated: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          criteria?: Json
          customer_count?: number | null
          description?: string | null
          id?: string
          is_dynamic?: boolean | null
          last_updated?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          criteria?: Json
          customer_count?: number | null
          description?: string | null
          id?: string
          is_dynamic?: boolean | null
          last_updated?: string | null
          name?: string
        }
        Relationships: []
      }
      diabetes_appointments: {
        Row: {
          address: string | null
          admin_notes: string | null
          appointment_date: string
          appointment_time: string
          appointment_type: string | null
          contact_phone: string
          created_at: string | null
          current_medications: string[] | null
          current_symptoms: string | null
          diabetes_type: string | null
          follow_up_date: string | null
          hba1c_last_value: number | null
          id: string
          medical_history: string | null
          package_id: string | null
          patient_age: number | null
          patient_name: string
          prescription_notes: string | null
          service_id: string | null
          specialist_id: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          appointment_date: string
          appointment_time: string
          appointment_type?: string | null
          contact_phone: string
          created_at?: string | null
          current_medications?: string[] | null
          current_symptoms?: string | null
          diabetes_type?: string | null
          follow_up_date?: string | null
          hba1c_last_value?: number | null
          id?: string
          medical_history?: string | null
          package_id?: string | null
          patient_age?: number | null
          patient_name: string
          prescription_notes?: string | null
          service_id?: string | null
          specialist_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string | null
          contact_phone?: string
          created_at?: string | null
          current_medications?: string[] | null
          current_symptoms?: string | null
          diabetes_type?: string | null
          follow_up_date?: string | null
          hba1c_last_value?: number | null
          id?: string
          medical_history?: string | null
          package_id?: string | null
          patient_age?: number | null
          patient_name?: string
          prescription_notes?: string | null
          service_id?: string | null
          specialist_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diabetes_appointments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "diabetes_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diabetes_appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "diabetes_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diabetes_appointments_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "diabetes_specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diabetes_appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diabetes_categories: {
        Row: {
          bg_color: string | null
          category_type: Database["public"]["Enums"]["service_category_type"]
          created_at: string | null
          description_en: string | null
          description_te: string | null
          display_order: number | null
          icon: string | null
          icon_color: string | null
          id: string
          is_active: boolean | null
          name_en: string
          name_te: string
          service_count: number | null
          updated_at: string | null
        }
        Insert: {
          bg_color?: string | null
          category_type: Database["public"]["Enums"]["service_category_type"]
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          display_order?: number | null
          icon?: string | null
          icon_color?: string | null
          id?: string
          is_active?: boolean | null
          name_en: string
          name_te: string
          service_count?: number | null
          updated_at?: string | null
        }
        Update: {
          bg_color?: string | null
          category_type?: Database["public"]["Enums"]["service_category_type"]
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          display_order?: number | null
          icon?: string | null
          icon_color?: string | null
          id?: string
          is_active?: boolean | null
          name_en?: string
          name_te?: string
          service_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      diabetes_packages: {
        Row: {
          consultation_count: number | null
          created_at: string | null
          description_en: string | null
          description_te: string | null
          discount_percentage: number | null
          discounted_price: number
          duration_months: number
          id: string
          included_tests: string[] | null
          is_active: boolean | null
          is_home_collection: boolean | null
          name_en: string
          name_te: string
          original_price: number
          provider: string | null
          updated_at: string | null
        }
        Insert: {
          consultation_count?: number | null
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          discount_percentage?: number | null
          discounted_price: number
          duration_months: number
          id?: string
          included_tests?: string[] | null
          is_active?: boolean | null
          is_home_collection?: boolean | null
          name_en: string
          name_te: string
          original_price: number
          provider?: string | null
          updated_at?: string | null
        }
        Update: {
          consultation_count?: number | null
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          discount_percentage?: number | null
          discounted_price?: number
          duration_months?: number
          id?: string
          included_tests?: string[] | null
          is_active?: boolean | null
          is_home_collection?: boolean | null
          name_en?: string
          name_te?: string
          original_price?: number
          provider?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      diabetes_services: {
        Row: {
          category_id: string | null
          created_at: string | null
          description_en: string | null
          description_te: string | null
          duration: string | null
          id: string
          is_active: boolean | null
          is_fasting_required: boolean | null
          is_home_collection: boolean | null
          name_en: string
          name_te: string
          preparation_instructions: string | null
          price: number
          providers: string[] | null
          report_time: string | null
          test_type: Database["public"]["Enums"]["diabetes_test_type"] | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          is_fasting_required?: boolean | null
          is_home_collection?: boolean | null
          name_en: string
          name_te: string
          preparation_instructions?: string | null
          price: number
          providers?: string[] | null
          report_time?: string | null
          test_type?: Database["public"]["Enums"]["diabetes_test_type"] | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          is_fasting_required?: boolean | null
          is_home_collection?: boolean | null
          name_en?: string
          name_te?: string
          preparation_instructions?: string | null
          price?: number
          providers?: string[] | null
          report_time?: string | null
          test_type?: Database["public"]["Enums"]["diabetes_test_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diabetes_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "diabetes_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      diabetes_specialists: {
        Row: {
          available_slots: Json | null
          clinic_address: string | null
          clinic_name: string | null
          consultation_fee: number
          created_at: string | null
          experience_years: number
          id: string
          is_online_consultation: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          name: string
          profile_image_url: string | null
          qualification: string | null
          rating: number | null
          specialization: string
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          available_slots?: Json | null
          clinic_address?: string | null
          clinic_name?: string | null
          consultation_fee: number
          created_at?: string | null
          experience_years: number
          id?: string
          is_online_consultation?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          name: string
          profile_image_url?: string | null
          qualification?: string | null
          rating?: number | null
          specialization: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          available_slots?: Json | null
          clinic_address?: string | null
          clinic_name?: string | null
          consultation_fee?: number
          created_at?: string | null
          experience_years?: number
          id?: string
          is_online_consultation?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          name?: string
          profile_image_url?: string | null
          qualification?: string | null
          rating?: number | null
          specialization?: string
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diabetes_specialists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_centers: {
        Row: {
          address: string
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name_en: string
          name_te: string
          phone: string | null
          updated_at: string | null
          working_hours: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name_en: string
          name_te: string
          phone?: string | null
          updated_at?: string | null
          working_hours?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name_en?: string
          name_te?: string
          phone?: string | null
          updated_at?: string | null
          working_hours?: string | null
        }
        Relationships: []
      }
      diet_consultations: {
        Row: {
          activity_level: string | null
          allergies: string[] | null
          consultation_date: string | null
          consultation_fee: number | null
          consultation_notes: string | null
          consultation_type: string | null
          created_at: string | null
          current_diet_pattern: string | null
          custom_plan: Json | null
          diet_plan_id: string | null
          food_preferences: string[] | null
          health_goals: string[] | null
          height: number | null
          id: string
          medical_conditions: string[] | null
          next_consultation: string | null
          nutritionist_id: string | null
          patient_age: number | null
          patient_gender: string | null
          patient_name: string
          progress_tracking: Json | null
          recommendations: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          allergies?: string[] | null
          consultation_date?: string | null
          consultation_fee?: number | null
          consultation_notes?: string | null
          consultation_type?: string | null
          created_at?: string | null
          current_diet_pattern?: string | null
          custom_plan?: Json | null
          diet_plan_id?: string | null
          food_preferences?: string[] | null
          health_goals?: string[] | null
          height?: number | null
          id?: string
          medical_conditions?: string[] | null
          next_consultation?: string | null
          nutritionist_id?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name: string
          progress_tracking?: Json | null
          recommendations?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          allergies?: string[] | null
          consultation_date?: string | null
          consultation_fee?: number | null
          consultation_notes?: string | null
          consultation_type?: string | null
          created_at?: string | null
          current_diet_pattern?: string | null
          custom_plan?: Json | null
          diet_plan_id?: string | null
          food_preferences?: string[] | null
          health_goals?: string[] | null
          height?: number | null
          id?: string
          medical_conditions?: string[] | null
          next_consultation?: string | null
          nutritionist_id?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name?: string
          progress_tracking?: Json | null
          recommendations?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_consultations_diet_plan_id_fkey"
            columns: ["diet_plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_plans: {
        Row: {
          calorie_range: string | null
          created_at: string | null
          description_en: string | null
          description_te: string | null
          dietary_restrictions: string[] | null
          duration_days: number
          foods_to_avoid: string[] | null
          foods_to_include: string[] | null
          id: string
          is_active: boolean | null
          is_personalized: boolean | null
          macros: Json | null
          meal_structure: Json | null
          name_en: string
          name_te: string
          nutritionist_id: string | null
          plan_type: string
          price: number | null
          sample_menu: Json | null
          target_conditions: string[] | null
          updated_at: string | null
        }
        Insert: {
          calorie_range?: string | null
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          dietary_restrictions?: string[] | null
          duration_days: number
          foods_to_avoid?: string[] | null
          foods_to_include?: string[] | null
          id?: string
          is_active?: boolean | null
          is_personalized?: boolean | null
          macros?: Json | null
          meal_structure?: Json | null
          name_en: string
          name_te: string
          nutritionist_id?: string | null
          plan_type: string
          price?: number | null
          sample_menu?: Json | null
          target_conditions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          calorie_range?: string | null
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          dietary_restrictions?: string[] | null
          duration_days?: number
          foods_to_avoid?: string[] | null
          foods_to_include?: string[] | null
          id?: string
          is_active?: boolean | null
          is_personalized?: boolean | null
          macros?: Json | null
          meal_structure?: Json | null
          name_en?: string
          name_te?: string
          nutritionist_id?: string | null
          plan_type?: string
          price?: number | null
          sample_menu?: Json | null
          target_conditions?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      doctor_credentials: {
        Row: {
          created_at: string | null
          credential_name: string
          credential_number: string | null
          credential_type: string
          doctor_id: string | null
          document_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_authority: string
          verification_status: string | null
        }
        Insert: {
          created_at?: string | null
          credential_name: string
          credential_number?: string | null
          credential_type: string
          doctor_id?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority: string
          verification_status?: string | null
        }
        Update: {
          created_at?: string | null
          credential_name?: string
          credential_number?: string | null
          credential_type?: string
          doctor_id?: string | null
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_credentials_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_reviews: {
        Row: {
          consultation_id: string | null
          created_at: string | null
          doctor_id: string | null
          helpful_count: number | null
          id: string
          is_anonymous: boolean | null
          is_verified: boolean | null
          patient_id: string | null
          rating: number
          review_text: string | null
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          helpful_count?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_verified?: boolean | null
          patient_id?: string | null
          rating: number
          review_text?: string | null
        }
        Update: {
          consultation_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          helpful_count?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_verified?: boolean | null
          patient_id?: string | null
          rating?: number
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_reviews_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: true
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_reviews_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_reviews_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_schedules: {
        Row: {
          break_end_time: string | null
          break_start_time: string | null
          created_at: string | null
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          doctor_id: string | null
          end_time: string
          id: string
          is_available: boolean | null
          max_patients: number | null
          start_time: string
        }
        Insert: {
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string | null
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          doctor_id?: string | null
          end_time: string
          id?: string
          is_available?: boolean | null
          max_patients?: number | null
          start_time: string
        }
        Update: {
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string | null
          day_of_week?: Database["public"]["Enums"]["day_of_week"]
          doctor_id?: string | null
          end_time?: string
          id?: string
          is_available?: boolean | null
          max_patients?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          awards: string[] | null
          bio_en: string | null
          bio_te: string | null
          consultation_fee: number
          created_at: string | null
          emergency_available: boolean | null
          experience_years: number
          hospital_affiliations: string[] | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          license_number: string
          profile_image: string | null
          qualification: string
          rating: number | null
          research_papers: string[] | null
          social_links: Json | null
          specialization_id: string | null
          status: Database["public"]["Enums"]["doctor_status"] | null
          total_consultations: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          awards?: string[] | null
          bio_en?: string | null
          bio_te?: string | null
          consultation_fee?: number
          created_at?: string | null
          emergency_available?: boolean | null
          experience_years?: number
          hospital_affiliations?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          license_number: string
          profile_image?: string | null
          qualification: string
          rating?: number | null
          research_papers?: string[] | null
          social_links?: Json | null
          specialization_id?: string | null
          status?: Database["public"]["Enums"]["doctor_status"] | null
          total_consultations?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          awards?: string[] | null
          bio_en?: string | null
          bio_te?: string | null
          consultation_fee?: number
          created_at?: string | null
          emergency_available?: boolean | null
          experience_years?: number
          hospital_affiliations?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          license_number?: string
          profile_image?: string | null
          qualification?: string
          rating?: number | null
          research_papers?: string[] | null
          social_links?: Json | null
          specialization_id?: string | null
          status?: Database["public"]["Enums"]["doctor_status"] | null
          total_consultations?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "medical_specializations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_pricing_rules: {
        Row: {
          adjustments: Json
          conditions: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          rule_name: string
          rule_type: string
          target_products: Json | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          adjustments?: Json
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_name: string
          rule_type: string
          target_products?: Json | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          adjustments?: Json
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_name?: string
          rule_type?: string
          target_products?: Json | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          created_at: string | null
          cta_link: string | null
          cta_text_en: string | null
          cta_text_te: string | null
          description_en: string | null
          description_te: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          title_en: string
          title_te: string
        }
        Insert: {
          created_at?: string | null
          cta_link?: string | null
          cta_text_en?: string | null
          cta_text_te?: string | null
          description_en?: string | null
          description_te?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title_en: string
          title_te: string
        }
        Update: {
          created_at?: string | null
          cta_link?: string | null
          cta_text_en?: string | null
          cta_text_te?: string | null
          description_en?: string | null
          description_te?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title_en?: string
          title_te?: string
        }
        Relationships: []
      }
      home_care_bookings: {
        Row: {
          address: string
          admin_notes: string | null
          booking_notes: string | null
          cancellation_reason: string | null
          caregiver_id: string | null
          contact_phone: string
          created_at: string | null
          duration_days: number | null
          emergency_contact: string | null
          id: string
          medical_conditions: string[] | null
          patient_age: number | null
          patient_gender: string | null
          patient_name: string
          preferred_start_date: string
          preferred_time_slot: string | null
          service_id: string | null
          special_instructions: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address: string
          admin_notes?: string | null
          booking_notes?: string | null
          cancellation_reason?: string | null
          caregiver_id?: string | null
          contact_phone: string
          created_at?: string | null
          duration_days?: number | null
          emergency_contact?: string | null
          id?: string
          medical_conditions?: string[] | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name: string
          preferred_start_date: string
          preferred_time_slot?: string | null
          service_id?: string | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string
          admin_notes?: string | null
          booking_notes?: string | null
          cancellation_reason?: string | null
          caregiver_id?: string | null
          contact_phone?: string
          created_at?: string | null
          duration_days?: number | null
          emergency_contact?: string | null
          id?: string
          medical_conditions?: string[] | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name?: string
          preferred_start_date?: string
          preferred_time_slot?: string | null
          service_id?: string | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_care_bookings_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_care_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "home_care_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_care_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      home_care_categories: {
        Row: {
          bg_color: string | null
          category_type: Database["public"]["Enums"]["service_category_type"]
          created_at: string | null
          description_en: string | null
          description_te: string | null
          display_order: number | null
          icon: string | null
          icon_color: string | null
          id: string
          is_active: boolean | null
          name_en: string
          name_te: string
          updated_at: string | null
        }
        Insert: {
          bg_color?: string | null
          category_type: Database["public"]["Enums"]["service_category_type"]
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          display_order?: number | null
          icon?: string | null
          icon_color?: string | null
          id?: string
          is_active?: boolean | null
          name_en: string
          name_te: string
          updated_at?: string | null
        }
        Update: {
          bg_color?: string | null
          category_type?: Database["public"]["Enums"]["service_category_type"]
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          display_order?: number | null
          icon?: string | null
          icon_color?: string | null
          id?: string
          is_active?: boolean | null
          name_en?: string
          name_te?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      home_care_services: {
        Row: {
          category_id: string | null
          created_at: string | null
          description_en: string | null
          description_te: string | null
          duration: string | null
          features: string[] | null
          frequency: string | null
          id: string
          is_active: boolean | null
          is_emergency_available: boolean | null
          name_en: string
          name_te: string
          price: number
          requirements: string[] | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          duration?: string | null
          features?: string[] | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          is_emergency_available?: boolean | null
          name_en: string
          name_te: string
          price: number
          requirements?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          duration?: string | null
          features?: string[] | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          is_emergency_available?: boolean | null
          name_en?: string
          name_te?: string
          price?: number
          requirements?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_care_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "home_care_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          address: string
          ambulance_service: boolean | null
          bed_capacity: number | null
          blood_bank: boolean | null
          coordinates: Json | null
          created_at: string | null
          email: string | null
          emergency_hours: string | null
          emergency_number: string | null
          emergency_services: boolean | null
          facilities: string[] | null
          hospital_type: string
          icu_beds: number | null
          id: string
          insurance_accepted: string[] | null
          is_active: boolean | null
          laboratory: boolean | null
          name_en: string
          name_te: string
          operating_hours: string | null
          pharmacy: boolean | null
          phone: string
          rating: number | null
          specialties: string[] | null
          total_reviews: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address: string
          ambulance_service?: boolean | null
          bed_capacity?: number | null
          blood_bank?: boolean | null
          coordinates?: Json | null
          created_at?: string | null
          email?: string | null
          emergency_hours?: string | null
          emergency_number?: string | null
          emergency_services?: boolean | null
          facilities?: string[] | null
          hospital_type: string
          icu_beds?: number | null
          id?: string
          insurance_accepted?: string[] | null
          is_active?: boolean | null
          laboratory?: boolean | null
          name_en: string
          name_te: string
          operating_hours?: string | null
          pharmacy?: boolean | null
          phone: string
          rating?: number | null
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          ambulance_service?: boolean | null
          bed_capacity?: number | null
          blood_bank?: boolean | null
          coordinates?: Json | null
          created_at?: string | null
          email?: string | null
          emergency_hours?: string | null
          emergency_number?: string | null
          emergency_services?: boolean | null
          facilities?: string[] | null
          hospital_type?: string
          icu_beds?: number | null
          id?: string
          insurance_accepted?: string[] | null
          is_active?: boolean | null
          laboratory?: boolean | null
          name_en?: string
          name_te?: string
          operating_hours?: string | null
          pharmacy?: boolean | null
          phone?: string
          rating?: number | null
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      insurance_claims: {
        Row: {
          approved_amount: number | null
          approved_at: string | null
          claim_amount: number
          claim_documents: Json | null
          claim_number: string
          claim_status: Database["public"]["Enums"]["claim_status"] | null
          claim_type: string
          created_at: string | null
          description_en: string
          description_te: string | null
          doctor_name: string | null
          estimated_resolution_days: number | null
          hospital_name: string | null
          id: string
          incident_date: string
          paid_at: string | null
          policy_id: string | null
          priority: Database["public"]["Enums"]["claim_priority"] | null
          processing_notes: Json | null
          submitted_at: string | null
          treatment_details: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approved_amount?: number | null
          approved_at?: string | null
          claim_amount: number
          claim_documents?: Json | null
          claim_number: string
          claim_status?: Database["public"]["Enums"]["claim_status"] | null
          claim_type: string
          created_at?: string | null
          description_en: string
          description_te?: string | null
          doctor_name?: string | null
          estimated_resolution_days?: number | null
          hospital_name?: string | null
          id?: string
          incident_date: string
          paid_at?: string | null
          policy_id?: string | null
          priority?: Database["public"]["Enums"]["claim_priority"] | null
          processing_notes?: Json | null
          submitted_at?: string | null
          treatment_details?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approved_amount?: number | null
          approved_at?: string | null
          claim_amount?: number
          claim_documents?: Json | null
          claim_number?: string
          claim_status?: Database["public"]["Enums"]["claim_status"] | null
          claim_type?: string
          created_at?: string | null
          description_en?: string
          description_te?: string | null
          doctor_name?: string | null
          estimated_resolution_days?: number | null
          hospital_name?: string | null
          id?: string
          incident_date?: string
          paid_at?: string | null
          policy_id?: string | null
          priority?: Database["public"]["Enums"]["claim_priority"] | null
          processing_notes?: Json | null
          submitted_at?: string | null
          treatment_details?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "user_insurance_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_plans: {
        Row: {
          age_limit_max: number | null
          age_limit_min: number | null
          coverage_amount: number | null
          coverage_type: Database["public"]["Enums"]["coverage_type"]
          created_at: string | null
          description_en: string | null
          description_te: string | null
          exclusions: Json | null
          features: Json | null
          id: string
          is_active: boolean | null
          name_en: string
          name_te: string
          policy_term_years: number | null
          premium_amount: number | null
          provider_id: string | null
          waiting_period_months: number | null
        }
        Insert: {
          age_limit_max?: number | null
          age_limit_min?: number | null
          coverage_amount?: number | null
          coverage_type: Database["public"]["Enums"]["coverage_type"]
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          exclusions?: Json | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name_en: string
          name_te: string
          policy_term_years?: number | null
          premium_amount?: number | null
          provider_id?: string | null
          waiting_period_months?: number | null
        }
        Update: {
          age_limit_max?: number | null
          age_limit_min?: number | null
          coverage_amount?: number | null
          coverage_type?: Database["public"]["Enums"]["coverage_type"]
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          exclusions?: Json | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name_en?: string
          name_te?: string
          policy_term_years?: number | null
          premium_amount?: number | null
          provider_id?: string | null
          waiting_period_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_plans_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "insurance_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_providers: {
        Row: {
          created_at: string | null
          customer_care_number: string | null
          email: string | null
          established_year: number | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name_en: string
          name_te: string
          rating: number | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          customer_care_number?: string | null
          email?: string | null
          established_year?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name_en: string
          name_te: string
          rating?: number | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          customer_care_number?: string | null
          email?: string | null
          established_year?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name_en?: string
          name_te?: string
          rating?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      lab_tests: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_te: string | null
          id: string
          is_active: boolean | null
          is_fasting_required: boolean | null
          is_home_collection: boolean | null
          name_en: string
          name_te: string
          preparation_instructions: string | null
          price: number
          report_time: string | null
          test_code: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          id?: string
          is_active?: boolean | null
          is_fasting_required?: boolean | null
          is_home_collection?: boolean | null
          name_en: string
          name_te: string
          preparation_instructions?: string | null
          price?: number
          report_time?: string | null
          test_code: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          id?: string
          is_active?: boolean | null
          is_fasting_required?: boolean | null
          is_home_collection?: boolean | null
          name_en?: string
          name_te?: string
          preparation_instructions?: string | null
          price?: number
          report_time?: string | null
          test_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      limited_time_offers: {
        Row: {
          applicable_categories: Json | null
          applicable_products: Json | null
          banner_image_url: string | null
          created_at: string | null
          created_by: string | null
          discount_type: string
          discount_value: number
          end_time: string
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          minimum_order_amount: number | null
          offer_name: string
          offer_type: string
          start_time: string
          updated_at: string | null
          urgency_message: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          applicable_categories?: Json | null
          applicable_products?: Json | null
          banner_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          discount_type: string
          discount_value: number
          end_time: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          minimum_order_amount?: number | null
          offer_name: string
          offer_type: string
          start_time: string
          updated_at?: string | null
          urgency_message?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          applicable_categories?: Json | null
          applicable_products?: Json | null
          banner_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          minimum_order_amount?: number | null
          offer_name?: string
          offer_type?: string
          start_time?: string
          updated_at?: string | null
          urgency_message?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          coordinates: Json | null
          coverage_areas: Json | null
          created_at: string | null
          delivery_fee: number | null
          estimated_delivery_time: string | null
          id: string
          is_active: boolean | null
          market_penetration: number | null
          min_order_amount: number | null
          name: string
          parent_id: string | null
          population: number | null
          service_radius_km: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          coordinates?: Json | null
          coverage_areas?: Json | null
          created_at?: string | null
          delivery_fee?: number | null
          estimated_delivery_time?: string | null
          id?: string
          is_active?: boolean | null
          market_penetration?: number | null
          min_order_amount?: number | null
          name: string
          parent_id?: string | null
          population?: number | null
          service_radius_km?: number | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          coordinates?: Json | null
          coverage_areas?: Json | null
          created_at?: string | null
          delivery_fee?: number | null
          estimated_delivery_time?: string | null
          id?: string
          is_active?: boolean | null
          market_penetration?: number | null
          min_order_amount?: number | null
          name?: string
          parent_id?: string | null
          population?: number | null
          service_radius_km?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points_transactions: {
        Row: {
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          points: number
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          points: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_program_config: {
        Row: {
          birthday_bonus_points: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          min_redemption_points: number | null
          point_expiry_months: number | null
          points_per_rupee: number | null
          program_name: string
          redemption_rate: number | null
          referral_points: number | null
          tier_benefits: Json | null
          tier_thresholds: Json | null
          updated_at: string | null
        }
        Insert: {
          birthday_bonus_points?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          min_redemption_points?: number | null
          point_expiry_months?: number | null
          points_per_rupee?: number | null
          program_name?: string
          redemption_rate?: number | null
          referral_points?: number | null
          tier_benefits?: Json | null
          tier_thresholds?: Json | null
          updated_at?: string | null
        }
        Update: {
          birthday_bonus_points?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          min_redemption_points?: number | null
          point_expiry_months?: number | null
          points_per_rupee?: number | null
          program_name?: string
          redemption_rate?: number | null
          referral_points?: number | null
          tier_benefits?: Json | null
          tier_thresholds?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          budget: number | null
          campaign_type: string
          clicks: number | null
          content: Json | null
          conversions: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          impressions: number | null
          name: string
          revenue: number | null
          schedule_end: string | null
          schedule_start: string | null
          spent_amount: number | null
          status: string | null
          target_audience: Json | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          campaign_type: string
          clicks?: number | null
          content?: Json | null
          conversions?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          impressions?: number | null
          name: string
          revenue?: number | null
          schedule_end?: string | null
          schedule_start?: string | null
          spent_amount?: number | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          campaign_type?: string
          clicks?: number | null
          content?: Json | null
          conversions?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          impressions?: number | null
          name?: string
          revenue?: number | null
          schedule_end?: string | null
          schedule_start?: string | null
          spent_amount?: number | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      medical_specializations: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_te: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_en: string
          name_te: string
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_en: string
          name_te: string
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_en?: string
          name_te?: string
        }
        Relationships: []
      }
      offer_usage_tracking: {
        Row: {
          discount_applied: number
          id: string
          offer_id: string
          order_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          discount_applied: number
          id?: string
          offer_id: string
          order_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          discount_applied?: number
          id?: string
          offer_id?: string
          order_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_usage_tracking_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "limited_time_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_usage_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_te: string | null
          discount_percentage: number | null
          display_order: number | null
          id: string
          status: Database["public"]["Enums"]["offer_status"] | null
          title_en: string
          title_te: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          id?: string
          status?: Database["public"]["Enums"]["offer_status"] | null
          title_en: string
          title_te: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          id?: string
          status?: Database["public"]["Enums"]["offer_status"] | null
          title_en?: string
          title_te?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          discount_amount: number | null
          fulfilled_quantity: number | null
          id: string
          inventory_id: string | null
          notes: string | null
          order_id: string | null
          prescription_required: boolean | null
          product_id: string | null
          quantity: number
          returned_quantity: number | null
          substitution_allowed: boolean | null
          total_price: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          discount_amount?: number | null
          fulfilled_quantity?: number | null
          id?: string
          inventory_id?: string | null
          notes?: string | null
          order_id?: string | null
          prescription_required?: boolean | null
          product_id?: string | null
          quantity: number
          returned_quantity?: number | null
          substitution_allowed?: boolean | null
          total_price?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          discount_amount?: number | null
          fulfilled_quantity?: number | null
          id?: string
          inventory_id?: string | null
          notes?: string | null
          order_id?: string | null
          prescription_required?: boolean | null
          product_id?: string | null
          quantity?: number
          returned_quantity?: number | null
          substitution_allowed?: boolean | null
          total_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "product_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string
          name: string
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url: string
          name: string
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string
          name?: string
          website_url?: string | null
        }
        Relationships: []
      }
      physiotherapists: {
        Row: {
          available_slots: Json | null
          bio_en: string | null
          bio_te: string | null
          clinic_address: string | null
          consultation_fee: number
          created_at: string | null
          experience_years: number
          home_visit_fee: number | null
          id: string
          is_active: boolean | null
          is_home_service: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          license_number: string
          name: string
          profile_image: string | null
          qualification: string
          rating: number | null
          specializations: string[] | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          available_slots?: Json | null
          bio_en?: string | null
          bio_te?: string | null
          clinic_address?: string | null
          consultation_fee?: number
          created_at?: string | null
          experience_years: number
          home_visit_fee?: number | null
          id?: string
          is_active?: boolean | null
          is_home_service?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          license_number: string
          name: string
          profile_image?: string | null
          qualification: string
          rating?: number | null
          specializations?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          available_slots?: Json | null
          bio_en?: string | null
          bio_te?: string | null
          clinic_address?: string | null
          consultation_fee?: number
          created_at?: string | null
          experience_years?: number
          home_visit_fee?: number | null
          id?: string
          is_active?: boolean | null
          is_home_service?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          license_number?: string
          name?: string
          profile_image?: string | null
          qualification?: string
          rating?: number | null
          specializations?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      physiotherapy_services: {
        Row: {
          age_group: string | null
          conditions_treated: string[] | null
          created_at: string | null
          description_en: string | null
          description_te: string | null
          duration: string | null
          equipment_required: string[] | null
          id: string
          is_active: boolean | null
          is_clinic_service: boolean | null
          is_home_service: boolean | null
          name_en: string
          name_te: string
          price: number
          service_type: string
          techniques_used: string[] | null
          updated_at: string | null
        }
        Insert: {
          age_group?: string | null
          conditions_treated?: string[] | null
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          duration?: string | null
          equipment_required?: string[] | null
          id?: string
          is_active?: boolean | null
          is_clinic_service?: boolean | null
          is_home_service?: boolean | null
          name_en: string
          name_te: string
          price?: number
          service_type: string
          techniques_used?: string[] | null
          updated_at?: string | null
        }
        Update: {
          age_group?: string | null
          conditions_treated?: string[] | null
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          duration?: string | null
          equipment_required?: string[] | null
          id?: string
          is_active?: boolean | null
          is_clinic_service?: boolean | null
          is_home_service?: boolean | null
          name_en?: string
          name_te?: string
          price?: number
          service_type?: string
          techniques_used?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pos_transaction_items: {
        Row: {
          batch_number: string | null
          created_at: string | null
          discount_amount: number | null
          expiry_date: string | null
          id: string
          inventory_id: string | null
          product_id: string | null
          quantity: number
          total_price: number | null
          transaction_id: string | null
          unit_price: number
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          discount_amount?: number | null
          expiry_date?: string | null
          id?: string
          inventory_id?: string | null
          product_id?: string | null
          quantity: number
          total_price?: number | null
          transaction_id?: string | null
          unit_price: number
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          discount_amount?: number | null
          expiry_date?: string | null
          id?: string
          inventory_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price?: number | null
          transaction_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "pos_transaction_items_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "product_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transaction_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "pos_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_transactions: {
        Row: {
          amount_paid: number | null
          cashier_id: string
          change_amount: number | null
          created_at: string | null
          customer_id: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_reference: string | null
          receipt_number: string | null
          refund_reference_id: string | null
          subtotal: number
          tax_amount: number | null
          terminal_id: string | null
          total_amount: number
          transaction_date: string | null
          transaction_number: string
          transaction_type:
            | Database["public"]["Enums"]["transaction_type"]
            | null
        }
        Insert: {
          amount_paid?: number | null
          cashier_id: string
          change_amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          receipt_number?: string | null
          refund_reference_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          terminal_id?: string | null
          total_amount?: number
          transaction_date?: string | null
          transaction_number: string
          transaction_type?:
            | Database["public"]["Enums"]["transaction_type"]
            | null
        }
        Update: {
          amount_paid?: number | null
          cashier_id?: string
          change_amount?: number | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          receipt_number?: string | null
          refund_reference_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          terminal_id?: string | null
          total_amount?: number
          transaction_date?: string | null
          transaction_number?: string
          transaction_type?:
            | Database["public"]["Enums"]["transaction_type"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_transactions_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_refund_reference_id_fkey"
            columns: ["refund_reference_id"]
            isOneToOne: false
            referencedRelation: "pos_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_authorization_requests: {
        Row: {
          approval_amount: number | null
          approval_code: string | null
          created_at: string | null
          doctor_name: string
          estimated_cost: number
          hospital_name: string
          id: string
          notes: string | null
          policy_id: string | null
          request_number: string
          status: Database["public"]["Enums"]["claim_status"] | null
          treatment_date: string
          treatment_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approval_amount?: number | null
          approval_code?: string | null
          created_at?: string | null
          doctor_name: string
          estimated_cost: number
          hospital_name: string
          id?: string
          notes?: string | null
          policy_id?: string | null
          request_number: string
          status?: Database["public"]["Enums"]["claim_status"] | null
          treatment_date: string
          treatment_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approval_amount?: number | null
          approval_code?: string | null
          created_at?: string | null
          doctor_name?: string
          estimated_cost?: number
          hospital_name?: string
          id?: string
          notes?: string | null
          policy_id?: string | null
          request_number?: string
          status?: Database["public"]["Enums"]["claim_status"] | null
          treatment_date?: string
          treatment_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_authorization_requests_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "user_insurance_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_authorization_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_inventory: {
        Row: {
          available_quantity: number | null
          batch_number: string | null
          cost_price: number | null
          created_at: string | null
          expiry_date: string | null
          id: string
          inventory_status:
            | Database["public"]["Enums"]["inventory_status"]
            | null
          last_restocked_at: string | null
          location_bin: string | null
          location_rack: string | null
          max_stock_level: number | null
          min_stock_level: number | null
          product_id: string | null
          reserved_quantity: number | null
          selling_price: number | null
          sku: string
          stock_quantity: number
          supplier_contact: string | null
          supplier_name: string | null
          updated_at: string | null
        }
        Insert: {
          available_quantity?: number | null
          batch_number?: string | null
          cost_price?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          inventory_status?:
            | Database["public"]["Enums"]["inventory_status"]
            | null
          last_restocked_at?: string | null
          location_bin?: string | null
          location_rack?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          product_id?: string | null
          reserved_quantity?: number | null
          selling_price?: number | null
          sku: string
          stock_quantity?: number
          supplier_contact?: string | null
          supplier_name?: string | null
          updated_at?: string | null
        }
        Update: {
          available_quantity?: number | null
          batch_number?: string | null
          cost_price?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          inventory_status?:
            | Database["public"]["Enums"]["inventory_status"]
            | null
          last_restocked_at?: string | null
          location_bin?: string | null
          location_rack?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          product_id?: string | null
          reserved_quantity?: number | null
          selling_price?: number | null
          sku?: string
          stock_quantity?: number
          supplier_contact?: string | null
          supplier_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          admin_response: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          images: Json | null
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          reported_count: number | null
          review_text: string | null
          review_title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          images?: Json | null
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          reported_count?: number | null
          review_text?: string | null
          review_title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          images?: Json | null
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          reported_count?: number | null
          review_text?: string | null
          review_title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description_en: string | null
          description_te: string | null
          discount_price: number | null
          expiry_date: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_prescription_required: boolean | null
          manufacturer: string | null
          name_en: string
          name_te: string
          price: number | null
          sku: string | null
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description_en?: string | null
          description_te?: string | null
          discount_price?: number | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_prescription_required?: boolean | null
          manufacturer?: string | null
          name_en: string
          name_te: string
          price?: number | null
          sku?: string | null
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description_en?: string | null
          description_te?: string | null
          discount_price?: number | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_prescription_required?: boolean | null
          manufacturer?: string | null
          name_en?: string
          name_te?: string
          price?: number | null
          sku?: string | null
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_offers: {
        Row: {
          applicable_categories: Json | null
          applicable_products: Json | null
          created_at: string | null
          description: string | null
          discount_value: number | null
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_order_amount: number | null
          offer_type: string
          target_locations: Json | null
          target_segments: Json | null
          title: string
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_categories?: Json | null
          applicable_products?: Json | null
          created_at?: string | null
          description?: string | null
          discount_value?: number | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          offer_type: string
          target_locations?: Json | null
          target_segments?: Json | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_categories?: Json | null
          applicable_products?: Json | null
          created_at?: string | null
          description?: string | null
          discount_value?: number | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          offer_type?: string
          target_locations?: Json | null
          target_segments?: Json | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          batch_number: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          product_id: string | null
          purchase_order_id: string | null
          quantity: number
          received_quantity: number | null
          rejected_quantity: number | null
          total_price: number | null
          unit_price: number
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          product_id?: string | null
          purchase_order_id?: string | null
          quantity: number
          received_quantity?: number | null
          rejected_quantity?: number | null
          total_price?: number | null
          unit_price: number
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          product_id?: string | null
          purchase_order_id?: string | null
          quantity?: number
          received_quantity?: number | null
          rejected_quantity?: number | null
          total_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          delivery_address: Json | null
          discount_amount: number | null
          expected_delivery_date: string | null
          final_amount: number
          id: string
          notes: string | null
          order_date: string
          order_status: Database["public"]["Enums"]["order_status"] | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          payment_terms: string | null
          po_number: string
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_address?: Json | null
          discount_amount?: number | null
          expected_delivery_date?: string | null
          final_amount?: number
          id?: string
          notes?: string | null
          order_date?: string
          order_status?: Database["public"]["Enums"]["order_status"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          payment_terms?: string | null
          po_number: string
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_address?: Json | null
          discount_amount?: number | null
          expected_delivery_date?: string | null
          final_amount?: number
          id?: string
          notes?: string | null
          order_date?: string
          order_status?: Database["public"]["Enums"]["order_status"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          payment_terms?: string | null
          po_number?: string
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_assessments: {
        Row: {
          appointment_id: string | null
          booking_id: string | null
          cleanliness_rating: number | null
          created_at: string | null
          feedback_text: string | null
          id: string
          improvement_suggestions: string | null
          overall_rating: number | null
          provider_id: string | null
          provider_rating: number | null
          punctuality_rating: number | null
          service_rating: number | null
          user_id: string | null
          would_recommend: boolean | null
        }
        Insert: {
          appointment_id?: string | null
          booking_id?: string | null
          cleanliness_rating?: number | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          improvement_suggestions?: string | null
          overall_rating?: number | null
          provider_id?: string | null
          provider_rating?: number | null
          punctuality_rating?: number | null
          service_rating?: number | null
          user_id?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          appointment_id?: string | null
          booking_id?: string | null
          cleanliness_rating?: number | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          improvement_suggestions?: string | null
          overall_rating?: number | null
          provider_id?: string | null
          provider_rating?: number | null
          punctuality_rating?: number | null
          service_rating?: number | null
          user_id?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_rules: {
        Row: {
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          priority: number | null
          recommended_products: Json | null
          rule_name: string
          rule_type: string
          trigger_products: Json | null
          updated_at: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          recommended_products?: Json | null
          rule_name: string
          rule_type: string
          trigger_products?: Json | null
          updated_at?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          recommended_products?: Json | null
          rule_name?: string
          rule_type?: string
          trigger_products?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scan_services: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_te: string | null
          duration: string | null
          id: string
          is_active: boolean | null
          is_contrast_required: boolean | null
          name_en: string
          name_te: string
          preparation_instructions: string | null
          price: number
          scan_code: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          is_contrast_required?: boolean | null
          name_en: string
          name_te: string
          preparation_instructions?: string | null
          price?: number
          scan_code: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          is_contrast_required?: boolean | null
          name_en?: string
          name_te?: string
          preparation_instructions?: string | null
          price?: number
          scan_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_analytics: {
        Row: {
          additional_data: Json | null
          created_at: string | null
          id: string
          metric_date: string
          metric_name: string
          metric_value: number
          service_id: string | null
          service_type: Database["public"]["Enums"]["service_type"]
        }
        Insert: {
          additional_data?: Json | null
          created_at?: string | null
          id?: string
          metric_date?: string
          metric_name: string
          metric_value: number
          service_id?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
        }
        Update: {
          additional_data?: Json | null
          created_at?: string | null
          id?: string
          metric_date?: string
          metric_name?: string
          metric_value?: number
          service_id?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description_en: string | null
          description_te: string | null
          display_order: number | null
          icon: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name_en: string
          name_te: string
          service_type: Database["public"]["Enums"]["service_type"]
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          display_order?: number | null
          icon?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name_en: string
          name_te: string
          service_type: Database["public"]["Enums"]["service_type"]
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description_en?: string | null
          description_te?: string | null
          display_order?: number | null
          icon?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name_en?: string
          name_te?: string
          service_type?: Database["public"]["Enums"]["service_type"]
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          id: string
          inventory_id: string | null
          moved_at: string | null
          moved_by: string | null
          movement_type: string
          notes: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          id?: string
          inventory_id?: string | null
          moved_at?: string | null
          moved_by?: string | null
          movement_type: string
          notes?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          id?: string
          inventory_id?: string | null
          moved_at?: string | null
          moved_by?: string | null
          movement_type?: string
          notes?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "product_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      surgery_opinions: {
        Row: {
          additional_tests_needed: string | null
          alternative_treatments: string | null
          consultation_date: string | null
          consultation_fee: number | null
          created_at: string | null
          current_medications: string[] | null
          current_symptoms: string | null
          diagnosis: string
          id: string
          imaging_urls: string[] | null
          medical_history: string | null
          opinion_status: string | null
          patient_age: number | null
          patient_gender: string | null
          patient_name: string
          previous_surgeries: string[] | null
          primary_hospital: string | null
          primary_surgeon: string | null
          priority_level: string | null
          proposed_date: string | null
          recommended_approach: string | null
          recovery_timeline: string | null
          risks_assessment: string | null
          second_opinion: string | null
          specialist_id: string | null
          surgery_type: string
          test_reports_urls: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          additional_tests_needed?: string | null
          alternative_treatments?: string | null
          consultation_date?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          current_medications?: string[] | null
          current_symptoms?: string | null
          diagnosis: string
          id?: string
          imaging_urls?: string[] | null
          medical_history?: string | null
          opinion_status?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name: string
          previous_surgeries?: string[] | null
          primary_hospital?: string | null
          primary_surgeon?: string | null
          priority_level?: string | null
          proposed_date?: string | null
          recommended_approach?: string | null
          recovery_timeline?: string | null
          risks_assessment?: string | null
          second_opinion?: string | null
          specialist_id?: string | null
          surgery_type: string
          test_reports_urls?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          additional_tests_needed?: string | null
          alternative_treatments?: string | null
          consultation_date?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          current_medications?: string[] | null
          current_symptoms?: string | null
          diagnosis?: string
          id?: string
          imaging_urls?: string[] | null
          medical_history?: string | null
          opinion_status?: string | null
          patient_age?: number | null
          patient_gender?: string | null
          patient_name?: string
          previous_surgeries?: string[] | null
          primary_hospital?: string | null
          primary_surgeon?: string | null
          priority_level?: string | null
          proposed_date?: string | null
          recommended_approach?: string | null
          recovery_timeline?: string | null
          risks_assessment?: string | null
          second_opinion?: string | null
          specialist_id?: string | null
          surgery_type?: string
          test_reports_urls?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surgery_opinions_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          data_type: string | null
          description: string | null
          id: string
          is_public: boolean | null
          is_required: boolean | null
          key: string
          updated_at: string | null
          validation_rules: Json | null
          value: Json | null
        }
        Insert: {
          category: string
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_required?: boolean | null
          key: string
          updated_at?: string | null
          validation_rules?: Json | null
          value?: Json | null
        }
        Update: {
          category?: string
          created_at?: string | null
          data_type?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          is_required?: boolean | null
          key?: string
          updated_at?: string | null
          validation_rules?: Json | null
          value?: Json | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          comment_en: string
          comment_te: string
          created_at: string | null
          customer_image: string | null
          customer_name: string
          display_order: number | null
          id: string
          is_featured: boolean | null
          location: string | null
          rating: number | null
        }
        Insert: {
          comment_en: string
          comment_te: string
          created_at?: string | null
          customer_image?: string | null
          customer_name: string
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          rating?: number | null
        }
        Update: {
          comment_en?: string
          comment_te?: string
          created_at?: string | null
          customer_image?: string | null
          customer_name?: string
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          rating?: number | null
        }
        Relationships: []
      }
      user_insurance_policies: {
        Row: {
          beneficiary_name: string | null
          coverage_amount: number
          created_at: string | null
          end_date: string
          family_members: Json | null
          id: string
          next_premium_date: string | null
          plan_id: string | null
          policy_documents: Json | null
          policy_holder_name: string
          policy_number: string
          policy_status: Database["public"]["Enums"]["policy_status"] | null
          premium_amount: number
          start_date: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          beneficiary_name?: string | null
          coverage_amount: number
          created_at?: string | null
          end_date: string
          family_members?: Json | null
          id?: string
          next_premium_date?: string | null
          plan_id?: string | null
          policy_documents?: Json | null
          policy_holder_name: string
          policy_number: string
          policy_status?: Database["public"]["Enums"]["policy_status"] | null
          premium_amount: number
          start_date: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          beneficiary_name?: string | null
          coverage_amount?: number
          created_at?: string | null
          end_date?: string
          family_members?: Json | null
          id?: string
          next_premium_date?: string | null
          plan_id?: string | null
          policy_documents?: Json | null
          policy_holder_name?: string
          policy_number?: string
          policy_status?: Database["public"]["Enums"]["policy_status"] | null
          premium_amount?: number
          start_date?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_insurance_policies_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "insurance_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_insurance_policies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_loyalty_accounts: {
        Row: {
          available_points: number | null
          created_at: string | null
          current_tier: string | null
          id: string
          lifetime_points: number | null
          referral_code: string | null
          tier_progress: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_points?: number | null
          created_at?: string | null
          current_tier?: string | null
          id?: string
          lifetime_points?: number | null
          referral_code?: string | null
          tier_progress?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_points?: number | null
          created_at?: string | null
          current_tier?: string | null
          id?: string
          lifetime_points?: number | null
          referral_code?: string | null
          tier_progress?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          location: Json | null
          phone: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          location?: Json | null
          phone?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          location?: Json | null
          phone?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: Json | null
          bank_details: Json | null
          commission_percentage: number | null
          company_name: string
          contact_person: string | null
          created_at: string | null
          credit_limit: number | null
          delivery_performance: number | null
          documents: Json | null
          email: string | null
          gstin: string | null
          id: string
          pan_number: string | null
          payment_terms_days: number | null
          phone: string | null
          quality_score: number | null
          rating: number | null
          updated_at: string | null
          vendor_code: string
          vendor_status: Database["public"]["Enums"]["vendor_status"] | null
        }
        Insert: {
          address?: Json | null
          bank_details?: Json | null
          commission_percentage?: number | null
          company_name: string
          contact_person?: string | null
          created_at?: string | null
          credit_limit?: number | null
          delivery_performance?: number | null
          documents?: Json | null
          email?: string | null
          gstin?: string | null
          id?: string
          pan_number?: string | null
          payment_terms_days?: number | null
          phone?: string | null
          quality_score?: number | null
          rating?: number | null
          updated_at?: string | null
          vendor_code: string
          vendor_status?: Database["public"]["Enums"]["vendor_status"] | null
        }
        Update: {
          address?: Json | null
          bank_details?: Json | null
          commission_percentage?: number | null
          company_name?: string
          contact_person?: string | null
          created_at?: string | null
          credit_limit?: number | null
          delivery_performance?: number | null
          documents?: Json | null
          email?: string | null
          gstin?: string | null
          id?: string
          pan_number?: string | null
          payment_terms_days?: number | null
          phone?: string | null
          quality_score?: number | null
          rating?: number | null
          updated_at?: string | null
          vendor_code?: string
          vendor_status?: Database["public"]["Enums"]["vendor_status"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_doctor_rating: {
        Args: { doctor_uuid: string }
        Returns: number
      }
      calculate_loyalty_tier: {
        Args: { total_points: number }
        Returns: string
      }
      can_access_claim_document: {
        Args: { document_uuid: string }
        Returns: boolean
      }
      can_access_consultation: {
        Args: { consultation_uuid: string }
        Returns: boolean
      }
      can_access_pos_transaction: {
        Args: { transaction_uuid: string }
        Returns: boolean
      }
      can_access_vendor_data: {
        Args: { vendor_uuid: string }
        Returns: boolean
      }
      generate_claim_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_po_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_preauth_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_transaction_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_caregiver_owner: {
        Args: { caregiver_uuid: string }
        Returns: boolean
      }
      is_diabetes_specialist_owner: {
        Args: { specialist_uuid: string }
        Returns: boolean
      }
      is_doctor: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_inventory_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      owns_cart_item: {
        Args: { cart_item_id: string }
        Returns: boolean
      }
      owns_customer_order: {
        Args: { order_uuid: string }
        Returns: boolean
      }
      owns_diabetes_appointment: {
        Args: { appointment_uuid: string }
        Returns: boolean
      }
      owns_doctor_profile: {
        Args: { doctor_uuid: string }
        Returns: boolean
      }
      owns_home_care_booking: {
        Args: { booking_uuid: string }
        Returns: boolean
      }
      owns_insurance_claim: {
        Args: { claim_uuid: string }
        Returns: boolean
      }
      owns_insurance_policy: {
        Args: { policy_uuid: string }
        Returns: boolean
      }
      owns_pre_auth_request: {
        Args: { request_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "rescheduled"
      banner_type: "hero" | "promotional" | "announcement"
      caregiver_status: "available" | "busy" | "offline" | "emergency_only"
      claim_priority: "low" | "medium" | "high" | "emergency"
      claim_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "paid"
        | "closed"
      consultation_status:
        | "scheduled"
        | "ongoing"
        | "completed"
        | "cancelled"
        | "no_show"
      consultation_type: "video" | "audio" | "chat" | "in_person"
      coupon_status: "active" | "inactive" | "expired" | "used_up"
      coupon_type:
        | "percentage"
        | "fixed_amount"
        | "free_shipping"
        | "buy_one_get_one"
      coverage_type:
        | "health"
        | "life"
        | "critical_illness"
        | "accident"
        | "dental"
        | "vision"
      day_of_week:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
      diabetes_test_type:
        | "hba1c"
        | "fasting_glucose"
        | "post_meal"
        | "glucose_tolerance"
        | "continuous_monitoring"
      doctor_status: "active" | "inactive" | "busy" | "offline"
      document_type:
        | "medical_report"
        | "prescription"
        | "invoice"
        | "discharge_summary"
        | "identity_proof"
        | "policy_document"
        | "bank_statement"
        | "other"
      inventory_status:
        | "in_stock"
        | "low_stock"
        | "out_of_stock"
        | "discontinued"
      offer_status: "active" | "inactive" | "scheduled"
      order_priority: "low" | "normal" | "high" | "emergency"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "returned"
      payment_method: "cash" | "card" | "upi" | "wallet" | "insurance"
      payment_status: "pending" | "paid" | "failed" | "refunded" | "partial"
      policy_status: "active" | "expired" | "suspended" | "cancelled"
      qualification_status: "verified" | "pending" | "expired" | "rejected"
      scan_modality:
        | "xray"
        | "ct"
        | "mri"
        | "ultrasound"
        | "mammography"
        | "nuclear_medicine"
        | "pet_scan"
        | "bone_scan"
        | "dexa_scan"
        | "fluoroscopy"
        | "angiography"
        | "echocardiography"
        | "doppler_ultrasound"
        | "cardiac_ct"
        | "cardiac_mri"
      service_category_type:
        | "nursing_care"
        | "physiotherapy"
        | "elderly_care"
        | "chronic_disease"
        | "mother_baby_care"
        | "blood_sugar_monitoring"
        | "diabetes_medication"
        | "nutrition_diet"
        | "specialist_consultation"
        | "complication_screening"
      service_type:
        | "medicine"
        | "lab_test"
        | "scan"
        | "doctor"
        | "home_care"
        | "diabetes_care"
      transaction_type: "sale" | "return" | "refund" | "adjustment"
      user_role: "admin" | "user" | "doctor" | "pharmacist" | "lab_technician"
      vendor_status: "active" | "inactive" | "suspended" | "pending_approval"
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
      appointment_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      banner_type: ["hero", "promotional", "announcement"],
      caregiver_status: ["available", "busy", "offline", "emergency_only"],
      claim_priority: ["low", "medium", "high", "emergency"],
      claim_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "paid",
        "closed",
      ],
      consultation_status: [
        "scheduled",
        "ongoing",
        "completed",
        "cancelled",
        "no_show",
      ],
      consultation_type: ["video", "audio", "chat", "in_person"],
      coupon_status: ["active", "inactive", "expired", "used_up"],
      coupon_type: [
        "percentage",
        "fixed_amount",
        "free_shipping",
        "buy_one_get_one",
      ],
      coverage_type: [
        "health",
        "life",
        "critical_illness",
        "accident",
        "dental",
        "vision",
      ],
      day_of_week: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      diabetes_test_type: [
        "hba1c",
        "fasting_glucose",
        "post_meal",
        "glucose_tolerance",
        "continuous_monitoring",
      ],
      doctor_status: ["active", "inactive", "busy", "offline"],
      document_type: [
        "medical_report",
        "prescription",
        "invoice",
        "discharge_summary",
        "identity_proof",
        "policy_document",
        "bank_statement",
        "other",
      ],
      inventory_status: [
        "in_stock",
        "low_stock",
        "out_of_stock",
        "discontinued",
      ],
      offer_status: ["active", "inactive", "scheduled"],
      order_priority: ["low", "normal", "high", "emergency"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      payment_method: ["cash", "card", "upi", "wallet", "insurance"],
      payment_status: ["pending", "paid", "failed", "refunded", "partial"],
      policy_status: ["active", "expired", "suspended", "cancelled"],
      qualification_status: ["verified", "pending", "expired", "rejected"],
      scan_modality: [
        "xray",
        "ct",
        "mri",
        "ultrasound",
        "mammography",
        "nuclear_medicine",
        "pet_scan",
        "bone_scan",
        "dexa_scan",
        "fluoroscopy",
        "angiography",
        "echocardiography",
        "doppler_ultrasound",
        "cardiac_ct",
        "cardiac_mri",
      ],
      service_category_type: [
        "nursing_care",
        "physiotherapy",
        "elderly_care",
        "chronic_disease",
        "mother_baby_care",
        "blood_sugar_monitoring",
        "diabetes_medication",
        "nutrition_diet",
        "specialist_consultation",
        "complication_screening",
      ],
      service_type: [
        "medicine",
        "lab_test",
        "scan",
        "doctor",
        "home_care",
        "diabetes_care",
      ],
      transaction_type: ["sale", "return", "refund", "adjustment"],
      user_role: ["admin", "user", "doctor", "pharmacist", "lab_technician"],
      vendor_status: ["active", "inactive", "suspended", "pending_approval"],
    },
  },
} as const
