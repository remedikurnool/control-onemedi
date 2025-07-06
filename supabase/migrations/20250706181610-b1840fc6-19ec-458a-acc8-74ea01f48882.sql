
-- Create tables for doctors module
CREATE TABLE IF NOT EXISTS public.lab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  test_code TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_te TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  preparation_instructions TEXT,
  report_time TEXT,
  is_fasting_required BOOLEAN DEFAULT false,
  is_home_collection BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tables for diagnostic centers
CREATE TABLE IF NOT EXISTS public.diagnostic_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  working_hours TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tables for scan services
CREATE TABLE IF NOT EXISTS public.scan_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  scan_code TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_te TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  preparation_instructions TEXT,
  duration TEXT,
  is_contrast_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies for lab_tests
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_lab_tests" ON public.lab_tests
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "public_read_lab_tests" ON public.lab_tests
  FOR SELECT USING (is_active = true);

-- Add RLS policies for diagnostic_centers
ALTER TABLE public.diagnostic_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_diagnostic_centers" ON public.diagnostic_centers
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "public_read_diagnostic_centers" ON public.diagnostic_centers
  FOR SELECT USING (is_active = true);

-- Add RLS policies for scan_services
ALTER TABLE public.scan_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_scan_services" ON public.scan_services
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "public_read_scan_services" ON public.scan_services
  FOR SELECT USING (is_active = true);
