import { useTranslation } from 'react-i18next'
import { Shield, Star } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import type { Resident } from '@/shared/types/entities'

interface Props { resident: Resident }

export function ResidentDetail({ resident: r }: Props) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="text-base bg-primary/10 text-primary">
            {r.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1">
            <h3 className="font-semibold">{r.name}</h3>
            {r.isSyndic && <Shield className="h-4 w-4 text-primary" />}
            {r.isCouncilMember && <Star className="h-4 w-4 text-amber-500" />}
          </div>
          <p className="text-sm text-muted-foreground">{r.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">{t('common.phone')}</p>
          <p>{r.phone}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('residents.columns.unit')}</p>
          <p>{r.block} — Apt {r.unit}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('residents.columns.type')}</p>
          <Badge variant={r.occupancyType === 'owner' ? 'default' : 'secondary'}>
            {t(`residents.type.${r.occupancyType}`)}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('residents.columns.financialStatus')}</p>
          <Badge variant={r.financialStatus === 'current' ? 'success' : 'destructive'}>
            {t(`residents.financialStatus.${r.financialStatus}`)}
          </Badge>
        </div>
      </div>

      {r.vehicleModel && (
        <div className="text-sm">
          <p className="text-xs text-muted-foreground">{t('residents.fields.vehicleModel')}</p>
          <p>{r.vehicleModel} — {r.licensePlate}</p>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold mb-2">Occurrence History</h4>
        <p className="text-sm text-muted-foreground">{t('common.emptyState')}</p>
      </div>
    </div>
  )
}
