import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import type { PropertyManager } from '@/shared/types/entities'

const schema = z.object({
  legalName: z.string().min(1),
  tradeName: z.string().min(1),
  cnpj: z.string().min(1),
  creci: z.string(),
  email: z.string().email().or(z.literal('')),
  phone: z.string(),
  website: z.string(),
  zip: z.string().min(1),
  street: z.string().min(1),
  number: z.string().min(1),
  complement: z.string(),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  whiteLabel: z.boolean(),
  platformName: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  customDomain: z.string(),
  customSenderEmail: z.string(),
})

type FormData = z.infer<typeof schema>

interface Props {
  initialData?: Partial<PropertyManager>
  onSave: (data: Partial<PropertyManager>) => void
  onCancel: () => void
}

export function PropertyManagerForm({ initialData, onSave, onCancel }: Props) {
  const { t } = useTranslation()
  const [whiteLabelEnabled, setWhiteLabelEnabled] = useState(initialData?.whiteLabel ?? false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      legalName: initialData?.legalName ?? '',
      tradeName: initialData?.tradeName ?? '',
      cnpj: initialData?.cnpj ?? '',
      creci: initialData?.creci ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      website: initialData?.website ?? '',
      zip: initialData?.address?.zip ?? '',
      street: initialData?.address?.street ?? '',
      number: initialData?.address?.number ?? '',
      complement: initialData?.address?.complement ?? '',
      neighborhood: initialData?.address?.neighborhood ?? '',
      city: initialData?.address?.city ?? '',
      state: initialData?.address?.state ?? '',
      whiteLabel: whiteLabelEnabled,
      platformName: initialData?.whiteLabelConfig?.platformName ?? '',
      primaryColor: initialData?.whiteLabelConfig?.primaryColor ?? '',
      secondaryColor: initialData?.whiteLabelConfig?.secondaryColor ?? '',
      customDomain: initialData?.whiteLabelConfig?.customDomain ?? '',
      customSenderEmail: initialData?.whiteLabelConfig?.customSenderEmail ?? '',
    },
  })

  const onSubmit = (data: FormData) => {
    onSave({
      legalName: data.legalName,
      tradeName: data.tradeName,
      cnpj: data.cnpj,
      creci: data.creci,
      email: data.email,
      phone: data.phone,
      website: data.website,
      status: 'active',
      whiteLabel: whiteLabelEnabled,
      address: {
        zip: data.zip, street: data.street, number: data.number,
        complement: data.complement, neighborhood: data.neighborhood,
        city: data.city, state: data.state,
      },
      ...(whiteLabelEnabled && {
        whiteLabelConfig: {
          platformName: data.platformName,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          customDomain: data.customDomain,
          customSenderEmail: data.customSenderEmail,
        },
      }),
    })
  }

  const F = ({ label, id, req, err, children }: { label: string; id: string; req?: boolean; err?: boolean; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}{req && <span className="text-destructive ml-1">*</span>}</Label>
      {children}
      {err && <p className="text-xs text-destructive">{t('common.required')}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">{t('propertyManagers.tabs.general')}</TabsTrigger>
          <TabsTrigger value="address">{t('propertyManagers.tabs.address')}</TabsTrigger>
          <TabsTrigger value="whiteLabel">{t('propertyManagers.tabs.whiteLabel')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <F label={t('propertyManagers.fields.legalName')} id="legalName" req err={!!errors.legalName}>
            <Input id="legalName" {...register('legalName')} />
          </F>
          <F label={t('propertyManagers.fields.tradeName')} id="tradeName" req err={!!errors.tradeName}>
            <Input id="tradeName" {...register('tradeName')} />
          </F>
          <F label={t('propertyManagers.fields.cnpj')} id="cnpj" req err={!!errors.cnpj}>
            <Input id="cnpj" {...register('cnpj')} placeholder="00.000.000/0001-00" />
          </F>
          <F label={t('propertyManagers.fields.creci')} id="creci">
            <Input id="creci" {...register('creci')} />
          </F>
          <F label={t('propertyManagers.fields.email')} id="email">
            <Input id="email" type="email" {...register('email')} />
          </F>
          <F label={t('propertyManagers.fields.phone')} id="phone">
            <Input id="phone" {...register('phone')} />
          </F>
          <F label={t('propertyManagers.fields.website')} id="website">
            <Input id="website" {...register('website')} />
          </F>
        </TabsContent>

        <TabsContent value="address" className="space-y-4">
          <F label={t('propertyManagers.fields.zip')} id="zip" req err={!!errors.zip}>
            <Input id="zip" {...register('zip')} />
          </F>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <F label={t('propertyManagers.fields.street')} id="street" req err={!!errors.street}>
                <Input id="street" {...register('street')} />
              </F>
            </div>
            <F label={t('propertyManagers.fields.number')} id="number" req err={!!errors.number}>
              <Input id="number" {...register('number')} />
            </F>
          </div>
          <F label={t('propertyManagers.fields.complement')} id="complement">
            <Input id="complement" {...register('complement')} />
          </F>
          <F label={t('propertyManagers.fields.neighborhood')} id="neighborhood" req err={!!errors.neighborhood}>
            <Input id="neighborhood" {...register('neighborhood')} />
          </F>
          <div className="grid grid-cols-2 gap-2">
            <F label={t('propertyManagers.fields.city')} id="city" req err={!!errors.city}>
              <Input id="city" {...register('city')} />
            </F>
            <F label={t('propertyManagers.fields.state')} id="state" req err={!!errors.state}>
              <Input id="state" {...register('state')} maxLength={2} />
            </F>
          </div>
        </TabsContent>

        <TabsContent value="whiteLabel" className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch id="wl" checked={whiteLabelEnabled} onCheckedChange={setWhiteLabelEnabled} />
            <Label htmlFor="wl">{t('propertyManagers.fields.whiteLabelEnabled')}</Label>
          </div>
          {whiteLabelEnabled && (
            <>
              <F label={t('propertyManagers.fields.platformName')} id="platformName">
                <Input id="platformName" {...register('platformName')} />
              </F>
              <div className="grid grid-cols-2 gap-2">
                <F label={t('propertyManagers.fields.primaryColor')} id="primaryColor">
                  <Input id="primaryColor" {...register('primaryColor')} placeholder="#0d9488" />
                </F>
                <F label={t('propertyManagers.fields.secondaryColor')} id="secondaryColor">
                  <Input id="secondaryColor" {...register('secondaryColor')} placeholder="#065f46" />
                </F>
              </div>
              <F label={t('propertyManagers.fields.customDomain')} id="customDomain">
                <Input id="customDomain" {...register('customDomain')} placeholder="app.yourplatform.com" />
              </F>
              <F label={t('propertyManagers.fields.customSenderEmail')} id="customSenderEmail">
                <Input id="customSenderEmail" {...register('customSenderEmail')} placeholder="noreply@yourplatform.com" />
              </F>
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit">{t('common.save')}</Button>
      </div>
    </form>
  )
}
