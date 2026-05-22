import { create } from 'zustand'
import type { Theme, Locale, RadiusOption, MenuColorOption, MenuAccentOption, Tenant, Notification } from '../types/entities'
import type { FontChoice } from '../data/fonts'
import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT } from '../data/fonts'
import { seedTenants, seedNotifications } from '../data/seed'

interface AppState {
  theme: Theme
  activePreset: string
  activeRadius: RadiusOption
  activeMenuColor: MenuColorOption
  activeMenuAccent: MenuAccentOption
  activeBodyFont: FontChoice
  activeHeadingFont: FontChoice
  locale: Locale
  sidebarExpanded: boolean
  activeTenantId: string
  tenants: Tenant[]
  notifications: Notification[]

  setTheme: (theme: Theme) => void
  setActivePreset: (code: string) => void
  setActiveRadius: (r: RadiusOption) => void
  setActiveMenuColor: (c: MenuColorOption) => void
  setActiveMenuAccent: (a: MenuAccentOption) => void
  setActiveBodyFont: (font: FontChoice) => void
  setActiveHeadingFont: (font: FontChoice) => void
  setLocale: (locale: Locale) => void
  setSidebarExpanded: (v: boolean) => void
  toggleSidebar: () => void
  setActiveTenant: (tenantId: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  unreadCount: () => number
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'auto',
  activePreset: 'b1Ymqvgiu',
  activeRadius: 'default',
  activeMenuColor: 'default',
  activeMenuAccent: 'subtle',
  activeBodyFont: DEFAULT_BODY_FONT,
  activeHeadingFont: DEFAULT_HEADING_FONT,
  locale: 'auto',
  sidebarExpanded: window.innerWidth >= 1024,
  activeTenantId: seedTenants[0].id,
  tenants: seedTenants,
  notifications: seedNotifications,

  setTheme: (theme) => set({ theme }),
  setActivePreset: (code) => set({ activePreset: code }),
  setActiveRadius: (r) => set({ activeRadius: r }),
  setActiveMenuColor: (c) => set({ activeMenuColor: c }),
  setActiveMenuAccent: (a) => set({ activeMenuAccent: a }),
  setActiveBodyFont: (font) => set({ activeBodyFont: font }),
  setActiveHeadingFont: (font) => set({ activeHeadingFont: font }),
  setLocale: (locale) => set({ locale }),
  setActiveTenant: (tenantId) => set({ activeTenantId: tenantId }),
  setSidebarExpanded: (v) => set({ sidebarExpanded: v }),
  toggleSidebar: () => set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),

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
