import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Pencil, Info, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { DataTable, type Column } from '@/shared/components/DataTable'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import type { Tenant } from '@/shared/types/entities'
import { TenantForm } from './TenantForm'
import { TenantDetailPanel } from './TenantDetailPanel'
import {
  useTenantsQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
} from './hooks/useTenantsQuery'

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
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [editTarget, setEditTarget] = useState<Tenant | null>(null)
  const [detailTarget, setDetailTarget] = useState<Tenant | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data, isLoading, isError } = useTenantsQuery({ search: debouncedSearch || undefined })
  const createMutation = useCreateTenantMutation()
  const updateMutation = useUpdateTenantMutation()

  const items = data?.items ?? []

  // Simple client-side debounce for search
  const handleSearch = (val: string) => {
    setSearch(val)
    clearTimeout((window as any).__tenantSearchTimer)
    ;(window as any).__tenantSearchTimer = setTimeout(() => setDebouncedSearch(val), 350)
  }

  const fmt = (date?: string) => {
    if (!date) return '—'
    const d = new Date(date)
    if (isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat(i18n.language.replace('_', '-'), { dateStyle: 'medium' }).format(d)
  }

  const handleNew = () => { setEditTarget(null); setDrawerOpen(true) }
  const handleEdit = (tenant: Tenant) => { setEditTarget(tenant); setDrawerOpen(true) }
  const handleDetail = (tenant: Tenant) => { setDetailTarget(tenant); setDetailOpen(true) }

  const handleSave = async (data: Partial<Tenant>) => {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, ...data })
      } else {
        await createMutation.mutateAsync(data as any)
      }
      setDrawerOpen(false)
      toast.success(t('toast.saved'))
    } catch {
      // error already toasted by mutation onError
    }
  }

  const columns: Column<Tenant>[] = [
    {
      key: 'name', header: t('tenants.columns.name'),
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'type', header: t('tenants.columns.type'),
      render: (row) => <Badge variant="outline">{t(`tenants.type.${row.type}`)}</Badge>,
    },
    {
      key: 'plan', header: t('tenants.columns.plan'),
      render: (row) => <Badge variant={planColor(row.planId)}>{row.planId}</Badge>,
    },
    {
      key: 'status', header: t('tenants.columns.status'),
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Badge variant={statusColor(row.status)}>{t(`tenants.status.${row.status}`)}</Badge>
          {row.subscriptionStatus === 'trial' && row.trialEndDate && (
            <span className="text-xs text-amber-600">
              {t('tenants.trial.daysRemaining', { count: daysRemaining(row.trialEndDate) })}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'condominiums', header: t('tenants.columns.condominiums'),
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {t('tenants.usage.limit', { count: row.usageLimits.activeCondos })}
        </span>
      ),
    },
    {
      key: 'createdAt', header: t('tenants.columns.joinDate'),
      render: (row) => <span className="text-muted-foreground text-sm">{fmt(row.createdAt)}</span>,
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
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 text-destructive text-sm py-8 justify-center">
          <AlertCircle className="h-4 w-4" />
          {t('common.loadError')}
        </div>
      ) : (
        <DataTable data={items} columns={columns} keyField="id" />
      )}

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
