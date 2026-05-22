import { httpClient } from '@/shared/api/http-client'
import type { PaginatedResponse } from '@/shared/types/api.types'
import type { Employee } from '../types/employee.types'

export interface EmployeeFilters { page?: number; pageSize?: number; search?: string; condoId?: string; role?: string; status?: string; contractType?: string }

export const employeesService = {
  list: (f: EmployeeFilters = {}) =>
    httpClient.get<{ data: PaginatedResponse<Employee> }>('/v1/employees', { params: f }).then(r => r.data.data),
  getById: (id: string) =>
    httpClient.get<{ data: Employee }>(`/v1/employees/${id}`).then(r => r.data.data),
  create: (p: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>, key = crypto.randomUUID()) =>
    httpClient.post<{ data: Employee }>('/v1/employees', p, { headers: { 'X-Idempotency-Key': key } }).then(r => r.data.data),
  update: (id: string, p: Partial<Employee>) =>
    httpClient.patch<{ data: Employee }>(`/v1/employees/${id}`, p).then(r => r.data.data),
  delete: (id: string) => httpClient.delete(`/v1/employees/${id}`),
}
