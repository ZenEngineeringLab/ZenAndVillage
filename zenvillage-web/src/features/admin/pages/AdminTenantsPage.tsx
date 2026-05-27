import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { AdminGuard } from '../components/AdminGuard'

/**
 * AdminTenantsPage — Platform Admin cross-tenant view.
 *
 * NOTE: This page requires a dedicated GET /v1/admin/tenants backend endpoint
 * that performs a cross-tenant DynamoDB scan. That endpoint has not yet been
 * implemented. The UI scaffold is in place and will be wired up when the
 * backend endpoint is deployed.
 */
export function AdminTenantsPage() {
  const { t } = useTranslation()

  return (
    <AdminGuard>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{t('onboarding.admin.tenants.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('onboarding.admin.tenants.subtitle')}
          </p>
        </div>

        <div className="border rounded-xl bg-card p-8 shadow-sm flex flex-col items-center gap-3 text-center">
          <Info className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground max-w-md">
            {t('onboarding.admin.tenants.notImplemented')}
          </p>
        </div>
      </div>
    </AdminGuard>
  )
}
