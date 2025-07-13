
-- Fix database schema issues by adding missing columns and constraints

-- Add is_active column to user_profiles if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing users to be active by default
UPDATE public.user_profiles 
SET is_active = true 
WHERE is_active IS NULL;

-- Add missing columns to user_profiles for better functionality
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS location JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- Ensure security_audit_log table exists for enhanced security features
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT,
  details JSONB DEFAULT '{}',
  success BOOLEAN DEFAULT true,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on security_audit_log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for security audit log
CREATE POLICY "Admin access security logs" ON public.security_audit_log
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'admin')
  )
);

-- Ensure product_barcodes table exists for POS functionality
CREATE TABLE IF NOT EXISTS public.product_barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  barcode_value TEXT NOT NULL UNIQUE,
  barcode_type TEXT DEFAULT 'EAN13',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on product_barcodes
ALTER TABLE public.product_barcodes ENABLE ROW LEVEL SECURITY;

-- Create policy for product_barcodes
CREATE POLICY "Admin manage product barcodes" ON public.product_barcodes
FOR ALL USING (is_admin() OR is_inventory_manager());

CREATE POLICY "Public read product barcodes" ON public.product_barcodes
FOR SELECT USING (true);

-- Add some sample barcodes for demo purposes
INSERT INTO public.product_barcodes (product_id, barcode_value, barcode_type)
SELECT id, 'MED' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'), 'CODE128'
FROM public.products 
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_barcodes WHERE product_id = products.id
)
LIMIT 10
ON CONFLICT (barcode_value) DO NOTHING;
