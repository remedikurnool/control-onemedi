-- Enhanced Location Management System Migration
-- Comprehensive location, zone, and service management for One Medi Healthcare Platform

-- Create enhanced location zones with polygon support
CREATE TABLE IF NOT EXISTS public.location_service_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  zone_name TEXT NOT NULL,
  zone_type TEXT DEFAULT 'delivery' CHECK (zone_type IN ('delivery', 'pickup', 'emergency', 'restricted', 'premium')),
  geometry JSONB NOT NULL, -- GeoJSON polygon/multipolygon
  service_types TEXT[] DEFAULT '{}', -- Array of applicable services
  priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 10),
  is_active BOOLEAN DEFAULT true,
  zone_color TEXT DEFAULT '#3b82f6', -- Hex color for map display
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT unique_zone_name_per_location UNIQUE(location_id, zone_name)
);

-- Zone-specific service configurations
CREATE TABLE IF NOT EXISTS public.zone_service_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES public.location_service_zones(id) ON DELETE CASCADE,
  service_type public.service_type NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  
  -- Pricing Configuration
  delivery_fee NUMERIC DEFAULT 0,
  min_order_amount NUMERIC DEFAULT 0,
  max_order_amount NUMERIC DEFAULT NULL,
  peak_hour_multiplier NUMERIC DEFAULT 1.0,
  distance_based_pricing BOOLEAN DEFAULT false,
  
  -- Operational Configuration
  estimated_delivery_time TEXT DEFAULT '30-45 minutes',
  operating_hours JSONB DEFAULT '{}', -- {day: {open: "09:00", close: "21:00", breaks: []}}
  capacity_per_hour INTEGER DEFAULT 10,
  staff_required INTEGER DEFAULT 1,
  equipment_required TEXT[] DEFAULT '{}',
  advance_booking_days INTEGER DEFAULT 7,
  
  -- Service-specific settings
  emergency_available BOOLEAN DEFAULT false,
  prescription_required BOOLEAN DEFAULT false,
  age_restrictions JSONB DEFAULT NULL, -- {minAge: 18, maxAge: null}
  special_requirements TEXT[] DEFAULT '{}',
  
  -- Custom fields for service-specific data
  custom_config JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(zone_id, service_type)
);

-- Enhanced pincode management with zone mapping
CREATE TABLE IF NOT EXISTS public.enhanced_pincode_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode TEXT NOT NULL,
  zone_id UUID REFERENCES public.location_service_zones(id) ON DELETE SET NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  state_code TEXT NOT NULL,
  coordinates JSONB, -- {lat: number, lng: number}
  population INTEGER,
  urban_rural TEXT DEFAULT 'urban' CHECK (urban_rural IN ('urban', 'rural', 'semi_urban')),
  accessibility_score INTEGER DEFAULT 5 CHECK (accessibility_score BETWEEN 1 AND 10),
  auto_assigned BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pincode, zone_id)
);

-- Location performance metrics and analytics
CREATE TABLE IF NOT EXISTS public.location_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES public.location_service_zones(id) ON DELETE CASCADE,
  service_type public.service_type,
  date DATE NOT NULL,
  
  -- Order metrics
  total_orders INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  cancelled_orders INTEGER DEFAULT 0,
  
  -- Performance metrics
  average_delivery_time INTERVAL,
  average_response_time INTERVAL,
  customer_satisfaction NUMERIC DEFAULT 0 CHECK (customer_satisfaction BETWEEN 0 AND 5),
  
  -- Financial metrics
  revenue NUMERIC DEFAULT 0,
  operational_cost NUMERIC DEFAULT 0,
  delivery_cost NUMERIC DEFAULT 0,
  
  -- Capacity metrics
  capacity_utilization NUMERIC DEFAULT 0, -- Percentage
  peak_hour_orders INTEGER DEFAULT 0,
  staff_utilization NUMERIC DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(location_id, zone_id, service_type, date)
);

-- Multi-city expansion planning
CREATE TABLE IF NOT EXISTS public.city_expansion_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT NOT NULL,
  state_code TEXT NOT NULL,
  coordinates JSONB, -- {lat: number, lng: number}
  
  -- Planning details
  target_launch_date DATE,
  actual_launch_date DATE,
  priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'approved', 'in_progress', 'launched', 'paused', 'cancelled')),
  
  -- Market analysis
  market_research JSONB DEFAULT '{}',
  competitor_analysis JSONB DEFAULT '{}',
  demographic_data JSONB DEFAULT '{}',
  
  -- Financial planning
  investment_required NUMERIC,
  expected_roi NUMERIC,
  break_even_timeline INTEGER, -- months
  
  -- Service planning
  priority_services TEXT[] DEFAULT '{}',
  initial_zones INTEGER DEFAULT 3,
  target_coverage_area NUMERIC, -- sq km
  
  -- Partnerships and compliance
  local_partnerships JSONB DEFAULT '{}',
  regulatory_requirements JSONB DEFAULT '{}',
  licenses_required TEXT[] DEFAULT '{}',
  
  -- Progress tracking
  completion_percentage NUMERIC DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  milestones JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(city_name, state_code)
);

-- Service center zone assignments
CREATE TABLE IF NOT EXISTS public.service_center_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_center_id UUID REFERENCES public.service_centers(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES public.location_service_zones(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  coverage_percentage NUMERIC DEFAULT 100 CHECK (coverage_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_center_id, zone_id)
);

-- Dynamic pricing rules
CREATE TABLE IF NOT EXISTS public.dynamic_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES public.location_service_zones(id) ON DELETE CASCADE,
  service_type public.service_type NOT NULL,
  rule_name TEXT NOT NULL,
  rule_type TEXT CHECK (rule_type IN ('peak_hour', 'distance', 'demand', 'weather', 'special_event')),
  
  -- Rule conditions
  conditions JSONB NOT NULL, -- Flexible conditions object
  
  -- Pricing adjustments
  adjustment_type TEXT CHECK (adjustment_type IN ('percentage', 'fixed_amount', 'multiplier')),
  adjustment_value NUMERIC NOT NULL,
  max_adjustment NUMERIC, -- Cap on adjustment
  
  -- Validity
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add enhanced fields to existing locations table
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata';
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS local_language TEXT DEFAULT 'en';
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'INR';
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS tax_configuration JSONB DEFAULT '{}';
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS regulatory_licenses JSONB DEFAULT '{}';
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS expansion_status TEXT DEFAULT 'active' CHECK (expansion_status IN ('planning', 'active', 'expanding', 'paused'));
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS city_tier INTEGER DEFAULT 2 CHECK (city_tier BETWEEN 1 AND 4);
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS business_model TEXT DEFAULT 'direct' CHECK (business_model IN ('direct', 'franchise', 'partnership'));

-- Add zone support to service_centers
ALTER TABLE public.service_centers ADD COLUMN IF NOT EXISTS primary_zone_id UUID REFERENCES public.location_service_zones(id);
ALTER TABLE public.service_centers ADD COLUMN IF NOT EXISTS accessibility_features JSONB DEFAULT '{}';
ALTER TABLE public.service_centers ADD COLUMN IF NOT EXISTS parking_available BOOLEAN DEFAULT false;
ALTER TABLE public.service_centers ADD COLUMN IF NOT EXISTS public_transport_access JSONB DEFAULT '{}';
ALTER TABLE public.service_centers ADD COLUMN IF NOT EXISTS google_place_id TEXT;
ALTER TABLE public.service_centers ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_location_service_zones_location_id ON public.location_service_zones(location_id);
CREATE INDEX IF NOT EXISTS idx_location_service_zones_active ON public.location_service_zones(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_zone_service_configs_zone_service ON public.zone_service_configs(zone_id, service_type);
CREATE INDEX IF NOT EXISTS idx_zone_service_configs_enabled ON public.zone_service_configs(is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_enhanced_pincode_zones_pincode ON public.enhanced_pincode_zones(pincode);
CREATE INDEX IF NOT EXISTS idx_enhanced_pincode_zones_zone_id ON public.enhanced_pincode_zones(zone_id);
CREATE INDEX IF NOT EXISTS idx_location_performance_date ON public.location_performance_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_location_performance_location_service ON public.location_performance_metrics(location_id, service_type, date);
CREATE INDEX IF NOT EXISTS idx_city_expansion_status ON public.city_expansion_plans(status);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_rules_active ON public.dynamic_pricing_rules(is_active, valid_from, valid_until) WHERE is_active = true;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_location_service_zones_updated_at BEFORE UPDATE ON public.location_service_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_zone_service_configs_updated_at BEFORE UPDATE ON public.zone_service_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_city_expansion_plans_updated_at BEFORE UPDATE ON public.city_expansion_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dynamic_pricing_rules_updated_at BEFORE UPDATE ON public.dynamic_pricing_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.location_service_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_service_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_pincode_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_expansion_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_center_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_pricing_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Location service zones policies
CREATE POLICY "Admin manage location service zones" ON public.location_service_zones FOR ALL USING (is_admin());
CREATE POLICY "Public read active zones" ON public.location_service_zones FOR SELECT USING (is_active = true);

-- Zone service configs policies
CREATE POLICY "Admin manage zone service configs" ON public.zone_service_configs FOR ALL USING (is_admin());
CREATE POLICY "Public read enabled zone configs" ON public.zone_service_configs FOR SELECT USING (is_enabled = true);

-- Enhanced pincode zones policies
CREATE POLICY "Admin manage enhanced pincode zones" ON public.enhanced_pincode_zones FOR ALL USING (is_admin());
CREATE POLICY "Public read verified pincodes" ON public.enhanced_pincode_zones FOR SELECT USING (verified = true);

-- Location performance metrics policies
CREATE POLICY "Admin manage location performance metrics" ON public.location_performance_metrics FOR ALL USING (is_admin());
CREATE POLICY "Admin read location performance metrics" ON public.location_performance_metrics FOR SELECT USING (is_admin());

-- City expansion plans policies
CREATE POLICY "Admin manage city expansion plans" ON public.city_expansion_plans FOR ALL USING (is_admin());

-- Service center zones policies
CREATE POLICY "Admin manage service center zones" ON public.service_center_zones FOR ALL USING (is_admin());
CREATE POLICY "Public read service center zones" ON public.service_center_zones FOR SELECT USING (true);

-- Dynamic pricing rules policies
CREATE POLICY "Admin manage dynamic pricing rules" ON public.dynamic_pricing_rules FOR ALL USING (is_admin());
CREATE POLICY "Public read active pricing rules" ON public.dynamic_pricing_rules FOR SELECT USING (is_active = true);

-- Utility Functions

-- Function to check if a point is within a zone
CREATE OR REPLACE FUNCTION is_point_in_zone(
  point_lat NUMERIC,
  point_lng NUMERIC,
  zone_geometry JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  point_geom GEOMETRY;
  zone_geom GEOMETRY;
BEGIN
  -- Convert point to PostGIS geometry
  point_geom := ST_SetSRID(ST_MakePoint(point_lng, point_lat), 4326);

  -- Convert GeoJSON to PostGIS geometry
  zone_geom := ST_SetSRID(ST_GeomFromGeoJSON(zone_geometry::text), 4326);

  -- Check if point is within zone
  RETURN ST_Within(point_geom, zone_geom);
END;
$$;

-- Function to get service availability for a pincode
CREATE OR REPLACE FUNCTION get_service_availability(
  pincode_input TEXT,
  service_type_input public.service_type
) RETURNS TABLE (
  zone_name TEXT,
  is_available BOOLEAN,
  delivery_fee NUMERIC,
  min_order_amount NUMERIC,
  estimated_delivery_time TEXT,
  emergency_available BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lsz.zone_name,
    zsc.is_enabled as is_available,
    zsc.delivery_fee,
    zsc.min_order_amount,
    zsc.estimated_delivery_time,
    zsc.emergency_available
  FROM public.enhanced_pincode_zones epz
  JOIN public.location_service_zones lsz ON lsz.id = epz.zone_id
  JOIN public.zone_service_configs zsc ON zsc.zone_id = lsz.id
  WHERE epz.pincode = pincode_input
    AND zsc.service_type = service_type_input
    AND lsz.is_active = true
    AND epz.verified = true;
END;
$$;

-- Function to calculate dynamic pricing
CREATE OR REPLACE FUNCTION calculate_dynamic_price(
  zone_id_input UUID,
  service_type_input public.service_type,
  base_amount NUMERIC,
  order_details JSONB DEFAULT '{}'
) RETURNS TABLE (
  final_price NUMERIC,
  adjustments JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_price NUMERIC := base_amount;
  price_adjustments JSONB := '[]'::jsonb;
  rule_record RECORD;
  adjustment_amount NUMERIC;
BEGIN
  -- Get base zone configuration
  SELECT delivery_fee INTO adjustment_amount
  FROM public.zone_service_configs
  WHERE zone_id = zone_id_input AND service_type = service_type_input;

  current_price := current_price + COALESCE(adjustment_amount, 0);

  -- Apply dynamic pricing rules
  FOR rule_record IN
    SELECT * FROM public.dynamic_pricing_rules
    WHERE zone_id = zone_id_input
      AND service_type = service_type_input
      AND is_active = true
      AND (valid_from IS NULL OR valid_from <= NOW())
      AND (valid_until IS NULL OR valid_until >= NOW())
  LOOP
    -- Calculate adjustment based on rule type
    CASE rule_record.adjustment_type
      WHEN 'percentage' THEN
        adjustment_amount := current_price * (rule_record.adjustment_value / 100);
      WHEN 'fixed_amount' THEN
        adjustment_amount := rule_record.adjustment_value;
      WHEN 'multiplier' THEN
        adjustment_amount := current_price * (rule_record.adjustment_value - 1);
      ELSE
        adjustment_amount := 0;
    END CASE;

    -- Apply max adjustment cap if specified
    IF rule_record.max_adjustment IS NOT NULL THEN
      adjustment_amount := LEAST(adjustment_amount, rule_record.max_adjustment);
    END IF;

    current_price := current_price + adjustment_amount;

    -- Add to adjustments array
    price_adjustments := price_adjustments || jsonb_build_object(
      'rule_name', rule_record.rule_name,
      'rule_type', rule_record.rule_type,
      'adjustment', adjustment_amount
    );
  END LOOP;

  RETURN QUERY SELECT current_price, price_adjustments;
END;
$$;

-- Function to get zone performance metrics
CREATE OR REPLACE FUNCTION get_zone_performance(
  zone_id_input UUID,
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
  total_orders BIGINT,
  avg_delivery_time INTERVAL,
  customer_satisfaction NUMERIC,
  revenue NUMERIC,
  capacity_utilization NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    SUM(lpm.total_orders)::BIGINT,
    AVG(lpm.average_delivery_time),
    AVG(lpm.customer_satisfaction),
    SUM(lpm.revenue),
    AVG(lpm.capacity_utilization)
  FROM public.location_performance_metrics lpm
  WHERE lpm.zone_id = zone_id_input
    AND lpm.date BETWEEN start_date AND end_date;
END;
$$;
