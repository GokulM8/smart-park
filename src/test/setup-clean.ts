import "@testing-library/jest-dom";
import { vi, beforeEach } from 'vitest';
import { useParkingStore } from '@/lib/parking-store';
import { useAuthStore } from '@/lib/auth-store';

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

type Row = Record<string, any>;
type Tables = Record<string, Row[]>;

function seedTables(target: Tables) {
  target.park_slots = [
    { id: 'seed-s1', user_id: 'test-user', number: 'A1', type: 'car', status: 'available', floor: 1 },
  ];
  target.park_vehicles = [
    { id: 'seed-v1', user_id: 'test-user', vehicle_number: 'S-100', vehicle_type: 'car', owner_name: 'Seed', contact_number: '0' },
  ];
  target.park_records = [
    { id: 'seed-r1', user_id: 'test-user', vehicle_id: 'seed-v1', slot_id: 'seed-s1', entry_time: new Date(Date.now() - 3600 * 1000).toISOString(), exit_time: new Date(Date.now() - 1800 * 1000).toISOString(), duration: 30, amount: 20, payment_status: 'paid' },
    { id: 'seed-r2', user_id: 'test-user', vehicle_id: 'seed-v1', slot_id: 'seed-s1', entry_time: new Date(Date.now() - 7200 * 1000).toISOString(), exit_time: new Date(Date.now() - 3600 * 1000).toISOString(), duration: 60, amount: 40, payment_status: 'paid' },
  ];
}

function getTables(): Tables {
  const g: any = globalThis as any;
  if (!g.__supabase_tables) {
    g.__supabase_tables = { park_slots: [], park_vehicles: [], park_records: [] };
    seedTables(g.__supabase_tables);
  }
  return g.__supabase_tables as Tables;
}

// Seed immediately so imported stores see data on first access.
seedTables(getTables());

// Mock Supabase client to avoid real network/auth calls during tests.
// Provides minimal in-memory DB behavior for the app/tests.
vi.mock('@supabase/supabase-js', () => {
  function createClient() {
    function genId(prefix = '') {
      return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function createBuilder(tableName?: string) {
      const ctx: any = { table: tableName };

      const builder: any = {
        _where: {},
        _order: null,
        _selectCols: null,
        select(cols?: string) { this._selectCols = cols; return this; },
        order(_col?: string, _opts?: any) { this._order = _col; return this; },
        in(_k?: string, _v?: any) { this._where[_k] = _v; return this; },
        eq(k?: string, v?: any) { this._where[k] = v; return this; },

        insert: (obj?: Record<string, any>) => {
          const row = { id: genId('r_'), ...obj };
          const tables = getTables();
          tables[ctx.table] = tables[ctx.table] || [];
          tables[ctx.table].push(row);
          return {
            select: () => ({
              single: async () => ({ data: row, error: null }),
            }),
          };
        },

        update: (obj?: Record<string, any>) => ({
          eq: (k?: string, v?: any) => ({
            select: () => ({
              single: async () => {
                const tables = getTables();
                const rows = (tables[ctx.table] || []).filter(r => r[k] === v);
                rows.forEach(r => Object.assign(r, obj));
                const data = rows[0] ?? null;
                return { data, error: null };
              },
            }),
            eq: (_k?: string, _v?: any) => ({
              select: () => ({ single: async () => ({ data: null, error: null }) }),
            }),
          }),
        }),

        delete: () => {
          const delObj: any = {};
          delObj.eq = (k?: string, v?: any) => {
            const tables = getTables();
            tables[ctx.table] = (tables[ctx.table] || []).filter(r => r[k] !== v);
            return delObj;
          };
          const promise = Promise.resolve({ error: null });
          // make thenable
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          delObj.then = promise.then.bind(promise);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          delObj.catch = promise.catch.bind(promise);
          return delObj;
        },

        then(resolve: any) {
          const tables = getTables();
          const rows = (tables[ctx.table] || []).filter((r: any) => {
            for (const k of Object.keys(this._where || {})) {
              const v = this._where[k];
              if (Array.isArray(v)) {
                if (!v.includes(r[k])) return false;
              } else if (r[k] !== v) return false;
            }
            return true;
          });
          return Promise.resolve(resolve({ data: rows, error: null }));
        },
      };

      return builder;
    }

    return {
      auth: {
        getSession: async () => ({ data: { session: { user: { id: 'test-user', email: 'test@local' } } } }),
        getUser: async () => ({ data: { user: { id: 'test-user', email: 'test@local' } } }),
        signInWithPassword: async (_opts: any) => ({ data: null, error: null }),
        signUp: async (_opts: any) => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: (table: string) => createBuilder(table),
      rpc: async () => ({ data: null, error: null }),
    };
  }

  return { createClient };
});

// Reset mock tables and stores before each test to keep tests deterministic.
beforeEach(() => {
  seedTables(getTables());

  // reset zustand stores used by tests
  useParkingStore.setState({
    slots: [], vehicles: [], records: [], rates: { car: 40, bike: 20, ev: 50 }, loading: false, initialized: false, initializedForUserId: null,
  });

  useAuthStore.setState({ user: { id: 'test-user', name: 'Test', email: 'test@local' }, isLoading: false });
  // Load seeded data into the parking store for tests
  return useParkingStore.getState().initialize();
});
