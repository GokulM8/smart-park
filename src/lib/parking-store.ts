import { create } from 'zustand';
import { supabase } from './supabase';

export type VehicleType = 'car' | 'bike' | 'ev';
export type SlotStatus = 'available' | 'occupied' | 'disabled';
export type PaymentStatus = 'paid' | 'unpaid';

export interface ParkingSlot {
  id: string;
  number: string;
  type: VehicleType;
  status: SlotStatus;
  floor: number;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  ownerName: string;
  contactNumber: string;
}

export interface ParkingRecord {
  id: string;
  vehicleId: string;
  slotId: string;
  slotNumber?: string;
  entryTime: string;
  exitTime: string | null;
  duration: number | null; // minutes
  amount: number | null;
  paymentStatus: PaymentStatus;
}

const DEFAULT_RATES: Record<VehicleType, number> = { car: 40, bike: 20, ev: 50 };

// ── Mappers: Supabase row (snake_case) → local type (camelCase) ─────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVehicle(row: Record<string, any>): Vehicle {
  return {
    id: row.id as string,
    vehicleNumber: row.vehicle_number as string,
    vehicleType: row.vehicle_type as VehicleType,
    ownerName: row.owner_name as string,
    contactNumber: (row.contact_number as string) ?? '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSlot(row: Record<string, any>): ParkingSlot {
  return {
    id: row.id as string,
    number: row.number as string,
    type: row.type as VehicleType,
    status: row.status as SlotStatus,
    floor: row.floor as number,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRecord(row: Record<string, any>): ParkingRecord {
  return {
    id: row.id as string,
    vehicleId: row.vehicle_id as string,
    slotId: row.slot_id as string,
    slotNumber: (row.park_slots?.number as string | undefined) ?? undefined,
    entryTime: row.entry_time as string,
    exitTime: (row.exit_time as string | null) ?? null,
    duration: (row.duration as number | null) ?? null,
    amount: row.amount != null ? Number(row.amount) : null,
    paymentStatus: row.payment_status as PaymentStatus,
  };
}

export interface BillPreview {
  vehicleId: string;
  slotId: string;
  entryTime: string;
  duration: number;
  rate: number;
  amount: number;
  vehicleType: VehicleType;
}

interface ParkingStore {
  slots: ParkingSlot[];
  vehicles: Vehicle[];
  records: ParkingRecord[];
  rates: Record<VehicleType, number>;
  loading: boolean;
  initialized: boolean;
  initializedForUserId: string | null;
  initialize: () => Promise<void>;
  setRate: (type: VehicleType, rate: number) => void;
  addSlot: (slot: Omit<ParkingSlot, 'id' | 'status'>) => Promise<ParkingSlot>;
  removeSlot: (slotId: string) => Promise<boolean>;
  toggleSlotDisabled: (slotId: string) => Promise<void>;
  addVehicle: (v: Omit<Vehicle, 'id'>) => Promise<Vehicle>;
  vehicleEntry: (vehicleId: string, slotId: string) => Promise<ParkingRecord>;
  vehicleExit: (recordId: string) => Promise<ParkingRecord>;
  calculateBill: (recordId: string) => BillPreview | null;
  getVehicle: (id: string) => Vehicle | undefined;
  getSlot: (id: string) => ParkingSlot | undefined;
  getVehicleHistory: (vehicleId: string) => ParkingRecord[];
  getActiveRecords: () => ParkingRecord[];
  getTotalRevenue: () => number;
  getTodayRevenue: () => number;
}

// Helper: typed Supabase access for tables not in generated Database types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

async function getAuthenticatedUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

export const useParkingStore = create<ParkingStore>((set, get) => ({
  slots: [],
  vehicles: [],
  records: [],
  rates: { ...DEFAULT_RATES },
  loading: false,
  initialized: false,
  initializedForUserId: null,

  // ── Load all data from Supabase ────────────────────────────────────────────
  initialize: async () => {
    const userId = await getAuthenticatedUserId();
    if (get().initialized && get().initializedForUserId === userId) return;

    set({ loading: true });
    try {
      const [slotsRes, vehiclesRes] = await Promise.all([
        db.from('park_slots').select('*').eq('user_id', userId).order('floor').order('number'),
        db.from('park_vehicles').select('*').eq('user_id', userId).order('created_at'),
      ]);

      if (slotsRes.error) { console.error('[park_slots]', slotsRes.error); throw new Error(slotsRes.error.message); }
      if (vehiclesRes.error) { console.error('[park_vehicles]', vehiclesRes.error); throw new Error(vehiclesRes.error.message); }

      const vehicles = (vehiclesRes.data ?? []).map(mapVehicle);
      const vehicleIds = vehicles.map(vehicle => vehicle.id);

      const recordsRes = vehicleIds.length > 0
        ? await db
            .from('park_records')
            .select('*, park_slots(number, type)')
            .in('vehicle_id', vehicleIds)
            .order('entry_time', { ascending: false })
        : { data: [], error: null };

      if (recordsRes.error) { console.error('[park_records]', recordsRes.error); throw new Error(recordsRes.error.message); }

      set({
        slots: (slotsRes.data ?? []).map(mapSlot),
        vehicles,
        records: (recordsRes.data ?? []).map(mapRecord),
        initialized: true,
        initializedForUserId: userId,
      });
    } catch (err) {
      console.error('[parking-store] initialize error:', err);
    } finally {
      set({ loading: false });
    }
  },

  setRate: (type, rate) => set(s => ({ rates: { ...s.rates, [type]: rate } })),

  // ── Slots ──────────────────────────────────────────────────────────────────
  addSlot: async (slot) => {
    const userId = await getAuthenticatedUserId();

    const { data, error } = await db
      .from('park_slots')
      .insert({ user_id: userId, number: slot.number, type: slot.type, floor: slot.floor, status: 'available' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const newSlot = mapSlot(data);
    set(s => ({ slots: [...s.slots, newSlot] }));
    return newSlot;
  },

  removeSlot: async (slotId) => {
    const userId = await getAuthenticatedUserId();
    const hasActive = get().records.some(r => r.slotId === slotId && !r.exitTime);
    if (hasActive) return false;
    const { error } = await db.from('park_slots').delete().eq('id', slotId).eq('user_id', userId);
    if (error) throw new Error(error.message);
    set(s => ({ slots: s.slots.filter(sl => sl.id !== slotId) }));
    return true;
  },

  toggleSlotDisabled: async (slotId) => {
    const userId = await getAuthenticatedUserId();
    const slot = get().slots.find(sl => sl.id === slotId);
    if (!slot || slot.status === 'occupied') return;
    const newStatus: SlotStatus = slot.status === 'disabled' ? 'available' : 'disabled';
    const { error } = await db.from('park_slots').update({ status: newStatus }).eq('id', slotId).eq('user_id', userId);
    if (error) throw new Error(error.message);
    set(s => ({
      slots: s.slots.map(sl => sl.id === slotId ? { ...sl, status: newStatus } : sl),
    }));
  },

  // ── Vehicles ───────────────────────────────────────────────────────────────
  addVehicle: async (v) => {
    const userId = await getAuthenticatedUserId();

    const { data, error } = await db
      .from('park_vehicles')
      .insert({
        user_id: userId,
        vehicle_number: v.vehicleNumber,
        vehicle_type: v.vehicleType,
        owner_name: v.ownerName,
        contact_number: v.contactNumber,
      })
      .select()
      .single();
    if (error) { console.error('[park_vehicles insert]', error); throw new Error(error.message); }
    const vehicle = mapVehicle(data);
    set(s => ({ vehicles: [...s.vehicles, vehicle] }));
    return vehicle;
  },

  // ── Records ────────────────────────────────────────────────────────────────
  vehicleEntry: async (vehicleId, slotId) => {
    const userId = await getAuthenticatedUserId();

    const vehicle = get().vehicles.find(item => item.id === vehicleId);
    if (!vehicle) throw new Error('Vehicle not found for current user');

    const slot = get().slots.find(item => item.id === slotId);
    if (!slot) throw new Error('Slot not found for current user');

    const { data, error } = await db
      .from('park_records')
      .insert({ vehicle_id: vehicleId, slot_id: slotId, entry_time: new Date().toISOString(), payment_status: 'unpaid' })
      .select('*, park_slots(number, type)')
      .single();
    if (error) throw new Error(error.message);

    const { error: slotErr } = await db.from('park_slots').update({ status: 'occupied' }).eq('id', slotId).eq('user_id', userId);
    if (slotErr) throw new Error(slotErr.message);

    const record = mapRecord(data);
    set(s => ({
      records: [record, ...s.records],
      slots: s.slots.map(sl => sl.id === slotId ? { ...sl, status: 'occupied' as SlotStatus } : sl),
    }));
    return record;
  },

  vehicleExit: async (recordId) => {
    const userId = await getAuthenticatedUserId();
    const state = get();
    const record = state.records.find(r => r.id === recordId);
    if (!record) throw new Error('Record not found');

    const slot = state.slots.find(s => s.id === record.slotId);
    const exitTime = new Date();
    const duration = Math.max(1, Math.round((exitTime.getTime() - new Date(record.entryTime).getTime()) / 60000));
    const rate = get().rates[slot?.type ?? 'car'];
    const amount = Math.ceil(duration / 60) * rate;

    const { data, error } = await db
      .from('park_records')
      .update({ exit_time: exitTime.toISOString(), duration, amount, payment_status: 'paid' })
      .eq('id', recordId)
      .select('*, park_slots(number, type)')
      .single();
    if (error) throw new Error(error.message);

    const { error: slotErr } = await db.from('park_slots').update({ status: 'available' }).eq('id', record.slotId).eq('user_id', userId);
    if (slotErr) throw new Error(slotErr.message);

    const updated = mapRecord(data);
    set(s => ({
      records: s.records.map(r => r.id === recordId ? updated : r),
      slots: s.slots.map(sl => sl.id === record.slotId ? { ...sl, status: 'available' as SlotStatus } : sl),
    }));
    return updated;
  },

  // ── Sync helpers ───────────────────────────────────────────────────────────
  calculateBill: (recordId) => {
    const state = get();
    const record = state.records.find(r => r.id === recordId);
    if (!record) return null;
    const slot = state.slots.find(s => s.id === record.slotId);
    const duration = Math.max(1, Math.round((Date.now() - new Date(record.entryTime).getTime()) / 60000));
    const rate = get().rates[slot?.type ?? 'car'];
    const amount = Math.ceil(duration / 60) * rate;
    return { vehicleId: record.vehicleId, slotId: record.slotId, entryTime: record.entryTime, duration, rate, amount, vehicleType: slot?.type ?? 'car' };
  },

  getVehicle: (id) => get().vehicles.find(v => v.id === id),
  getSlot: (id) => get().slots.find(s => s.id === id),
  getVehicleHistory: (vehicleId) =>
    get().records
      .filter(r => r.vehicleId === vehicleId && r.exitTime)
      .sort((a, b) => new Date(b.exitTime!).getTime() - new Date(a.exitTime!).getTime()),
  getActiveRecords: () => get().records.filter(r => !r.exitTime),
  getTotalRevenue: () =>
    get().records.filter(r => r.paymentStatus === 'paid').reduce((sum, r) => sum + (r.amount ?? 0), 0),
  getTodayRevenue: () => {
    const today = new Date().toDateString();
    return get().records
      .filter(r => r.paymentStatus === 'paid' && r.exitTime && new Date(r.exitTime).toDateString() === today)
      .reduce((sum, r) => sum + (r.amount ?? 0), 0);
  },
}));

const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  useParkingStore.setState(state => ({
    slots: session?.user ? state.slots : [],
    vehicles: [],
    records: [],
    loading: false,
    initialized: false,
    initializedForUserId: session?.user?.id ?? null,
  }));
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    subscription.unsubscribe();
  });
}

