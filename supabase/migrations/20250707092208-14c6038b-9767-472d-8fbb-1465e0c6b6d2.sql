-- Enhanced Location Management System for Multi-Service Healthcare Platform (Fixed)

-- Create service types enum only if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.service_type AS ENUM (
      'medicine_delivery',
      'doctor_consultation', 
      'scan_diagnostic',
      'blood_bank',
      'ambulance',
      'home_care',
      'physiotherapy',
      'diabetes_care',
      'diet_consultation'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create delivery types enum only if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.delivery_type AS ENUM (
      'pickup_only',
      'local_delivery',
      'courier_delivery',
      'nationwide_delivery',
      'online_only'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create service locations table for location-specific service configurations
CREATE TABLE IF NOT EXISTS public.service_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  service_type public.service_type NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  delivery_type public.delivery_type DEFAULT 'pickup_only',
  service_radius_km NUMERIC DEFAULT 10,
  min_order_amount NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  estimated_delivery_time TEXT,
  operating_hours JSONB DEFAULT '{}'::jsonb,
  special_instructions TEXT,
  capacity_limit INTEGER,
  staff_count INTEGER DEFAULT 0,
  equipment_available JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(location_id, service_type)
);

-- Create service centers table for physical locations like scan centers, clinics
CREATE TABLE IF NOT EXISTS public.service_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  service_type public.service_type NOT NULL,
  location_id UUID REFERENCES public.locations(id),
  address TEXT NOT NULL,
  coordinates JSONB,
  pincode TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  operating_hours JSONB DEFAULT '{}'::jsonb,
  services_offered JSONB DEFAULT '[]'::jsonb,
  equipment_available JSONB DEFAULT '[]'::jsonb,
  staff_details JSONB DEFAULT '[]'::jsonb,
  capacity_per_hour INTEGER DEFAULT 10,
  advance_booking_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create location service zones for delivery areas mapping
CREATE TABLE IF NOT EXISTS public.location_service_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  service_type public.service_type NOT NULL,
  zone_name TEXT NOT NULL,
  zone_boundary JSONB, -- GeoJSON polygon for zone boundaries
  pincodes TEXT[] DEFAULT '{}',
  delivery_fee NUMERIC DEFAULT 0,
  estimated_delivery_time TEXT,
  is_active BOOLEAN DEFAULT true,
  priority_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create location analytics table for tracking service performance by location
CREATE TABLE IF NOT EXISTS public.location_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES public.locations(id),
  service_type public.service_type,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  avg_delivery_time INTERVAL,
  customer_satisfaction NUMERIC DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  repeat_customers INTEGER DEFAULT 0,
  cancellation_rate NUMERIC DEFAULT 0,
  peak_hours JSONB DEFAULT '{}'::jsonb,
  demographics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(location_id, service_type, date)
);

-- Create pincode service mapping for nationwide services
CREATE TABLE IF NOT EXISTS public.pincode_service_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pincode TEXT NOT NULL,
  state_code TEXT,
  district TEXT,
  city TEXT,
  service_type public.service_type NOT NULL,
  serving_location_id UUID REFERENCES public.locations(id),
  delivery_type public.delivery_type DEFAULT 'courier_delivery',
  delivery_fee NUMERIC DEFAULT 0,
  estimated_delivery_days INTEGER DEFAULT 1,
  cod_available BOOLEAN DEFAULT true,
  is_serviceable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pincode, service_type)
);

-- Create business configuration table for multi-location settings
CREATE TABLE IF NOT EXISTS public.business_configuration (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  is_location_specific BOOLEAN DEFAULT false,
  location_id UUID REFERENCES public.locations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all new tables
ALTER TABLE public.service_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_service_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pincode_service_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_configuration ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (only if they don't exist)
DO $$ BEGIN
    CREATE POLICY "Admin manage service locations" ON public.service_locations FOR ALL USING (is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read active service locations" ON public.service_locations FOR SELECT USING (is_enabled = true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admin manage service centers" ON public.service_centers FOR ALL USING (is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read active service centers" ON public.service_centers FOR SELECT USING (is_active = true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admin manage location zones" ON public.location_service_zones FOR ALL USING (is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read active zones" ON public.location_service_zones FOR SELECT USING (is_active = true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admin manage location analytics" ON public.location_analytics FOR ALL USING (is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admin manage pincode mapping" ON public.pincode_service_mapping FOR ALL USING (is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read serviceable pincodes" ON public.pincode_service_mapping FOR SELECT USING (is_serviceable = true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admin manage business config" ON public.business_configuration FOR ALL USING (is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read public config" ON public.business_configuration FOR SELECT USING (config_key NOT LIKE '%private%');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_service_locations_location_service ON public.service_locations(location_id, service_type);
CREATE INDEX IF NOT EXISTS idx_service_centers_location_type ON public.service_centers(location_id, service_type);
CREATE INDEX IF NOT EXISTS idx_service_centers_pincode ON public.service_centers(pincode);
CREATE INDEX IF NOT EXISTS idx_location_zones_service_type ON public.location_service_zones(service_type);
CREATE INDEX IF NOT EXISTS idx_location_analytics_date ON public.location_analytics(date);
CREATE INDEX IF NOT EXISTS idx_pincode_mapping_pincode ON public.pincode_service_mapping(pincode);
CREATE INDEX IF NOT EXISTS idx_pincode_mapping_service_type ON public.pincode_service_mapping(service_type);

-- Insert default business configuration for Kurnool-based operations (if not exists)
INSERT INTO public.business_configuration (config_key, config_value, description) 
VALUES 
('primary_location', '{"city": "Kurnool", "state": "Andhra Pradesh", "coordinates": {"lat": 15.8281, "lng": 78.0373}}', 'Primary business location'),
('medicine_delivery_policy', '{"local_delivery_radius": 25, "courier_coverage": "nationwide", "cod_limit": 5000}', 'Medicine delivery service configuration'),
('doctor_consultation_policy', '{"online_consultation": "nationwide", "clinic_visits": "kurnool_only", "emergency_hours": "24x7"}', 'Doctor consultation service configuration'),
('scan_services_policy', '{"type": "visit_required", "booking_advance_days": 7, "home_collection": false}', 'Diagnostic scan services configuration')
ON CONFLICT (config_key) DO NOTHING;

-- Create function to get serviceable areas for a service type
CREATE OR REPLACE FUNCTION public.get_serviceable_areas(
  service_name public.service_type,
  pincode_input TEXT DEFAULT NULL
) 
RETURNS TABLE (
  location_name TEXT,
  delivery_type TEXT,
  delivery_fee NUMERIC,
  estimated_time TEXT,
  is_serviceable BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF pincode_input IS NOT NULL THEN
    -- Check specific pincode serviceability
    RETURN QUERY
    SELECT 
      l.name,
      psm.delivery_type::TEXT,
      psm.delivery_fee,
      CONCAT(psm.estimated_delivery_days, ' days') as estimated_time,
      psm.is_serviceable
    FROM public.pincode_service_mapping psm
    JOIN public.locations l ON l.id = psm.serving_location_id
    WHERE psm.pincode = pincode_input 
    AND psm.service_type = service_name;
  ELSE
    -- Return all serviceable locations for the service
    RETURN QUERY
    SELECT 
      l.name,
      sl.delivery_type::TEXT,
      sl.delivery_fee,
      sl.estimated_delivery_time,
      sl.is_enabled
    FROM public.service_locations sl
    JOIN public.locations l ON l.id = sl.location_id
    WHERE sl.service_type = service_name 
    AND sl.is_enabled = true
    AND l.is_active = true;
  END IF;
END;
$$;