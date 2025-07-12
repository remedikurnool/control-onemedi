
-- Add is_active column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Update existing users to be active by default
UPDATE public.user_profiles 
SET is_active = true 
WHERE is_active IS NULL;
