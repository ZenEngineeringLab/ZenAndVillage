import { useTranslation } from 'react-i18next'
import { Progress } from '@/shared/components/ui/progress'
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
          <p className="font-medium">{t(`tenants.plan.${tenant.plan}`)}</p>
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
        <p className="text-sm font-semibold">{t('tenants.usage.condominiums')}</p>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{tenant.condominiumsCount} / {tenant.condominiumsLimit}</span>
            <span>{Math.round((tenant.condominiumsCount / tenant.condominiumsLimit) * 100)}%</span>
          </div>
          <Progress value={(tenant.condominiumsCount / tenant.condominiumsLimit) * 100} />
        </div>

        <p className="text-sm font-semibold">{t('tenants.usage.units')}</p>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{tenant.unitsCount} / {tenant.unitsLimit}</span>
            <span>{Math.round((tenant.unitsCount / tenant.unitsLimit) * 100)}%</span>
          </div>
          <Progress value={(tenant.unitsCount / tenant.unitsLimit) * 100} />
        </div>
      </div>
    </div>
  )
}
