export type CondoType = 'residential' | 'commercial' | 'mixed'
export type CondoStatus = 'active' | 'inactive'

export interface Address {
  zipCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export interface Condominium {
  id: string
  tenantId: string
  name: string
  taxId: string
  type: CondoType
  status: CondoStatus
  address: Address
  numUnits: number
  numBlocks: number
  numFloors: number
  totalAreaSqm?: number
  inauguratedAt?: string
  propertyManagerId?: string
  syndicResidentId?: string
  bylawsUrl?: string
  regulationsUrl?: string
  createdAt: string
  updatedAt: string
}
