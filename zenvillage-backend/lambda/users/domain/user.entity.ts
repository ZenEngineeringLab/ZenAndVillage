export type OnboardingStatus =
  | 'pending_verification'
  | 'pending_subscription'
  | 'pending_approval'
  | 'onboarding'
  | 'complete'

export type UserStatus = 'active' | 'inactive' | 'blocked' | 'pending_verification'

export interface UserRole {
  role: string
  tenantId: string
  condoId?: string
  unitId?: string
  isPrimary?: boolean
  startsAt: string
  endsAt?: string
}

export interface User {
  id: string
  cognitoSub: string
  email: string
  name: string
  cpf?: string
  passwordHash?: string
  mfaEnabled: boolean
  onboardingStatus: OnboardingStatus
  status: UserStatus
  locale: string
  roles: UserRole[]
  createdAt: string
  lastLogin?: string
}
