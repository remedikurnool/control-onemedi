
-- First, let's create an enum for user roles
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'manager', 'pharmacist', 'frontdesk', 'customer');

-- Update the existing user_profiles table to use the new role enum
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS role CASCADE,
ADD COLUMN role public.user_role DEFAULT 'customer',
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Create a function to check admin access (super_admin, admin, manager)
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

-- Create a function to check if user has specific role
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

-- Update the trigger function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'customer')
  );
  RETURN NEW;
END;
$$;

-- Insert dummy users with different roles (passwords will be 'password123' for all)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
-- Super Admin
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'superadmin@onemedi.com',
  '$2a$10$U6TZDqHHDxqMqHUqfF2.yOYrSMG4xPJ5J5J5J5J5J5J5J5J5J5J5JW', -- password123
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Super Admin","role":"super_admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
-- Admin
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@onemedi.com',
  '$2a$10$U6TZDqHHDxqMqHUqfF2.yOYrSMG4xPJ5J5J5J5J5J5J5J5J5J5J5JW', -- password123
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User","role":"admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
-- Manager
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'manager@onemedi.com',
  '$2a$10$U6TZDqHHDxqMqHUqfF2.yOYrSMG4xPJ5J5J5J5J5J5J5J5J5J5J5JW', -- password123
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Manager User","role":"manager"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
-- Pharmacist
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'pharmacist@onemedi.com',
  '$2a$10$U6TZDqHHDxqMqHUqfF2.yOYrSMG4xPJ5J5J5J5J5J5J5J5J5J5J5JW', -- password123
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Pharmacist User","role":"pharmacist"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
-- Front Desk
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'frontdesk@onemedi.com',
  '$2a$10$U6TZDqHHDxqMqHUqfF2.yOYrSMG4xPJ5J5J5J5J5J5J5J5J5J5J5JW', -- password123
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Front Desk User","role":"frontdesk"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
-- Customer
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'customer@onemedi.com',
  '$2a$10$U6TZDqHHDxqMqHUqfF2.yOYrSMG4xPJ5J5J5J5J5J5J5J5J5J5J5JW', -- password123
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Customer User","role":"customer"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
