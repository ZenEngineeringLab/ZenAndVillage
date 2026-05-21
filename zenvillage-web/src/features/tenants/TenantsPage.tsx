import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Pencil, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'
import { DataTable, type Column } from '@/shared/components/DataTable'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { seedTenants } from '@/shared/data/seed'
import type { Tenant } from '@/shared/types/entities'
import { TenantForm } from './TenantForm'
import { TenantDetailPanel } from './TenantDetailPanel'

function daysRemaining(dateStr?: string) {
  if (!dateStr) return 0
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000))
}

function planColor(plan: string): 'default' | 'secondary' | 'info' {
  if (plan === 'enterprise') return 'default'
  if (plan === 'pro') return 'info'
  return 'secondary'
}

function statusColor(status: string): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (status === 'active') return 'success'
  if (status === 'trial') return 'warning'
  if (status === 'suspended') return 'destructive'
  return 'secondary'
}

export function TenantsPage() {
  const { t, i18n } = useTranslation()
  const [tenants, setTenants] = useState<Tenant[]>(seedTenants)
  const [search, setSearch] = useState('')
  const [editTarget, setEditTarget] = useState<Tenant | null>(null)
  const [detailTarget, setDetailTarget] = useState<Tenant | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const fmt = (date: string) =>
    new Intl.DateTimeFormat(i18n.language.replace('_', '-'), { dateStyle: 'medium' }).format(new Date(date))

  const filtered = tenants.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))

  const handleNew = () => { setEditTarget(null); setDrawerOpen(true) }
  const handleEdit = (tenant: Tenant) => { setEditTarget(tenant); setDrawerOpen(true) }
  const handleDetail = (tenant: Tenant) => { setDetailTarget(tenant); setDetailOpen(true) }

  const handleSave = (data: Partial<Tenant>) => {
    if (editTarget) {
      setTenants((prev) => prev.map((t) => (t.id === editTarget.id ? { ...t, ...data } : t)))
    } else {
      const newTenant: Tenant = {
        id: `t${Date.now()}`,
        condominiumsCount: 0,
        condominiumsLimit: 1,
        unitsCount: 0,
        unitsLimit: 100,
        joinDate: new Date().toISOString().split('T')[0],
        ...data,
      } as Tenant
      setTenants((prev) => [...prev, newTenant])
    }
    setDrawerOpen(false)
    toast.success(t('toast.saved'))
  }

  const columns: Column<Tenant>[] = [
    {
      key: 'name', header: t('tenants.columns.name'),
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'type', header: t('tenants.columns.type'),
      render: (row) => (
        <Badge variant="outline">{t(`tenants.type.${row.type}`)}</Badge>
      ),
    },
    {
      key: 'plan', header: t('tenants.columns.plan'),
      render: (row) => (
        <Badge variant={planColor(row.plan)}>{t(`tenants.plan.${row.plan}`)}</Badge>
      ),
    },
    {
      key: 'status', header: t('tenants.columns.status'),
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Badge variant={statusColor(row.status)}>{t(`tenants.status.${row.status}`)}</Badge>
          {row.status === 'trial' && row.trialEnd && (
            <span className="text-xs text-amber-600">
              {t('tenants.trial.daysRemaining', { count: daysRemaining(row.trialEnd) })}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'condominiums', header: t('tenants.columns.condominiums'),
      render: (row) => (
        <div className="space-y-1 min-w-24">
          <div className="text-xs">{row.condominiumsCount} / {row.condominiumsLimit}</div>
          <Progress value={(row.condominiumsCount / row.condominiumsLimit) * 100} className="h-1" />
        </div>
      ),
    },
    {
      key: 'joinDate', header: t('tenants.columns.joinDate'),
      render: (row) => <span className="text-muted-foreground text-sm">{fmt(row.joinDate)}</span>,
    },
    {
      key: 'actions', header: t('common.actions'),
      render: (row) => (
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" aria-label={t('common.edit')} onClick={() => handleEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" aria-label={t('common.details')} onClick={() => handleDetail(row)}>
            <Info className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('tenants.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('tenants.subtitle')}</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4" />
          {t('tenants.new')}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <DataTable data={filtered} columns={columns} keyField="id" />

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>{editTarget ? t('tenants.edit') : t('tenants.new')}</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6 mt-4">
            <TenantForm
              initialData={editTarget ?? undefined}
              onSave={handleSave}
              onCancel={() => setDrawerOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>{detailTarget?.name}</SheetTitle>
          </SheetHeader>
          {detailTarget && (
            <div className="px-6 pb-6 mt-4">
              <TenantDetailPanel tenant={detailTarget} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
