export interface Tenant {
  id: string
  tenantId: string
  name: string
  type: 'management_company' | 'independent_condo'
  taxId: string
  contactEmail: string
  phone: string
  responsibleName: string
  responsibleEmail: string
  planId: 'starter' | 'pro' | 'enterprise'
  subscriptionStatus: 'trial' | 'active' | 'delinquent' | 'canceled' | 'suspended'
  subscriptionStartDate: string
  trialEndDate?: string
  billingCycle: 'monthly' | 'annual'
  whiteLabelEnabled: boolean
  whiteLabelConfig?: {
    platformName: string
    primaryColor: string
    secondaryColor: string
    customDomain?: string
    customSenderEmail?: string
  }
  usageLimits: { activeCondos: number; totalUnits: number; adminUsers: number }
  maxCondos: number
  maxUnits: number
  maxAdminUsers: number
  status: 'active' | 'suspended' | 'canceled'
  createdAt: string
  updatedAt: string
}
