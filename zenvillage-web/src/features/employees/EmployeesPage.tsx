import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { DataTable, type Column } from '@/shared/components/DataTable'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { seedEmployees } from '@/shared/data/seed'
import type { Employee } from '@/shared/types/entities'
import { EmployeeForm } from './EmployeeForm'

function statusColor(status: string): 'success' | 'secondary' | 'warning' {
  if (status === 'active') return 'success'
  if (status === 'on_leave') return 'warning'
  return 'secondary'
}

export function EmployeesPage() {
  const { t, i18n } = useTranslation()
  const [employees, setEmployees] = useState<Employee[]>(seedEmployees)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterContract, setFilterContract] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editTarget, setEditTarget] = useState<Employee | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const fmt = (date: string) =>
    new Intl.DateTimeFormat(i18n.language.replace('_', '-'), { dateStyle: 'medium' }).format(new Date(date))

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.cpf.includes(search)
    const matchRole = filterRole === 'all' || e.role === filterRole
    const matchContract = filterContract === 'all' || e.contractType === filterContract
    const matchStatus = filterStatus === 'all' || e.status === filterStatus
    return matchSearch && matchRole && matchContract && matchStatus
  })

  const handleSave = (data: Partial<Employee>) => {
    if (editTarget) {
      setEmployees((prev) => prev.map((e) => (e.id === editTarget.id ? { ...e, ...data } : e)))
    } else {
      setEmployees((prev) => [...prev, { id: `e${Date.now()}`, ...data } as Employee])
    }
    setDrawerOpen(false)
    toast.success(t('toast.saved'))
  }

  const columns: Column<Employee>[] = [
    {
      key: 'name', header: t('employees.columns.name'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {row.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'role', header: t('employees.columns.role'),
      render: (row) => <Badge variant="outline">{t(`employees.role.${row.role}`)}</Badge>,
    },
    { key: 'condo', header: t('employees.columns.condominium'), render: (row) => <span className="text-sm">{row.condominiumName}</span> },
    {
      key: 'contractType', header: t('employees.columns.contractType'),
      render: (row) => (
        <Badge variant={row.contractType === 'direct_clt' ? 'default' : 'secondary'}>
          {t(`employees.contractType.${row.contractType}`)}
        </Badge>
      ),
    },
    {
      key: 'company', header: t('employees.columns.company'),
      render: (row) => <span className="text-sm">{row.outsourcingCompany ?? '—'}</span>,
    },
    {
      key: 'admissionDate', header: t('employees.columns.admissionDate'),
      render: (row) => <span className="text-sm">{fmt(row.admissionDate)}</span>,
    },
    { key: 'schedule', header: t('employees.columns.schedule'), render: (row) => <span className="text-sm">{t(`employees.schedule.${row.schedule}`)}</span> },
    {
      key: 'status', header: t('employees.columns.status'),
      render: (row) => <Badge variant={statusColor(row.status)}>{t(`employees.status.${row.status}`)}</Badge>,
    },
    {
      key: 'actions', header: t('common.actions'),
      render: (row) => (
        <Button size="icon" variant="ghost" aria-label={t('common.edit')} onClick={() => { setEditTarget(row); setDrawerOpen(true) }}>
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('employees.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('employees.subtitle')}</p>
        </div>
        <Button onClick={() => { setEditTarget(null); setDrawerOpen(true) }}>
          <Plus className="h-4 w-4" />
          {t('employees.new')}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-44"><SelectValue placeholder={t('employees.filters.role')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('employees.filters.role')}</SelectItem>
            {(['superintendent', 'doorman', 'general_services', 'guard', 'receptionist'] as const).map((r) => (
              <SelectItem key={r} value={r}>{t(`employees.role.${r}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterContract} onValueChange={setFilterContract}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t('employees.filters.contractType')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('employees.filters.contractType')}</SelectItem>
            <SelectItem value="direct_clt">{t('employees.contractType.direct_clt')}</SelectItem>
            <SelectItem value="outsourced">{t('employees.contractType.outsourced')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t('employees.filters.status')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('employees.filters.status')}</SelectItem>
            <SelectItem value="active">{t('employees.status.active')}</SelectItem>
            <SelectItem value="inactive">{t('employees.status.inactive')}</SelectItem>
            <SelectItem value="on_leave">{t('employees.status.on_leave')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filtered} columns={columns} keyField="id" />

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>{editTarget ? t('employees.edit') : t('employees.new')}</SheetTitle>
          </SheetHeader>
          <div className="px-6 pb-6 mt-4">
            <EmployeeForm
              initialData={editTarget ?? undefined}
              onSave={handleSave}
              onCancel={() => setDrawerOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
