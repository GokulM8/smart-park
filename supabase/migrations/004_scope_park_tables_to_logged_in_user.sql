-- Scope vehicle and record data to the authenticated user.
-- Slot ownership is handled in 004_scope_slots_to_logged_in_user.sql.

CREATE INDEX IF NOT EXISTS idx_park_vehicles_user_id ON public.park_vehicles(user_id);

ALTER TABLE public.park_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.park_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.park_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read vehicles"          ON public.park_vehicles;
DROP POLICY IF EXISTS "Authenticated users can insert vehicles"        ON public.park_vehicles;
DROP POLICY IF EXISTS "Authenticated users can update vehicles"        ON public.park_vehicles;
DROP POLICY IF EXISTS "Authenticated users can delete vehicles"        ON public.park_vehicles;
DROP POLICY IF EXISTS "Authenticated users can read slots"             ON public.park_slots;
DROP POLICY IF EXISTS "Authenticated users can insert slots"           ON public.park_slots;
DROP POLICY IF EXISTS "Authenticated users can update slots"           ON public.park_slots;
DROP POLICY IF EXISTS "Authenticated users can delete slots"           ON public.park_slots;
DROP POLICY IF EXISTS "Authenticated users can read records"           ON public.park_records;
DROP POLICY IF EXISTS "Authenticated users can insert records"         ON public.park_records;
DROP POLICY IF EXISTS "Authenticated users can update records"         ON public.park_records;
DROP POLICY IF EXISTS "Authenticated users can delete records"         ON public.park_records;
DROP POLICY IF EXISTS "Authenticated users can read own vehicles"      ON public.park_vehicles;
DROP POLICY IF EXISTS "Authenticated users can insert own vehicles"    ON public.park_vehicles;
DROP POLICY IF EXISTS "Authenticated users can update own vehicles"    ON public.park_vehicles;
DROP POLICY IF EXISTS "Authenticated users can delete own vehicles"    ON public.park_vehicles;
DROP POLICY IF EXISTS "Authenticated users can read own records"       ON public.park_records;
DROP POLICY IF EXISTS "Authenticated users can insert own records"     ON public.park_records;
DROP POLICY IF EXISTS "Authenticated users can update own records"     ON public.park_records;
DROP POLICY IF EXISTS "Authenticated users can delete own records"     ON public.park_records;
DROP POLICY IF EXISTS "allow_all_vehicles"                             ON public.park_vehicles;
DROP POLICY IF EXISTS "allow_all_slots"                                ON public.park_slots;
DROP POLICY IF EXISTS "allow_all_records"                              ON public.park_records;

CREATE POLICY "Authenticated users can read own vehicles"
  ON public.park_vehicles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own vehicles"
  ON public.park_vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own vehicles"
  ON public.park_vehicles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete own vehicles"
  ON public.park_vehicles
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can read slots"
  ON public.park_slots
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert slots"
  ON public.park_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update slots"
  ON public.park_slots
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete slots"
  ON public.park_slots
  FOR DELETE
  TO authenticated
  USING (true);

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
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.park_vehicles vehicle
      WHERE vehicle.id = park_records.vehicle_id
        AND vehicle.user_id = auth.uid()
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
  );
