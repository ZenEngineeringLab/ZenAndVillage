import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { httpClient } from '@/shared/api/http-client'
import type { Condominium } from '@/shared/types/entities'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Block {
  id: string
  name: string
  description?: string
  createdAt: string
}

interface Unit {
  id: string
  block?: string
  floor: number
  number: string
  type: 'apartment' | 'office' | 'store' | 'parking'
  occupancyStatus: 'owned' | 'rented' | 'vacant'
}

// ── Schemas ────────────────────────────────────────────────────────────────────

const blockSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})
type BlockFormValues = z.infer<typeof blockSchema>

const unitSchema = z.object({
  number: z.string().min(1),
  block: z.string().optional(),
  floor: z.coerce.number().int().min(0),
  type: z.enum(['apartment', 'office', 'store', 'parking']),
  occupancyStatus: z.enum(['owned', 'rented', 'vacant']),
})
type UnitFormValues = z.infer<typeof unitSchema>

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props { condo: Condominium }

// ── Component ─────────────────────────────────────────────────────────────────

export function CondominiumDetail({ condo }: Props) {
  const { t } = useTranslation()
  const qc = useQueryClient()

  // ─── Blocks state ────────────────────────────────────────────────────────────
  const [blockSheet, setBlockSheet] = useState<{ open: boolean; editing: Block | null }>({
    open: false,
    editing: null,
  })

  const blockForm = useForm<BlockFormValues>({ resolver: zodResolver(blockSchema) })

  const { data: blocks = [], isLoading: blocksLoading } = useQuery<Block[]>({
    queryKey: ['blocks', condo.id],
    queryFn: async () => {
      const res = await httpClient.get(`/v1/condominiums/${condo.id}/blocks`)
      return res.data.items ?? res.data
    },
    staleTime: 30_000,
  })

  const createBlockMutation = useMutation({
    mutationFn: (data: BlockFormValues) =>
      httpClient.post(`/v1/condominiums/${condo.id}/blocks`, data),
    onSuccess: () => {
      toast.success(t('toast.saved'))
      qc.invalidateQueries({ queryKey: ['blocks', condo.id] })
      setBlockSheet({ open: false, editing: null })
    },
    onError: () => toast.error(t('toast.error')),
  })

  const updateBlockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlockFormValues }) =>
      httpClient.patch(`/v1/condominiums/${condo.id}/blocks/${id}`, data),
    onSuccess: () => {
      toast.success(t('toast.saved'))
      qc.invalidateQueries({ queryKey: ['blocks', condo.id] })
      setBlockSheet({ open: false, editing: null })
    },
    onError: () => toast.error(t('toast.error')),
  })

  const deleteBlockMutation = useMutation({
    mutationFn: (id: string) =>
      httpClient.delete(`/v1/condominiums/${condo.id}/blocks/${id}`),
    onSuccess: () => {
      toast.success(t('toast.deleted'))
      qc.invalidateQueries({ queryKey: ['blocks', condo.id] })
    },
    onError: () => toast.error(t('toast.error')),
  })

  const openBlockCreate = () => {
    blockForm.reset({ name: '', description: '' })
    setBlockSheet({ open: true, editing: null })
  }

  const openBlockEdit = (block: Block) => {
    blockForm.reset({ name: block.name, description: block.description ?? '' })
    setBlockSheet({ open: true, editing: block })
  }

  const onBlockSubmit = (values: BlockFormValues) => {
    if (blockSheet.editing) {
      updateBlockMutation.mutate({ id: blockSheet.editing.id, data: values })
    } else {
      createBlockMutation.mutate(values)
    }
  }

  // ─── Units state ─────────────────────────────────────────────────────────────
  const [unitSheet, setUnitSheet] = useState<{ open: boolean; editing: Unit | null }>({
    open: false,
    editing: null,
  })

  const unitForm = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: { floor: 0, type: 'apartment', occupancyStatus: 'vacant' },
  })

  const { data: units = [], isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ['units', condo.id],
    queryFn: async () => {
      const res = await httpClient.get(`/v1/condominiums/${condo.id}/units`)
      return res.data.items ?? res.data
    },
    staleTime: 30_000,
  })

  const createUnitMutation = useMutation({
    mutationFn: (data: UnitFormValues) =>
      httpClient.post(`/v1/condominiums/${condo.id}/units`, data),
    onSuccess: () => {
      toast.success(t('toast.saved'))
      qc.invalidateQueries({ queryKey: ['units', condo.id] })
      setUnitSheet({ open: false, editing: null })
    },
    onError: () => toast.error(t('toast.error')),
  })

  const updateUnitMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UnitFormValues }) =>
      httpClient.patch(`/v1/condominiums/${condo.id}/units/${id}`, data),
    onSuccess: () => {
      toast.success(t('toast.saved'))
      qc.invalidateQueries({ queryKey: ['units', condo.id] })
      setUnitSheet({ open: false, editing: null })
    },
    onError: () => toast.error(t('toast.error')),
  })

  const deleteUnitMutation = useMutation({
    mutationFn: (id: string) =>
      httpClient.delete(`/v1/condominiums/${condo.id}/units/${id}`),
    onSuccess: () => {
      toast.success(t('toast.deleted'))
      qc.invalidateQueries({ queryKey: ['units', condo.id] })
    },
    onError: () => toast.error(t('toast.error')),
  })

  const openUnitCreate = () => {
    unitForm.reset({ floor: 0, type: 'apartment', occupancyStatus: 'vacant' })
    setUnitSheet({ open: true, editing: null })
  }

  const openUnitEdit = (unit: Unit) => {
    unitForm.reset({
      number: unit.number,
      block: unit.block ?? '',
      floor: unit.floor,
      type: unit.type,
      occupancyStatus: unit.occupancyStatus,
    })
    setUnitSheet({ open: true, editing: unit })
  }

  const onUnitSubmit = (values: UnitFormValues) => {
    if (unitSheet.editing) {
      updateUnitMutation.mutate({ id: unitSheet.editing.id, data: values })
    } else {
      createUnitMutation.mutate(values)
    }
  }

  const unitTypeValue = unitForm.watch('type')
  const occupancyStatusValue = unitForm.watch('occupancyStatus')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant={condo.status === 'active' ? 'success' : 'secondary'}>
          {t(`common.${condo.status}`)}
        </Badge>
        <Badge variant="outline">{t(`condominiums.type.${condo.type}`)}</Badge>
        <span className="text-sm text-muted-foreground">
          {condo.address.city}/{condo.address.state}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {condo.address.street}, {condo.address.number} — {condo.address.neighborhood}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: t('condominiums.detail.totalUnits'), value: condo.numUnits },
          { label: 'Blocks', value: blocks.length },
          { label: 'Units (API)', value: units.length },
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

      <Tabs defaultValue="blocks">
        <TabsList>
          <TabsTrigger value="blocks">{t('condominiums.detail.tabs.blocks')}</TabsTrigger>
          <TabsTrigger value="units">{t('condominiums.detail.tabs.units')}</TabsTrigger>
          <TabsTrigger value="docs">{t('condominiums.detail.tabs.documents')}</TabsTrigger>
        </TabsList>

        {/* ── Blocks tab ─────────────────────────────────────────────────────── */}
        <TabsContent value="blocks" className="mt-3 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={openBlockCreate}>
              <Plus className="h-3 w-3 mr-1" />
              {t('common.new')}
            </Button>
          </div>
          {blocksLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {t('common.emptyState')}
            </p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between px-4 py-2.5 border-b last:border-0 text-sm hover:bg-muted/30"
                >
                  <div>
                    <span className="font-medium">{block.name}</span>
                    {block.description && (
                      <span className="text-muted-foreground ml-2">— {block.description}</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openBlockEdit(block)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteBlockMutation.mutate(block.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Units tab ──────────────────────────────────────────────────────── */}
        <TabsContent value="units" className="mt-3 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={openUnitCreate}>
              <Plus className="h-3 w-3 mr-1" />
              {t('common.new')}
            </Button>
          </div>
          {unitsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : units.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {t('common.emptyState')}
            </p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className="flex items-center justify-between px-4 py-2.5 border-b last:border-0 text-sm hover:bg-muted/30"
                >
                  <div>
                    <span className="font-medium">
                      {unit.block ? `${unit.block} - ` : ''}{unit.number}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {t(`condominiums.unit.type.${unit.type}`, unit.type)} ·{' '}
                      {t(`condominiums.unit.occupancy.${unit.occupancyStatus}`, unit.occupancyStatus)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openUnitEdit(unit)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteUnitMutation.mutate(unit.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Documents tab ──────────────────────────────────────────────────── */}
        <TabsContent value="docs" className="mt-3">
          <p className="text-sm text-muted-foreground">{t('common.emptyState')}</p>
        </TabsContent>
      </Tabs>

      {/* ── Block Sheet ──────────────────────────────────────────────────────── */}
      <Sheet
        open={blockSheet.open}
        onOpenChange={(open) => !open && setBlockSheet({ open: false, editing: null })}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {blockSheet.editing ? t('common.edit') : t('common.new')} Block
            </SheetTitle>
          </SheetHeader>
          <form
            onSubmit={blockForm.handleSubmit(onBlockSubmit)}
            className="mt-6 space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="blockName">{t('common.name')} *</Label>
              <Input id="blockName" {...blockForm.register('name')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="blockDesc">Description</Label>
              <Input id="blockDesc" {...blockForm.register('description')} />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={createBlockMutation.isPending || updateBlockMutation.isPending}
            >
              {(createBlockMutation.isPending || updateBlockMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {t('common.save')}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* ── Unit Sheet ───────────────────────────────────────────────────────── */}
      <Sheet
        open={unitSheet.open}
        onOpenChange={(open) => !open && setUnitSheet({ open: false, editing: null })}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {unitSheet.editing ? t('common.edit') : t('common.new')} Unit
            </SheetTitle>
            <SheetDescription>
              Unit fields: number, block, floor, type, occupancy status.
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={unitForm.handleSubmit(onUnitSubmit)}
            className="mt-6 space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="unitNumber">{t('residents.fields.unit')} *</Label>
                <Input id="unitNumber" {...unitForm.register('number')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="unitBlock">{t('residents.fields.block')}</Label>
                <Input id="unitBlock" {...unitForm.register('block')} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="unitFloor">Floor</Label>
              <Input id="unitFloor" type="number" {...unitForm.register('floor')} />
            </div>
            <div className="space-y-1">
              <Label>Type *</Label>
              <Select
                value={unitTypeValue}
                onValueChange={(v) =>
                  unitForm.setValue('type', v as UnitFormValues['type'], { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['apartment', 'office', 'store', 'parking'] as const).map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Occupancy *</Label>
              <Select
                value={occupancyStatusValue}
                onValueChange={(v) =>
                  unitForm.setValue('occupancyStatus', v as UnitFormValues['occupancyStatus'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['owned', 'rented', 'vacant'] as const).map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={createUnitMutation.isPending || updateUnitMutation.isPending}
            >
              {(createUnitMutation.isPending || updateUnitMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {t('common.save')}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
