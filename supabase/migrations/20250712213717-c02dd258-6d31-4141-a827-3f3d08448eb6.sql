
-- Create missing notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'general',
  priority TEXT DEFAULT 'normal',
  target_audience JSONB NOT NULL DEFAULT '{}',
  delivery_method TEXT[] DEFAULT ARRAY['push'],
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- Create customer segments table
CREATE TABLE public.customer_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  is_dynamic BOOLEAN DEFAULT true,
  customer_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create marketing campaigns table
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  target_audience JSONB DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft',
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create funnel analytics table
CREATE TABLE public.funnel_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  conversion_value NUMERIC
);

-- Create automation triggers table
CREATE TABLE public.automation_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create WhatsApp templates table
CREATE TABLE public.whatsapp_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_category TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  header_type TEXT,
  header_text TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,
  buttons JSONB DEFAULT '[]',
  variables JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  template_id TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create dynamic pricing rules table
CREATE TABLE public.dynamic_pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  product_categories JSONB DEFAULT '[]',
  customer_segments JSONB DEFAULT '[]',
  conditions JSONB NOT NULL DEFAULT '{}',
  pricing_strategy TEXT NOT NULL,
  discount_percentage NUMERIC,
  minimum_price NUMERIC,
  maximum_price NUMERIC,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create layout configuration table
CREATE TABLE public.layout_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL,
  section_name TEXT NOT NULL,
  section_order INTEGER NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  config_data JSONB DEFAULT '{}',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(page_name, section_name)
);

-- Create SEO settings table
CREATE TABLE public.seo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL UNIQUE,
  title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  robots_txt TEXT,
  schema_markup JSONB,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layout_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin manage notifications" ON public.notifications FOR ALL USING (is_admin_user());
CREATE POLICY "Admin manage customer segments" ON public.customer_segments FOR ALL USING (is_admin_user());
CREATE POLICY "Admin manage marketing campaigns" ON public.marketing_campaigns FOR ALL USING (is_admin_user());
CREATE POLICY "Track funnel analytics" ON public.funnel_analytics FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin_user());
CREATE POLICY "Admin view funnel analytics" ON public.funnel_analytics FOR SELECT USING (is_admin_user());
CREATE POLICY "Admin manage automation triggers" ON public.automation_triggers FOR ALL USING (is_admin_user());
CREATE POLICY "Admin manage WhatsApp templates" ON public.whatsapp_templates FOR ALL USING (is_admin_user());
CREATE POLICY "Admin manage pricing rules" ON public.dynamic_pricing_rules FOR ALL USING (is_admin_user());
CREATE POLICY "Admin manage layout config" ON public.layout_config FOR ALL USING (is_admin_user());
CREATE POLICY "Public read layout config" ON public.layout_config FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admin manage SEO settings" ON public.seo_settings FOR ALL USING (is_admin_user());
CREATE POLICY "Public read SEO settings" ON public.seo_settings FOR SELECT USING (true);

-- Add realtime support
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.customer_segments REPLICA IDENTITY FULL;
ALTER TABLE public.marketing_campaigns REPLICA IDENTITY FULL;
ALTER TABLE public.funnel_analytics REPLICA IDENTITY FULL;
ALTER TABLE public.automation_triggers REPLICA IDENTITY FULL;
ALTER TABLE public.whatsapp_templates REPLICA IDENTITY FULL;
ALTER TABLE public.dynamic_pricing_rules REPLICA IDENTITY FULL;
ALTER TABLE public.layout_config REPLICA IDENTITY FULL;
ALTER TABLE public.seo_settings REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_segments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketing_campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.funnel_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_triggers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dynamic_pricing_rules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.layout_config;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seo_settings;

-- Insert default layout configuration
INSERT INTO public.layout_config (page_name, section_name, section_order, is_enabled, config_data) VALUES
('homepage', 'hero_banner', 1, true, '{"title": "Welcome to ONE MEDI", "subtitle": "Your Health, Our Priority"}'),
('homepage', 'featured_services', 2, true, '{"max_items": 6}'),
('homepage', 'lab_tests', 3, true, '{"title": "Popular Lab Tests", "max_items": 8}'),
('homepage', 'medicines', 4, true, '{"title": "Medicines", "max_items": 8}'),
('homepage', 'doctors', 5, true, '{"title": "Consult Our Doctors", "max_items": 6}'),
('homepage', 'testimonials', 6, true, '{"max_items": 4}'),
('homepage', 'footer', 7, true, '{}');

-- Insert default SEO settings
INSERT INTO public.seo_settings (page_name, title, meta_description, keywords) VALUES
('homepage', 'ONE MEDI - Your Trusted Healthcare Partner', 'Complete healthcare solutions including medicines, lab tests, doctor consultations, and more.', ARRAY['healthcare', 'medicines', 'lab tests', 'online pharmacy', 'doctor consultation']),
('medicines', 'Buy Medicines Online - ONE MEDI', 'Order medicines online with home delivery. Genuine medicines at best prices.', ARRAY['buy medicines online', 'online pharmacy', 'prescription medicines']),
('lab-tests', 'Book Lab Tests Online - ONE MEDI', 'Book lab tests online with home sample collection. Accurate results, affordable prices.', ARRAY['lab tests', 'blood test', 'health checkup', 'diagnostic tests']),
('doctors', 'Online Doctor Consultation - ONE MEDI', 'Consult qualified doctors online. Video consultation, prescription, and follow-up care.', ARRAY['online doctor consultation', 'telemedicine', 'video consultation']);
