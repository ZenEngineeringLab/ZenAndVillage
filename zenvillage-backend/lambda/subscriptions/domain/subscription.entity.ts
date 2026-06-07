export type SubscriptionStatus =
  | 'pending_approval'
  | 'trial'
  | 'active'
  | 'delinquent'
  | 'suspended'
  | 'canceled'
  | 'rejected'

export type BillingCycle = 'monthly' | 'annual'

export interface Subscription {
  id: string
  tenantId: string
  planId: string
  /** cognitoSub of the user who submitted the request — used for cross-domain onboardingStatus updates. */
  requestedByCognitoSub: string
  requestedAt: string
  startsAt?: string
  endsAt?: string
  billingCycle: BillingCycle
  status: SubscriptionStatus
  rejectionReason?: string
  approvedBy?: string
  rejectedBy?: string
}
