/*
# Fix RLS Recursion Issue
This migration fixes the stack depth limit exceeded error caused by recursive RLS policies.

## Problem:
The function requesting_user_establishment_id() queries the users table,
but the users table has RLS enabled with a policy that calls requesting_user_establishment_id(),
creating an infinite loop.

## Solution:
1. Drop the problematic function
2. Recreate it with SECURITY DEFINER and proper search_path to bypass RLS
3. Update policies to avoid recursion
*/

-- Drop existing function
DROP FUNCTION IF EXISTS public.requesting_user_establishment_id();

-- Recreate function with proper security context to bypass RLS
CREATE OR REPLACE FUNCTION public.requesting_user_establishment_id()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  est_id int;
BEGIN
  -- Query users table directly, bypassing RLS
  SELECT establishment_id INTO est_id
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN est_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.requesting_user_establishment_id() TO authenticated;

-- Drop and recreate the users table policy to avoid recursion
DROP POLICY IF EXISTS "Allow access to own establishment data" ON public.users;

-- New policy that doesn't cause recursion
-- Users can see other users in their establishment
CREATE POLICY "Allow access to own establishment data" ON public.users FOR ALL
USING (
  establishment_id = (
    SELECT establishment_id 
    FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Also fix the auth helper functions if they exist
DROP FUNCTION IF EXISTS auth.get_current_establishment_id();
DROP FUNCTION IF EXISTS auth.get_current_user_role_id();

-- Recreate in public schema with proper security
CREATE OR REPLACE FUNCTION public.get_current_establishment_id()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  est_id int;
BEGIN
  SELECT establishment_id INTO est_id
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN est_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role_id()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r_id int;
BEGIN
  SELECT role_id INTO r_id
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN r_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_establishment_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role_id() TO authenticated;
