import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Building2 } from 'lucide-react'
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

const step1Schema = z.object({
  name: z.string().min(2),
  type: z.enum(['residential', 'commercial', 'mixed']),
  taxId: z.string().min(14),
})
type Step1Values = z.infer<typeof step1Schema>

const step2Schema = z.object({
  zipCode: z.string().min(8),
  street: z.string().min(2),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2).max(2),
})
type Step2Values = z.infer<typeof step2Schema>

type Step = 'basic' | 'address'

export function FirstCondoWizardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, setUser, activeTenantId } = useAuthStore()

  const [step, setStep] = useState<Step>('basic')
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [skipping, setSkipping] = useState(false)

  const step1Form = useForm<Step1Values>({ resolver: zodResolver(step1Schema) })
  const step2Form = useForm<Step2Values>({ resolver: zodResolver(step2Schema) })

  const typeValue = step1Form.watch('type')

  const onStep1Submit = (values: Step1Values) => {
    setStep1Data(values)
    setStep('address')
  }

  const onStep2Submit = async (addressValues: Step2Values) => {
    if (!step1Data || !user) return
    setSubmitting(true)
    try {
      await httpClient.post('/v1/condominiums', {
        ...step1Data,
        address: addressValues,
      })

      await completeOnboarding()
    } catch (err: any) {
      toast.error(err?.message ?? t('onboarding.firstCondoWizard.finishError'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = async () => {
    setSkipping(true)
    try {
      await completeOnboarding()
    } finally {
      setSkipping(false)
    }
  }

  const completeOnboarding = async () => {
    if (!user) return
    try {
      // Mark onboarding as complete via the Users API.
      // The path param is the Cognito sub (cognitoSub), not the internal UUID.
      await httpClient.patch(`/v1/users/${user.cognitoSub}/onboarding-status`, {
        onboardingStatus: 'complete',
      })
    } catch {
      // Non-fatal — update the store anyway and let the token refresh correct it
    }

    // Update the local store so AuthGuard stops redirecting
    setUser(
      { ...user, onboardingStatus: 'complete' as OnboardingStatus },
      activeTenantId ?? '',
    )
    navigate('/', { replace: true })
  }

  const stepIndex = step === 'basic' ? 0 : 1
  const steps = [
    t('onboarding.firstCondoWizard.stepBasic'),
    t('onboarding.firstCondoWizard.stepAddress'),
  ]

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">{t('onboarding.firstCondoWizard.title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('onboarding.firstCondoWizard.subtitle')}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((label, idx) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  idx <= stepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {idx + 1}
              </div>
              <span
                className={`text-sm ${
                  idx === stepIndex ? 'font-medium' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
              {idx < steps.length - 1 && (
                <div className="w-8 h-px bg-border mx-1" />
              )}
            </div>
          ))}
        </div>

        <div className="bg-card border rounded-xl p-8 shadow-sm">
          {/* Step 1: Basic info */}
          {step === 'basic' && (
            <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">{t('onboarding.firstCondoWizard.condoName')} *</Label>
                <Input
                  id="name"
                  placeholder={t('onboarding.firstCondoWizard.condoNamePlaceholder')}
                  {...step1Form.register('name')}
                  aria-invalid={!!step1Form.formState.errors.name}
                />
                {step1Form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {step1Form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>{t('onboarding.firstCondoWizard.condoType')} *</Label>
                <Select
                  value={typeValue}
                  onValueChange={(v) =>
                    step1Form.setValue('type', v as 'residential' | 'commercial' | 'mixed', {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger aria-invalid={!!step1Form.formState.errors.type}>
                    <SelectValue placeholder={t('onboarding.firstCondoWizard.condoType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">
                      {t('onboarding.firstCondoWizard.typeResidential')}
                    </SelectItem>
                    <SelectItem value="commercial">
                      {t('onboarding.firstCondoWizard.typeCommercial')}
                    </SelectItem>
                    <SelectItem value="mixed">
                      {t('onboarding.firstCondoWizard.typeMixed')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {step1Form.formState.errors.type && (
                  <p className="text-xs text-destructive">
                    {step1Form.formState.errors.type.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="taxId">{t('onboarding.firstCondoWizard.taxId')} *</Label>
                <Input
                  id="taxId"
                  placeholder={t('onboarding.firstCondoWizard.taxIdPlaceholder')}
                  {...step1Form.register('taxId')}
                  aria-invalid={!!step1Form.formState.errors.taxId}
                />
                {step1Form.formState.errors.taxId && (
                  <p className="text-xs text-destructive">
                    {step1Form.formState.errors.taxId.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">
                  {t('onboarding.firstCondoWizard.next')}
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Address */}
          {step === 'address' && (
            <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="zipCode">{t('onboarding.firstCondoWizard.zipCode')} *</Label>
                  <Input
                    id="zipCode"
                    {...step2Form.register('zipCode')}
                    aria-invalid={!!step2Form.formState.errors.zipCode}
                  />
                  {step2Form.formState.errors.zipCode && (
                    <p className="text-xs text-destructive">
                      {step2Form.formState.errors.zipCode.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="number">{t('onboarding.firstCondoWizard.number')} *</Label>
                  <Input
                    id="number"
                    {...step2Form.register('number')}
                    aria-invalid={!!step2Form.formState.errors.number}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="street">{t('onboarding.firstCondoWizard.street')} *</Label>
                <Input
                  id="street"
                  {...step2Form.register('street')}
                  aria-invalid={!!step2Form.formState.errors.street}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="complement">
                    {t('onboarding.firstCondoWizard.complement')}
                  </Label>
                  <Input id="complement" {...step2Form.register('complement')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="neighborhood">
                    {t('onboarding.firstCondoWizard.neighborhood')} *
                  </Label>
                  <Input
                    id="neighborhood"
                    {...step2Form.register('neighborhood')}
                    aria-invalid={!!step2Form.formState.errors.neighborhood}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="city">{t('onboarding.firstCondoWizard.city')} *</Label>
                  <Input
                    id="city"
                    {...step2Form.register('city')}
                    aria-invalid={!!step2Form.formState.errors.city}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">{t('onboarding.firstCondoWizard.state')} *</Label>
                  <Input
                    id="state"
                    maxLength={2}
                    className="uppercase"
                    {...step2Form.register('state')}
                    aria-invalid={!!step2Form.formState.errors.state}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('basic')}
                  disabled={submitting}
                >
                  {t('onboarding.firstCondoWizard.back')}
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {submitting
                    ? t('onboarding.firstCondoWizard.finishing')
                    : t('onboarding.firstCondoWizard.finish')}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Skip option */}
        <div className="text-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={handleSkip}
            disabled={skipping || submitting}
          >
            {skipping && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
            {t('onboarding.firstCondoWizard.skipForNow')}
          </Button>
        </div>
      </div>
    </div>
  )
}
