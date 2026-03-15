-- Make vehicle numbers unique per user instead of globally unique.

ALTER TABLE public.park_vehicles
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.park_vehicles
  DROP CONSTRAINT IF EXISTS park_vehicles_vehicle_number_key;

DO $$
DECLARE
  index_name text;
BEGIN
  FOR index_name IN
    SELECT i.indexname
    FROM pg_indexes i
    WHERE i.schemaname = 'public'
      AND i.tablename = 'park_vehicles'
      AND i.indexdef ILIKE 'CREATE UNIQUE INDEX%ON public.park_vehicles USING btree (vehicle_number)%'
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS public.%I', index_name);
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_park_vehicles_user_id ON public.park_vehicles(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_park_vehicles_user_vehicle_number
  ON public.park_vehicles(user_id, vehicle_number)
  WHERE user_id IS NOT NULL;
