import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(persist(
  (set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    setUser: (userData) => set({ 
      user: userData, 
      isAuthenticated: !!userData 
    }),

    clearUser: () => set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    }),

    updateUser: (updates) => set((state) => ({ 
      user: { ...state.user, ...updates } 
    }))
  }),
  {
    name: 'user-storage', // unique name
    getStorage: () => localStorage, // use localStorage for persistence
  }
));

export default useUserStore;
