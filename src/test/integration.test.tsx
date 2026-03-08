import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/lib/auth-store';
import { useParkingStore } from '@/lib/parking-store';

const USERS_KEY = 'parksmart_users';

// ── Integration: Auth + Parking flow ──
describe('Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(USERS_KEY, JSON.stringify([
      { id: 'u1', name: 'Angie D', email: 'admin@park.io', password: 'admin123' },
    ]));
    useAuthStore.setState({ user: null, isLoading: true });
  });

  it('full user flow: signup → update profile → change password → re-login', async () => {
    const auth = useAuthStore.getState();

    // Signup
    await auth.signup('New User', 'new@park.io', 'pass123');
    expect(useAuthStore.getState().user?.name).toBe('New User');

    // Update profile
    await useAuthStore.getState().updateProfile({ name: 'Updated User' });
    expect(useAuthStore.getState().user?.name).toBe('Updated User');

    // Change password
    await useAuthStore.getState().changePassword('pass123', 'newpass456');

    // Logout and re-login with new password
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();

    await useAuthStore.getState().login('new@park.io', 'newpass456');
    expect(useAuthStore.getState().user?.name).toBe('Updated User');
  });

  it('full parking flow: add vehicle → entry → bill → exit → history', () => {
    const store = useParkingStore.getState();

    // Add vehicle
    const vehicle = store.addVehicle({
      vehicleNumber: 'INT-01-TEST',
      vehicleType: 'car',
      ownerName: 'Integration Tester',
      contactNumber: '9999999999',
    });

    // Find available slot
    const availableSlot = useParkingStore.getState().slots.find(s => s.status === 'available' && s.type === 'car');
    expect(availableSlot).toBeTruthy();

    // Entry
    const record = useParkingStore.getState().vehicleEntry(vehicle.id, availableSlot!.id);
    expect(useParkingStore.getState().getSlot(availableSlot!.id)?.status).toBe('occupied');
    expect(useParkingStore.getState().getActiveRecords().find(r => r.id === record.id)).toBeTruthy();

    // Calculate bill while parked
    const bill = useParkingStore.getState().calculateBill(record.id);
    expect(bill).not.toBeNull();
    expect(bill!.rate).toBe(useParkingStore.getState().rates.car);

    // Exit
    const exited = useParkingStore.getState().vehicleExit(record.id);
    expect(useParkingStore.getState().getSlot(availableSlot!.id)?.status).toBe('available');
    expect(exited.paymentStatus).toBe('paid');

    // History
    const history = useParkingStore.getState().getVehicleHistory(vehicle.id);
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0].id).toBe(record.id);
  });

  it('disabled slots are excluded from available count', () => {
    const slot = useParkingStore.getState().addSlot({ number: 'DIS01', type: 'car', floor: 1 });
    const beforeAvail = useParkingStore.getState().slots.filter(s => s.status === 'available').length;
    useParkingStore.getState().toggleSlotDisabled(slot.id);
    const afterAvail = useParkingStore.getState().slots.filter(s => s.status === 'available').length;
    expect(afterAvail).toBe(beforeAvail - 1);
  });

  it('rate change affects subsequent exit calculations', () => {
    const slot = useParkingStore.getState().addSlot({ number: 'RATE01', type: 'ev', floor: 1 });
    const v = useParkingStore.getState().addVehicle({
      vehicleNumber: 'RATE-TEST',
      vehicleType: 'ev',
      ownerName: 'Rate Tester',
      contactNumber: '0',
    });
    useParkingStore.getState().setRate('ev', 200);
    const record = useParkingStore.getState().vehicleEntry(v.id, slot.id);
    const exited = useParkingStore.getState().vehicleExit(record.id);
    // Minimum 1 hour at 200/hr
    expect(exited.amount).toBeGreaterThanOrEqual(200);
  });
});

// ── Black-box Tests: behavior-driven, no internal knowledge ──
describe('Black-box Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(USERS_KEY, JSON.stringify([
      { id: 'u1', name: 'Admin', email: 'admin@park.io', password: 'admin123' },
    ]));
    useAuthStore.setState({ user: null, isLoading: true });
  });

  it('user cannot login with empty credentials', async () => {
    await expect(useAuthStore.getState().login('', '')).rejects.toThrow();
  });

  it('two different users can exist independently', async () => {
    await useAuthStore.getState().signup('User A', 'a@test.io', 'passA');
    useAuthStore.getState().logout();
    await useAuthStore.getState().signup('User B', 'b@test.io', 'passB');
    useAuthStore.getState().logout();

    await useAuthStore.getState().login('a@test.io', 'passA');
    expect(useAuthStore.getState().user?.name).toBe('User A');
    useAuthStore.getState().logout();

    await useAuthStore.getState().login('b@test.io', 'passB');
    expect(useAuthStore.getState().user?.name).toBe('User B');
  });

  it('parking revenue never goes negative', () => {
    expect(useParkingStore.getState().getTotalRevenue()).toBeGreaterThanOrEqual(0);
    expect(useParkingStore.getState().getTodayRevenue()).toBeGreaterThanOrEqual(0);
  });

  it('a slot that was just freed can be reused', () => {
    const slot = useParkingStore.getState().addSlot({ number: 'REUSE01', type: 'car', floor: 1 });
    const v1 = useParkingStore.getState().addVehicle({ vehicleNumber: 'R1', vehicleType: 'car', ownerName: 'A', contactNumber: '0' });
    const v2 = useParkingStore.getState().addVehicle({ vehicleNumber: 'R2', vehicleType: 'car', ownerName: 'B', contactNumber: '0' });

    // First vehicle parks and leaves
    const r1 = useParkingStore.getState().vehicleEntry(v1.id, slot.id);
    useParkingStore.getState().vehicleExit(r1.id);

    // Second vehicle can now use same slot
    const r2 = useParkingStore.getState().vehicleEntry(v2.id, slot.id);
    expect(r2.slotId).toBe(slot.id);
    expect(useParkingStore.getState().getSlot(slot.id)?.status).toBe('occupied');
  });

  it('session persists across initialize calls', async () => {
    await useAuthStore.getState().login('admin@park.io', 'admin123');
    // Simulate app reload
    useAuthStore.setState({ user: null, isLoading: true });
    useAuthStore.getState().initialize();
    expect(useAuthStore.getState().user?.email).toBe('admin@park.io');
  });
});
