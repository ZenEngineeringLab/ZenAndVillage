import { Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { useAppStore } from '../store/app.store'
import { useTheme } from '../hooks/useTheme'
import { useLocale } from '../hooks/useLocale'

export function AppShell() {
  useTheme()
  useLocale()
  const { t } = useTranslation()
  const { tenants, activeTenantId } = useAppStore()
  const activeTenant = tenants.find((tn) => tn.id === activeTenantId)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <AppSidebar />
      <main className="pt-14 pl-14 min-h-screen">
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
  )
}
