-- 1. Update any existing account for tawananyashachipata@gmail.com to have the 'admin' role in public.user_roles
UPDATE public.user_roles
SET role = 'admin'::public.app_role
WHERE user_id IN (
  SELECT id FROM auth.users WHERE LOWER(email) = LOWER('tawananyashachipata@gmail.com')
);

-- 2. Insert admin role if not already present
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE LOWER(email) = LOWER('tawananyashachipata@gmail.com')
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin'::public.app_role;

-- 3. Create self-service claim function for authenticated users
CREATE OR REPLACE FUNCTION public.claim_admin_role()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  caller_id UUID := auth.uid();
BEGIN
  IF caller_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Update existing user_roles entry to admin
  UPDATE public.user_roles
  SET role = 'admin'::public.app_role
  WHERE user_id = caller_id;

  -- Insert if missing
  INSERT INTO public.user_roles (user_id, role)
  VALUES (caller_id, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin'::public.app_role;

  RETURN TRUE;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_admin_role() TO authenticated;

-- 4. Update the new user trigger to automatically grant 'admin' role to project owner upon sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;

  -- Default role for all users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  -- Auto-assign admin role to project owner
  IF LOWER(NEW.email) = LOWER('tawananyashachipata@gmail.com') THEN
    UPDATE public.user_roles
    SET role = 'admin'::public.app_role
    WHERE user_id = NEW.id;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin'::public.app_role;
  END IF;

  RETURN NEW;
END;
$$;
