-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- Users Table (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'staff', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Vehicles Table
-- ============================================
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  license_plate TEXT NOT NULL UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  color TEXT,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('sedan', 'suv', 'truck', 'motorcycle', 'other')),
  year INTEGER,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Parking Slots Table
-- ============================================
CREATE TABLE public.parking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_number TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL,
  zone TEXT NOT NULL,
  capacity TEXT NOT NULL CHECK (capacity IN ('compact', 'standard', 'large')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  current_vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  hourly_rate DECIMAL(10, 2) DEFAULT 5.00,
  is_handicap BOOLEAN DEFAULT false,
  is_reserved BOOLEAN DEFAULT false,
  features TEXT, -- JSON array of features (e.g., ["ev_charging", "covered"])
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Entry/Exit Logs Table
-- ============================================
CREATE TABLE public.entry_exit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES public.parking_slots(id) ON DELETE SET NULL,
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  cost DECIMAL(10, 2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  entry_photo_url TEXT,
  exit_photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Billing/Invoices Table
-- ============================================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  entry_exit_log_id UUID REFERENCES public.entry_exit_logs(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  due_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT CHECK (payment_method IN ('credit_card', 'debit_card', 'upi', 'wallet', 'cash')),
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Reservations Table
-- ============================================
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES public.parking_slots(id) ON DELETE CASCADE,
  reserved_from TIMESTAMP WITH TIME ZONE NOT NULL,
  reserved_until TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Reports Table (for analytics)
-- ============================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL CHECK (report_type IN ('occupancy', 'revenue', 'user_activity', 'slot_usage')),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX idx_vehicles_license_plate ON public.vehicles(license_plate);
CREATE INDEX idx_parking_slots_status ON public.parking_slots(status);
CREATE INDEX idx_parking_slots_level ON public.parking_slots(level);
CREATE INDEX idx_entry_exit_logs_user_id ON public.entry_exit_logs(user_id);
CREATE INDEX idx_entry_exit_logs_vehicle_id ON public.entry_exit_logs(vehicle_id);
CREATE INDEX idx_entry_exit_logs_slot_id ON public.entry_exit_logs(slot_id);
CREATE INDEX idx_entry_exit_logs_entry_time ON public.entry_exit_logs(entry_time);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX idx_reservations_slot_id ON public.reservations(slot_id);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_exit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users: Users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Vehicles: Users can view/manage their own vehicles, admins can view all
CREATE POLICY "Users can view own vehicles" ON public.vehicles
  FOR SELECT USING (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own vehicles" ON public.vehicles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own vehicles" ON public.vehicles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own vehicles" ON public.vehicles
  FOR DELETE USING (user_id = auth.uid());

-- Parking Slots: Everyone can view available slots, staff/admin can manage
CREATE POLICY "Everyone can view available slots" ON public.parking_slots
  FOR SELECT USING (true);

CREATE POLICY "Staff can update parking slots" ON public.parking_slots
  FOR UPDATE USING ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('staff', 'admin'));

-- Entry/Exit Logs: Users can view their own, staff/admin can view all
CREATE POLICY "Users can view own logs" ON public.entry_exit_logs
  FOR SELECT USING (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('staff', 'admin'));

CREATE POLICY "Users can insert own logs" ON public.entry_exit_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Invoices: Users can view their own, admins can manage all
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Reservations: Users can manage their own
CREATE POLICY "Users can view own reservations" ON public.reservations
  FOR SELECT USING (user_id = auth.uid() OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('staff', 'admin'));

CREATE POLICY "Users can create reservations" ON public.reservations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reservations" ON public.reservations
  FOR UPDATE USING (user_id = auth.uid());

-- Reports: Only admins can view
CREATE POLICY "Admins can view reports" ON public.reports
  FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- ============================================
-- Triggers for Updated Timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_vehicles_timestamp BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_parking_slots_timestamp BEFORE UPDATE ON public.parking_slots
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_entry_exit_logs_timestamp BEFORE UPDATE ON public.entry_exit_logs
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_reservations_timestamp BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
