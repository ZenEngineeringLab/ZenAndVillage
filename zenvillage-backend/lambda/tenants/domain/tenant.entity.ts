export type TenantType = 'management_company' | 'independent_condo'
export type TenantPlan = 'starter' | 'pro' | 'enterprise'
export type SubscriptionStatus = 'trial' | 'active' | 'delinquent' | 'canceled' | 'suspended'
export type BillingCycle = 'monthly' | 'annual'

export interface WhiteLabelConfig {
  platformName: string
  primaryColor: string
  secondaryColor: string
  customDomain?: string
  customSenderEmail?: string
}

export interface UsageLimits {
  activeCondos: number
  totalUnits: number
  adminUsers: number
}

export interface Tenant {
  id: string
  tenantId: string
  name: string
  type: TenantType
  taxId: string
  contactEmail: string
  phone: string
  responsibleName: string
  responsibleEmail: string
  planId: TenantPlan
  subscriptionStatus: SubscriptionStatus
  subscriptionStartDate: string
  trialEndDate?: string
  billingCycle: BillingCycle
  whiteLabelEnabled: boolean
  whiteLabelConfig?: WhiteLabelConfig
  usageLimits: UsageLimits
  maxCondos: number
  maxUnits: number
  maxAdminUsers: number
  status: 'active' | 'suspended' | 'canceled'
  createdAt: string
  updatedAt: string
}
