export type FinancialStatus = 'current' | 'delinquent'

export interface Owner {
  id: string
  tenantId: string
  condoId: string
  unitId: string
  name: string
  cpf: string
  rg?: string
  email: string
  phone: string
  acquisitionDate: string
  financialStatus: FinancialStatus
  isSyndic: boolean
  isCouncilMember: boolean
  createdAt: string
  updatedAt: string
}
