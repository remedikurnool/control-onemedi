-- Fix Missing Tables and Schema Issues for OneMedi Healthcare Platform
-- This migration creates all missing tables referenced in the admin components

-- 1. Create categories table (universal for all service types)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_te TEXT,
    description_en TEXT,
    description_te TEXT,
    type TEXT NOT NULL CHECK (type IN ('medicine', 'lab_test', 'scan', 'home_care', 'surgery_opinion', 'diabetes_care', 'diet_guide', 'physiotherapy')),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    parent_category_id UUID REFERENCES public.categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create medicines table (separate from products for better organization)
CREATE TABLE IF NOT EXISTS public.medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_te TEXT,
    description_en TEXT,
    description_te TEXT,
    category_id UUID REFERENCES public.categories(id),
    brand_name TEXT,
    generic_name TEXT,
    manufacturer TEXT,
    sku TEXT UNIQUE,
    batch_number TEXT,
    expiry_date DATE,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    discount_percent DECIMAL(5,2),
    dosage_form TEXT CHECK (dosage_form IN ('tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'powder')),
    strength TEXT,
    unit TEXT DEFAULT 'piece',
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    image_url TEXT,
    images TEXT[],
    is_prescription_required BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    add_to_carousel BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create lab_tests table
CREATE TABLE IF NOT EXISTS public.lab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_te TEXT,
    description_en TEXT,
    description_te TEXT,
    test_code TEXT UNIQUE NOT NULL,
    category TEXT,
    category_id UUID REFERENCES public.categories(id),
    sample_type TEXT NOT NULL,
    fasting_required BOOLEAN DEFAULT false,
    preparation_instructions TEXT,
    report_delivery_hours INTEGER DEFAULT 24,
    is_package BOOLEAN DEFAULT false,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    discount_percent DECIMAL(5,2),
    normal_range TEXT,
    methodology TEXT,
    image_url TEXT,
    images TEXT[],
    is_featured BOOLEAN DEFAULT false,
    add_to_carousel BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create scans table
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_te TEXT,
    description_en TEXT,
    description_te TEXT,
    scan_code TEXT UNIQUE NOT NULL,
    scan_type TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    organ_system TEXT[],
    disease_conditions TEXT[],
    contrast_required BOOLEAN DEFAULT false,
    preparation_instructions TEXT,
    duration_minutes INTEGER,
    radiation_dose TEXT,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    discount_percent DECIMAL(5,2),
    image_url TEXT,
    images TEXT[],
    is_featured BOOLEAN DEFAULT false,
    add_to_carousel BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create center_variants table (for lab tests and scans)
CREATE TABLE IF NOT EXISTS public.center_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('lab_test', 'scan')),
    center_id UUID REFERENCES public.locations(id),
    center_name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    is_available BOOLEAN DEFAULT true,
    estimated_time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create home_care_services table
CREATE TABLE IF NOT EXISTS public.home_care_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_te TEXT,
    description_en TEXT,
    description_te TEXT,
    category_id UUID REFERENCES public.categories(id),
    service_type TEXT CHECK (service_type IN ('nursing', 'physiotherapy', 'elderly_care', 'post_surgery', 'chronic_care', 'palliative_care')),
    duration_hours INTEGER DEFAULT 1,
    price_per_hour DECIMAL(10,2) NOT NULL,
    price_per_day DECIMAL(10,2),
    price_per_week DECIMAL(10,2),
    price_per_month DECIMAL(10,2),
    equipment_required TEXT[],
    qualifications_required TEXT[],
    availability_hours JSONB,
    service_areas TEXT[],
    is_emergency_available BOOLEAN DEFAULT false,
    emergency_surcharge DECIMAL(5,2),
    image_url TEXT,
    images TEXT[],
    is_featured BOOLEAN DEFAULT false,
    add_to_carousel BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create surgery_opinions table
CREATE TABLE IF NOT EXISTS public.surgery_opinions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_te TEXT,
    description_en TEXT,
    description_te TEXT,
    category_id UUID REFERENCES public.categories(id),
    surgery_type TEXT CHECK (surgery_type IN ('general', 'cardiac', 'orthopedic', 'neurological', 'plastic', 'oncological', 'pediatric', 'gynecological')),
    consultation_fee DECIMAL(10,2) NOT NULL,
    second_opinion_fee DECIMAL(10,2),
    video_consultation_fee DECIMAL(10,2),
    report_review_fee DECIMAL(10,2),
    specializations_required TEXT[],
    experience_required_years INTEGER DEFAULT 5,
    consultation_duration_minutes INTEGER DEFAULT 30,
    preparation_instructions TEXT,
    documents_required TEXT[],
    is_emergency_available BOOLEAN DEFAULT false,
    emergency_surcharge DECIMAL(5,2),
    image_url TEXT,
    images TEXT[],
    is_featured BOOLEAN DEFAULT false,
    add_to_carousel BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create diabetes_care_services table
CREATE TABLE IF NOT EXISTS public.diabetes_care_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_te TEXT,
    description_en TEXT,
    description_te TEXT,
    category_id UUID REFERENCES public.categories(id),
    service_type TEXT CHECK (service_type IN ('monitoring', 'consultation', 'education', 'medication_management', 'diet_planning', 'exercise_planning')),
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    discount_percent DECIMAL(5,2),
    duration_minutes INTEGER DEFAULT 30,
    includes_equipment BOOLEAN DEFAULT false,
    equipment_list TEXT[],
    follow_up_included BOOLEAN DEFAULT false,
    image_url TEXT,
    images TEXT[],
    is_featured BOOLEAN DEFAULT false,
    add_to_carousel BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create diet_plans table
CREATE TABLE IF NOT EXISTS public.diet_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_te TEXT,
    description_en TEXT,
    description_te TEXT,
    category_id UUID REFERENCES public.categories(id),
    plan_type TEXT CHECK (plan_type IN ('weight_loss', 'weight_gain', 'diabetes', 'heart_healthy', 'vegetarian', 'vegan', 'keto', 'mediterranean')),
    duration_days INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    discount_percent DECIMAL(5,2),
    calories_per_day INTEGER,
    meal_count INTEGER DEFAULT 3,
    includes_snacks BOOLEAN DEFAULT true,
    dietary_restrictions TEXT[],
    health_conditions TEXT[],
    image_url TEXT,
    images TEXT[],
    is_featured BOOLEAN DEFAULT false,
    add_to_carousel BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Create physiotherapy_services table
CREATE TABLE IF NOT EXISTS public.physiotherapy_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_te TEXT,
    description_en TEXT,
    description_te TEXT,
    category_id UUID REFERENCES public.categories(id),
    service_type TEXT CHECK (service_type IN ('orthopedic', 'neurological', 'cardiopulmonary', 'pediatric', 'geriatric', 'sports')),
    session_duration_minutes INTEGER DEFAULT 45,
    price_per_session DECIMAL(10,2) NOT NULL,
    package_sessions INTEGER,
    package_price DECIMAL(10,2),
    equipment_required TEXT[],
    conditions_treated TEXT[],
    home_service_available BOOLEAN DEFAULT false,
    home_service_fee DECIMAL(10,2),
    image_url TEXT,
    images TEXT[],
    is_featured BOOLEAN DEFAULT false,
    add_to_carousel BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON public.medicines(category_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_category ON public.lab_tests(category_id);
CREATE INDEX IF NOT EXISTS idx_scans_category ON public.scans(category_id);
CREATE INDEX IF NOT EXISTS idx_center_variants_service ON public.center_variants(service_id, service_type);

-- Add RLS policies for security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.center_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_care_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diabetes_care_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physiotherapy_services ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin full access to categories" ON public.categories FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to medicines" ON public.medicines FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to lab_tests" ON public.lab_tests FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to scans" ON public.scans FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to center_variants" ON public.center_variants FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to home_care_services" ON public.home_care_services FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to surgery_opinions" ON public.surgery_opinions FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to diabetes_care_services" ON public.diabetes_care_services FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to diet_plans" ON public.diet_plans FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access to physiotherapy_services" ON public.physiotherapy_services FOR ALL USING (public.is_admin());

-- Create public read policies for active items
CREATE POLICY "Public read active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active medicines" ON public.medicines FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active lab_tests" ON public.lab_tests FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active scans" ON public.scans FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active home_care_services" ON public.home_care_services FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active surgery_opinions" ON public.surgery_opinions FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active diabetes_care_services" ON public.diabetes_care_services FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active diet_plans" ON public.diet_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active physiotherapy_services" ON public.physiotherapy_services FOR SELECT USING (is_active = true);
