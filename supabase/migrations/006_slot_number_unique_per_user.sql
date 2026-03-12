-- Make slot numbers unique per user instead of globally unique.

ALTER TABLE public.park_slots
  DROP CONSTRAINT IF EXISTS park_slots_number_key;

DROP INDEX IF EXISTS public.park_slots_number_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_park_slots_user_number
  ON public.park_slots(user_id, number)
  WHERE user_id IS NOT NULL;
