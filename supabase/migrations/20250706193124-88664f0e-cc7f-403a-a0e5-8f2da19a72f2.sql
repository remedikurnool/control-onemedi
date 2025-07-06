
-- Create locations table for managing service areas
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'city', -- city, state, region, zone
  parent_id UUID REFERENCES public.locations(id),
  coordinates JSONB, -- lat, lng, radius for service areas
  is_active BOOLEAN DEFAULT true,
  service_radius_km NUMERIC DEFAULT 10,
  delivery_fee NUMERIC DEFAULT 0,
  min_order_amount NUMERIC DEFAULT 0,
  estimated_delivery_time TEXT DEFAULT '30-45 minutes',
  coverage_areas JSONB DEFAULT '[]'::jsonb, -- array of polygons/areas
  population INTEGER,
  market_penetration NUMERIC DEFAULT 0, -- percentage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics events table for tracking user behavior
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  event_type TEXT NOT NULL, -- page_view, click, purchase, search, etc.
  event_category TEXT, -- engagement, conversion, etc.
  event_data JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  location_id UUID REFERENCES public.locations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create marketing campaigns table
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL, -- email, sms, push, banner, discount
  status TEXT DEFAULT 'draft', -- draft, active, paused, completed
  target_audience JSONB DEFAULT '{}'::jsonb, -- segmentation criteria
  content JSONB DEFAULT '{}'::jsonb, -- campaign content/settings
  schedule_start TIMESTAMP WITH TIME ZONE,
  schedule_end TIMESTAMP WITH TIME ZONE,
  budget NUMERIC DEFAULT 0,
  spent_amount NUMERIC DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create customer segments table for marketing automation
CREATE TABLE public.customer_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb, -- segmentation rules
  is_dynamic BOOLEAN DEFAULT true, -- auto-update based on criteria
  customer_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create system settings table for admin customization
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- general, payment, notification, etc.
  key TEXT NOT NULL,
  value JSONB,
  data_type TEXT DEFAULT 'string', -- string, number, boolean, object, array
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- can be accessed by non-admin users
  is_required BOOLEAN DEFAULT false,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, key)
);

-- Create promotional offers table
CREATE TABLE public.promotional_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  offer_type TEXT NOT NULL, -- discount_percentage, discount_amount, buy_one_get_one, free_shipping
  discount_value NUMERIC,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  applicable_products JSONB DEFAULT '[]'::jsonb,
  applicable_categories JSONB DEFAULT '[]'::jsonb,
  target_locations JSONB DEFAULT '[]'::jsonb,
  target_segments JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create A/B test experiments table
CREATE TABLE public.ab_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  experiment_type TEXT NOT NULL, -- ui_test, pricing_test, campaign_test
  status TEXT DEFAULT 'draft', -- draft, running, completed, paused
  variants JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of variant configurations
  traffic_allocation JSONB DEFAULT '{}'::jsonb, -- percentage split
  target_audience JSONB DEFAULT '{}'::jsonb,
  success_metrics JSONB DEFAULT '[]'::jsonb,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  results JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_experiments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admin manage locations" ON public.locations FOR ALL USING (is_admin());
CREATE POLICY "Public read active locations" ON public.locations FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage analytics" ON public.analytics_events FOR ALL USING (is_admin());
CREATE POLICY "Users track own events" ON public.analytics_events FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admin manage campaigns" ON public.marketing_campaigns FOR ALL USING (is_admin());
CREATE POLICY "Admin manage segments" ON public.customer_segments FOR ALL USING (is_admin());
CREATE POLICY "Admin manage settings" ON public.system_settings FOR ALL USING (is_admin());
CREATE POLICY "Public read public settings" ON public.system_settings FOR SELECT USING (is_public = true);

CREATE POLICY "Admin manage offers" ON public.promotional_offers FOR ALL USING (is_admin());
CREATE POLICY "Public read active offers" ON public.promotional_offers FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage experiments" ON public.ab_experiments FOR ALL USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_locations_parent_id ON public.locations(parent_id);
CREATE INDEX idx_locations_type ON public.locations(type);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_campaigns_status ON public.marketing_campaigns(status);
CREATE INDEX idx_campaigns_created_at ON public.marketing_campaigns(created_at);
