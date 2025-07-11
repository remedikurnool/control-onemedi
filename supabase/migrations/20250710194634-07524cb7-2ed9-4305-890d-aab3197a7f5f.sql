
-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('category-images', 'category-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('service-images', 'service-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('user-uploads', 'user-uploads', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

-- Create RLS policies for storage buckets
CREATE POLICY "Public read access for category images" ON storage.objects
  FOR SELECT USING (bucket_id = 'category-images');

CREATE POLICY "Admin upload category images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'category-images' AND is_admin());

CREATE POLICY "Public read access for service images" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-images');

CREATE POLICY "Admin upload service images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'service-images' AND (is_admin() OR auth.uid() IS NOT NULL));

CREATE POLICY "Public read access for user uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-uploads');

CREATE POLICY "Users upload own files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-uploads' AND auth.uid() IS NOT NULL);

-- Create medicine categories table
CREATE TABLE IF NOT EXISTS public.medicine_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  description_en TEXT,
  description_te TEXT,
  image_url TEXT,
  icon TEXT DEFAULT 'pill',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_category_id UUID REFERENCES public.medicine_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lab test categories table
CREATE TABLE IF NOT EXISTS public.lab_test_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  description_en TEXT,
  description_te TEXT,
  image_url TEXT,
  icon TEXT DEFAULT 'test-tube',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_category_id UUID REFERENCES public.lab_test_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create scan categories table
CREATE TABLE IF NOT EXISTS public.scan_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  description_en TEXT,
  description_te TEXT,
  image_url TEXT,
  icon TEXT DEFAULT 'scan',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_category_id UUID REFERENCES public.scan_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create home care categories table
CREATE TABLE IF NOT EXISTS public.home_care_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  description_en TEXT,
  description_te TEXT,
  image_url TEXT,
  icon TEXT DEFAULT 'home',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_category_id UUID REFERENCES public.home_care_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create physiotherapy categories table
CREATE TABLE IF NOT EXISTS public.physiotherapy_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_te TEXT NOT NULL,
  description_en TEXT,
  description_te TEXT,
  image_url TEXT,
  icon TEXT DEFAULT 'activity',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_category_id UUID REFERENCES public.physiotherapy_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies for category tables
ALTER TABLE public.medicine_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_test_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_care_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physiotherapy_categories ENABLE ROW LEVEL SECURITY;

-- Admin manage all categories
CREATE POLICY "Admin manage medicine categories" ON public.medicine_categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admin manage lab test categories" ON public.lab_test_categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admin manage scan categories" ON public.scan_categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admin manage home care categories" ON public.home_care_categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admin manage physiotherapy categories" ON public.physiotherapy_categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Public read active categories
CREATE POLICY "Public read active medicine categories" ON public.medicine_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active lab test categories" ON public.lab_test_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active scan categories" ON public.scan_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active home care categories" ON public.home_care_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active physiotherapy categories" ON public.physiotherapy_categories
  FOR SELECT USING (is_active = true);

-- Add image columns to existing tables
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.medicine_categories(id);

ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS clinic_images TEXT[] DEFAULT '{}';

ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS hospital_images TEXT[] DEFAULT '{}';
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS facility_images TEXT[] DEFAULT '{}';

ALTER TABLE public.blood_banks ADD COLUMN IF NOT EXISTS facility_images TEXT[] DEFAULT '{}';

ALTER TABLE public.ambulance_services ADD COLUMN IF NOT EXISTS vehicle_images TEXT[] DEFAULT '{}';

-- Insert sample category data
INSERT INTO public.medicine_categories (name_en, name_te, description_en, description_te, icon, display_order) VALUES
  ('Pain Relief', 'నొప్పి నివారణ', 'Medications for pain management', 'నొప్పి నిర్వహణ కోసం మందులు', 'pill', 1),
  ('Antibiotics', 'యాంటీబయాటిక్స్', 'Medications to fight bacterial infections', 'బ్యాక్టీరియల్ ఇన్ఫెక్షన్లతో పోరాడటానికి మందులు', 'shield', 2),
  ('Vitamins', 'విటమిన్లు', 'Essential vitamins and supplements', 'అవసరమైన విటమిన్లు మరియు సప్లిమెంట్లు', 'heart', 3),
  ('Diabetes Care', 'డయాబెటిస్ కేర్', 'Medications for diabetes management', 'డయాబెటిస్ నిర్వహణ కోసం మందులు', 'activity', 4),
  ('Heart Care', 'గుండె సంరక్షణ', 'Cardiovascular medications', 'కార్డియోవాస్కులర్ మందులు', 'heart-pulse', 5);

INSERT INTO public.lab_test_categories (name_en, name_te, description_en, description_te, icon, display_order) VALUES
  ('Blood Tests', 'రక్త పరీక్షలు', 'Various blood analysis tests', 'వివిధ రక్త విశ్లేషణ పరీక్షలు', 'droplet', 1),
  ('Urine Tests', 'మూత్ర పరీక్షలు', 'Urine analysis and related tests', 'మూత్ర విశ్లేషణ మరియు సంబంధిత పరీక్షలు', 'test-tube', 2),
  ('Cardiac Tests', 'గుండె పరీక్షలు', 'Heart function tests', 'గుండె పనితీరు పరీక్షలు', 'heart-pulse', 3),
  ('Hormone Tests', 'హార్మోన్ పరీక్షలు', 'Hormonal level assessments', 'హార్మోన్ స్థాయి అంచనాలు', 'activity', 4),
  ('Allergy Tests', 'అలెర్జీ పరీక్షలు', 'Allergy detection tests', 'అలెర్జీ గుర్తింపు పరీక్షలు', 'shield-alert', 5);

INSERT INTO public.scan_categories (name_en, name_te, description_en, description_te, icon, display_order) VALUES
  ('X-Ray', 'ఎక్స్-రే', 'X-ray imaging services', 'ఎక్స్-రే ఇమేజింగ్ సేవలు', 'zap', 1),
  ('CT Scan', 'సిటి స్కాన్', 'Computed Tomography scans', 'కంప్యూటెడ్ టోమోగ్రఫీ స్కాన్లు', 'scan', 2),
  ('MRI', 'ఎంఆర్ఐ', 'Magnetic Resonance Imaging', 'మాగ్నెటిక్ రెసొనెన్స్ ఇమేజింగ్', 'circle', 3),
  ('Ultrasound', 'అల్ట్రాసౌండ్', 'Ultrasound imaging services', 'అల్ట్రాసౌండ్ ఇమేజింగ్ సేవలు', 'radio', 4),
  ('Mammography', 'మామోగ్రఫీ', 'Breast cancer screening', 'రొమ్ము క్యాన్సర్ స్క్రీనింగ్', 'scan-face', 5);

INSERT INTO public.home_care_categories (name_en, name_te, description_en, description_te, icon, display_order) VALUES
  ('Nursing Care', 'నర్సింగ్ కేర్', 'Professional nursing services at home', 'ఇంట్లో వృత్తిపరమైన నర్సింగ్ సేవలు', 'heart-handshake', 1),
  ('Elder Care', 'వృద్ధుల సంరక్షణ', 'Specialized care for elderly', 'వృద్ధులకు ప్రత్యేక సంరక్షణ', 'users', 2),
  ('Baby Care', 'శిశు సంరక్షణ', 'Newborn and infant care', 'నవజాత మరియు శిశు సంరక్షణ', 'baby', 3),
  ('Post Surgery Care', 'శస్త్రచికిత్స అనంతర సంరక్షణ', 'Care after surgical procedures', 'శస్త్రచికిత్స అనంతరం సంరక్షణ', 'bandage', 4),
  ('Rehabilitation', 'పునరావాసం', 'Physical and occupational therapy', 'శారీరక మరియు వృత్తిపరమైన చికిత్స', 'activity', 5);

INSERT INTO public.physiotherapy_categories (name_en, name_te, description_en, description_te, icon, display_order) VALUES
  ('Sports Injury', 'క్రీడా గాయం', 'Treatment for sports-related injuries', 'క్రీడలకు సంబంధించిన గాయాలకు చికిత్స', 'dumbbell', 1),
  ('Back Pain', 'వెన్ను నొప్పి', 'Back and spine pain management', 'వెన్ను మరియు వెన్నెముక నొప్పి నిర్వహణ', 'move-vertical', 2),
  ('Joint Pain', 'కీళ్ల నొప్పి', 'Joint and arthritis pain relief', 'కీళ్లు మరియు కీళ్లనొప్పుల ఉపశమనం', 'bone', 3),
  ('Stroke Recovery', 'స్ట్రోక్ రికవరీ', 'Rehabilitation after stroke', 'స్ట్రోక్ తర్వాత పునరావాసం', 'brain', 4),
  ('Pediatric Therapy', 'పిల్లల చికిత్స', 'Physical therapy for children', 'పిల్లలకు భౌతిక చికిత్స', 'baby', 5);

-- Enable realtime for category tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.medicine_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_test_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.home_care_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.physiotherapy_categories;
