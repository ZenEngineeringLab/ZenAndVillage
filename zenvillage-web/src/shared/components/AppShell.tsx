import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { useAppStore } from '../store/app.store'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useTheme } from '../hooks/useTheme'
import { useLocale } from '../hooks/useLocale'
import { useWebSocket } from '../hooks/useWebSocket'
import { useServiceWorkerUpdate } from '../hooks/useServiceWorkerUpdate'

const COLLAPSE_BREAKPOINT = 1024

export function AppShell() {
  useTheme()
  useLocale()
  useWebSocket()           // called once here, never in individual components
  useServiceWorkerUpdate() // register PWA update listener

  const { t } = useTranslation()
  const { setSidebarExpanded } = useAppStore()
  const { activeTenantId, tenants } = useAuthStore()
  const activeTenant = tenants.find((tn) => tn.id === activeTenantId)

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < COLLAPSE_BREAKPOINT) {
        setSidebarExpanded(false)
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarExpanded])

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          {activeTenant?.status === 'suspended' && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {t('tenants.suspended.banner')}
            </div>
          )}
          <div className="max-w-7xl mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
