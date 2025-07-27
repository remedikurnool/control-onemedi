-- Update existing user profiles to have correct admin roles 
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