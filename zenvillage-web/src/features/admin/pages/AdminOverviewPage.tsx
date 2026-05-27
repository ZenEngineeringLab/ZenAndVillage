import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Clock, Users, TrendingUp, BookOpen, ArrowRight } from 'lucide-react'
import { httpClient } from '@/shared/api/http-client'
import { AdminGuard } from '../components/AdminGuard'

interface Subscription {
  id: string
  tenantId: string
  planId: string
  requestedAt: string
  billingCycle: string
  status: string
}

interface Plan {
  id: string
  name: string
}

export function AdminOverviewPage() {
  const { t } = useTranslation()

  const { data: subscriptions = [] } = useQuery<Subscription[]>({
    queryKey: ['admin', 'subscriptions'],
    queryFn: async () => {
      const res = await httpClient.get('/v1/admin/subscriptions')
      return res.data.items ?? res.data
    },
    staleTime: 30_000,
  })

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      const res = await httpClient.get('/v1/admin/plans')
      return res.data.items ?? res.data
    },
    staleTime: 30_000,
  })

  const pendingCount = subscriptions.filter((s) => s.status === 'pending_approval').length
  const activeCount = subscriptions.filter((s) => s.status === 'active' || s.status === 'trial').length
  const recentRequests = [...subscriptions]
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    .slice(0, 5)

  const stats = [
    {
      label: t('onboarding.admin.overview.pendingRequests'),
      value: pendingCount,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      label: t('onboarding.admin.overview.totalTenants'),
      value: subscriptions.length,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: t('onboarding.admin.overview.activeTenants'),
      value: activeCount,
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      label: t('onboarding.admin.overview.totalPlans'),
      value: plans.length,
      icon: BookOpen,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
  ]

  return (
    <AdminGuard>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">{t('onboarding.admin.overview.title')}</h1>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="border rounded-xl bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent subscription requests */}
        <div className="border rounded-xl bg-card shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-semibold">{t('onboarding.admin.overview.recentRequests')}</h2>
            <Link
              to="/admin/subscriptions"
              className="text-sm text-primary flex items-center gap-1 hover:underline"
            >
              {t('onboarding.admin.overview.viewAll')}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted-foreground text-center">
              {t('onboarding.admin.overview.noRequests')}
            </p>
          ) : (
            <div className="divide-y">
              {recentRequests.map((sub) => (
                <div key={sub.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{sub.tenantId.slice(0, 8)}…</p>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat('en-US', {
                        dateStyle: 'medium',
                      }).format(new Date(sub.requestedAt))}
                    </p>
                  </div>
                  <StatusBadge status={sub.status} t={t} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  )
}

function StatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const map: Record<string, string> = {
    pending_approval: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    trial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-muted text-muted-foreground'}`}
    >
      {t(`onboarding.admin.overview.status.${status}`)}
    </span>
  )
}
