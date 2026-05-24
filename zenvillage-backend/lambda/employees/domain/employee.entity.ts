export type EmployeeRole = 'superintendent' | 'doorman' | 'general_services' | 'guard' | 'receptionist'
export type ContractType = 'direct_clt' | 'outsourced'
export type EmployeeSchedule = '44h' | '12x36' | 'part_time'
export type EmployeeStatus = 'active' | 'inactive' | 'on_leave'

export interface Employee {
  id: string
  tenantId: string
  condoId: string
  name: string
  cpf: string
  socialSecurityId?: string
  email?: string
  phone?: string
  role: EmployeeRole
  contractType: ContractType
  outsourcingCompany?: string
  admissionDate: string
  terminationDate?: string
  schedule: EmployeeSchedule
  baseSalary: number
  status: EmployeeStatus
  asoUrl?: string
  contractUrl?: string
  otherDocsUrl?: string
  createdAt: string
  updatedAt: string
}
