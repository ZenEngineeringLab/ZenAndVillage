import { create } from 'zustand'
import type { Theme, Locale, Tenant, Notification } from '../types/entities'
import { seedTenants, seedNotifications } from '../data/seed'

interface AppState {
  theme: Theme
  locale: Locale
  activeTenantId: string
  tenants: Tenant[]
  notifications: Notification[]

  setTheme: (theme: Theme) => void
  setLocale: (locale: Locale) => void
  setActiveTenant: (tenantId: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  unreadCount: () => number
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'auto',
  locale: 'auto',
  activeTenantId: seedTenants[0].id,
  tenants: seedTenants,
  notifications: seedNotifications,

  setTheme: (theme) => set({ theme }),
  setLocale: (locale) => set({ locale }),
  setActiveTenant: (tenantId) => set({ activeTenantId: tenantId }),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}))
