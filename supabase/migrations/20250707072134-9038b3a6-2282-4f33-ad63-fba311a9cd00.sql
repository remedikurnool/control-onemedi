
-- Create dynamic pricing rules table
CREATE TABLE public.dynamic_pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'demand_based', 'time_based', 'inventory_based', 'customer_tier'
  target_products JSONB DEFAULT '[]'::jsonb, -- product IDs or categories
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb, -- pricing conditions
  adjustments JSONB NOT NULL DEFAULT '{}'::jsonb, -- price adjustments
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Create recommendation rules table
CREATE TABLE public.recommendation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'cross_sell', 'upsell', 'frequently_bought_together'
  trigger_products JSONB DEFAULT '[]'::jsonb,
  recommended_products JSONB DEFAULT '[]'::jsonb,
  conditions JSONB DEFAULT '{}'::jsonb,
  discount_percentage NUMERIC DEFAULT 0,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Create abandoned cart recovery campaigns table
CREATE TABLE public.abandoned_cart_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  trigger_delay_minutes INTEGER DEFAULT 60, -- delay before first email
  email_template TEXT,
  sms_template TEXT,
  whatsapp_template TEXT,
  discount_code TEXT,
  discount_percentage NUMERIC DEFAULT 0,
  follow_up_sequence JSONB DEFAULT '[]'::jsonb, -- array of follow-up messages with delays
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Create loyalty program configuration table
CREATE TABLE public.loyalty_program_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_name TEXT NOT NULL DEFAULT 'Health Rewards',
  points_per_rupee NUMERIC DEFAULT 1,
  referral_points INTEGER DEFAULT 100,
  birthday_bonus_points INTEGER DEFAULT 50,
  tier_thresholds JSONB DEFAULT '{"bronze": 0, "silver": 1000, "gold": 5000, "platinum": 15000}'::jsonb,
  tier_benefits JSONB DEFAULT '{}'::jsonb,
  point_expiry_months INTEGER DEFAULT 12,
  min_redemption_points INTEGER DEFAULT 100,
  redemption_rate NUMERIC DEFAULT 1, -- points to rupee conversion
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user loyalty accounts table
CREATE TABLE public.user_loyalty_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  total_points INTEGER DEFAULT 0,
  available_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  current_tier TEXT DEFAULT 'bronze',
  tier_progress NUMERIC DEFAULT 0,
  referral_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create loyalty points transactions table
CREATE TABLE public.loyalty_points_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earned', 'redeemed', 'expired', 'bonus'
  points INTEGER NOT NULL,
  description TEXT,
  reference_type TEXT, -- 'order', 'referral', 'birthday', 'manual'
  reference_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews and ratings table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  order_id UUID REFERENCES customer_orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title TEXT,
  review_text TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  reported_count INTEGER DEFAULT 0,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, user_id, order_id)
);

-- Create limited time offers table
CREATE TABLE public.limited_time_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_name TEXT NOT NULL,
  offer_type TEXT NOT NULL, -- 'flash_sale', 'daily_deal', 'weekend_special', 'clearance'
  applicable_products JSONB DEFAULT '[]'::jsonb,
  applicable_categories JSONB DEFAULT '[]'::jsonb,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed_amount', 'buy_x_get_y'
  discount_value NUMERIC NOT NULL,
  max_discount_amount NUMERIC,
  minimum_order_amount NUMERIC DEFAULT 0,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  urgency_message TEXT,
  banner_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Create offer usage tracking table
CREATE TABLE public.offer_usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID REFERENCES limited_time_offers(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES customer_orders(id),
  discount_applied NUMERIC NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE public.dynamic_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_cart_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_program_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.limited_time_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin management
CREATE POLICY "Admin manage pricing rules" ON public.dynamic_pricing_rules FOR ALL USING (is_admin());
CREATE POLICY "Admin manage recommendation rules" ON public.recommendation_rules FOR ALL USING (is_admin());
CREATE POLICY "Admin manage abandoned cart campaigns" ON public.abandoned_cart_campaigns FOR ALL USING (is_admin());
CREATE POLICY "Admin manage loyalty program" ON public.loyalty_program_config FOR ALL USING (is_admin());
CREATE POLICY "Admin manage offers" ON public.limited_time_offers FOR ALL USING (is_admin());

-- Create RLS policies for user access
CREATE POLICY "Users view own loyalty account" ON public.user_loyalty_accounts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users view own points transactions" ON public.loyalty_points_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users manage own reviews" ON public.product_reviews FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Public read approved reviews" ON public.product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Public read active offers" ON public.limited_time_offers FOR SELECT USING (is_active = true AND start_time <= CURRENT_TIMESTAMP AND end_time >= CURRENT_TIMESTAMP);
CREATE POLICY "Track offer usage" ON public.offer_usage_tracking FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin());

-- Create indexes for performance
CREATE INDEX idx_dynamic_pricing_rules_active ON public.dynamic_pricing_rules(is_active, valid_from, valid_until);
CREATE INDEX idx_recommendation_rules_active ON public.recommendation_rules(is_active, rule_type);
CREATE INDEX idx_user_loyalty_accounts_user_id ON public.user_loyalty_accounts(user_id);
CREATE INDEX idx_loyalty_points_transactions_user_id ON public.loyalty_points_transactions(user_id);
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id, is_approved);
CREATE INDEX idx_limited_time_offers_active ON public.limited_time_offers(is_active, start_time, end_time);

-- Create functions for loyalty program
CREATE OR REPLACE FUNCTION public.calculate_loyalty_tier(total_points INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  IF total_points >= 15000 THEN
    RETURN 'platinum';
  ELSIF total_points >= 5000 THEN
    RETURN 'gold';
  ELSIF total_points >= 1000 THEN
    RETURN 'silver';
  ELSE
    RETURN 'bronze';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_loyalty_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.current_tier := calculate_loyalty_tier(NEW.total_points);
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_loyalty_tier_trigger
  BEFORE UPDATE ON public.user_loyalty_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loyalty_tier();

-- Create function to generate referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  code := 'REF' || LPAD(floor(random() * 1000000)::text, 6, '0');
  RETURN code;
END;
$$;
