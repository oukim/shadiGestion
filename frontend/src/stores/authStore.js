import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,

      // Computed (via getter function)
      isAuthenticated: () => !!get().token,

      // Actions
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),

      // Set user without changing token (utile pour /me)
      setUser: (user) => set({ user }),

      // 🆕 Met à jour partiellement le user (ex: must_change_password)
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'shadi-phone-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)