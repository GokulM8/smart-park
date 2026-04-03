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

async function hydrateUserProfile(sessionUser: SessionUserLike, nameOverride?: string, emailOverride?: string) {
  const profile = await getProfileOrFallback(sessionUser, nameOverride, emailOverride);
  useAuthStore.setState({ user: profile, error: null, isLoading: false });
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
      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error('Session initialization timed out')), 12000);
        }),
      ]);

      const { data: { session }, error: err } = sessionResult;

      if (err) throw err;

      if (session?.user) {
        set({ user: buildFallbackUser(session.user), isLoading: false });
        void hydrateUserProfile(session.user);
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

      set({ user: buildFallbackUser(session.user), isLoading: false });
      void hydrateUserProfile(session.user);
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

      set({ user: buildFallbackUser(session.user, name, email), isLoading: false });
      void hydrateUserProfile(session.user, name, email);
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
const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
  if (!session?.user) {
    useAuthStore.setState({ user: null, error: null, isLoading: false });
    return;
  }

  const currentUser = useAuthStore.getState().user;

  // Avoid repeated profile fetches on frequent refresh events for same user.
  if (event === 'TOKEN_REFRESHED' && currentUser?.id === session.user.id) {
    useAuthStore.setState({ isLoading: false, error: null });
    return;
  }

  // If same user is already loaded, skip redundant fetches for initial/session sync events.
  if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && currentUser?.id === session.user.id) {
    useAuthStore.setState({ isLoading: false, error: null });
    return;
  }

  try {
    useAuthStore.setState({ user: buildFallbackUser(session.user), error: null, isLoading: false });
    void hydrateUserProfile(session.user);
  } catch {
    useAuthStore.setState({ user: buildFallbackUser(session.user), error: null, isLoading: false });
  }
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    subscription.unsubscribe();
  });
}
