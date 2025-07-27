-- First, let's see what constraint exists on the role field
SELECT conname, pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint 
WHERE conrelid = 'public.user_profiles'::regclass 
AND contype = 'c';