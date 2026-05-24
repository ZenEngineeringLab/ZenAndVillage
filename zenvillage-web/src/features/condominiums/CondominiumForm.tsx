import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import type { Condominium } from '@/shared/types/entities'

const schema = z.object({
  name: z.string().min(1),
  cnpj: z.string().min(1),
  type: z.enum(['residential', 'commercial', 'mixed']),
  status: z.enum(['active', 'inactive']),
  zip: z.string().min(1),
  street: z.string().min(1),
  number: z.string().min(1),
  complement: z.string(),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  numUnits: z.coerce.number().min(1),
  numBlocks: z.coerce.number().min(0),
  numFloors: z.coerce.number().min(1),
  totalArea: z.string(),
  inauguratedAt: z.string(),
  propertyManagerId: z.string(),
  syndic: z.string(),
  bylawsUrl: z.string(),
  regulationsUrl: z.string(),
})

type FormData = z.infer<typeof schema>

interface Props {
  initialData?: Partial<Condominium>
  onSave: (data: Partial<Condominium>) => void | Promise<void>
  onCancel: () => void
}

export function CondominiumForm({ initialData, onSave, onCancel }: Props) {
  const { t } = useTranslation()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: {
      name: initialData?.name ?? '',
      cnpj: initialData?.cnpj ?? '',
      type: initialData?.type ?? 'residential',
      status: initialData?.status ?? 'active',
      zip: initialData?.address?.zip ?? '',
      street: initialData?.address?.street ?? '',
      number: initialData?.address?.number ?? '',
      complement: initialData?.address?.complement ?? '',
      neighborhood: initialData?.address?.neighborhood ?? '',
      city: initialData?.address?.city ?? '',
      state: initialData?.address?.state ?? '',
      numUnits: initialData?.numUnits ?? 1,
      numBlocks: initialData?.numBlocks ?? 1,
      numFloors: initialData?.numFloors ?? 1,
      totalArea: initialData?.totalArea ?? '',
      inauguratedAt: initialData?.inauguratedAt ?? '',
      propertyManagerId: initialData?.propertyManagerId ?? '',
      syndic: initialData?.syndic ?? '',
      bylawsUrl: initialData?.bylawsUrl ?? '',
      regulationsUrl: initialData?.regulationsUrl ?? '',
    },
  })

  const onSubmit = (data: FormData) => {
    onSave({
      name: data.name, cnpj: data.cnpj, type: data.type, status: data.status,
      address: { zip: data.zip, street: data.street, number: data.number, complement: data.complement, neighborhood: data.neighborhood, city: data.city, state: data.state },
      numUnits: data.numUnits, numBlocks: data.numBlocks, numFloors: data.numFloors, totalArea: data.totalArea,
      inauguratedAt: data.inauguratedAt, propertyManagerId: data.propertyManagerId, syndic: data.syndic,
      bylawsUrl: data.bylawsUrl, regulationsUrl: data.regulationsUrl,
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
    <form onSubmit={handleSubmit(onSubmit as never)}>
      <Tabs defaultValue="identification">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="identification">{t('condominiums.tabs.identification')}</TabsTrigger>
          <TabsTrigger value="address">{t('condominiums.tabs.address')}</TabsTrigger>
          <TabsTrigger value="characteristics">{t('condominiums.tabs.characteristics')}</TabsTrigger>
          <TabsTrigger value="management">{t('condominiums.tabs.management')}</TabsTrigger>
        </TabsList>

        <TabsContent value="identification" className="space-y-4">
          <F label={t('condominiums.fields.name')} id="name" req err={!!errors.name}>
            <Input id="name" {...register('name')} />
          </F>
          <F label={t('condominiums.fields.cnpj')} id="cnpj" req err={!!errors.cnpj}>
            <Input id="cnpj" {...register('cnpj')} />
          </F>
          <div className="grid grid-cols-2 gap-2">
            <F label={t('condominiums.fields.type')} id="type" req>
              <Select defaultValue={watch('type')} onValueChange={(v) => setValue('type', v as FormData['type'])}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">{t('condominiums.type.residential')}</SelectItem>
                  <SelectItem value="commercial">{t('condominiums.type.commercial')}</SelectItem>
                  <SelectItem value="mixed">{t('condominiums.type.mixed')}</SelectItem>
                </SelectContent>
              </Select>
            </F>
            <F label={t('condominiums.fields.status')} id="status" req>
              <Select defaultValue={watch('status')} onValueChange={(v) => setValue('status', v as FormData['status'])}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('common.active')}</SelectItem>
                  <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </F>
          </div>
        </TabsContent>

        <TabsContent value="address" className="space-y-4">
          <F label={t('condominiums.fields.zip')} id="zip" req err={!!errors.zip}>
            <Input id="zip" {...register('zip')} />
          </F>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <F label={t('condominiums.fields.street')} id="street" req err={!!errors.street}>
                <Input id="street" {...register('street')} />
              </F>
            </div>
            <F label={t('condominiums.fields.number')} id="number" req err={!!errors.number}>
              <Input id="number" {...register('number')} />
            </F>
          </div>
          <F label={t('condominiums.fields.complement')} id="complement">
            <Input id="complement" {...register('complement')} />
          </F>
          <F label={t('condominiums.fields.neighborhood')} id="neighborhood" req err={!!errors.neighborhood}>
            <Input id="neighborhood" {...register('neighborhood')} />
          </F>
          <div className="grid grid-cols-2 gap-2">
            <F label={t('condominiums.fields.city')} id="city" req err={!!errors.city}>
              <Input id="city" {...register('city')} />
            </F>
            <F label={t('condominiums.fields.state')} id="state" req err={!!errors.state}>
              <Input id="state" {...register('state')} maxLength={2} />
            </F>
          </div>
        </TabsContent>

        <TabsContent value="characteristics" className="space-y-4">
          <F label={t('condominiums.fields.numUnits')} id="numUnits" req err={!!errors.numUnits}>
            <Input id="numUnits" type="number" {...register('numUnits')} />
          </F>
          <div className="grid grid-cols-2 gap-2">
            <F label={t('condominiums.fields.numBlocks')} id="numBlocks">
              <Input id="numBlocks" type="number" {...register('numBlocks')} />
            </F>
            <F label={t('condominiums.fields.numFloors')} id="numFloors">
              <Input id="numFloors" type="number" {...register('numFloors')} />
            </F>
          </div>
          <F label={t('condominiums.fields.totalArea')} id="totalArea">
            <Input id="totalArea" {...register('totalArea')} />
          </F>
          <F label={t('condominiums.fields.inauguratedAt')} id="inauguratedAt">
            <Input id="inauguratedAt" type="date" {...register('inauguratedAt')} />
          </F>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <F label={t('condominiums.fields.syndic')} id="syndic">
            <Input id="syndic" {...register('syndic')} />
          </F>
          <F label={t('condominiums.fields.bylawsUrl')} id="bylawsUrl">
            <Input id="bylawsUrl" {...register('bylawsUrl')} />
          </F>
          <F label={t('condominiums.fields.regulationsUrl')} id="regulationsUrl">
            <Input id="regulationsUrl" {...register('regulationsUrl')} />
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
