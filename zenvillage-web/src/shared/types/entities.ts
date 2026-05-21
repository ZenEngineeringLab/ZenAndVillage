export type Theme = 'light' | 'dark' | 'auto'
export type Locale = 'en_US' | 'pt_BR' | 'auto'
export type ColorTheme = 'teal' | 'blue' | 'violet' | 'rose' | 'amber' | 'emerald' | 'indigo' | 'coral' | 'sky' | 'fuchsia'

export interface Tenant {
  id: string
  name: string
  type: 'property_manager' | 'independent_condominium'
  cnpj: string
  contactEmail: string
  phone: string
  responsibleName: string
  responsibleEmail: string
  plan: 'starter' | 'pro' | 'enterprise'
  billingCycle: 'monthly' | 'annual'
  status: 'active' | 'trial' | 'suspended' | 'inactive'
  trialEnd?: string
  condominiumsCount: number
  condominiumsLimit: number
  unitsCount: number
  unitsLimit: number
  joinDate: string
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
  whiteLabel: boolean
  whiteLabelConfig?: {
    platformName: string
    primaryColor: string
    secondaryColor: string
    customDomain: string
    customSenderEmail: string
  }
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
