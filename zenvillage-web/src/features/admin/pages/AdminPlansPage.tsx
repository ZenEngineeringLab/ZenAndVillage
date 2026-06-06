import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Ban, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Checkbox } from '@/shared/components/ui/checkbox'
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
import { AdminGuard } from '../components/AdminGuard'

interface Plan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  maxCondos: number
  maxUnitsTotal: number
  maxAdminUsers: number
  dataRetentionMonths: number
  supportLevel: 'basic' | 'priority' | 'dedicated'
  apiAccess: boolean
  status: 'active' | 'discontinued'
  public: boolean
  createdAt: string
}

const planSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  monthlyPrice: z.coerce.number().min(0),
  annualPrice: z.coerce.number().min(0),
  maxCondos: z.coerce.number().int().min(1),
  maxUnitsTotal: z.coerce.number().int().min(1),
  maxAdminUsers: z.coerce.number().int().min(1),
  dataRetentionMonths: z.coerce.number().int().min(1),
  supportLevel: z.enum(['basic', 'priority', 'dedicated']),
  apiAccess: z.boolean(),
  public: z.boolean(),
})
type PlanFormValues = z.infer<typeof planSchema>

type SheetMode = 'create' | 'edit' | 'discontinue' | null

export function AdminPlansPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [sheetMode, setSheetMode] = useState<SheetMode>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      const res = await httpClient.get('/v1/admin/plans')
      const body = res.data?.data ?? res.data
      return Array.isArray(body) ? body : body?.items ?? []
    },
    staleTime: 30_000,
  })

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
    useForm<z.input<typeof planSchema>, unknown, PlanFormValues>({
      resolver: zodResolver(planSchema),
      defaultValues: {
        apiAccess: false,
        public: true,
        supportLevel: 'basic',
      },
    })

  const supportLevelValue = watch('supportLevel')
  const apiAccessValue = watch('apiAccess')
  const publicValue = watch('public')

  const createMutation = useMutation({
    mutationFn: async (data: PlanFormValues) => {
      await httpClient.post('/v1/plans', data)
    },
    onSuccess: () => {
      toast.success(t('onboarding.admin.plans.createSuccess'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      closeSheet()
    },
    onError: (err: any) => toast.error(err?.message ?? t('toast.error')),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PlanFormValues> }) => {
      await httpClient.patch(`/v1/plans/${id}`, data)
    },
    onSuccess: () => {
      toast.success(t('onboarding.admin.plans.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      closeSheet()
    },
    onError: (err: any) => toast.error(err?.message ?? t('toast.error')),
  })

  const discontinueMutation = useMutation({
    mutationFn: async (id: string) => {
      await httpClient.post(`/v1/plans/${id}/discontinue`)
    },
    onSuccess: () => {
      toast.success(t('onboarding.admin.plans.discontinueSuccess'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      closeSheet()
    },
    onError: (err: any) => toast.error(err?.message ?? t('toast.error')),
  })

  const openCreate = () => {
    reset({ apiAccess: false, public: true, supportLevel: 'basic' })
    setSelectedPlan(null)
    setSheetMode('create')
  }

  const openEdit = (plan: Plan) => {
    setSelectedPlan(plan)
    reset({
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
      maxCondos: plan.maxCondos,
      maxUnitsTotal: plan.maxUnitsTotal,
      maxAdminUsers: plan.maxAdminUsers,
      dataRetentionMonths: plan.dataRetentionMonths,
      supportLevel: plan.supportLevel,
      apiAccess: plan.apiAccess,
      public: plan.public,
    })
    setSheetMode('edit')
  }

  const openDiscontinue = (plan: Plan) => {
    setSelectedPlan(plan)
    setSheetMode('discontinue')
  }

  const closeSheet = () => {
    setSheetMode(null)
    setSelectedPlan(null)
  }

  const onSubmit = (values: PlanFormValues) => {
    if (sheetMode === 'create') {
      createMutation.mutate(values)
    } else if (sheetMode === 'edit' && selectedPlan) {
      updateMutation.mutate({ id: selectedPlan.id, data: values })
    }
  }

  const handleDiscontinue = () => {
    if (selectedPlan) discontinueMutation.mutate(selectedPlan.id)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <AdminGuard>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('onboarding.admin.plans.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('onboarding.admin.plans.subtitle')}
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {t('onboarding.admin.plans.new')}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : plans.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            {t('onboarding.admin.plans.empty')}
          </p>
        ) : (
          <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {['name', 'monthlyPrice', 'annualPrice', 'maxCondos', 'status', 'public', 'actions'].map(
                    (col) => (
                      <th
                        key={col}
                        className="text-left px-4 py-3 font-medium text-muted-foreground"
                      >
                        {t(`onboarding.admin.plans.columns.${col}`)}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className={`hover:bg-muted/30 transition-colors ${
                      plan.status === 'discontinued' ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">{plan.name}</td>
                    <td className="px-4 py-3">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                      }).format(plan.monthlyPrice)}
                    </td>
                    <td className="px-4 py-3">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                      }).format(plan.annualPrice)}
                    </td>
                    <td className="px-4 py-3">{plan.maxCondos}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          plan.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {t(`onboarding.admin.plans.status.${plan.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {plan.public ? (
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {plan.status === 'active' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(plan)}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              {t('onboarding.admin.plans.edit')}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openDiscontinue(plan)}
                            >
                              <Ban className="h-3 w-3 mr-1" />
                              {t('onboarding.admin.plans.discontinue')}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Sheet */}
      <Sheet
        open={sheetMode === 'create' || sheetMode === 'edit'}
        onOpenChange={(open) => !open && closeSheet()}
      >
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {sheetMode === 'create'
                ? t('onboarding.admin.plans.new')
                : t('onboarding.admin.plans.edit')}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">{t('onboarding.admin.plans.fields.name')} *</Label>
              <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">{t('onboarding.admin.plans.fields.description')} *</Label>
              <textarea
                id="description"
                className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                {...register('description')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="monthlyPrice">{t('onboarding.admin.plans.fields.monthlyPrice')} *</Label>
                <Input id="monthlyPrice" type="number" step="0.01" {...register('monthlyPrice')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="annualPrice">{t('onboarding.admin.plans.fields.annualPrice')} *</Label>
                <Input id="annualPrice" type="number" step="0.01" {...register('annualPrice')} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="maxCondos">{t('onboarding.admin.plans.fields.maxCondos')} *</Label>
                <Input id="maxCondos" type="number" {...register('maxCondos')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="maxUnitsTotal">{t('onboarding.admin.plans.fields.maxUnitsTotal')} *</Label>
                <Input id="maxUnitsTotal" type="number" {...register('maxUnitsTotal')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="maxAdminUsers">{t('onboarding.admin.plans.fields.maxAdminUsers')} *</Label>
                <Input id="maxAdminUsers" type="number" {...register('maxAdminUsers')} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="dataRetentionMonths">{t('onboarding.admin.plans.fields.dataRetentionMonths')} *</Label>
              <Input id="dataRetentionMonths" type="number" {...register('dataRetentionMonths')} />
            </div>
            <div className="space-y-1">
              <Label>{t('onboarding.admin.plans.fields.supportLevel')} *</Label>
              <Select
                value={supportLevelValue}
                onValueChange={(v) =>
                  setValue('supportLevel', v as 'basic' | 'priority' | 'dedicated', {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['basic', 'priority', 'dedicated'] as const).map((level) => (
                    <SelectItem key={level} value={level}>
                      {t(`onboarding.admin.plans.supportLevel.${level}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="apiAccess"
                checked={apiAccessValue}
                onCheckedChange={(checked) => setValue('apiAccess', !!checked)}
              />
              <Label htmlFor="apiAccess" className="cursor-pointer">
                {t('onboarding.admin.plans.fields.apiAccess')}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="public"
                checked={publicValue}
                onCheckedChange={(checked) => setValue('public', !!checked)}
              />
              <Label htmlFor="public" className="cursor-pointer">
                {t('onboarding.admin.plans.fields.public')}
              </Label>
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {sheetMode === 'create' ? t('onboarding.admin.plans.new') : t('common.save')}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Discontinue confirmation Sheet */}
      <Sheet
        open={sheetMode === 'discontinue'}
        onOpenChange={(open) => !open && closeSheet()}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t('onboarding.admin.plans.discontinue')}</SheetTitle>
            <SheetDescription>{t('onboarding.admin.plans.discontinueConfirm')}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex flex-col gap-3">
            <Button
              variant="destructive"
              onClick={handleDiscontinue}
              disabled={discontinueMutation.isPending}
            >
              {discontinueMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {t('onboarding.admin.plans.discontinue')}
            </Button>
            <Button variant="outline" onClick={closeSheet}>
              {t('common.cancel')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </AdminGuard>
  )
}
