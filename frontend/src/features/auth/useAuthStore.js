import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      admin: null,           // { id, name, email, role }
      isAuthenticated: false,

      /** Called after a successful login */
      setSession: ({ token, admin }) =>
        set({ token, admin, isAuthenticated: true }),

      /** Called on logout OR on any 401 */
      logout: () =>
        set({ token: null, admin: null, isAuthenticated: false }),

      /** Optional: update admin fields (e.g. after profile change) */
      setAdmin: (admin) => set({ admin }),
    }),
    {
      name: 'auth',          
      partialize: (s) => ({
        token: s.token,
        admin: s.admin,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)