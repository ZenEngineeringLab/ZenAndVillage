import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { seedCondominiums } from '@/shared/data/seed'
import type { Resident } from '@/shared/types/entities'

const schema = z.object({
  name: z.string().min(1),
  cpf: z.string().min(1),
  rg: z.string(),
  email: z.string().email().or(z.literal('')),
  phone: z.string().min(1),
  secondaryPhone: z.string(),
  birthdate: z.string(),
  condominiumId: z.string().min(1),
  block: z.string(),
  unit: z.string().min(1),
  occupancyType: z.enum(['owner', 'tenant']),
  acquisitionDate: z.string(),
  leaseStart: z.string(),
  leaseEnd: z.string(),
  leaseUrl: z.string(),
  licensePlate: z.string(),
  vehicleModel: z.string(),
  isSyndic: z.boolean(),
  isCouncilMember: z.boolean(),
  financialStatus: z.enum(['current', 'defaulting']),
})

type FormData = z.infer<typeof schema>

interface Props {
  initialData?: Partial<Resident>
  onSave: (data: Partial<Resident>) => void
  onCancel: () => void
}

export function ResidentForm({ initialData, onSave, onCancel }: Props) {
  const { t } = useTranslation()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? '',
      cpf: initialData?.cpf ?? '',
      rg: initialData?.rg ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      secondaryPhone: initialData?.secondaryPhone ?? '',
      birthdate: initialData?.birthdate ?? '',
      condominiumId: initialData?.condominiumId ?? '',
      block: initialData?.block ?? '',
      unit: initialData?.unit ?? '',
      occupancyType: initialData?.occupancyType ?? 'owner',
      acquisitionDate: initialData?.acquisitionDate ?? '',
      leaseStart: initialData?.leaseStart ?? '',
      leaseEnd: initialData?.leaseEnd ?? '',
      leaseUrl: initialData?.leaseUrl ?? '',
      licensePlate: initialData?.licensePlate ?? '',
      vehicleModel: initialData?.vehicleModel ?? '',
      isSyndic: initialData?.isSyndic ?? false,
      isCouncilMember: initialData?.isCouncilMember ?? false,
      financialStatus: initialData?.financialStatus ?? 'current',
    },
  })

  const occupancyType = watch('occupancyType')
  const isSyndic = watch('isSyndic')
  const isCouncilMember = watch('isCouncilMember')

  const onSubmit = (data: FormData) => {
    const condo = seedCondominiums.find((c) => c.id === data.condominiumId)
    onSave({
      ...data,
      condominiumName: condo?.name ?? '',
      tenantId: 't1',
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
      <Tabs defaultValue="personal">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="personal">{t('residents.tabs.personal')}</TabsTrigger>
          <TabsTrigger value="unit">{t('residents.tabs.unit')}</TabsTrigger>
          <TabsTrigger value="vehicle">{t('residents.tabs.vehicle')}</TabsTrigger>
          <TabsTrigger value="profile">{t('residents.tabs.profile')}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <F label={t('residents.fields.name')} id="name" req err={!!errors.name}>
            <Input id="name" {...register('name')} />
          </F>
          <div className="grid grid-cols-2 gap-2">
            <F label={t('residents.fields.cpf')} id="cpf" req err={!!errors.cpf}>
              <Input id="cpf" {...register('cpf')} placeholder="000.000.000-00" />
            </F>
            <F label={t('residents.fields.rg')} id="rg">
              <Input id="rg" {...register('rg')} />
            </F>
          </div>
          <F label={t('residents.fields.email')} id="email" req err={!!errors.email}>
            <Input id="email" type="email" {...register('email')} />
          </F>
          <div className="grid grid-cols-2 gap-2">
            <F label={t('residents.fields.phone')} id="phone" req err={!!errors.phone}>
              <Input id="phone" {...register('phone')} />
            </F>
            <F label={t('residents.fields.secondaryPhone')} id="secondaryPhone">
              <Input id="secondaryPhone" {...register('secondaryPhone')} />
            </F>
          </div>
          <F label={t('residents.fields.birthdate')} id="birthdate">
            <Input id="birthdate" type="date" {...register('birthdate')} />
          </F>
        </TabsContent>

        <TabsContent value="unit" className="space-y-4">
          <F label={t('residents.fields.condominium')} id="condominiumId" req err={!!errors.condominiumId}>
            <Select defaultValue={watch('condominiumId')} onValueChange={(v) => setValue('condominiumId', v)}>
              <SelectTrigger id="condominiumId"><SelectValue /></SelectTrigger>
              <SelectContent>
                {seedCondominiums.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>
          <div className="grid grid-cols-2 gap-2">
            <F label={t('residents.fields.block')} id="block">
              <Input id="block" {...register('block')} />
            </F>
            <F label={t('residents.fields.unit')} id="unit" req err={!!errors.unit}>
              <Input id="unit" {...register('unit')} />
            </F>
          </div>
          <F label={t('residents.fields.occupancyType')} id="occupancyType" req>
            <Select defaultValue={occupancyType} onValueChange={(v) => setValue('occupancyType', v as 'owner' | 'tenant')}>
              <SelectTrigger id="occupancyType"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">{t('residents.type.owner')}</SelectItem>
                <SelectItem value="tenant">{t('residents.type.tenant')}</SelectItem>
              </SelectContent>
            </Select>
          </F>
          {occupancyType === 'owner' && (
            <F label={t('residents.fields.acquisitionDate')} id="acquisitionDate">
              <Input id="acquisitionDate" type="date" {...register('acquisitionDate')} />
            </F>
          )}
          {occupancyType === 'tenant' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <F label={t('residents.fields.leaseStart')} id="leaseStart">
                  <Input id="leaseStart" type="date" {...register('leaseStart')} />
                </F>
                <F label={t('residents.fields.leaseEnd')} id="leaseEnd">
                  <Input id="leaseEnd" type="date" {...register('leaseEnd')} />
                </F>
              </div>
              <F label={t('residents.fields.leaseUrl')} id="leaseUrl">
                <Input id="leaseUrl" {...register('leaseUrl')} />
              </F>
            </>
          )}
        </TabsContent>

        <TabsContent value="vehicle" className="space-y-4">
          <F label={t('residents.fields.licensePlate')} id="licensePlate">
            <Input id="licensePlate" {...register('licensePlate')} />
          </F>
          <F label={t('residents.fields.vehicleModel')} id="vehicleModel">
            <Input id="vehicleModel" {...register('vehicleModel')} />
          </F>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch id="isSyndic" checked={isSyndic} onCheckedChange={(v) => setValue('isSyndic', v)} />
            <Label htmlFor="isSyndic">{t('residents.fields.isSyndic')}</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="isCouncilMember" checked={isCouncilMember} onCheckedChange={(v) => setValue('isCouncilMember', v)} />
            <Label htmlFor="isCouncilMember">{t('residents.fields.isCouncilMember')}</Label>
          </div>
          <F label={t('residents.fields.financialStatus')} id="financialStatus">
            <Select defaultValue={watch('financialStatus')} onValueChange={(v) => setValue('financialStatus', v as 'current' | 'defaulting')}>
              <SelectTrigger id="financialStatus"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="current">{t('residents.financialStatus.current')}</SelectItem>
                <SelectItem value="defaulting">{t('residents.financialStatus.defaulting')}</SelectItem>
              </SelectContent>
            </Select>
          </F>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit">{t('common.save')}</Button>
      </div>
    </form>
  )
}
