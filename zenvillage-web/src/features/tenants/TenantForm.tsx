import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import type { Tenant } from '@/shared/types/entities'

const schema = z.object({
  name: z.string().min(1),
  type: z.enum(['property_manager', 'independent_condominium']),
  cnpj: z.string().min(1),
  contactEmail: z.string().email(),
  phone: z.string(),
  responsibleName: z.string().min(1),
  responsibleEmail: z.string().email(),
  plan: z.enum(['starter', 'pro', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']),
  status: z.enum(['active', 'trial', 'suspended', 'inactive']),
})

type FormData = z.infer<typeof schema>

interface TenantFormProps {
  initialData?: Partial<Tenant>
  onSave: (data: Partial<Tenant>) => void | Promise<void>
  onCancel: () => void
}

export function TenantForm({ initialData, onSave, onCancel }: TenantFormProps) {
  const { t } = useTranslation()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? '',
      type: initialData?.type ?? 'property_manager',
      cnpj: initialData?.cnpj ?? '',
      contactEmail: initialData?.contactEmail ?? '',
      phone: initialData?.phone ?? '',
      responsibleName: initialData?.responsibleName ?? '',
      responsibleEmail: initialData?.responsibleEmail ?? '',
      plan: initialData?.plan ?? 'starter',
      billingCycle: initialData?.billingCycle ?? 'monthly',
      status: initialData?.status ?? 'active',
    },
  })

  const Field = ({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label} <span className="text-destructive">*</span></Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <Field label={t('tenants.fields.name')} id="name" error={errors.name && t('common.required')}>
        <Input id="name" {...register('name')} />
      </Field>

      <Field label={t('tenants.fields.type')} id="type" error={errors.type && t('common.required')}>
        <Select defaultValue={watch('type')} onValueChange={(v) => setValue('type', v as FormData['type'])}>
          <SelectTrigger id="type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="property_manager">{t('tenants.type.property_manager')}</SelectItem>
            <SelectItem value="independent_condominium">{t('tenants.type.independent_condominium')}</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label={t('tenants.fields.cnpj')} id="cnpj" error={errors.cnpj && t('common.required')}>
        <Input id="cnpj" {...register('cnpj')} placeholder="00.000.000/0001-00" />
      </Field>

      <Field label={t('tenants.fields.contactEmail')} id="contactEmail" error={errors.contactEmail && t('common.required')}>
        <Input id="contactEmail" type="email" {...register('contactEmail')} />
      </Field>

      <Field label={t('tenants.fields.phone')} id="phone">
        <Input id="phone" {...register('phone')} />
      </Field>

      <Field label={t('tenants.fields.responsibleName')} id="responsibleName" error={errors.responsibleName && t('common.required')}>
        <Input id="responsibleName" {...register('responsibleName')} />
      </Field>

      <Field label={t('tenants.fields.responsibleEmail')} id="responsibleEmail" error={errors.responsibleEmail && t('common.required')}>
        <Input id="responsibleEmail" type="email" {...register('responsibleEmail')} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t('tenants.fields.plan')} id="plan">
          <Select defaultValue={watch('plan')} onValueChange={(v) => setValue('plan', v as FormData['plan'])}>
            <SelectTrigger id="plan"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="starter">{t('tenants.plan.starter')}</SelectItem>
              <SelectItem value="pro">{t('tenants.plan.pro')}</SelectItem>
              <SelectItem value="enterprise">{t('tenants.plan.enterprise')}</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label={t('tenants.fields.billingCycle')} id="billingCycle">
          <Select defaultValue={watch('billingCycle')} onValueChange={(v) => setValue('billingCycle', v as FormData['billingCycle'])}>
            <SelectTrigger id="billingCycle"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">{t('tenants.fields.billingCycleMonthly')}</SelectItem>
              <SelectItem value="annual">{t('tenants.fields.billingCycleAnnual')}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label={t('tenants.fields.status')} id="status">
        <Select defaultValue={watch('status')} onValueChange={(v) => setValue('status', v as FormData['status'])}>
          <SelectTrigger id="status"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(['active', 'trial', 'suspended', 'inactive'] as const).map((s) => (
              <SelectItem key={s} value={s}>{t(`tenants.status.${s}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit">{t('common.save')}</Button>
      </div>
    </form>
  )
}
