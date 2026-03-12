import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

/**
 * Utility function to handle Supabase errors consistently
 */
export function handleSupabaseError(error: unknown): string {
  if (!error) return 'An unexpected error occurred';
  
  if (error instanceof Error) {
    // Supabase client errors
    if ('status' in error && 'message' in error) {
      return error.message;
    }
    return error.message;
  }
  
  return String(error);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  return data.session.user;
}
