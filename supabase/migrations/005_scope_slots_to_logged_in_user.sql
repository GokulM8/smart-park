-- Scope parking slots to the authenticated user
-- Existing slots with NULL user_id will need to be reassigned or recreated.

ALTER TABLE public.park_slots
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_park_slots_user_id ON public.park_slots(user_id);

ALTER TABLE public.park_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.park_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.park_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read slots"             ON public.park_slots;
DROP POLICY IF EXISTS "Authenticated users can insert slots"           ON public.park_slots;
DROP POLICY IF EXISTS "Authenticated users can update slots"           ON public.park_slots;
DROP POLICY IF EXISTS "Authenticated users can delete slots"           ON public.park_slots;
DROP POLICY IF EXISTS "Authenticated users can read own records"       ON public.park_records;
DROP POLICY IF EXISTS "Authenticated users can insert own records"     ON public.park_records;
DROP POLICY IF EXISTS "Authenticated users can update own records"     ON public.park_records;
DROP POLICY IF EXISTS "Authenticated users can delete own records"     ON public.park_records;
DROP POLICY IF EXISTS "allow_all_slots"                                ON public.park_slots;
DROP POLICY IF EXISTS "allow_all_records"                              ON public.park_records;

CREATE POLICY "Authenticated users can read slots"
  ON public.park_slots
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert slots"
  ON public.park_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update slots"
  ON public.park_slots
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete slots"
  ON public.park_slots
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can read own records"
  ON public.park_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.park_vehicles vehicle
      WHERE vehicle.id = park_records.vehicle_id
        AND vehicle.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.park_slots slot
      WHERE slot.id = park_records.slot_id
        AND slot.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert own records"
  ON public.park_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.park_vehicles vehicle
      WHERE vehicle.id = park_records.vehicle_id
        AND vehicle.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.park_slots slot
      WHERE slot.id = park_records.slot_id
        AND slot.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can update own records"
  ON public.park_records
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.park_vehicles vehicle
      WHERE vehicle.id = park_records.vehicle_id
        AND vehicle.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.park_slots slot
      WHERE slot.id = park_records.slot_id
        AND slot.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.park_vehicles vehicle
      WHERE vehicle.id = park_records.vehicle_id
        AND vehicle.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.park_slots slot
      WHERE slot.id = park_records.slot_id
        AND slot.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can delete own records"
  ON public.park_records
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.park_vehicles vehicle
      WHERE vehicle.id = park_records.vehicle_id
        AND vehicle.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.park_slots slot
      WHERE slot.id = park_records.slot_id
        AND slot.user_id = auth.uid()
    )
  );
