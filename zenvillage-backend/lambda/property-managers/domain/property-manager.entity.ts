export interface Address {
  zipCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export interface WhiteLabelConfig {
  platformName: string
  primaryColor: string
  secondaryColor: string
  customDomain?: string
  customSenderEmail?: string
}

export interface PropertyManager {
  id: string
  tenantId: string
  legalName: string
  tradeName: string
  taxId: string
  creci?: string
  email: string
  phone: string
  site?: string
  address: Address
  whiteLabelEnabled: boolean
  whiteLabelConfig?: WhiteLabelConfig
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}
