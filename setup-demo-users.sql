-- Setup Demo Users for OneMedi Healthcare Platform
-- Run this script in Supabase SQL Editor

-- First, ensure the user_role enum exists with all required roles
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM (
        'super_admin', 
        'admin', 
        'manager', 
        'doctor', 
        'pharmacist', 
        'lab_technician', 
        'front_desk', 
        'nurse',
        'customer',
        'user'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure user_profiles table has all required columns
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Update existing user_profiles to be active
UPDATE public.user_profiles SET is_active = true WHERE is_active IS NULL;

-- Function to create demo user with proper authentication
CREATE OR REPLACE FUNCTION create_demo_user_with_auth(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT,
  user_phone TEXT DEFAULT NULL,
  user_role public.user_role DEFAULT 'customer',
  user_department TEXT DEFAULT NULL,
  user_permissions JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  user_id UUID;
  encrypted_password TEXT;
BEGIN
  -- Generate a new UUID for the user
  user_id := gen_random_uuid();
  
  -- Create encrypted password using crypt function
  encrypted_password := crypt(user_password, gen_salt('bf'));
  
  -- Insert into auth.users table
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
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    user_email,
    encrypted_password,
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'full_name', user_full_name,
      'role', user_role::text,
      'phone', user_phone,
      'permissions', user_permissions
    ),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = NOW();
  
  -- Insert or update user_profiles table
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    phone,
    role,
    is_active,
    department,
    permissions,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_email,
    user_full_name,
    user_phone,
    user_role,
    true,
    user_department,
    user_permissions,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    department = EXCLUDED.department,
    permissions = EXCLUDED.permissions,
    updated_at = NOW();
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create demo users with working credentials
SELECT create_demo_user_with_auth(
  'superadmin@onemedi.com',
  'SuperAdmin@123',
  'Dr. Rajesh Kumar (Super Admin)',
  '+91-9876543210',
  'super_admin',
  'Administration',
  '{"users.create": true, "users.read": true, "users.update": true, "users.delete": true, "inventory.manage": true, "orders.manage": true, "analytics.view": true, "settings.manage": true, "pos.access": true, "reports.generate": true, "system.configure": true}'::jsonb
);

SELECT create_demo_user_with_auth(
  'admin@onemedi.com',
  'Admin@123',
  'Dr. Priya Sharma (Admin)',
  '+91-9876543211',
  'admin',
  'Administration',
  '{"users.create": true, "users.read": true, "users.update": true, "inventory.manage": true, "orders.manage": true, "analytics.view": true, "settings.read": true, "pos.access": true, "reports.generate": true}'::jsonb
);

SELECT create_demo_user_with_auth(
  'manager@onemedi.com',
  'Manager@123',
  'Mr. Amit Patel (Manager)',
  '+91-9876543212',
  'manager',
  'Operations',
  '{"orders.read": true, "orders.update": true, "inventory.read": true, "inventory.update": true, "users.read": true, "analytics.view": true, "pos.access": true}'::jsonb
);

SELECT create_demo_user_with_auth(
  'doctor@onemedi.com',
  'Doctor@123',
  'Dr. Sunita Reddy (Doctor)',
  '+91-9876543213',
  'doctor',
  'Medical',
  '{"consultations.create": true, "consultations.read": true, "consultations.update": true, "prescriptions.create": true, "prescriptions.read": true, "prescriptions.update": true, "patients.read": true, "patients.update": true}'::jsonb
);

SELECT create_demo_user_with_auth(
  'pharmacist@onemedi.com',
  'Pharma@123',
  'Mr. Ravi Kumar (Pharmacist)',
  '+91-9876543214',
  'pharmacist',
  'Pharmacy',
  '{"medicines.read": true, "medicines.update": true, "inventory.read": true, "inventory.update": true, "orders.read": true, "orders.update": true, "prescriptions.read": true, "pos.access": true}'::jsonb
);

SELECT create_demo_user_with_auth(
  'labtech@onemedi.com',
  'LabTech@123',
  'Ms. Kavya Nair (Lab Technician)',
  '+91-9876543215',
  'lab_technician',
  'Laboratory',
  '{"lab_tests.read": true, "lab_tests.update": true, "lab_bookings.read": true, "lab_bookings.update": true, "reports.create": true, "reports.read": true, "reports.update": true}'::jsonb
);

SELECT create_demo_user_with_auth(
  'frontdesk@onemedi.com',
  'FrontDesk@123',
  'Ms. Meera Singh (Front Desk)',
  '+91-9876543216',
  'front_desk',
  'Reception',
  '{"appointments.create": true, "appointments.read": true, "appointments.update": true, "patients.create": true, "patients.read": true, "patients.update": true, "pos.create": true, "pos.read": true}'::jsonb
);

SELECT create_demo_user_with_auth(
  'nurse@onemedi.com',
  'Nurse@123',
  'Ms. Anjali Gupta (Nurse)',
  '+91-9876543217',
  'nurse',
  'Medical',
  '{"patients.read": true, "patients.update": true, "consultations.read": true, "appointments.read": true, "appointments.update": true}'::jsonb
);

SELECT create_demo_user_with_auth(
  'customer@onemedi.com',
  'Customer@123',
  'Mr. Vikram Joshi (Customer)',
  '+91-9876543218',
  'customer',
  NULL,
  '{"profile.read": true, "profile.update": true, "orders.create": true, "orders.read": true, "appointments.create": true, "appointments.read": true}'::jsonb
);

-- Verify the demo users were created successfully
SELECT 
  up.email,
  up.full_name,
  up.role,
  up.department,
  up.is_active,
  au.email_confirmed_at IS NOT NULL as email_confirmed
FROM public.user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.email LIKE '%@onemedi.com'
ORDER BY 
  CASE up.role 
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'manager' THEN 3
    WHEN 'doctor' THEN 4
    WHEN 'pharmacist' THEN 5
    WHEN 'lab_technician' THEN 6
    WHEN 'front_desk' THEN 7
    WHEN 'nurse' THEN 8
    WHEN 'customer' THEN 9
    ELSE 10
  END;

-- Display demo credentials for reference
DO $$
BEGIN
  RAISE NOTICE '=== DEMO LOGIN CREDENTIALS ===';
  RAISE NOTICE 'Super Admin: superadmin@onemedi.com / SuperAdmin@123';
  RAISE NOTICE 'Admin: admin@onemedi.com / Admin@123';
  RAISE NOTICE 'Manager: manager@onemedi.com / Manager@123';
  RAISE NOTICE 'Doctor: doctor@onemedi.com / Doctor@123';
  RAISE NOTICE 'Pharmacist: pharmacist@onemedi.com / Pharma@123';
  RAISE NOTICE 'Lab Technician: labtech@onemedi.com / LabTech@123';
  RAISE NOTICE 'Front Desk: frontdesk@onemedi.com / FrontDesk@123';
  RAISE NOTICE 'Nurse: nurse@onemedi.com / Nurse@123';
  RAISE NOTICE 'Customer: customer@onemedi.com / Customer@123';
  RAISE NOTICE '================================';
  RAISE NOTICE 'All users created successfully!';
  RAISE NOTICE 'Navigate to: http://localhost:8080/login';
END $$;
