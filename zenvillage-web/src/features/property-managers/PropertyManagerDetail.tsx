import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useCondominiumsQuery } from '@/features/condominiums/hooks/useCondominiumsQuery'
import type { PropertyManager } from '@/shared/types/entities'

interface Props { manager: PropertyManager }

export function PropertyManagerDetail({ manager }: Props) {
  const { t } = useTranslation()
  const { data: condosPage } = useCondominiumsQuery({ propertyManagerId: manager.id })
  const linkedCondos = condosPage?.items ?? []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: t('propertyManagers.detail.totalCondominiums'), value: manager.condominiumsCount },
          { label: t('propertyManagers.detail.totalUnits'), value: linkedCondos.reduce((s, c) => s + c.numUnits, 0) },
          { label: t('propertyManagers.detail.totalResidents'), value: '—' },
          { label: t('propertyManagers.detail.avgDefaultRate'), value: '2.4%' },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs text-muted-foreground font-normal">{label}</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">{t('condominiums.title')}</h3>
        {linkedCondos.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('common.emptyState')}</p>
        ) : (
          <ul className="space-y-2">
            {linkedCondos.map((c) => (
              <li key={c.id} className="flex justify-between items-center rounded-md border px-3 py-2 text-sm">
                <span className="font-medium">{c.name}</span>
                <span className="text-muted-foreground">{c.address.city}/{c.address.state}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
