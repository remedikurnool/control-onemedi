-- Update existing user profiles to have correct admin roles using valid enum values
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email IN ('remedikurnool@gmail.com', 'superadmin@onemedi.com', 'admin@onemedi.com', 'manager@onemedi.com');

UPDATE public.user_profiles 
SET role = 'pharmacist' 
WHERE email = 'pharmacist@onemedi.com';