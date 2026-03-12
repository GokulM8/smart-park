import { create } from 'zustand';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import type { User, Database } from '@/types/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; email?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

type SessionUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function buildFallbackUser(sessionUser: SessionUserLike, nameOverride?: string, emailOverride?: string): User {
  return {
    id: sessionUser.id,
    email: emailOverride ?? sessionUser.email ?? '',
    name:
      nameOverride ??
      (typeof sessionUser.user_metadata?.name === 'string'
        ? sessionUser.user_metadata.name
        : sessionUser.email?.split('@')[0]) ??
      'User',
    role: 'user',
    phone: null,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function getProfileOrFallback(sessionUser: SessionUserLike, nameOverride?: string, emailOverride?: string): Promise<User> {
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('id', sessionUser.id)
    .maybeSingle();

  if (error || !data) {
    return buildFallbackUser(sessionUser, nameOverride, emailOverride);
  }

  return data as User;
}

/**
 * Supabase Auth Store
 * Manages user authentication with Supabase
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  /**
   * Initialize auth state from session
   */
  initialize: async () => {
    set({ isLoading: true });
    try {
      const { data: { session }, error: err } = await supabase.auth.getSession();

      if (err) throw err;

      if (session?.user) {
        const user = await getProfileOrFallback(session.user);
        set({ user, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (err) {
      const message = handleSupabaseError(err);
      set({ user: null, error: message, isLoading: false });
    }
  },

  /**
   * Login with email and password
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session }, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr) throw signInErr;
      if (!session?.user) throw new Error('No session returned');

      const user = await getProfileOrFallback(session.user);
      set({ user, isLoading: false });
    } catch (err) {
      const message = handleSupabaseError(err);
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  /**
   * Sign up with name, email and password
   */
  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user: authUser, session }, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (signUpErr) throw signUpErr;
      if (!authUser) throw new Error('Signup failed');

      // If email confirmation is enabled, Supabase may not return an active session.
      // In that case keep user as null and let the login flow continue after confirmation.
      if (!session?.user) {
        set({ user: null, isLoading: false });
        return;
      }

      const user = await getProfileOrFallback(session.user, name, email);
      set({ user, isLoading: false });
    } catch (err) {
      const message = handleSupabaseError(err);
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (err) {
      const message = handleSupabaseError(err);
      set({ error: message });
      throw new Error(message);
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates: { name?: string; email?: string }) => {
    set({ error: null });
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      // If email is being updated, update auth email too
      if (updates.email && updates.email !== authUser.email) {
        const { error: emailErr } = await supabase.auth.updateUser({
          email: updates.email,
        });
        if (emailErr) throw emailErr;
      }

      // Update profile in public.users table
      const { data, error: updateErr } = await db
        .from('users')
        .update(updates as Database['public']['Tables']['users']['Update'])
        .eq('id', authUser.id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      set({ user: data });
    } catch (err) {
      const message = handleSupabaseError(err);
      set({ error: message });
      throw new Error(message);
    }
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    set({ error: null });
    try {
      // Note: Supabase doesn't have a direct "verify current password" method
      // We need to verify by attempting to sign in with current credentials
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser?.email) throw new Error('Not authenticated');

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: authUser.email,
        password: currentPassword,
      });

      if (signInErr) throw new Error('Current password is incorrect');

      // Update to new password
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) throw updateErr;
    } catch (err) {
      const message = handleSupabaseError(err);
      set({ error: message });
      throw new Error(message);
    }
  },
}));

// Subscribe to auth state changes
const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
  if (session?.user) {
    const user = await getProfileOrFallback(session.user);
    useAuthStore.setState({ user, error: null });
  } else {
    useAuthStore.setState({ user: null });
  }
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    subscription.unsubscribe();
  });
}
