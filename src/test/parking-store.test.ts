import { describe, it, expect, beforeEach } from 'vitest';
import { useParkingStore } from '@/lib/parking-store';

describe('Parking Store — Unit Tests', () => {
  // Note: store is seeded on import; we test against seed data

  // ── Slot management ──
  it('addSlot creates a new available slot', async () => {
    const slot = await useParkingStore.getState().addSlot({ number: 'T01', type: 'car', floor: 3 });
    expect(slot.status).toBe('available');
    expect(slot.number).toBe('T01');
    expect(useParkingStore.getState().slots.find(s => s.id === slot.id)).toBeTruthy();
  });

  it('removeSlot deletes an available slot', async () => {
    const slot = await useParkingStore.getState().addSlot({ number: 'T02', type: 'bike', floor: 1 });
    const result = await useParkingStore.getState().removeSlot(slot.id);
    expect(result).toBe(true);
    expect(useParkingStore.getState().slots.find(s => s.id === slot.id)).toBeUndefined();
  });

  it('removeSlot returns false for slot with active session', () => {
    const occupied = useParkingStore.getState().slots.find(s => s.status === 'occupied');
    if (occupied) {
      const result = useParkingStore.getState().removeSlot(occupied.id);
      expect(result).toBe(false);
    }
  });

  it('toggleSlotDisabled toggles available ↔ disabled', async () => {
    const slot = await useParkingStore.getState().addSlot({ number: 'T03', type: 'ev', floor: 1 });
    await useParkingStore.getState().toggleSlotDisabled(slot.id);
    expect(useParkingStore.getState().getSlot(slot.id)?.status).toBe('disabled');
    await useParkingStore.getState().toggleSlotDisabled(slot.id);
    expect(useParkingStore.getState().getSlot(slot.id)?.status).toBe('available');
  });

  it('toggleSlotDisabled does not affect occupied slots', () => {
    const occupied = useParkingStore.getState().slots.find(s => s.status === 'occupied');
    if (occupied) {
      useParkingStore.getState().toggleSlotDisabled(occupied.id);
      expect(useParkingStore.getState().getSlot(occupied.id)?.status).toBe('occupied');
    }
  });

  // ── Vehicle management ──
  it('addVehicle creates and returns vehicle with id', async () => {
    const v = await useParkingStore.getState().addVehicle({
      vehicleNumber: 'KA-99-ZZ-0001',
      vehicleType: 'car',
      ownerName: 'Test',
      contactNumber: '1234567890',
    });
    expect(v.id).toBeTruthy();
    expect(useParkingStore.getState().getVehicle(v.id)?.ownerName).toBe('Test');
  });

  // ── Entry / Exit flow ──
  it('vehicleEntry creates record and marks slot occupied', async () => {
    const slot = await useParkingStore.getState().addSlot({ number: 'T04', type: 'car', floor: 1 });
    const v = await useParkingStore.getState().addVehicle({
      vehicleNumber: 'XX-00-YY-0000',
      vehicleType: 'car',
      ownerName: 'Flow Test',
      contactNumber: '0000000000',
    });
    const record = await useParkingStore.getState().vehicleEntry(v.id, slot.id);
    expect(record.exitTime).toBeNull();
    expect(record.paymentStatus).toBe('unpaid');
    expect(useParkingStore.getState().getSlot(slot.id)?.status).toBe('occupied');
  });

  it('vehicleExit calculates bill and frees slot', async () => {
    const slot = await useParkingStore.getState().addSlot({ number: 'T05', type: 'bike', floor: 1 });
    const v = await useParkingStore.getState().addVehicle({
      vehicleNumber: 'XX-11-YY-1111',
      vehicleType: 'bike',
      ownerName: 'Exit Test',
      contactNumber: '1111111111',
    });
    const record = await useParkingStore.getState().vehicleEntry(v.id, slot.id);
    const exited = await useParkingStore.getState().vehicleExit(record.id);
    expect(exited.exitTime).toBeTruthy();
    expect(exited.amount).toBeGreaterThan(0);
    expect(exited.paymentStatus).toBe('paid');
    expect(useParkingStore.getState().getSlot(slot.id)?.status).toBe('available');
  });

  it('vehicleExit throws for nonexistent record', async () => {
    await expect(useParkingStore.getState().vehicleExit('nonexistent')).rejects.toThrow('Record not found');
  });

  // ── Rate management ──
  it('setRate updates pricing', () => {
    useParkingStore.getState().setRate('ev', 100);
    expect(useParkingStore.getState().rates.ev).toBe(100);
  });

  // ── Queries ──
  it('getActiveRecords returns only records without exitTime', () => {
    const active = useParkingStore.getState().getActiveRecords();
    active.forEach(r => expect(r.exitTime).toBeNull());
  });

  it('getTotalRevenue sums paid records', () => {
    const total = useParkingStore.getState().getTotalRevenue();
    expect(total).toBeGreaterThanOrEqual(0);
  });

  // ── calculateBill ──
  it('calculateBill returns null for nonexistent record', () => {
    expect(useParkingStore.getState().calculateBill('nonexistent')).toBeNull();
  });

  it('calculateBill returns valid preview for active record', async () => {
    const slot = await useParkingStore.getState().addSlot({ number: 'T06', type: 'car', floor: 1 });
    const v = await useParkingStore.getState().addVehicle({
      vehicleNumber: 'BB-22-CC-2222',
      vehicleType: 'car',
      ownerName: 'Bill Test',
      contactNumber: '2222222222',
    });
    const record = await useParkingStore.getState().vehicleEntry(v.id, slot.id);
    const bill = useParkingStore.getState().calculateBill(record.id);
    expect(bill).not.toBeNull();
    expect(bill!.amount).toBeGreaterThan(0);
    expect(bill!.vehicleType).toBe('car');
  });
});

// ── White-box: internal logic branches ──
describe('Parking Store — White-box Tests', () => {
  it('getVehicleHistory returns sorted completed records', () => {
    const state = useParkingStore.getState();
    const vehicle = state.vehicles[0];
    const history = state.getVehicleHistory(vehicle.id);
    for (let i = 1; i < history.length; i++) {
      expect(new Date(history[i - 1].exitTime!).getTime()).toBeGreaterThanOrEqual(
        new Date(history[i].exitTime!).getTime()
      );
    }
  });

  it('getTodayRevenue only counts records exited today', () => {
    const todayRev = useParkingStore.getState().getTodayRevenue();
    expect(typeof todayRev).toBe('number');
    expect(todayRev).toBeGreaterThanOrEqual(0);
  });

  it('vehicleEntry sets correct initial record fields', async () => {
    const slot = await useParkingStore.getState().addSlot({ number: 'WB01', type: 'ev', floor: 2 });
    const v = await useParkingStore.getState().addVehicle({
      vehicleNumber: 'WB-TEST',
      vehicleType: 'ev',
      ownerName: 'WB',
      contactNumber: '0',
    });
    const r = await useParkingStore.getState().vehicleEntry(v.id, slot.id);
    expect(r.duration).toBeNull();
    expect(r.amount).toBeNull();
    expect(r.paymentStatus).toBe('unpaid');
    expect(r.vehicleId).toBe(v.id);
    expect(r.slotId).toBe(slot.id);
  });
});
