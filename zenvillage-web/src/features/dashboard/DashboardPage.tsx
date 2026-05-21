import { useTranslation } from 'react-i18next'
import { Building2, Users, UserCheck, Home } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

export function DashboardPage() {
  const { t } = useTranslation()

  const stats = [
    { icon: Building2, label: t('tenants.title'), value: '3', color: 'text-primary' },
    { icon: Home, label: t('condominiums.title'), value: '3', color: 'text-blue-600' },
    { icon: Users, label: t('residents.title'), value: '5', color: 'text-emerald-600' },
    { icon: UserCheck, label: t('employees.title'), value: '4', color: 'text-violet-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
