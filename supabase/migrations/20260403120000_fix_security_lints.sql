-- Fix Supabase linter warnings:
-- 1) function_search_path_mutable
-- 2) rls_policy_always_true

-- Make function search paths explicit and immutable at runtime
ALTER FUNCTION public.update_timestamp()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.handle_new_user()
  SET search_path = public, pg_temp;

-- Remove overly permissive INSERT policy on public.users
DROP POLICY IF EXISTS "Allow insert on signup" ON public.users;

-- Optional safe insert policy for authenticated users creating their own profile row
-- (trigger-based signup still works through SECURITY DEFINER)
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
