
-- Add missing fields to existing tables and create new tables

-- Update products table to include missing medicine fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS dosage_form TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Update lab_tests table to include missing fields
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS test_group TEXT;
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS sample_type TEXT;

-- Update scan_services table to include missing fields  
ALTER TABLE scan_services ADD COLUMN IF NOT EXISTS scan_type TEXT;
ALTER TABLE scan_services ADD COLUMN IF NOT EXISTS image_prep_required BOOLEAN DEFAULT false;

-- Add location fields to hospitals, ambulances, and blood banks
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS longitude NUMERIC;

ALTER TABLE ambulance_services ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE ambulance_services ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE ambulance_services ADD COLUMN IF NOT EXISTS service_area_radius_km NUMERIC DEFAULT 10;
ALTER TABLE ambulance_services ADD COLUMN IF NOT EXISTS available_24x7 BOOLEAN DEFAULT true;

ALTER TABLE blood_banks ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE blood_banks ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE blood_banks ADD COLUMN IF NOT EXISTS blood_inventory JSONB DEFAULT '{}';

-- Create home care services table
CREATE TABLE IF NOT EXISTS home_care_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  duration TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create diabetes care plans table
CREATE TABLE IF NOT EXISTS diabetes_care_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL,
  features TEXT[],
  price NUMERIC NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create layout configuration table
CREATE TABLE IF NOT EXISTS layout_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  homepage_sections_order JSONB DEFAULT '[]',
  section_visibility JSONB DEFAULT '{}',
  featured_categories JSONB DEFAULT '[]',
  banner_urls JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create global settings table
CREATE TABLE IF NOT EXISTS global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_name TEXT DEFAULT 'OneMedi',
  contact_email TEXT,
  support_phone TEXT,
  whatsapp_link TEXT,
  site_open_close_toggle BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on new tables
ALTER TABLE home_care_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE diabetes_care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE layout_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Admin manage home care services" ON home_care_services
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Public read home care services" ON home_care_services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage diabetes care plans" ON diabetes_care_plans
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Public read diabetes care plans" ON diabetes_care_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage layout config" ON layout_config
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Public read layout config" ON layout_config
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage global settings" ON global_settings
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Public read global settings" ON global_settings
  FOR SELECT USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE home_care_services;
ALTER PUBLICATION supabase_realtime ADD TABLE diabetes_care_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE layout_config;
ALTER PUBLICATION supabase_realtime ADD TABLE global_settings;

-- Insert initial global settings record
INSERT INTO global_settings (app_name, contact_email, support_phone, whatsapp_link)
VALUES ('OneMedi', 'support@onemedi.com', '+91-9876543210', 'https://wa.me/919876543210')
ON CONFLICT DO NOTHING;

-- Insert initial layout config record
INSERT INTO layout_config (
  homepage_sections_order,
  section_visibility,
  featured_categories,
  banner_urls
) VALUES (
  '["medicines", "lab_tests", "scans", "doctors", "home_care", "diabetes_care", "hospitals", "ambulance", "blood_banks"]',
  '{"medicines": true, "lab_tests": true, "scans": true, "doctors": true, "home_care": true, "diabetes_care": true, "hospitals": true, "ambulance": true, "blood_banks": true}',
  '[]',
  '[]'
) ON CONFLICT DO NOTHING;
