import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
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
import { httpClient } from '@/shared/api/http-client'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { OnboardingStatus } from '@/features/auth/store/auth.store'

interface Plan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  maxCondos: number
  maxUnitsTotal: number
  maxAdminUsers: number
  enabledModules: string[]
  dataRetentionMonths: number
  supportLevel: 'basic' | 'priority' | 'dedicated'
  apiAccess: boolean
  status: 'active' | 'discontinued'
  public: boolean
}

const companySchema = z.object({
  tenantName: z.string().min(2),
  tenantType: z.enum(['management_company', 'independent_condo']),
  taxId: z.string().min(14),
  contactEmail: z.string().email(),
  phone: z.string().optional(),
  responsibleName: z.string().optional(),
  responsibleEmail: z.string().email().optional().or(z.literal('')),
})
type CompanyFormValues = z.infer<typeof companySchema>

export function PlanSelectionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, setUser, activeTenantId } = useAuthStore()

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [step, setStep] = useState<'plan' | 'company'>('plan')
  const [submitting, setSubmitting] = useState(false)

  const { data: plans = [], isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ['plans', 'public'],
    queryFn: async () => {
      const res = await httpClient.get('/v1/plans')
      const body = res.data?.data ?? res.data
      return Array.isArray(body) ? body : body?.items ?? []
    },
    staleTime: 5 * 60 * 1000,
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyFormValues>({ resolver: zodResolver(companySchema) })

  const tenantTypeValue = watch('tenantType')

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId)
    setStep('company')
  }

  const onSubmit = async (values: CompanyFormValues) => {
    if (!selectedPlanId || !user) return
    setSubmitting(true)
    try {
      await httpClient.post('/v1/subscriptions', {
        cognitoSub: user.id,
        planId: selectedPlanId,
        billingCycle,
        ...values,
      })

      // Optimistically advance the onboarding status in the local store.
      // The pre-token Lambda will confirm this on the next token refresh.
      setUser(
        { ...user, onboardingStatus: 'pending_approval' as OnboardingStatus },
        activeTenantId ?? '',
      )
      navigate('/', { replace: true })
    } catch (err: any) {
      toast.error(err?.message ?? t('onboarding.planSelection.submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <img src="/logo-icon.svg" alt="ZenAndVillage" className="h-10 w-10 mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">
            {t('onboarding.planSelection.title')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('onboarding.planSelection.subtitle')}
          </p>
        </div>

        {step === 'plan' && (
          <>
            {/* Billing cycle toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-lg border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('onboarding.planSelection.monthly')}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === 'annual'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('onboarding.planSelection.annual')}
                </button>
              </div>
            </div>

            {/* Plan cards */}
            {plansLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => {
                  const price =
                    billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice
                  const annualSaving = Math.round(
                    (1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100,
                  )

                  return (
                    <div
                      key={plan.id}
                      className="rounded-xl border bg-card p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>

                        <div className="mt-4">
                          <span className="text-3xl font-bold">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                              minimumFractionDigits: 0,
                            }).format(price)}
                          </span>
                          <span className="text-muted-foreground text-sm ml-1">
                            {billingCycle === 'monthly'
                              ? t('onboarding.planSelection.perMonth')
                              : t('onboarding.planSelection.perYear')}
                          </span>
                          {billingCycle === 'annual' && annualSaving > 0 && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                              {t('onboarding.planSelection.annualDiscount', {
                                percent: annualSaving,
                              })}
                            </span>
                          )}
                        </div>

                        <ul className="mt-5 space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            {t('onboarding.planSelection.maxCondos', { count: plan.maxCondos })}
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            {t('onboarding.planSelection.maxUnits', { count: plan.maxUnitsTotal })}
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            {t('onboarding.planSelection.maxAdmins', {
                              count: plan.maxAdminUsers,
                            })}
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            {t(`onboarding.planSelection.supportLabel.${plan.supportLevel}`)}
                          </li>
                          {plan.apiAccess && (
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-primary flex-shrink-0" />
                              {t('onboarding.planSelection.apiAccess')}
                            </li>
                          )}
                        </ul>
                      </div>

                      <Button
                        className="mt-6 w-full"
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        {t('onboarding.planSelection.selectPlan')}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {step === 'company' && (
          <div className="max-w-lg mx-auto bg-card border rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-1">
              {t('onboarding.planSelection.companyInfoTitle')}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t('onboarding.planSelection.companyInfoSubtitle')}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="tenantName">
                  {t('onboarding.planSelection.tenantName')} *
                </Label>
                <Input
                  id="tenantName"
                  placeholder={t('onboarding.planSelection.tenantNamePlaceholder')}
                  {...register('tenantName')}
                  aria-invalid={!!errors.tenantName}
                />
                {errors.tenantName && (
                  <p className="text-xs text-destructive">{errors.tenantName.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>{t('onboarding.planSelection.tenantType')} *</Label>
                <Select
                  value={tenantTypeValue}
                  onValueChange={(v) =>
                    setValue('tenantType', v as 'management_company' | 'independent_condo', {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger aria-invalid={!!errors.tenantType}>
                    <SelectValue placeholder={t('onboarding.planSelection.tenantType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="management_company">
                      {t('onboarding.planSelection.tenantTypeManagement')}
                    </SelectItem>
                    <SelectItem value="independent_condo">
                      {t('onboarding.planSelection.tenantTypeIndependent')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.tenantType && (
                  <p className="text-xs text-destructive">{errors.tenantType.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="taxId">{t('onboarding.planSelection.taxId')} *</Label>
                <Input
                  id="taxId"
                  placeholder={t('onboarding.planSelection.taxIdPlaceholder')}
                  {...register('taxId')}
                  aria-invalid={!!errors.taxId}
                />
                {errors.taxId && (
                  <p className="text-xs text-destructive">{errors.taxId.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="contactEmail">
                  {t('onboarding.planSelection.contactEmail')} *
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...register('contactEmail')}
                  aria-invalid={!!errors.contactEmail}
                />
                {errors.contactEmail && (
                  <p className="text-xs text-destructive">{errors.contactEmail.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">{t('onboarding.planSelection.phone')}</Label>
                <Input id="phone" type="tel" {...register('phone')} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="responsibleName">
                  {t('onboarding.planSelection.responsibleName')}
                </Label>
                <Input id="responsibleName" {...register('responsibleName')} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('plan')}
                >
                  {t('onboarding.planSelection.back')}
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {submitting
                    ? t('onboarding.planSelection.submitting')
                    : t('onboarding.planSelection.submitRequest')}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
