export type Theme = 'light' | 'dark' | 'auto'
export type Locale = 'en_US' | 'pt_BR' | 'auto'
export type RadiusOption = 'none' | 'small' | 'default' | 'large'
export type MenuColorOption = 'default' | 'inverted'
export type MenuAccentOption = 'subtle' | 'bold'

export type SubscriptionStatus =
  | 'pending_approval'
  | 'trial'
  | 'active'
  | 'delinquent'
  | 'suspended'
  | 'canceled'

export type TenantStatus = 'active' | 'suspended' | 'canceled'

export interface Tenant {
  id: string
  name: string
  type: 'management_company' | 'independent_condo'
  taxId: string
  contactEmail: string
  phone: string
  responsibleName: string
  responsibleEmail: string
  planId: string
  billingCycle: 'monthly' | 'annual'
  subscriptionStatus: SubscriptionStatus
  status: TenantStatus
  trialEndDate?: string
  usageLimits: { activeCondos: number; totalUnits: number; adminUsers: number }
  createdAt: string
}

export interface PropertyManager {
  id: string
  legalName: string
  tradeName: string
  cnpj: string
  creci: string
  email: string
  phone: string
  website: string
  status: 'active' | 'inactive'
  address: {
    zip: string
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
  }
  condominiumsCount: number
  tenantId: string
}

export interface Condominium {
  id: string
  name: string
  cnpj: string
  type: 'residential' | 'commercial' | 'mixed'
  status: 'active' | 'inactive'
  address: {
    zip: string
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
  }
  numUnits: number
  numBlocks: number
  numFloors: number
  totalArea: string
  inauguratedAt: string
  propertyManagerId: string
  propertyManagerName: string
  syndic: string
  bylawsUrl: string
  regulationsUrl: string
  tenantId: string
}

export interface Resident {
  id: string
  name: string
  cpf: string
  rg: string
  email: string
  phone: string
  secondaryPhone: string
  birthdate: string
  condominiumId: string
  condominiumName: string
  block: string
  unit: string
  occupancyType: 'owner' | 'tenant'
  acquisitionDate?: string
  leaseStart?: string
  leaseEnd?: string
  leaseUrl?: string
  licensePlate: string
  vehicleModel: string
  isSyndic: boolean
  isCouncilMember: boolean
  financialStatus: 'current' | 'defaulting'
  tenantId: string
}

export interface Employee {
  id: string
  name: string
  cpf: string
  pisPasep: string
  email: string
  phone: string
  condominiumId: string
  condominiumName: string
  role: 'superintendent' | 'doorman' | 'general_services' | 'guard' | 'receptionist'
  contractType: 'direct_clt' | 'outsourced'
  outsourcingCompany?: string
  admissionDate: string
  schedule: '44h' | '12x36' | 'part_time'
  baseSalary: number
  status: 'active' | 'inactive' | 'on_leave'
  terminationDate?: string
  asoUrl: string
  contractUrl: string
  otherDocs: string
  tenantId: string
}

export interface Notification {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
}
