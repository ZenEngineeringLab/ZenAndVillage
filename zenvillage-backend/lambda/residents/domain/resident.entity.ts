export type OccupancyType = 'owner' | 'tenant'
export type FinancialStatus = 'current' | 'delinquent'

export interface Resident {
  id: string
  tenantId: string
  condoId: string
  name: string
  cpf: string
  rg?: string
  email: string
  phone: string
  secondaryPhone?: string
  birthDate?: string
  block?: string
  unit: string
  occupancyType: OccupancyType
  acquisitionDate?: string
  leaseStartDate?: string
  leaseEndDate?: string
  leaseContractUrl?: string
  vehiclePlate?: string
  vehicleModel?: string
  isSyndic: boolean
  isBoardMember: boolean
  financialStatus: FinancialStatus
  createdAt: string
  updatedAt: string
}
