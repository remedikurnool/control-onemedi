-- Phase 1: Critical Database Security Fixes

-- 1. Fix Admin Role Authorization - Update is_admin() function to check all admin roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role IN ('super_admin', 'admin', 'manager')
    AND up.is_active = true
  );
$$;

-- 2. Create standardized admin user check function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role IN ('super_admin', 'admin', 'manager')
    AND up.is_active = true
  );
$$;

-- 3. Create has_role function for flexible role checking
CREATE OR REPLACE FUNCTION public.has_role(required_role public.user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role = required_role
    AND up.is_active = true
  );
$$;

-- 4. Add missing RLS policy for user_profiles table
CREATE POLICY "Admin access for user_profiles" ON public.user_profiles
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- 5. Add users can view own profile policy
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT 
USING (id = auth.uid());

-- 6. Add users can update own profile policy  
CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 7. Create inventory manager check function
CREATE OR REPLACE FUNCTION public.is_inventory_manager()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role IN ('super_admin', 'admin', 'pharmacist')
    AND up.is_active = true
  );
$$;

-- 8. Update handle_new_user function to be more secure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, phone, role, is_active)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'customer'),
    true
  );
  RETURN NEW;
END;
$$;

-- 9. Add session security tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  session_end TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on sessions table
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admin can view all sessions" ON public.user_sessions
FOR ALL 
USING (is_admin_user());

-- 10. Create security audit log table
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
CREATE POLICY "Admin can view audit log" ON public.security_audit_log
FOR ALL 
USING (is_admin_user());

-- 11. Add function to log security events
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