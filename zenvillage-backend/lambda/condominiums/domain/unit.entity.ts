export type UnitType = 'apartment' | 'office' | 'store' | 'parking'
export type OccupancyStatus = 'owned' | 'rented' | 'vacant'

export interface Unit {
  id: string
  condoId: string
  tenantId: string
  block?: string
  floor: number
  number: string
  type: UnitType
  privateAreaSqm?: number
  idealFraction?: number
  linkedParkingSpace?: string
  occupancyStatus: OccupancyStatus
  createdAt: string
  updatedAt: string
}
