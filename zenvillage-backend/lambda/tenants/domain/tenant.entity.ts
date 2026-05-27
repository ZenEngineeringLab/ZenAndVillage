export type TenantType = 'management_company' | 'independent_condo'
export type SubscriptionStatus =
  | 'pending_approval'
  | 'trial'
  | 'active'
  | 'delinquent'
  | 'suspended'
  | 'canceled'
export type BillingCycle = 'monthly' | 'annual'
export type TenantStatus = 'active' | 'suspended' | 'canceled'

export interface UsageLimits {
  activeCondos: number
  totalUnits: number
  adminUsers: number
}

export interface StatusChangeEntry {
  actorId: string
  previousStatus: TenantStatus
  newStatus: TenantStatus
  timestamp: string
  reason?: string
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
  planId: string
  subscriptionStatus: SubscriptionStatus
  subscriptionStartDate?: string
  trialEndDate?: string
  billingCycle: BillingCycle
  usageLimits: UsageLimits
  status: TenantStatus
  statusChangeLog: StatusChangeEntry[]
  createdAt: string
  updatedAt: string
}
