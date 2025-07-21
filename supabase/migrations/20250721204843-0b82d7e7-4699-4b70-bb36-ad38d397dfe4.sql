
-- Create test_categories table
CREATE TABLE public.test_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  description_en TEXT,
  description_te TEXT,
  icon TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.test_categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  bg_color TEXT DEFAULT 'bg-primary-50',
  icon_color TEXT DEFAULT 'var(--color-primary)',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create center_services junction table
CREATE TABLE public.center_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID REFERENCES public.diagnostic_centers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('lab_test', 'scan')),
  is_available BOOLEAN DEFAULT true,
  estimated_time TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(center_id, service_id, service_type)
);

-- Create test_parameters table
CREATE TABLE public.test_parameters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.lab_tests(id) ON DELETE CASCADE,
  parameter_name TEXT NOT NULL,
  normal_range_min NUMERIC,
  normal_range_max NUMERIC,
  normal_range_text TEXT,
  unit TEXT,
  reference_values JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create center_pricing table
CREATE TABLE public.center_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID REFERENCES public.diagnostic_centers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('lab_test', 'scan')),
  base_price NUMERIC(10,2) NOT NULL,
  discounted_price NUMERIC(10,2),
  discount_percentage INTEGER DEFAULT 0,
  saved_amount NUMERIC(10,2) GENERATED ALWAYS AS (base_price - COALESCE(discounted_price, base_price)) STORED,
  home_collection_fee NUMERIC(10,2) DEFAULT 0,
  urgent_fee NUMERIC(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(center_id, service_id, service_type)
);

-- Add new columns to lab_tests table
ALTER TABLE public.lab_tests ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.lab_tests ADD COLUMN IF NOT EXISTS parameters JSONB DEFAULT '[]';
ALTER TABLE public.lab_tests ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.lab_tests ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE public.lab_tests ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE public.lab_tests ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.test_categories(id);

-- Add new columns to scan_services table
ALTER TABLE public.scan_services ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.scan_services ADD COLUMN IF NOT EXISTS parameters JSONB DEFAULT '[]';
ALTER TABLE public.scan_services ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.scan_services ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE public.scan_services ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE public.scan_services ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.test_categories(id);
ALTER TABLE public.scan_services ADD COLUMN IF NOT EXISTS equipment_type TEXT;
ALTER TABLE public.scan_services ADD COLUMN IF NOT EXISTS contrast_agent TEXT;
ALTER TABLE public.scan_services ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available';

-- Add new columns to diagnostic_centers table
ALTER TABLE public.diagnostic_centers ADD COLUMN IF NOT EXISTS services_offered JSONB DEFAULT '[]';
ALTER TABLE public.diagnostic_centers ADD COLUMN IF NOT EXISTS facilities JSONB DEFAULT '[]';
ALTER TABLE public.diagnostic_centers ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE public.diagnostic_centers ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE public.diagnostic_centers ADD COLUMN IF NOT EXISTS coordinates JSONB;
ALTER TABLE public.diagnostic_centers ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.diagnostic_centers ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE public.diagnostic_centers ADD COLUMN IF NOT EXISTS accreditation TEXT[];
ALTER TABLE public.diagnostic_centers ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}';
ALTER TABLE public.diagnostic_centers ADD COLUMN IF NOT EXISTS home_collection_available BOOLEAN DEFAULT false;
ALTER TABLE public.diagnostic_centers ADD COLUMN IF NOT EXISTS home_collection_radius_km INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.test_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_pricing ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Admin manage test categories" ON public.test_categories FOR ALL USING (is_admin());
CREATE POLICY "Public read active test categories" ON public.test_categories FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage center services" ON public.center_services FOR ALL USING (is_admin());
CREATE POLICY "Public read available center services" ON public.center_services FOR SELECT USING (is_available = true);

CREATE POLICY "Admin manage test parameters" ON public.test_parameters FOR ALL USING (is_admin());
CREATE POLICY "Public read test parameters" ON public.test_parameters FOR SELECT USING (true);

CREATE POLICY "Admin manage center pricing" ON public.center_pricing FOR ALL USING (is_admin());
CREATE POLICY "Public read available center pricing" ON public.center_pricing FOR SELECT USING (is_available = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_categories_parent ON public.test_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_center_services_center_type ON public.center_services(center_id, service_type);
CREATE INDEX IF NOT EXISTS idx_test_parameters_test ON public.test_parameters(test_id);
CREATE INDEX IF NOT EXISTS idx_center_pricing_center_service ON public.center_pricing(center_id, service_id, service_type);

-- Insert sample test categories
INSERT INTO public.test_categories (name_en, name_te, description_en, description_te, icon, display_order) VALUES
('Blood Tests', 'రక్త పరీక్షలు', 'Complete blood analysis and related tests', 'పూర్తి రక్త విశ్లేషణ మరియు సంబంధిత పరీక్షలు', '🩸', 1),
('Urine Tests', 'మూత్ర పరీక్షలు', 'Urine analysis and culture tests', 'మూత్ర విశ్లేషణ మరియు కల్చర్ పరీక్షలు', '🧪', 2),
('Cardiac Tests', 'గుండె పరీక్షలు', 'Heart health and cardiac markers', 'గుండె ఆరోగ్యం మరియు కార్డియాక్ మార్కర్లు', '❤️', 3),
('Diabetes Tests', 'మధుమేహ పరీక్షలు', 'Blood sugar and diabetes monitoring', 'రక్తంలో చక్కెర మరియు మధుమేహ పర్యవేక్షణ', '🩺', 4),
('Thyroid Tests', 'థైరాయిడ్ పరీక్షలు', 'Thyroid function tests', 'థైరాయిడ్ పనితీరు పరీక్షలు', '🦋', 5),
('X-Ray Scans', 'ఎక్స్-రే స్కాన్లు', 'X-ray imaging services', 'ఎక్స్-రే ఇమేజింగ్ సేవలు', '🔬', 6),
('CT Scans', 'సిటి స్కాన్లు', 'CT scan imaging services', 'సిటి స్కాన్ ఇమేజింగ్ సేవలు', '🏥', 7),
('MRI Scans', 'ఎమ్ఆర్ఐ స్కాన్లు', 'MRI imaging services', 'ఎమ్ఆర్ఐ ఇమేజింగ్ సేవలు', '🧠', 8),
('Ultrasound', 'అల్ట్రాసౌండ్', 'Ultrasound imaging services', 'అల్ట్రాసౌండ్ ఇమేజింగ్ సేవలు', '👶', 9);

-- Insert sample center services and pricing
INSERT INTO public.center_services (center_id, service_id, service_type, is_available, estimated_time) 
SELECT dc.id, lt.id, 'lab_test', true, '2-4 hours'
FROM public.diagnostic_centers dc, public.lab_tests lt
WHERE dc.name_en IN ('Apollo Diagnostics', 'SRL Diagnostics')
LIMIT 10;

INSERT INTO public.center_pricing (center_id, service_id, service_type, base_price, discounted_price, discount_percentage)
SELECT cs.center_id, cs.service_id, cs.service_type, 
       (300 + (RANDOM() * 700))::NUMERIC(10,2), 
       (200 + (RANDOM() * 400))::NUMERIC(10,2),
       (10 + (RANDOM() * 30))::INTEGER
FROM public.center_services cs
WHERE cs.service_type = 'lab_test';
