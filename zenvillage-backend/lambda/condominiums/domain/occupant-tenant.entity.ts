/**
 * OccupantTenant represents a unit occupant who rents (not owns) the unit.
 * Named OccupantTenant to distinguish from the platform-level Tenant
 * (subscription account).
 */
export interface OccupantTenant {
  id: string
  tenantId: string
  condoId: string
  unitId: string
  name: string
  cpf: string
  email: string
  phone: string
  leaseStartDate: string
  leaseEndDate: string
  leaseContractUrl?: string
  createdAt: string
  updatedAt: string
}
