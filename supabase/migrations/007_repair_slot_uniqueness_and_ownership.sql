-- Repair migration for add-slot failures after user scoping.
-- 1) Ensure slot ownership column exists
-- 2) Remove any legacy global uniqueness on slot number
-- 3) Enforce per-user uniqueness for slot number

ALTER TABLE public.park_slots
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop legacy global unique constraint if present
ALTER TABLE public.park_slots
  DROP CONSTRAINT IF EXISTS park_slots_number_key;

-- Drop any single-column unique index on (number) that can block cross-user inserts
DO $$
DECLARE
  index_name text;
BEGIN
  FOR index_name IN
    SELECT i.indexname
    FROM pg_indexes i
    WHERE i.schemaname = 'public'
      AND i.tablename = 'park_slots'
      AND i.indexdef ILIKE 'CREATE UNIQUE INDEX%ON public.park_slots USING btree (number)%'
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS public.%I', index_name);
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_park_slots_user_id ON public.park_slots(user_id);

-- Per-user uniqueness (only for owned rows)
CREATE UNIQUE INDEX IF NOT EXISTS uq_park_slots_user_number
  ON public.park_slots(user_id, number)
  WHERE user_id IS NOT NULL;
