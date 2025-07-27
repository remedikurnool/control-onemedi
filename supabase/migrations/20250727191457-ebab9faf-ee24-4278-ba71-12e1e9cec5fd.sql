-- Fix the trigger function to properly handle admin roles from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing user profiles to have correct admin roles based on their email
UPDATE public.user_profiles 
SET role = 'super_admin' 
WHERE email IN ('remedikurnool@gmail.com', 'superadmin@onemedi.com');

UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'admin@onemedi.com';

UPDATE public.user_profiles 
SET role = 'manager' 
WHERE email = 'manager@onemedi.com';

UPDATE public.user_profiles 
SET role = 'pharmacist' 
WHERE email = 'pharmacist@onemedi.com';