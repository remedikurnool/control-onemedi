
-- Create enums for lab tests and scans
CREATE TYPE public.test_category AS ENUM (
  'blood_work', 'urine_analysis', 'hormone_tests', 'cardiac_markers', 
  'liver_function', 'kidney_function', 'diabetes', 'thyroid', 
  'vitamin_deficiency', 'infection_screening', 'cancer_markers', 'allergy_tests'
);

CREATE TYPE public.scan_type AS ENUM (
  'x_ray', 'mri', 'ct_scan', 'pet_scan', 'ultrasound', 
  'cardiac', 'nuclear', 'pregnancy', 'mammography', 'dexa'
);

CREATE TYPE public.organ_system AS ENUM (
  'cardiovascular', 'respiratory', 'digestive', 'nervous', 
  'musculoskeletal', 'endocrine', 'reproductive', 'urinary', 
  'immune', 'integumentary'
);

CREATE TYPE public.risk_factor AS ENUM (
  'diabetes', 'hypertension', 'heart_disease', 'obesity', 
  'smoking', 'family_history', 'age_related', 'pregnancy'
);

-- Create diagnostic centers table
CREATE TABLE public.diagnostic_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  address JSONB NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  license_number TEXT NOT NULL,
  accreditation TEXT[],
  rating NUMERIC(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  operating_hours JSONB,
  home_collection_available BOOLEAN DEFAULT false,
  home_collection_radius_km INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lab tests table
CREATE TABLE public.lab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  description_en TEXT,
  description_te TEXT,
  test_code TEXT UNIQUE NOT NULL,
  category public.test_category NOT NULL,
  disease_conditions TEXT[],
  risk_factors public.risk_factor[],
  sample_type TEXT NOT NULL, -- blood, urine, saliva, etc.
  fasting_required BOOLEAN DEFAULT false,
  preparation_instructions TEXT,
  report_delivery_hours INTEGER DEFAULT 24,
  normal_ranges JSONB, -- age/gender specific ranges
  is_package BOOLEAN DEFAULT false,
  package_tests UUID[], -- references to other lab_tests if package
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lab test pricing per center
CREATE TABLE public.lab_test_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.lab_tests(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES public.diagnostic_centers(id) ON DELETE CASCADE,
  base_price NUMERIC(10,2) NOT NULL,
  discounted_price NUMERIC(10,2),
  discount_percentage INTEGER,
  home_collection_fee NUMERIC(10,2) DEFAULT 0,
  urgent_fee NUMERIC(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(test_id, center_id)
);

-- Create scans table
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  description_en TEXT,
  description_te TEXT,
  scan_code TEXT UNIQUE NOT NULL,
  scan_type public.scan_type NOT NULL,
  organ_system public.organ_system[],
  disease_conditions TEXT[],
  contrast_required BOOLEAN DEFAULT false,
  preparation_instructions TEXT,
  duration_minutes INTEGER,
  radiation_dose TEXT, -- for CT, X-ray etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create scan pricing per center
CREATE TABLE public.scan_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES public.diagnostic_centers(id) ON DELETE CASCADE,
  base_price NUMERIC(10,2) NOT NULL,
  discounted_price NUMERIC(10,2),
  discount_percentage INTEGER,
  contrast_fee NUMERIC(10,2) DEFAULT 0,
  cd_fee NUMERIC(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(scan_id, center_id)
);

-- Create lab test bookings table
CREATE TABLE public.lab_test_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  center_id UUID NOT NULL REFERENCES public.diagnostic_centers(id),
  booking_date DATE NOT NULL,
  booking_time TIME,
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  patient_gender TEXT,
  contact_phone TEXT NOT NULL,
  home_collection BOOLEAN DEFAULT false,
  collection_address JSONB,
  fasting_required BOOLEAN DEFAULT false,
  urgent_processing BOOLEAN DEFAULT false,
  total_amount NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  final_amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  booking_status TEXT DEFAULT 'scheduled',
  special_instructions TEXT,
  reports_uploaded BOOLEAN DEFAULT false,
  report_urls JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lab test booking items
CREATE TABLE public.lab_test_booking_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.lab_test_bookings(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES public.lab_tests(id),
  test_name TEXT NOT NULL,
  base_price NUMERIC(10,2) NOT NULL,
  discounted_price NUMERIC(10,2),
  home_collection_fee NUMERIC(10,2) DEFAULT 0,
  urgent_fee NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create scan bookings table
CREATE TABLE public.scan_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  center_id UUID NOT NULL REFERENCES public.diagnostic_centers(id),
  booking_date DATE NOT NULL,
  booking_time TIME,
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  patient_gender TEXT,
  contact_phone TEXT NOT NULL,
  contrast_required BOOLEAN DEFAULT false,
  total_amount NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  final_amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  booking_status TEXT DEFAULT 'scheduled',
  preparation_followed BOOLEAN DEFAULT false,
  special_instructions TEXT,
  reports_uploaded BOOLEAN DEFAULT false,
  report_urls JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create scan booking items
CREATE TABLE public.scan_booking_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.scan_bookings(id) ON DELETE CASCADE,
  scan_id UUID NOT NULL REFERENCES public.scans(id),
  scan_name TEXT NOT NULL,
  base_price NUMERIC(10,2) NOT NULL,
  discounted_price NUMERIC(10,2),
  contrast_fee NUMERIC(10,2) DEFAULT 0,
  cd_fee NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE public.diagnostic_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_test_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_test_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_test_booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_booking_items ENABLE ROW LEVEL SECURITY;

-- Public read policies for active items
CREATE POLICY "public_read_active_centers" ON public.diagnostic_centers FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_active_lab_tests" ON public.lab_tests FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_lab_test_pricing" ON public.lab_test_pricing FOR SELECT USING (is_available = true);
CREATE POLICY "public_read_active_scans" ON public.scans FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_scan_pricing" ON public.scan_pricing FOR SELECT USING (is_available = true);

-- Admin management policies
CREATE POLICY "admin_manage_centers" ON public.diagnostic_centers FOR ALL USING (is_admin_user());
CREATE POLICY "admin_manage_lab_tests" ON public.lab_tests FOR ALL USING (is_admin_user());
CREATE POLICY "admin_manage_lab_pricing" ON public.lab_test_pricing FOR ALL USING (is_admin_user());
CREATE POLICY "admin_manage_scans" ON public.scans FOR ALL USING (is_admin_user());
CREATE POLICY "admin_manage_scan_pricing" ON public.scan_pricing FOR ALL USING (is_admin_user());

-- User booking policies
CREATE POLICY "users_own_lab_bookings" ON public.lab_test_bookings 
  FOR ALL USING (user_id = auth.uid() OR is_admin_user()) 
  WITH CHECK (user_id = auth.uid() OR is_admin_user());

CREATE POLICY "users_own_scan_bookings" ON public.scan_bookings 
  FOR ALL USING (user_id = auth.uid() OR is_admin_user()) 
  WITH CHECK (user_id = auth.uid() OR is_admin_user());

CREATE POLICY "access_lab_booking_items" ON public.lab_test_booking_items 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.lab_test_bookings ltb 
    WHERE ltb.id = booking_id AND (ltb.user_id = auth.uid() OR is_admin_user())
  ));

CREATE POLICY "access_scan_booking_items" ON public.scan_booking_items 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.scan_bookings sb 
    WHERE sb.id = booking_id AND (sb.user_id = auth.uid() OR is_admin_user())
  ));

-- Insert sample data
INSERT INTO public.diagnostic_centers (name_en, name_te, address, phone, license_number, home_collection_available, home_collection_radius_km) VALUES
('Apollo Diagnostics', 'అపోలో డయాగ్నాస్టిక్స్', '{"street": "Banjara Hills", "city": "Hyderabad", "state": "Telangana", "pincode": "500034"}', '+91-40-12345678', 'AP-DIAG-001', true, 25),
('SRL Diagnostics', 'ఎస్ఆర్ఎల్ డయాగ్నాస్టిక్స్', '{"street": "Madhapur", "city": "Hyderabad", "state": "Telangana", "pincode": "500081"}', '+91-40-87654321', 'AP-DIAG-002', true, 30),
('Dr. Lal PathLabs', 'డాక్టర్ లాల్ పాత్లాబ్స్', '{"street": "Secunderabad", "city": "Hyderabad", "state": "Telangana", "pincode": "500003"}', '+91-40-11223344', 'AP-DIAG-003', false, 0);
