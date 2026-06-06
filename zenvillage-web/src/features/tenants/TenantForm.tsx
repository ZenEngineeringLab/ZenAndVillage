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
  type: z.enum(['management_company', 'independent_condo']),
  taxId: z.string().min(1),
  contactEmail: z.string().email(),
  phone: z.string(),
  responsibleName: z.string().min(1),
  responsibleEmail: z.string().email(),
  planId: z.string().min(1),
  billingCycle: z.enum(['monthly', 'annual']),
  status: z.enum(['active', 'suspended', 'canceled']),
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
      type: initialData?.type ?? 'management_company',
      taxId: initialData?.taxId ?? '',
      contactEmail: initialData?.contactEmail ?? '',
      phone: initialData?.phone ?? '',
      responsibleName: initialData?.responsibleName ?? '',
      responsibleEmail: initialData?.responsibleEmail ?? '',
      planId: initialData?.planId ?? '',
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
            <SelectItem value="management_company">{t('tenants.type.management_company')}</SelectItem>
            <SelectItem value="independent_condo">{t('tenants.type.independent_condo')}</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label={t('tenants.fields.cnpj')} id="taxId" error={errors.taxId && t('common.required')}>
        <Input id="taxId" {...register('taxId')} placeholder="00.000.000/0001-00" />
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
        <Field label={t('tenants.fields.plan')} id="planId" error={errors.planId && t('common.required')}>
          <Input id="planId" {...register('planId')} />
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
            {(['active', 'suspended', 'canceled'] as const).map((s) => (
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
