-- ==============================================================================
-- TasteHub Admin Role Assignment Script
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ltkdbruviqnjcdkxqcou/sql
-- ==============================================================================

-- 1. UPDATE existing role from 'user' to 'admin' for your User ID:
UPDATE public.user_roles
SET role = 'admin'::public.app_role
WHERE user_id = '630286af-1418-4ba7-aebe-2e1e79f738c7';

-- 2. UPDATE by email as well:
UPDATE public.user_roles
SET role = 'admin'::public.app_role
WHERE user_id = (
  SELECT id FROM auth.users WHERE LOWER(email) = LOWER('tawananyashachipata@gmail.com')
);

-- 3. Also INSERT in case it doesn't exist:
INSERT INTO public.user_roles (user_id, role)
VALUES ('630286af-1418-4ba7-aebe-2e1e79f738c7', 'admin'::public.app_role)
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin'::public.app_role;

-- 4. VERIFY: View the updated role in the Results tab below
SELECT 
  u.id AS user_id,
  u.email,
  ur.role
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.id = '630286af-1418-4ba7-aebe-2e1e79f738c7';
