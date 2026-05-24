import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { seedCondominiums } from '@/shared/data/seed'
import type { Employee } from '@/shared/types/entities'

const schema = z.object({
  name: z.string().min(1),
  cpf: z.string().min(1),
  pisPasep: z.string(),
  email: z.string(),
  phone: z.string(),
  condominiumId: z.string().min(1),
  role: z.enum(['superintendent', 'doorman', 'general_services', 'guard', 'receptionist']),
  contractType: z.enum(['direct_clt', 'outsourced']),
  outsourcingCompany: z.string(),
  admissionDate: z.string().min(1),
  schedule: z.enum(['44h', '12x36', 'part_time']),
  baseSalary: z.coerce.number().min(0),
  status: z.enum(['active', 'inactive', 'on_leave']),
  terminationDate: z.string(),
  asoUrl: z.string(),
  contractUrl: z.string(),
  otherDocs: z.string(),
})

type FormData = z.infer<typeof schema>

interface Props {
  initialData?: Partial<Employee>
  onSave: (data: Partial<Employee>) => void | Promise<void>
  onCancel: () => void
}

export function EmployeeForm({ initialData, onSave, onCancel }: Props) {
  const { t } = useTranslation()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
    defaultValues: {
      name: initialData?.name ?? '',
      cpf: initialData?.cpf ?? '',
      pisPasep: initialData?.pisPasep ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      condominiumId: initialData?.condominiumId ?? '',
      role: initialData?.role ?? 'doorman',
      contractType: initialData?.contractType ?? 'direct_clt',
      outsourcingCompany: initialData?.outsourcingCompany ?? '',
      admissionDate: initialData?.admissionDate ?? '',
      schedule: initialData?.schedule ?? '44h',
      baseSalary: initialData?.baseSalary ?? 0,
      status: initialData?.status ?? 'active',
      terminationDate: initialData?.terminationDate ?? '',
      asoUrl: initialData?.asoUrl ?? '',
      contractUrl: initialData?.contractUrl ?? '',
      otherDocs: initialData?.otherDocs ?? '',
    },
  })

  const contractType = watch('contractType')
  const status = watch('status')

  const onSubmit = (data: FormData) => {
    const condo = seedCondominiums.find((c) => c.id === data.condominiumId)
    onSave({ ...data, condominiumName: condo?.name ?? '', tenantId: 't1' })
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
      <Tabs defaultValue="personal">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="personal">{t('employees.tabs.personal')}</TabsTrigger>
          <TabsTrigger value="contract">{t('employees.tabs.contract')}</TabsTrigger>
          <TabsTrigger value="documents">{t('employees.tabs.documents')}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <F label={t('employees.fields.name')} id="name" req err={!!errors.name}>
            <Input id="name" {...register('name')} />
          </F>
          <div className="grid grid-cols-2 gap-2">
            <F label={t('employees.fields.cpf')} id="cpf" req err={!!errors.cpf}>
              <Input id="cpf" {...register('cpf')} placeholder="000.000.000-00" />
            </F>
            <F label={t('employees.fields.pisPasep')} id="pisPasep">
              <Input id="pisPasep" {...register('pisPasep')} />
            </F>
          </div>
          <F label={t('employees.fields.email')} id="email">
            <Input id="email" type="email" {...register('email')} />
          </F>
          <F label={t('employees.fields.phone')} id="phone">
            <Input id="phone" {...register('phone')} />
          </F>
        </TabsContent>

        <TabsContent value="contract" className="space-y-4">
          <F label={t('employees.fields.condominium')} id="condominiumId" req err={!!errors.condominiumId}>
            <Select defaultValue={watch('condominiumId')} onValueChange={(v) => setValue('condominiumId', v)}>
              <SelectTrigger id="condominiumId"><SelectValue /></SelectTrigger>
              <SelectContent>
                {seedCondominiums.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>
          <F label={t('employees.fields.role')} id="role" req>
            <Select defaultValue={watch('role')} onValueChange={(v) => setValue('role', v as FormData['role'])}>
              <SelectTrigger id="role"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['superintendent', 'doorman', 'general_services', 'guard', 'receptionist'] as const).map((r) => (
                  <SelectItem key={r} value={r}>{t(`employees.role.${r}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>
          <F label={t('employees.fields.contractType')} id="contractType" req>
            <Select defaultValue={contractType} onValueChange={(v) => setValue('contractType', v as FormData['contractType'])}>
              <SelectTrigger id="contractType"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="direct_clt">{t('employees.contractType.direct_clt')}</SelectItem>
                <SelectItem value="outsourced">{t('employees.contractType.outsourced')}</SelectItem>
              </SelectContent>
            </Select>
          </F>
          {contractType === 'outsourced' && (
            <F label={t('employees.fields.outsourcingCompany')} id="outsourcingCompany">
              <Input id="outsourcingCompany" {...register('outsourcingCompany')} />
            </F>
          )}
          <div className="grid grid-cols-2 gap-2">
            <F label={t('employees.fields.admissionDate')} id="admissionDate" req err={!!errors.admissionDate}>
              <Input id="admissionDate" type="date" {...register('admissionDate')} />
            </F>
            <F label={t('employees.fields.schedule')} id="schedule" req>
              <Select defaultValue={watch('schedule')} onValueChange={(v) => setValue('schedule', v as FormData['schedule'])}>
                <SelectTrigger id="schedule"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="44h">{t('employees.schedule.44h')}</SelectItem>
                  <SelectItem value="12x36">{t('employees.schedule.12x36')}</SelectItem>
                  <SelectItem value="part_time">{t('employees.schedule.part_time')}</SelectItem>
                </SelectContent>
              </Select>
            </F>
          </div>
          <F label={t('employees.fields.baseSalary')} id="baseSalary" req>
            <Input id="baseSalary" type="number" step="0.01" {...register('baseSalary')} />
          </F>
          <F label={t('employees.fields.status')} id="status" req>
            <Select defaultValue={status} onValueChange={(v) => setValue('status', v as FormData['status'])}>
              <SelectTrigger id="status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('employees.status.active')}</SelectItem>
                <SelectItem value="inactive">{t('employees.status.inactive')}</SelectItem>
                <SelectItem value="on_leave">{t('employees.status.on_leave')}</SelectItem>
              </SelectContent>
            </Select>
          </F>
          {status === 'inactive' && (
            <F label={t('employees.fields.terminationDate')} id="terminationDate">
              <Input id="terminationDate" type="date" {...register('terminationDate')} />
            </F>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <F label={t('employees.fields.asoUrl')} id="asoUrl">
            <Input id="asoUrl" {...register('asoUrl')} />
          </F>
          <F label={t('employees.fields.contractUrl')} id="contractUrl">
            <Input id="contractUrl" {...register('contractUrl')} />
          </F>
          <F label={t('employees.fields.otherDocs')} id="otherDocs">
            <Input id="otherDocs" {...register('otherDocs')} />
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
