-- Fix security functions to work with actual table structure

-- Fix Admin Role Authorization - Update is_admin() function (without is_active column)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role::text IN ('super_admin', 'admin', 'manager')
  );
$$;

-- Create standardized admin user check function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role::text IN ('super_admin', 'admin', 'manager')
  );
$$;

-- Create inventory manager check function
CREATE OR REPLACE FUNCTION public.is_inventory_manager()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role::text IN ('super_admin', 'admin', 'pharmacist')
  );
$$;

-- Add missing RLS policies for user_profiles table
DROP POLICY IF EXISTS "Admin access for user_profiles" ON public.user_profiles;
CREATE POLICY "Admin access for user_profiles" ON public.user_profiles
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Add users can view own profile policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT 
USING (id = auth.uid());

-- Add users can update own profile policy  
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for audit log (admin only)
DROP POLICY IF EXISTS "Admin can view audit log" ON public.security_audit_log;
CREATE POLICY "Admin can view audit log" ON public.security_audit_log
FOR ALL 
USING (is_admin_user());

-- Add function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_resource TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_success BOOLEAN DEFAULT true
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, action, resource, details, success
  ) VALUES (
    auth.uid(), p_action, p_resource, p_details, p_success
  );
END;
$$;