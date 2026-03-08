import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/lib/auth-store';

const USERS_KEY = 'parksmart_users';
const SESSION_KEY = 'parksmart_session';

describe('Auth Store — Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    // Seed default user
    localStorage.setItem(USERS_KEY, JSON.stringify([
      { id: 'u1', name: 'Angie D', email: 'admin@park.io', password: 'admin123' },
    ]));
    useAuthStore.setState({ user: null, isLoading: true });
  });

  // ── Unit: initialize ──
  it('initialize sets user from session storage', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: 'u1', name: 'Angie D', email: 'admin@park.io' }));
    useAuthStore.getState().initialize();
    expect(useAuthStore.getState().user).toEqual({ id: 'u1', name: 'Angie D', email: 'admin@park.io' });
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('initialize sets null user when no session', () => {
    useAuthStore.getState().initialize();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  // ── Unit: login ──
  it('login succeeds with valid credentials', async () => {
    await useAuthStore.getState().login('admin@park.io', 'admin123');
    expect(useAuthStore.getState().user?.email).toBe('admin@park.io');
    expect(localStorage.getItem(SESSION_KEY)).toBeTruthy();
  });

  it('login is case-insensitive for email', async () => {
    await useAuthStore.getState().login('ADMIN@PARK.IO', 'admin123');
    expect(useAuthStore.getState().user?.email).toBe('admin@park.io');
  });

  it('login fails with wrong password', async () => {
    await expect(useAuthStore.getState().login('admin@park.io', 'wrong')).rejects.toThrow('Invalid email or password');
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('login fails with non-existent email', async () => {
    await expect(useAuthStore.getState().login('nobody@park.io', 'admin123')).rejects.toThrow('Invalid email or password');
  });

  // ── Unit: signup ──
  it('signup creates a new user and logs in', async () => {
    await useAuthStore.getState().signup('Test User', 'test@park.io', 'test123');
    const user = useAuthStore.getState().user;
    expect(user?.name).toBe('Test User');
    expect(user?.email).toBe('test@park.io');
  });

  it('signup rejects duplicate email (case-insensitive)', async () => {
    await expect(useAuthStore.getState().signup('Dup', 'ADMIN@PARK.IO', 'x')).rejects.toThrow('already exists');
  });

  // ── Unit: logout ──
  it('logout clears user and session', async () => {
    await useAuthStore.getState().login('admin@park.io', 'admin123');
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  // ── Unit: updateProfile ──
  it('updateProfile updates name', async () => {
    await useAuthStore.getState().login('admin@park.io', 'admin123');
    await useAuthStore.getState().updateProfile({ name: 'New Name' });
    expect(useAuthStore.getState().user?.name).toBe('New Name');
  });

  it('updateProfile rejects duplicate email', async () => {
    await useAuthStore.getState().signup('Other', 'other@park.io', 'pass123');
    await expect(useAuthStore.getState().updateProfile({ email: 'admin@park.io' })).rejects.toThrow('already exists');
  });

  it('updateProfile fails when not authenticated', async () => {
    await expect(useAuthStore.getState().updateProfile({ name: 'x' })).rejects.toThrow('Not authenticated');
  });

  // ── Unit: changePassword ──
  it('changePassword succeeds with correct current password', async () => {
    await useAuthStore.getState().login('admin@park.io', 'admin123');
    await useAuthStore.getState().changePassword('admin123', 'newpass');
    // Verify new password works
    useAuthStore.getState().logout();
    await useAuthStore.getState().login('admin@park.io', 'newpass');
    expect(useAuthStore.getState().user?.email).toBe('admin@park.io');
  });

  it('changePassword fails with wrong current password', async () => {
    await useAuthStore.getState().login('admin@park.io', 'admin123');
    await expect(useAuthStore.getState().changePassword('wrong', 'newpass')).rejects.toThrow('incorrect');
  });
});

// ── White-box: edge cases & branch coverage ──
describe('Auth Store — White-box Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(USERS_KEY, JSON.stringify([
      { id: 'u1', name: 'Angie D', email: 'admin@park.io', password: 'admin123' },
    ]));
    useAuthStore.setState({ user: null, isLoading: true });
  });

  it('initialize handles corrupt session JSON gracefully', () => {
    localStorage.setItem(SESSION_KEY, '{bad json');
    useAuthStore.getState().initialize();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('login does not store password in session', async () => {
    await useAuthStore.getState().login('admin@park.io', 'admin123');
    const session = JSON.parse(localStorage.getItem(SESSION_KEY)!);
    expect(session.password).toBeUndefined();
  });

  it('signup does not store password in session', async () => {
    await useAuthStore.getState().signup('X', 'x@x.io', 'secret');
    const session = JSON.parse(localStorage.getItem(SESSION_KEY)!);
    expect(session.password).toBeUndefined();
  });

  it('updateProfile persists to both store and localStorage', async () => {
    await useAuthStore.getState().login('admin@park.io', 'admin123');
    await useAuthStore.getState().updateProfile({ name: 'Updated', email: 'new@park.io' });
    const session = JSON.parse(localStorage.getItem(SESSION_KEY)!);
    expect(session.name).toBe('Updated');
    expect(session.email).toBe('new@park.io');
    // Also persisted in users list
    const users = JSON.parse(localStorage.getItem(USERS_KEY)!);
    expect(users.find((u: any) => u.id === 'u1').name).toBe('Updated');
  });
});
