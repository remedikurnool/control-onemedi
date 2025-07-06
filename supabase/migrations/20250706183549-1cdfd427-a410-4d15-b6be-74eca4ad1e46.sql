
-- Create ambulance services table
CREATE TABLE IF NOT EXISTS public.ambulance_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  service_type TEXT NOT NULL, -- 'basic', 'advanced', 'cardiac', 'neonatal'
  vehicle_number TEXT UNIQUE NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  paramedic_name TEXT,
  paramedic_phone TEXT,
  equipment_list TEXT[],
  price_per_km NUMERIC NOT NULL DEFAULT 0,
  base_fare NUMERIC NOT NULL DEFAULT 0,
  location JSONB, -- current location
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ambulance bookings table
CREATE TABLE IF NOT EXISTS public.ambulance_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  ambulance_id UUID REFERENCES public.ambulance_services(id),
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  emergency_type TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_coordinates JSONB,
  destination_address TEXT NOT NULL,
  destination_coordinates JSONB,
  contact_phone TEXT NOT NULL,
  emergency_contact TEXT,
  medical_history TEXT,
  current_condition TEXT,
  estimated_distance NUMERIC,
  total_amount NUMERIC,
  status TEXT DEFAULT 'requested', -- 'requested', 'assigned', 'en_route', 'completed', 'cancelled'
  booking_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  pickup_time TIMESTAMP WITH TIME ZONE,
  completion_time TIMESTAMP WITH TIME ZONE,
  driver_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create physiotherapy services table
CREATE TABLE IF NOT EXISTS public.physiotherapy_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  description_en TEXT,
  description_te TEXT,
  service_type TEXT NOT NULL, -- 'consultation', 'session', 'package'
  duration TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  conditions_treated TEXT[],
  techniques_used TEXT[],
  equipment_required TEXT[],
  is_home_service BOOLEAN DEFAULT false,
  is_clinic_service BOOLEAN DEFAULT true,
  age_group TEXT, -- 'pediatric', 'adult', 'geriatric', 'all'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create physiotherapists table
CREATE TABLE IF NOT EXISTS public.physiotherapists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  qualification TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  experience_years INTEGER NOT NULL,
  specializations TEXT[],
  languages TEXT[] DEFAULT '{English,Telugu,Hindi}',
  profile_image TEXT,
  bio_en TEXT,
  bio_te TEXT,
  consultation_fee NUMERIC NOT NULL DEFAULT 500,
  home_visit_fee NUMERIC,
  clinic_address TEXT,
  available_slots JSONB DEFAULT '{}',
  rating NUMERIC DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  is_home_service BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create hospitals table
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  hospital_type TEXT NOT NULL, -- 'government', 'private', 'specialty'
  address TEXT NOT NULL,
  coordinates JSONB,
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  emergency_number TEXT,
  specialties TEXT[],
  facilities TEXT[],
  bed_capacity INTEGER,
  icu_beds INTEGER,
  emergency_services BOOLEAN DEFAULT true,
  ambulance_service BOOLEAN DEFAULT false,
  pharmacy BOOLEAN DEFAULT false,
  laboratory BOOLEAN DEFAULT false,
  blood_bank BOOLEAN DEFAULT false,
  operating_hours TEXT,
  emergency_hours TEXT DEFAULT '24/7',
  insurance_accepted TEXT[],
  rating NUMERIC DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create blood banks table
CREATE TABLE IF NOT EXISTS public.blood_banks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  hospital_id UUID REFERENCES public.hospitals(id),
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  license_number TEXT UNIQUE NOT NULL,
  operating_hours TEXT,
  emergency_contact TEXT,
  storage_capacity INTEGER,
  is_government BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create blood inventory table
CREATE TABLE IF NOT EXISTS public.blood_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blood_bank_id UUID REFERENCES public.blood_banks(id) NOT NULL,
  blood_group TEXT NOT NULL, -- 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  component_type TEXT NOT NULL, -- 'whole_blood', 'plasma', 'platelets', 'rbc'
  units_available INTEGER NOT NULL DEFAULT 0,
  units_reserved INTEGER DEFAULT 0,
  expiry_date DATE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create blood requests table
CREATE TABLE IF NOT EXISTS public.blood_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  blood_group TEXT NOT NULL,
  component_type TEXT NOT NULL,
  units_required INTEGER NOT NULL,
  urgency_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  hospital_name TEXT,
  doctor_name TEXT,
  contact_phone TEXT NOT NULL,
  medical_reason TEXT,
  preferred_blood_bank_id UUID REFERENCES public.blood_banks(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'matched', 'fulfilled', 'cancelled'
  required_by TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create surgery second opinion table
CREATE TABLE IF NOT EXISTS public.surgery_opinions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  patient_gender TEXT,
  primary_surgeon TEXT,
  primary_hospital TEXT,
  surgery_type TEXT NOT NULL,
  proposed_date DATE,
  diagnosis TEXT NOT NULL,
  current_symptoms TEXT,
  medical_history TEXT,
  current_medications TEXT[],
  previous_surgeries TEXT[],
  test_reports_urls TEXT[],
  imaging_urls TEXT[],
  specialist_id UUID REFERENCES public.doctors(id),
  opinion_status TEXT DEFAULT 'pending', -- 'pending', 'in_review', 'completed', 'cancelled'
  second_opinion TEXT,
  recommended_approach TEXT,
  alternative_treatments TEXT,
  risks_assessment TEXT,
  recovery_timeline TEXT,
  additional_tests_needed TEXT,
  consultation_fee NUMERIC DEFAULT 1000,
  consultation_date TIMESTAMP WITH TIME ZONE,
  priority_level TEXT DEFAULT 'normal', -- 'normal', 'urgent', 'emergency'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create diet plans table
CREATE TABLE IF NOT EXISTS public.diet_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  description_en TEXT,
  description_te TEXT,
  plan_type TEXT NOT NULL, -- 'weight_loss', 'weight_gain', 'diabetes', 'heart_healthy', 'general'
  duration_days INTEGER NOT NULL,
  target_conditions TEXT[],
  dietary_restrictions TEXT[],
  calorie_range TEXT,
  macros JSONB, -- protein, carbs, fats percentages
  meal_structure JSONB, -- number of meals, timing
  foods_to_include TEXT[],
  foods_to_avoid TEXT[],
  sample_menu JSONB,
  nutritionist_id UUID REFERENCES auth.users,
  price NUMERIC DEFAULT 0,
  is_personalized BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create diet consultations table
CREATE TABLE IF NOT EXISTS public.diet_consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nutritionist_id UUID REFERENCES auth.users,
  diet_plan_id UUID REFERENCES public.diet_plans(id),
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  patient_gender TEXT,
  height NUMERIC,
  weight NUMERIC,
  activity_level TEXT,
  health_goals TEXT[],
  medical_conditions TEXT[],
  allergies TEXT[],
  food_preferences TEXT[],
  current_diet_pattern TEXT,
  consultation_type TEXT DEFAULT 'initial', -- 'initial', 'follow_up', 'review'
  consultation_date TIMESTAMP WITH TIME ZONE,
  consultation_notes TEXT,
  recommendations TEXT,
  custom_plan JSONB,
  progress_tracking JSONB,
  next_consultation DATE,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  consultation_fee NUMERIC DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for all tables
ALTER TABLE public.ambulance_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physiotherapy_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physiotherapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_consultations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Ambulance services
CREATE POLICY "admin_manage_ambulance_services" ON public.ambulance_services
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "public_read_ambulance_services" ON public.ambulance_services
  FOR SELECT USING (is_active = true);

-- Ambulance bookings
CREATE POLICY "users_own_ambulance_bookings" ON public.ambulance_bookings
  FOR ALL USING (user_id = auth.uid() OR is_admin()) WITH CHECK (user_id = auth.uid() OR is_admin());

-- Physiotherapy services
CREATE POLICY "admin_manage_physio_services" ON public.physiotherapy_services
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "public_read_physio_services" ON public.physiotherapy_services
  FOR SELECT USING (is_active = true);

-- Physiotherapists
CREATE POLICY "admin_manage_physiotherapists" ON public.physiotherapists
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "public_read_physiotherapists" ON public.physiotherapists
  FOR SELECT USING (is_verified = true AND is_active = true);

-- Hospitals
CREATE POLICY "admin_manage_hospitals" ON public.hospitals
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "public_read_hospitals" ON public.hospitals
  FOR SELECT USING (is_active = true);

-- Blood banks
CREATE POLICY "admin_manage_blood_banks" ON public.blood_banks
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "public_read_blood_banks" ON public.blood_banks
  FOR SELECT USING (is_active = true);

-- Blood inventory
CREATE POLICY "admin_manage_blood_inventory" ON public.blood_inventory
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "public_read_blood_inventory" ON public.blood_inventory
  FOR SELECT USING (true);

-- Blood requests
CREATE POLICY "users_own_blood_requests" ON public.blood_requests
  FOR ALL USING (user_id = auth.uid() OR is_admin()) WITH CHECK (user_id = auth.uid() OR is_admin());

-- Surgery opinions
CREATE POLICY "users_own_surgery_opinions" ON public.surgery_opinions
  FOR ALL USING (user_id = auth.uid() OR is_admin()) WITH CHECK (user_id = auth.uid() OR is_admin());

-- Diet plans
CREATE POLICY "admin_manage_diet_plans" ON public.diet_plans
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "public_read_diet_plans" ON public.diet_plans
  FOR SELECT USING (is_active = true);

-- Diet consultations
CREATE POLICY "users_own_diet_consultations" ON public.diet_consultations
  FOR ALL USING (user_id = auth.uid() OR nutritionist_id = auth.uid() OR is_admin()) 
  WITH CHECK (user_id = auth.uid() OR nutritionist_id = auth.uid() OR is_admin());

-- Enable realtime for all tables
ALTER TABLE public.ambulance_services REPLICA IDENTITY FULL;
ALTER TABLE public.ambulance_bookings REPLICA IDENTITY FULL;
ALTER TABLE public.physiotherapy_services REPLICA IDENTITY FULL;
ALTER TABLE public.physiotherapists REPLICA IDENTITY FULL;
ALTER TABLE public.hospitals REPLICA IDENTITY FULL;
ALTER TABLE public.blood_banks REPLICA IDENTITY FULL;
ALTER TABLE public.blood_inventory REPLICA IDENTITY FULL;
ALTER TABLE public.blood_requests REPLICA IDENTITY FULL;
ALTER TABLE public.surgery_opinions REPLICA IDENTITY FULL;
ALTER TABLE public.diet_plans REPLICA IDENTITY FULL;
ALTER TABLE public.diet_consultations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulance_services;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulance_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.physiotherapy_services;
ALTER PUBLICATION supabase_realtime ADD TABLE public.physiotherapists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hospitals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_banks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.surgery_opinions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diet_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diet_consultations;
