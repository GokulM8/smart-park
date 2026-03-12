-- ============================================
-- App-specific tables matching the UI data model
-- ============================================

-- Enable UUID generation extension (safe even if already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Vehicles registered in the parking system
CREATE TABLE IF NOT EXISTS public.park_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  vehicle_number TEXT NOT NULL UNIQUE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'bike', 'ev')),
  owner_name TEXT NOT NULL,
  contact_number TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Parking slots
CREATE TABLE IF NOT EXISTS public.park_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  number TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('car', 'bike', 'ev')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'disabled')),
  floor INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Entry/exit parking records
CREATE TABLE IF NOT EXISTS public.park_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.park_vehicles(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES public.park_slots(id) ON DELETE CASCADE,
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  exit_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- minutes
  amount DECIMAL(10,2),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure ownership columns exist on pre-existing tables
ALTER TABLE IF EXISTS public.park_vehicles
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.park_slots
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_park_vehicles_user_id ON public.park_vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_park_slots_user_id ON public.park_slots(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_park_slots_user_number ON public.park_slots(user_id, number) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_park_records_vehicle ON public.park_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_park_records_slot ON public.park_records(slot_id);
CREATE INDEX IF NOT EXISTS idx_park_records_entry ON public.park_records(entry_time);
CREATE INDEX IF NOT EXISTS idx_park_slots_status ON public.park_slots(status);
CREATE INDEX IF NOT EXISTS idx_park_vehicles_number ON public.park_vehicles(vehicle_number);

-- ============================================
-- Row Level Security — scope data to authenticated users
-- ============================================
ALTER TABLE public.park_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.park_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.park_records ENABLE ROW LEVEL SECURITY;

-- Drop old policies before recreating (safe to re-run)
DROP POLICY IF EXISTS "Authenticated users can read vehicles"   ON public.park_vehicles;
DROP POLICY IF EXISTS "Authenticated users can insert vehicles" ON public.park_vehicles;
DROP POLICY IF EXISTS "Authenticated users can update vehicles" ON public.park_vehicles;
DROP POLICY IF EXISTS "Authenticated users can delete vehicles" ON public.park_vehicles;
DROP POLICY IF EXISTS "Authenticated users can read slots"      ON public.park_slots;
DROP POLICY IF EXISTS "Authenticated users can insert slots"    ON public.park_slots;
DROP POLICY IF EXISTS "Authenticated users can update slots"    ON public.park_slots;
DROP POLICY IF EXISTS "Authenticated users can delete slots"    ON public.park_slots;
DROP POLICY IF EXISTS "Authenticated users can read records"    ON public.park_records;
DROP POLICY IF EXISTS "Authenticated users can insert records"  ON public.park_records;
DROP POLICY IF EXISTS "Authenticated users can update records"  ON public.park_records;
DROP POLICY IF EXISTS "Authenticated users can delete records"  ON public.park_records;
DROP POLICY IF EXISTS "allow_all_vehicles" ON public.park_vehicles;
DROP POLICY IF EXISTS "allow_all_slots"    ON public.park_slots;
DROP POLICY IF EXISTS "allow_all_records"  ON public.park_records;

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
