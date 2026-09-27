-- Sync missing users from auth.users to public.users
-- This script ensures all auth users have corresponding public.users records

-- Insert any missing users
INSERT INTO public.users (id, email, name, onboarding_completed, created_at, updated_at)
SELECT 
  au.id::text,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', NULL) as name,
  false as onboarding_completed,
  au.created_at,
  au.updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id::text = pu.id
WHERE pu.id IS NULL;

-- Show the results
SELECT 
  'Synced users count:' as message,
  COUNT(*) as count
FROM auth.users au
WHERE au.id::text IN (SELECT id FROM public.users);

SELECT 
  'Total auth users:' as message,
  COUNT(*) as count
FROM auth.users;

SELECT 
  'Total public users:' as message,
  COUNT(*) as count
FROM public.users;

