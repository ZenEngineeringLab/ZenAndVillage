import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { seedResidents, seedEmployees } from '@/shared/data/seed'
import type { Condominium } from '@/shared/types/entities'

interface Props { condo: Condominium }

export function CondominiumDetail({ condo }: Props) {
  const { t } = useTranslation()
  const residents = seedResidents.filter((r) => r.condominiumId === condo.id)
  const employees = seedEmployees.filter((e) => e.condominiumId === condo.id)
  const occupancyRate = residents.length > 0 ? Math.round((residents.length / condo.numUnits) * 100) : 0
  const defaultRate = residents.filter((r) => r.financialStatus === 'defaulting').length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant={condo.status === 'active' ? 'success' : 'secondary'}>{t(`common.${condo.status}`)}</Badge>
        <Badge variant="outline">{t(`condominiums.type.${condo.type}`)}</Badge>
        <span className="text-sm text-muted-foreground">{condo.address.city}/{condo.address.state}</span>
      </div>
      <p className="text-sm text-muted-foreground">{condo.address.street}, {condo.address.number} — {condo.address.neighborhood}</p>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: t('condominiums.detail.totalUnits'), value: condo.numUnits },
          { label: t('condominiums.detail.occupancyRate'), value: `${occupancyRate}%` },
          { label: t('condominiums.detail.defaultRate'), value: `${defaultRate}` },
          { label: t('condominiums.detail.activeEmployees'), value: employees.filter((e) => e.status === 'active').length },
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

      <Tabs defaultValue="units">
        <TabsList>
          <TabsTrigger value="blocks">{t('condominiums.detail.tabs.blocks')}</TabsTrigger>
          <TabsTrigger value="units">{t('condominiums.detail.tabs.units')}</TabsTrigger>
          <TabsTrigger value="docs">{t('condominiums.detail.tabs.documents')}</TabsTrigger>
        </TabsList>
        <TabsContent value="blocks" className="mt-3">
          {Array.from({ length: condo.numBlocks }, (_, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b text-sm">
              <span>{t('common.name')} {String.fromCharCode(65 + i)}</span>
              <span className="text-muted-foreground">~{Math.round(condo.numUnits / condo.numBlocks)} {t('condominiums.detail.totalUnits').toLowerCase()}</span>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="units" className="mt-3">
          {residents.map((r) => (
            <div key={r.id} className="flex justify-between items-center py-2 border-b text-sm">
              <span>{r.block} - {r.unit}</span>
              <span className="text-muted-foreground">{r.name}</span>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="docs" className="mt-3">
          <p className="text-sm text-muted-foreground">{t('common.emptyState')}</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
