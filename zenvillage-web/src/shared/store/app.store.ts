import { create } from 'zustand'
import type { Theme, Locale, ColorTheme, Tenant, Notification } from '../types/entities'
import { seedTenants, seedNotifications } from '../data/seed'

interface AppState {
  theme: Theme
  colorTheme: ColorTheme
  locale: Locale
  activeTenantId: string
  tenants: Tenant[]
  notifications: Notification[]

  setTheme: (theme: Theme) => void
  setColorTheme: (colorTheme: ColorTheme) => void
  setLocale: (locale: Locale) => void
  setActiveTenant: (tenantId: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  unreadCount: () => number
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'auto',
  colorTheme: 'teal',
  locale: 'auto',
  activeTenantId: seedTenants[0].id,
  tenants: seedTenants,
  notifications: seedNotifications,

  setTheme: (theme) => set({ theme }),
  setColorTheme: (colorTheme) => set({ colorTheme }),
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
