
-- Create advanced analytics tables
CREATE TABLE public.analytics_cohorts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cohort_name TEXT NOT NULL,
  cohort_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  cohort_date DATE NOT NULL,
  total_users INTEGER DEFAULT 0,
  retention_data JSONB DEFAULT '{}'::jsonb,
  revenue_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create conversion funnels table
CREATE TABLE public.conversion_funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_name TEXT NOT NULL,
  funnel_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  conversion_rates JSONB DEFAULT '{}'::jsonb,
  drop_off_analysis JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Create campaign management table
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL, -- 'email', 'sms', 'push', 'banner', 'discount'
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
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

-- Create A/B test experiments table
CREATE TABLE public.ab_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  experiment_type TEXT NOT NULL, -- 'ui_test', 'pricing_test', 'campaign_test'
  status TEXT DEFAULT 'draft', -- 'draft', 'running', 'completed', 'paused'
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

-- Create customer segments table for AI-powered segmentation
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

-- Create behavioral triggers table
CREATE TABLE public.behavioral_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- 'page_visit', 'product_view', 'cart_abandon', 'purchase'
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of actions to trigger
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create executive KPI dashboard table
CREATE TABLE public.executive_kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kpi_name TEXT NOT NULL,
  kpi_category TEXT NOT NULL, -- 'revenue', 'customer', 'operational', 'marketing'
  current_value NUMERIC DEFAULT 0,
  target_value NUMERIC DEFAULT 0,
  previous_value NUMERIC DEFAULT 0,
  trend_direction TEXT DEFAULT 'stable', -- 'up', 'down', 'stable'
  calculation_method TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create geographic analytics table
CREATE TABLE public.geographic_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES locations(id),
  region_name TEXT NOT NULL,
  coordinates JSONB, -- lat, lng
  total_customers INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  avg_order_value NUMERIC DEFAULT 0,
  market_penetration NUMERIC DEFAULT 0,
  growth_rate NUMERIC DEFAULT 0,
  date_period DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create predictive analytics table
CREATE TABLE public.predictive_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type TEXT NOT NULL, -- 'churn_prediction', 'demand_forecast', 'ltv_prediction'
  entity_type TEXT NOT NULL, -- 'customer', 'product', 'segment'
  entity_id UUID,
  prediction_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence_score NUMERIC DEFAULT 0,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create custom reports table
CREATE TABLE public.custom_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'revenue', 'customer', 'product', 'marketing'
  query_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  chart_config JSONB DEFAULT '{}'::jsonb,
  filters JSONB DEFAULT '{}'::jsonb,
  schedule JSONB DEFAULT '{}'::jsonb, -- auto-generation schedule
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE public.analytics_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geographic_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admin manage analytics" ON public.analytics_cohorts FOR ALL USING (is_admin());
CREATE POLICY "Admin manage funnels" ON public.conversion_funnels FOR ALL USING (is_admin());
CREATE POLICY "Admin manage campaigns" ON public.marketing_campaigns FOR ALL USING (is_admin());
CREATE POLICY "Admin manage experiments" ON public.ab_experiments FOR ALL USING (is_admin());
CREATE POLICY "Admin manage segments" ON public.customer_segments FOR ALL USING (is_admin());
CREATE POLICY "Admin manage triggers" ON public.behavioral_triggers FOR ALL USING (is_admin());
CREATE POLICY "Admin manage kpis" ON public.executive_kpis FOR ALL USING (is_admin());
CREATE POLICY "Admin manage geographic" ON public.geographic_analytics FOR ALL USING (is_admin());
CREATE POLICY "Admin manage insights" ON public.predictive_insights FOR ALL USING (is_admin());
CREATE POLICY "Admin manage reports" ON public.custom_reports FOR ALL USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_analytics_cohorts_date ON public.analytics_cohorts(cohort_date);
CREATE INDEX idx_conversion_funnels_active ON public.conversion_funnels(is_active);
CREATE INDEX idx_campaigns_status ON public.marketing_campaigns(status);
CREATE INDEX idx_ab_experiments_status ON public.ab_experiments(status);
CREATE INDEX idx_customer_segments_dynamic ON public.customer_segments(is_dynamic);
CREATE INDEX idx_behavioral_triggers_active ON public.behavioral_triggers(is_active);
CREATE INDEX idx_executive_kpis_active ON public.executive_kpis(is_active, display_order);
CREATE INDEX idx_geographic_analytics_period ON public.geographic_analytics(date_period);
CREATE INDEX idx_predictive_insights_entity ON public.predictive_insights(entity_type, entity_id);
CREATE INDEX idx_custom_reports_active ON public.custom_reports(is_active);
