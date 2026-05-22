export interface Employee {
  id: string; tenantId: string; condoId: string
  name: string; cpf: string; socialSecurityId?: string
  email?: string; phone?: string
  role: 'superintendent' | 'doorman' | 'general_services' | 'guard' | 'receptionist'
  contractType: 'direct_clt' | 'outsourced'
  outsourcingCompany?: string
  admissionDate: string; terminationDate?: string
  schedule: '44h' | '12x36' | 'part_time'
  baseSalary: number
  status: 'active' | 'inactive' | 'on_leave'
  asoUrl?: string; contractUrl?: string; otherDocsUrl?: string
  createdAt: string; updatedAt: string
}
