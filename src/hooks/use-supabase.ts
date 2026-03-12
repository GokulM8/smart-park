import { useCallback, useState } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import type { Vehicle, ParkingSlot, EntryExitLog, Invoice, Reservation } from '@/types/supabase';

// The generated DB types and runtime schema can drift; use permissive client for mutations.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/**
 * Hook for managing vehicles
 */
export function useVehicles(userId: string) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await db
        .from('vehicles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setVehicles(data || []);
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
    setError(null);
    try {
      const { data, error: err } = await db
        .from('vehicles')
        .insert([vehicle])
        .select()
        .single();

      if (err) throw err;
      setVehicles(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const updateVehicle = useCallback(async (id: string, updates: Partial<Vehicle>) => {
    setError(null);
    try {
      const { data, error: err } = await db
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setVehicles(prev => prev.map(v => v.id === id ? data : v));
      return data;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const deleteVehicle = useCallback(async (id: string) => {
    setError(null);
    try {
      const { error: err } = await db
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  return { vehicles, loading, error, fetchVehicles, addVehicle, updateVehicle, deleteVehicle };
}

/**
 * Hook for managing parking slots
 */
export function useParkingSlots() {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async (filters?: { status?: string; level?: number; zone?: string }) => {
    setLoading(true);
    setError(null);
    try {
      let query = db.from('parking_slots').select('*');

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.level) query = query.eq('level', filters.level);
      if (filters?.zone) query = query.eq('zone', filters.zone);

      const { data, error: err } = await query.order('slot_number', { ascending: true });

      if (err) throw err;
      setSlots(data || []);
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSlot = useCallback(async (id: string, updates: Partial<ParkingSlot>) => {
    setError(null);
    try {
      const { data, error: err } = await db
        .from('parking_slots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setSlots(prev => prev.map(s => s.id === id ? data : s));
      return data;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  return { slots, loading, error, fetchSlots, updateSlot };
}

/**
 * Hook for managing entry/exit logs
 */
export function useEntryExitLogs(userId?: string) {
  const [logs, setLogs] = useState<EntryExitLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = db.from('entry_exit_logs').select('*');

      if (userId) query = query.eq('user_id', userId);

      const { data, error: err } = await query.order('entry_time', { ascending: false });

      if (err) throw err;
      setLogs(data || []);
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createLog = useCallback(async (log: Omit<EntryExitLog, 'id' | 'created_at'>) => {
    setError(null);
    try {
      const { data, error: err } = await db
        .from('entry_exit_logs')
        .insert([log])
        .select()
        .single();

      if (err) throw err;
      setLogs(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const completeLog = useCallback(async (id: string, exitData: Partial<EntryExitLog>) => {
    setError(null);
    try {
      const { data, error: err } = await db
        .from('entry_exit_logs')
        .update(exitData)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setLogs(prev => prev.map(l => l.id === id ? data : l));
      return data;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  return { logs, loading, error, fetchLogs, createLog, completeLog };
}

/**
 * Hook for managing invoices
 */
export function useInvoices(userId?: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = db.from('invoices').select('*');

      if (userId) query = query.eq('user_id', userId);

      const { data, error: err } = await query.order('issued_at', { ascending: false });

      if (err) throw err;
      setInvoices(data || []);
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createInvoice = useCallback(async (invoice: Omit<Invoice, 'id' | 'created_at'>) => {
    setError(null);
    try {
      const { data, error: err } = await db
        .from('invoices')
        .insert([invoice])
        .select()
        .single();

      if (err) throw err;
      setInvoices(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  return { invoices, loading, error, fetchInvoices, createInvoice };
}

/**
 * Hook for managing reservations
 */
export function useReservations(userId?: string) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = db.from('reservations').select('*');

      if (userId) query = query.eq('user_id', userId);

      const { data, error: err } = await query.order('reserved_from', { ascending: true });

      if (err) throw err;
      setReservations(data || []);
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createReservation = useCallback(async (reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
    setError(null);
    try {
      const { data, error: err } = await db
        .from('reservations')
        .insert([{ ...reservation, status: 'active' }])
        .select()
        .single();

      if (err) throw err;
      setReservations(prev => [...prev, data]);
      return data;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  const cancelReservation = useCallback(async (id: string) => {
    setError(null);
    try {
      const { data, error: err } = await db
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setReservations(prev => prev.map(r => r.id === id ? data : r));
      return data;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      throw new Error(message);
    }
  }, []);

  return { reservations, loading, error, fetchReservations, createReservation, cancelReservation };
}
