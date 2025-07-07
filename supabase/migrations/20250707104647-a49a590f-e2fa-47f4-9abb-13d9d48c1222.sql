-- Check current enum values and fix security functions

-- First, let's ensure the user_role enum has the correct values
-- (This should already exist from previous migrations)
DO $$ 
BEGIN
    -- Check if user_role enum exists and has correct values
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'manager', 'pharmacist', 'frontdesk', 'customer');
    END IF;
END $$;

-- Fix Admin Role Authorization - Update is_admin() function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role::text IN ('super_admin', 'admin', 'manager')
    AND COALESCE(up.is_active, true) = true
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
    AND COALESCE(up.is_active, true) = true
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
    AND COALESCE(up.is_active, true) = true
  );
$$;