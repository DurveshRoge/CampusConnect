import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAdminStore = create(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (val) => set({ _hasHydrated: val }),

      setAdmin: (admin, token) => {
        set({ admin, token, isAuthenticated: true })
      },

      logout: () => {
        set({ admin: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'campusconnect-admin-auth',
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true)
      },
    }
  )
)

export default useAdminStore
