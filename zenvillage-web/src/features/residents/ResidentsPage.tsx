import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Pencil, Info, Shield, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { DataTable, type Column } from '@/shared/components/DataTable'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { seedResidents } from '@/shared/data/seed'
import type { Resident } from '@/shared/types/entities'
import { ResidentForm } from './ResidentForm'
import { ResidentDetail } from './ResidentDetail'

function maskCpf(cpf: string) {
  return cpf.replace(/(\d{3}\.)(\d{3}\.)(\d{3}-\d{2})/, '***.$2***-**')
}

export function ResidentsPage() {
  const { t } = useTranslation()
  const [residents, setResidents] = useState<Resident[]>(seedResidents)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editTarget, setEditTarget] = useState<Resident | null>(null)
  const [detailTarget, setDetailTarget] = useState<Resident | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const filtered = residents.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cpf.includes(search)
    const matchType = filterType === 'all' || r.occupancyType === filterType
    const matchStatus = filterStatus === 'all' || r.financialStatus === filterStatus
    return matchSearch && matchType && matchStatus
  })

  const handleSave = (data: Partial<Resident>) => {
    if (editTarget) {
      setResidents((prev) => prev.map((r) => (r.id === editTarget.id ? { ...r, ...data } : r)))
    } else {
      setResidents((prev) => [...prev, { id: `r${Date.now()}`, ...data } as Resident])
    }
    setDrawerOpen(false)
    toast.success(t('toast.saved'))
  }

  const columns: Column<Resident>[] = [
    {
      key: 'name', header: t('residents.columns.name'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {row.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1">
            <span className="font-medium text-sm">{row.name}</span>
            {row.isSyndic && <Shield className="h-3.5 w-3.5 text-primary" aria-label="Syndic" />}
            {row.isCouncilMember && <Star className="h-3.5 w-3.5 text-amber-500" aria-label="Council member" />}
          </div>
        </div>
      ),
    },
    {
      key: 'cpf', header: t('residents.columns.cpf'),
      render: (row) => <span className="font-mono text-sm">{maskCpf(row.cpf)}</span>,
    },
    {
      key: 'type', header: t('residents.columns.type'),
      render: (row) => (
        <Badge variant={row.occupancyType === 'owner' ? 'default' : 'secondary'}>
          {t(`residents.type.${row.occupancyType}`)}
        </Badge>
      ),
    },
    {
      key: 'unit', header: t('residents.columns.unit'),
      render: (row) => <span className="text-sm">{row.block} - Apt {row.unit}</span>,
    },
    {
      key: 'condominium', header: t('residents.columns.condominium'),
      render: (row) => <span className="text-sm">{row.condominiumName}</span>,
    },
    {
      key: 'financialStatus', header: t('residents.columns.financialStatus'),
      render: (row) => (
        <Badge variant={row.financialStatus === 'current' ? 'success' : 'destructive'}>
          {t(`residents.financialStatus.${row.financialStatus}`)}
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
          <h1 className="text-2xl font-bold">{t('residents.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('residents.subtitle')}</p>
        </div>
        <Button onClick={() => { setEditTarget(null); setDrawerOpen(true) }}>
          <Plus className="h-4 w-4" />
          {t('residents.new')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-44"><SelectValue placeholder={t('residents.filters.type')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('residents.filters.type')}</SelectItem>
            <SelectItem value="owner">{t('residents.type.owner')}</SelectItem>
            <SelectItem value="tenant">{t('residents.type.tenant')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder={t('residents.filters.financialStatus')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('residents.filters.financialStatus')}</SelectItem>
            <SelectItem value="current">{t('residents.financialStatus.current')}</SelectItem>
            <SelectItem value="defaulting">{t('residents.financialStatus.defaulting')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filtered} columns={columns} keyField="id" />

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>{editTarget ? t('residents.edit') : t('residents.new')}</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6 mt-4">
            <ResidentForm
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
              <ResidentDetail resident={detailTarget} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
