import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Pencil, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { DataTable, type Column } from '@/shared/components/DataTable'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { seedCondominiums } from '@/shared/data/seed'
import type { Condominium } from '@/shared/types/entities'
import { CondominiumForm } from './CondominiumForm'
import { CondominiumDetail } from './CondominiumDetail'

function typeColor(type: string): 'default' | 'secondary' | 'info' {
  if (type === 'residential') return 'default'
  if (type === 'mixed') return 'info'
  return 'secondary'
}

export function CondominiumsPage() {
  const { t } = useTranslation()
  const [condos, setCondos] = useState<Condominium[]>(seedCondominiums)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editTarget, setEditTarget] = useState<Condominium | null>(null)
  const [detailTarget, setDetailTarget] = useState<Condominium | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const filtered = condos.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || c.type === filterType
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    return matchSearch && matchType && matchStatus
  })

  const handleSave = (data: Partial<Condominium>) => {
    if (editTarget) {
      setCondos((prev) => prev.map((c) => (c.id === editTarget.id ? { ...c, ...data } : c)))
    } else {
      setCondos((prev) => [...prev, { id: `c${Date.now()}`, ...data } as Condominium])
    }
    setDrawerOpen(false)
    toast.success(t('toast.saved'))
  }

  const columns: Column<Condominium>[] = [
    {
      key: 'name', header: t('condominiums.columns.name'),
      render: (row) => (
        <button
          className="font-medium text-primary hover:underline text-left"
          onClick={() => { setDetailTarget(row); setDetailOpen(true) }}
        >
          {row.name}
        </button>
      ),
    },
    {
      key: 'type', header: t('condominiums.columns.type'),
      render: (row) => <Badge variant={typeColor(row.type)}>{t(`condominiums.type.${row.type}`)}</Badge>,
    },
    {
      key: 'location', header: t('condominiums.columns.location'),
      render: (row) => <span className="text-sm">{row.address.city}/{row.address.state}</span>,
    },
    {
      key: 'propertyManager', header: t('condominiums.columns.propertyManager'),
      render: (row) => <span className="text-sm">{row.propertyManagerName}</span>,
    },
    { key: 'units', header: t('condominiums.columns.units'), render: (row) => <span>{row.numUnits}</span> },
    { key: 'syndic', header: t('condominiums.columns.syndic'), render: (row) => <span className="text-sm">{row.syndic}</span> },
    {
      key: 'status', header: t('condominiums.columns.status'),
      render: (row) => <Badge variant={row.status === 'active' ? 'success' : 'secondary'}>{t(`common.${row.status}`)}</Badge>,
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
          <h1 className="text-2xl font-bold">{t('condominiums.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('condominiums.subtitle')}</p>
        </div>
        <Button onClick={() => { setEditTarget(null); setDrawerOpen(true) }}>
          <Plus className="h-4 w-4" />
          {t('condominiums.new')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44"><SelectValue placeholder={t('condominiums.filters.type')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('condominiums.filters.type')}</SelectItem>
            <SelectItem value="residential">{t('condominiums.type.residential')}</SelectItem>
            <SelectItem value="commercial">{t('condominiums.type.commercial')}</SelectItem>
            <SelectItem value="mixed">{t('condominiums.type.mixed')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t('condominiums.filters.status')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('condominiums.filters.status')}</SelectItem>
            <SelectItem value="active">{t('common.active')}</SelectItem>
            <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filtered} columns={columns} keyField="id" />

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>{editTarget ? t('condominiums.edit') : t('condominiums.new')}</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6 mt-4">
            <CondominiumForm
              initialData={editTarget ?? undefined}
              onSave={handleSave}
              onCancel={() => setDrawerOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>{detailTarget?.name}</SheetTitle>
          </SheetHeader>
          {detailTarget && (
            <div className="px-6 pb-6 mt-4">
              <CondominiumDetail condo={detailTarget} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
