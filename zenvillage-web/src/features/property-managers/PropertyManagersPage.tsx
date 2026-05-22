import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Pencil, Info, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { DataTable, type Column } from '@/shared/components/DataTable'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import type { PropertyManager } from './types/property-manager.types'
import { PropertyManagerForm } from './PropertyManagerForm'
import { PropertyManagerDetail } from './PropertyManagerDetail'
import {
  usePropertyManagersQuery,
  useCreatePMMutation,
  useUpdatePMMutation,
} from './hooks/usePropertyManagersQuery'

export function PropertyManagersPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [editTarget, setEditTarget] = useState<PropertyManager | null>(null)
  const [detailTarget, setDetailTarget] = useState<PropertyManager | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data, isLoading, isError } = usePropertyManagersQuery({ search: debouncedSearch || undefined })
  const createMutation = useCreatePMMutation()
  const updateMutation = useUpdatePMMutation()

  const items = data?.items ?? []

  const handleSearch = (val: string) => {
    setSearch(val)
    clearTimeout((window as any).__pmSearchTimer)
    ;(window as any).__pmSearchTimer = setTimeout(() => setDebouncedSearch(val), 350)
  }

  const handleSave = async (data: Partial<PropertyManager>) => {
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

  const columns: Column<PropertyManager>[] = [
    {
      key: 'name', header: t('propertyManagers.columns.name'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {row.tradeName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.tradeName}</span>
        </div>
      ),
    },
    {
      key: 'taxId', header: t('propertyManagers.columns.cnpj'),
      render: (row) => <span className="text-sm font-mono">{row.taxId}</span>,
    },
    {
      key: 'location', header: t('propertyManagers.columns.location'),
      render: (row) => <span className="text-sm">{row.address.city}/{row.address.state}</span>,
    },
    {
      key: 'status', header: t('propertyManagers.columns.status'),
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'secondary'}>
          {t(`common.${row.status}`)}
        </Badge>
      ),
    },
    {
      key: 'whiteLabel', header: t('propertyManagers.columns.whiteLabel'),
      render: (row) => (
        <Badge variant={row.whiteLabelEnabled ? 'info' : 'outline'}>
          {row.whiteLabelEnabled ? t('common.yes') : t('common.no')}
        </Badge>
      ),
    },
    {
      key: 'actions', header: t('common.actions'),
      render: (row) => (
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" aria-label={t('common.edit')} onClick={() => { setEditTarget(row); setDrawerOpen(true) }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" aria-label={t('common.details')} onClick={() => { setDetailTarget(row); setDetailOpen(true) }}>
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
          <h1 className="text-2xl font-bold">{t('propertyManagers.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('propertyManagers.subtitle')}</p>
        </div>
        <Button onClick={() => { setEditTarget(null); setDrawerOpen(true) }}>
          <Plus className="h-4 w-4" />
          {t('propertyManagers.new')}
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
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>{editTarget ? t('propertyManagers.edit') : t('propertyManagers.new')}</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6 mt-4">
            <PropertyManagerForm
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
            <SheetTitle>{detailTarget?.tradeName}</SheetTitle>
          </SheetHeader>
          {detailTarget && (
            <div className="px-6 pb-6 mt-4">
              <PropertyManagerDetail manager={detailTarget} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
