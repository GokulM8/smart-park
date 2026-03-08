import { create } from 'zustand';

export type VehicleType = 'car' | 'bike' | 'ev';
export type SlotStatus = 'available' | 'occupied';
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
  entryTime: string;
  exitTime: string | null;
  duration: number | null; // minutes
  amount: number | null;
  paymentStatus: PaymentStatus;
}

const RATES: Record<VehicleType, number> = { car: 40, bike: 20, ev: 50 }; // per hour

const generateSlots = (): ParkingSlot[] => {
  const slots: ParkingSlot[] = [];
  const types: VehicleType[] = ['car', 'bike', 'ev'];
  let id = 1;
  for (let floor = 1; floor <= 2; floor++) {
    for (const type of types) {
      const count = type === 'car' ? 8 : type === 'bike' ? 6 : 4;
      for (let i = 1; i <= count; i++) {
        const prefix = type === 'car' ? 'C' : type === 'bike' ? 'B' : 'E';
        slots.push({
          id: String(id++),
          number: `${floor}${prefix}${String(i).padStart(2, '0')}`,
          type,
          status: 'available',
          floor,
        });
      }
    }
  }
  return slots;
};

// Seed some demo data
const seedSlots = generateSlots();
// Occupy some slots
const occupiedIds = ['1', '3', '5', '9', '12', '15', '19', '22', '25', '30'];
occupiedIds.forEach(id => {
  const s = seedSlots.find(s => s.id === id);
  if (s) s.status = 'occupied';
});

const seedVehicles: Vehicle[] = [
  { id: 'v1', vehicleNumber: 'KA-01-AB-1234', vehicleType: 'car', ownerName: 'Rahul Sharma', contactNumber: '9876543210' },
  { id: 'v2', vehicleNumber: 'KA-02-CD-5678', vehicleType: 'bike', ownerName: 'Priya Patel', contactNumber: '9876543211' },
  { id: 'v3', vehicleNumber: 'KA-03-EV-9012', vehicleType: 'ev', ownerName: 'Amit Kumar', contactNumber: '9876543212' },
  { id: 'v4', vehicleNumber: 'MH-04-FG-3456', vehicleType: 'car', ownerName: 'Sneha Reddy', contactNumber: '9876543213' },
  { id: 'v5', vehicleNumber: 'TN-05-HI-7890', vehicleType: 'bike', ownerName: 'Karthik Nair', contactNumber: '9876543214' },
  { id: 'v6', vehicleNumber: 'DL-06-JK-2345', vehicleType: 'car', ownerName: 'Meera Singh', contactNumber: '9876543215' },
  { id: 'v7', vehicleNumber: 'GJ-07-LM-6789', vehicleType: 'ev', ownerName: 'Vikram Joshi', contactNumber: '9876543216' },
  { id: 'v8', vehicleNumber: 'RJ-08-NO-0123', vehicleType: 'car', ownerName: 'Ananya Das', contactNumber: '9876543217' },
  { id: 'v9', vehicleNumber: 'UP-09-PQ-4567', vehicleType: 'bike', ownerName: 'Rohan Gupta', contactNumber: '9876543218' },
  { id: 'v10', vehicleNumber: 'KL-10-RS-8901', vehicleType: 'car', ownerName: 'Divya Menon', contactNumber: '9876543219' },
];

const now = new Date();
const seedRecords: ParkingRecord[] = occupiedIds.map((slotId, i) => ({
  id: `r${i + 1}`,
  vehicleId: seedVehicles[i]?.id || 'v1',
  slotId,
  entryTime: new Date(now.getTime() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
  exitTime: null,
  duration: null,
  amount: null,
  paymentStatus: 'unpaid' as PaymentStatus,
}));

// Add some completed records for revenue
const pastRecords: ParkingRecord[] = Array.from({ length: 20 }, (_, i) => {
  const entry = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000 - Math.random() * 8 * 60 * 60 * 1000);
  const dur = Math.floor(30 + Math.random() * 300);
  const vType = ['car', 'bike', 'ev'][i % 3] as VehicleType;
  return {
    id: `rp${i + 1}`,
    vehicleId: seedVehicles[i % seedVehicles.length].id,
    slotId: String((i % seedSlots.length) + 1),
    entryTime: entry.toISOString(),
    exitTime: new Date(entry.getTime() + dur * 60 * 1000).toISOString(),
    duration: dur,
    amount: Math.ceil(dur / 60) * RATES[vType],
    paymentStatus: 'paid' as PaymentStatus,
  };
});

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
  addVehicle: (v: Omit<Vehicle, 'id'>) => Vehicle;
  vehicleEntry: (vehicleId: string, slotId: string) => ParkingRecord;
  vehicleExit: (recordId: string) => ParkingRecord;
  calculateBill: (recordId: string) => BillPreview | null;
  getVehicle: (id: string) => Vehicle | undefined;
  getSlot: (id: string) => ParkingSlot | undefined;
  getActiveRecords: () => ParkingRecord[];
  getTotalRevenue: () => number;
  getTodayRevenue: () => number;
}

let nextId = 100;

export const useParkingStore = create<ParkingStore>((set, get) => ({
  slots: seedSlots,
  vehicles: seedVehicles,
  records: [...seedRecords, ...pastRecords],

  addVehicle: (v) => {
    const vehicle: Vehicle = { ...v, id: `v${nextId++}` };
    set(s => ({ vehicles: [...s.vehicles, vehicle] }));
    return vehicle;
  },

  vehicleEntry: (vehicleId, slotId) => {
    const record: ParkingRecord = {
      id: `r${nextId++}`,
      vehicleId,
      slotId,
      entryTime: new Date().toISOString(),
      exitTime: null,
      duration: null,
      amount: null,
      paymentStatus: 'unpaid',
    };
    set(s => ({
      records: [...s.records, record],
      slots: s.slots.map(sl => sl.id === slotId ? { ...sl, status: 'occupied' as SlotStatus } : sl),
    }));
    return record;
  },

  vehicleExit: (recordId) => {
    const state = get();
    const record = state.records.find(r => r.id === recordId);
    if (!record) throw new Error('Record not found');
    const slot = state.slots.find(s => s.id === record.slotId);
    const exitTime = new Date();
    const duration = Math.max(1, Math.round((exitTime.getTime() - new Date(record.entryTime).getTime()) / 60000));
    const rate = RATES[slot?.type || 'car'];
    const amount = Math.ceil(duration / 60) * rate;

    const updated: ParkingRecord = {
      ...record,
      exitTime: exitTime.toISOString(),
      duration,
      amount,
      paymentStatus: 'paid',
    };

    set(s => ({
      records: s.records.map(r => r.id === recordId ? updated : r),
      slots: s.slots.map(sl => sl.id === record.slotId ? { ...sl, status: 'available' as SlotStatus } : sl),
    }));

    return updated;
  },

  calculateBill: (recordId) => {
    const state = get();
    const record = state.records.find(r => r.id === recordId);
    if (!record) return null;
    const slot = state.slots.find(s => s.id === record.slotId);
    const duration = Math.max(1, Math.round((Date.now() - new Date(record.entryTime).getTime()) / 60000));
    const rate = RATES[slot?.type || 'car'];
    const amount = Math.ceil(duration / 60) * rate;
    return { vehicleId: record.vehicleId, slotId: record.slotId, entryTime: record.entryTime, duration, rate, amount, vehicleType: slot?.type || 'car' };
  },

  getVehicle: (id) => get().vehicles.find(v => v.id === id),
  getSlot: (id) => get().slots.find(s => s.id === id),
  getActiveRecords: () => get().records.filter(r => !r.exitTime),
  getTotalRevenue: () => get().records.filter(r => r.paymentStatus === 'paid').reduce((sum, r) => sum + (r.amount || 0), 0),
  getTodayRevenue: () => {
    const today = new Date().toDateString();
    return get().records
      .filter(r => r.paymentStatus === 'paid' && r.exitTime && new Date(r.exitTime).toDateString() === today)
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  },
}));
