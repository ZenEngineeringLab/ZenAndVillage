import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type OnboardingStatus =
  | 'pending_verification'
  | 'pending_subscription'
  | 'pending_approval'
  | 'onboarding'
  | 'complete'

export interface AuthUser {
  id: string        // internal UUID from the Users table (custom:userId)
  cognitoSub: string // Cognito user sub (JWT sub claim)
  email: string
  name: string
  roles: string[]
  locale: string
  onboardingStatus: OnboardingStatus
}

export interface TenantSummary {
  id: string
  name: string
  type: 'management_company' | 'independent_condo'
  status: 'active' | 'suspended' | 'canceled'
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
