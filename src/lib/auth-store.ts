import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

// Demo accounts stored in localStorage
const USERS_KEY = 'parksmart_users';
const SESSION_KEY = 'parksmart_session';

const getStoredUsers = (): Array<User & { password: string }> => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch { return []; }
};

const saveUsers = (users: Array<User & { password: string }>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Seed a default admin account
if (getStoredUsers().length === 0) {
  saveUsers([{
    id: 'u1',
    name: 'Angie D',
    email: 'admin@park.io',
    password: 'admin123',
  }]);
}

let nextId = 100;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,

  initialize: () => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        set({ user: JSON.parse(session), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    const users = getStoredUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) throw new Error('Invalid email or password');
    const { password: _, ...user } = found;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    set({ user });
  },

  signup: async (name, email, password) => {
    await new Promise(r => setTimeout(r, 800));
    const users = getStoredUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists');
    }
    const newUser = { id: `u${nextId++}`, name, email, password };
    saveUsers([...users, newUser]);
    const { password: _, ...user } = newUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    set({ user: null });
  },
}));