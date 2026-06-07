export type SupportLevel = 'basic' | 'priority' | 'dedicated'
export type PlanStatus = 'active' | 'discontinued'

export interface Plan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  maxCondos: number
  maxUnitsTotal: number
  maxAdminUsers: number
  enabledModules: string[]
  dataRetentionMonths: number
  supportLevel: SupportLevel
  apiAccess: boolean
  status: PlanStatus
  /** Controls whether this plan appears on the self-service plan-selection screen. */
  public: boolean
  createdAt: string
  updatedAt?: string
}
