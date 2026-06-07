import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/ui/badge'
import type { Tenant } from '@/shared/types/entities'

interface TenantDetailPanelProps {
  tenant: Tenant
}

export function TenantDetailPanel({ tenant }: TenantDetailPanelProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">{t('tenants.fields.type')}</p>
          <Badge variant="outline">{t(`tenants.type.${tenant.type}`)}</Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('tenants.fields.plan')}</p>
          <p className="font-medium">{tenant.planId}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('tenants.fields.contactEmail')}</p>
          <p className="text-sm">{tenant.contactEmail}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('tenants.fields.phone')}</p>
          <p className="text-sm">{tenant.phone}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('tenants.fields.responsibleName')}</p>
          <p className="text-sm">{tenant.responsibleName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('tenants.fields.billingCycle')}</p>
          <p className="text-sm">{t(`tenants.fields.billingCycle${tenant.billingCycle === 'monthly' ? 'Monthly' : 'Annual'}`)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold">{t('tenants.usage.limits')}</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{t('tenants.usage.condominiums')}</p>
            <p className="text-lg font-semibold">{tenant.usageLimits?.activeCondos ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('tenants.usage.units')}</p>
            <p className="text-lg font-semibold">{tenant.usageLimits?.totalUnits ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('tenants.usage.adminUsers')}</p>
            <p className="text-lg font-semibold">{tenant.usageLimits?.adminUsers ?? '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
