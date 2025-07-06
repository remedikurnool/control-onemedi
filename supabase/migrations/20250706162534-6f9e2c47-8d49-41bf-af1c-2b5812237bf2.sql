
-- First, let's create the core tables for the admin panel

-- Admin user roles and permissions
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin', 'manager', 'staff');

-- Update user_profiles to include admin roles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role public.admin_role DEFAULT 'staff',
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Medicine categories
CREATE TABLE public.medicine_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  description_en TEXT,
  description_te TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Lab test categories  
CREATE TABLE public.lab_test_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  description_en TEXT,
  description_te TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Diagnostic centers
CREATE TABLE public.diagnostic_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  license_number TEXT,
  is_active BOOLEAN DEFAULT true,
  location_coordinates POINT,
  working_hours JSONB DEFAULT '{}',
  services_offered TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lab tests
CREATE TABLE public.lab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  description_en TEXT,
  description_te TEXT,
  category_id UUID REFERENCES lab_test_categories(id),
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  preparation_instructions TEXT,
  sample_type TEXT,
  report_time TEXT,
  fasting_required BOOLEAN DEFAULT false,
  home_collection_available BOOLEAN DEFAULT true,
  disease_conditions TEXT[],
  risk_factors TEXT[],
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Lab test center pricing
CREATE TABLE public.lab_test_center_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES lab_tests(id) ON DELETE CASCADE,
  center_id UUID REFERENCES diagnostic_centers(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(test_id, center_id)
);

-- Scan types
CREATE TYPE public.scan_type AS ENUM ('xray', 'mri', 'ct', 'pet', 'ultrasound', 'mammography', 'dexa');

CREATE TABLE public.scan_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  scan_type public.scan_type NOT NULL,
  description_en TEXT,
  description_te TEXT,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  preparation_instructions TEXT,
  duration_minutes INTEGER,
  contrast_required BOOLEAN DEFAULT false,
  disease_conditions TEXT[],
  body_parts TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scan center pricing
CREATE TABLE public.scan_center_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID REFERENCES scan_services(id) ON DELETE CASCADE,
  center_id UUID REFERENCES diagnostic_centers(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(scan_id, center_id)
);

-- Location zones
CREATE TABLE public.location_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT DEFAULT 'Andhra Pradesh',
  pincodes TEXT[],
  coordinates JSONB,
  delivery_charge NUMERIC(10,2) DEFAULT 0,
  delivery_time_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ambulance providers
CREATE TABLE public.ambulance_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  license_number TEXT,
  vehicle_type TEXT,
  equipment_available TEXT[],
  base_fare NUMERIC(10,2) DEFAULT 0,
  per_km_rate NUMERIC(10,2) DEFAULT 0,
  zone_id UUID REFERENCES location_zones(id),
  is_emergency_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Campaign management
CREATE TYPE public.campaign_type AS ENUM ('sms', 'email', 'whatsapp', 'push_notification');
CREATE TYPE public.campaign_status AS ENUM ('draft', 'scheduled', 'running', 'completed', 'paused');

CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  campaign_type public.campaign_type NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  target_audience JSONB DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status public.campaign_status DEFAULT 'draft',
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System settings
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type TEXT DEFAULT 'general',
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin activity logs
CREATE TABLE public.admin_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  target_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all admin tables
ALTER TABLE public.medicine_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_test_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_test_center_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_center_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create admin access function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role IN ('super_admin', 'admin', 'manager')
    AND up.is_active = true
  );
$$;

-- RLS Policies for admin access
CREATE POLICY "Admin access for medicine_categories" ON public.medicine_categories FOR ALL USING (is_admin_user());
CREATE POLICY "Admin access for lab_test_categories" ON public.lab_test_categories FOR ALL USING (is_admin_user());
CREATE POLICY "Admin access for diagnostic_centers" ON public.diagnostic_centers FOR ALL USING (is_admin_user());
CREATE POLICY "Admin access for lab_tests" ON public.lab_tests FOR ALL USING (is_admin_user());
CREATE POLICY "Admin access for lab_test_center_pricing" ON public.lab_test_center_pricing FOR ALL USING (is_admin_user());
CREATE POLICY "Admin access for scan_services" ON public.scan_services FOR ALL USING (is_admin_user());
CREATE POLICY "Admin access for scan_center_pricing" ON public.scan_center_pricing FOR ALL USING (is_admin_user());
CREATE POLICY "Admin access for location_zones" ON public.location_zones FOR ALL USING (is_admin_user());
CREATE POLICY "Admin access for ambulance_providers" ON public.ambulance_providers FOR ALL USING (is_admin_user());
CREATE POLICY "Admin access for marketing_campaigns" ON public.marketing_campaigns FOR ALL USING (is_admin_user());
CREATE POLICY "Admin access for system_settings" ON public.system_settings FOR ALL USING (is_admin_user());
CREATE POLICY "Admin access for admin_activity_logs" ON public.admin_activity_logs FOR ALL USING (is_admin_user());

-- Public read policies for frontend
CREATE POLICY "Public read medicine_categories" ON public.medicine_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read lab_test_categories" ON public.lab_test_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read diagnostic_centers" ON public.diagnostic_centers FOR SELECT USING (is_active = true);
CREATE POLICY "Public read lab_tests" ON public.lab_tests FOR SELECT USING (is_active = true);
CREATE POLICY "Public read lab_test_center_pricing" ON public.lab_test_center_pricing FOR SELECT USING (is_available = true);
CREATE POLICY "Public read scan_services" ON public.scan_services FOR SELECT USING (is_active = true);
CREATE POLICY "Public read scan_center_pricing" ON public.scan_center_pricing FOR SELECT USING (is_available = true);
CREATE POLICY "Public read location_zones" ON public.location_zones FOR SELECT USING (is_active = true);
CREATE POLICY "Public read ambulance_providers" ON public.ambulance_providers FOR SELECT USING (is_active = true);

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', '"ONE MEDI"', 'general', 'Website name'),
('site_location', '"Kurnool, Andhra Pradesh"', 'general', 'Primary business location'),
('delivery_radius_km', '50', 'delivery', 'Maximum delivery radius in kilometers'),
('min_order_amount', '500', 'order', 'Minimum order amount for delivery'),
('emergency_contact', '"+91-9876543210"', 'contact', 'Emergency contact number'),
('business_hours', '{"open": "08:00", "close": "22:00"}', 'general', 'Business operating hours'),
('tax_rate', '18', 'financial', 'GST tax rate percentage'),
('currency', '"INR"', 'financial', 'Default currency');

-- Insert default location zone for Kurnool
INSERT INTO public.location_zones (zone_name, city, pincodes, delivery_charge, delivery_time_hours) VALUES
('Kurnool Central', 'Kurnool', ARRAY['518001', '518002', '518003', '518004'], 0, 2),
('Kurnool Extended', 'Kurnool', ARRAY['518005', '518006', '518007', '518008'], 50, 4);
