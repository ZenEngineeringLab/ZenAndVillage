import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  email: string
  name: string
  roles: string[]
  locale: string
}

export interface TenantSummary {
  id: string
  name: string
  type: 'management_company' | 'independent_condo'
  status: string
}

interface AuthState {
  user: AuthUser | null
  activeTenantId: string | null
  tenants: TenantSummary[]
  isAuthenticated: boolean

  setUser: (user: AuthUser, tenantId: string) => void
  setTenants: (tenants: TenantSummary[]) => void
  setActiveTenant: (tenantId: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeTenantId: null,
      tenants: [],
      isAuthenticated: false,

      setUser: (user, tenantId) =>
        set({ user, activeTenantId: tenantId, isAuthenticated: true }),

      setTenants: (tenants) => set({ tenants }),

      setActiveTenant: (tenantId) => set({ activeTenantId: tenantId }),

      clearSession: () =>
        set({ user: null, activeTenantId: null, tenants: [], isAuthenticated: false }),
    }),
    {
      name: 'zenvillage-auth',
      partialize: (s) => ({
        user: s.user,
        activeTenantId: s.activeTenantId,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)
