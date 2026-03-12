-- ============================================
-- Trigger to auto-create public.users profile
-- when a new Supabase auth user is created
-- ============================================

-- This function runs automatically after signup
-- so we don't need to manually insert into public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow unauthenticated inserts for signup flow
-- (the trigger runs as SECURITY DEFINER so it bypasses RLS)
CREATE POLICY "Allow insert on signup" ON public.users
  FOR INSERT WITH CHECK (true);
