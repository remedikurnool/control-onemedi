-- Update existing user profiles to have correct admin roles 
-- Using exact values from the CHECK constraint
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email IN ('remedikurnool@gmail.com', 'superadmin@onemedi.com', 'admin@onemedi.com');

UPDATE public.user_profiles 
SET role = 'manager' 
WHERE email = 'manager@onemedi.com';

UPDATE public.user_profiles 
SET role = 'pharmacist' 
WHERE email = 'pharmacist@onemedi.com';