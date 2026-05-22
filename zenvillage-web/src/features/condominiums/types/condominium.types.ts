export interface Condominium {
  id: string; tenantId: string
  name: string; taxId: string
  type: 'residential' | 'commercial' | 'mixed'
  status: 'active' | 'inactive'
  address: { zipCode: string; street: string; number: string; complement?: string; neighborhood: string; city: string; state: string }
  numUnits: number; numBlocks: number; numFloors: number
  totalAreaSqm?: number; inauguratedAt?: string
  propertyManagerId?: string; syndicResidentId?: string
  bylawsUrl?: string; regulationsUrl?: string
  createdAt: string; updatedAt: string
}
