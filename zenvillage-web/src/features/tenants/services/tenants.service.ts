import { httpClient } from '@/shared/api/http-client'
import type { PaginatedResponse } from '@/shared/types/api.types'
import type { Tenant } from '../types/tenant.types'

export interface TenantsFilters {
  page?: number
  pageSize?: number
  search?: string
}

export const tenantsService = {
  list: (filters: TenantsFilters = {}) =>
    httpClient
      .get<{ data: PaginatedResponse<Tenant> }>('/v1/tenants', { params: filters })
      .then((r) => r.data.data),

  getById: (id: string) =>
    httpClient
      .get<{ data: Tenant }>(`/v1/tenants/${id}`)
      .then((r) => r.data.data),

  create: (payload: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>, idempotencyKey = crypto.randomUUID()) =>
    httpClient
      .post<{ data: Tenant }>('/v1/tenants', payload, {
        headers: { 'X-Idempotency-Key': idempotencyKey },
      })
      .then((r) => r.data.data),

  update: (id: string, payload: Partial<Tenant>) =>
    httpClient
      .patch<{ data: Tenant }>(`/v1/tenants/${id}`, payload)
      .then((r) => r.data.data),

  delete: (id: string) =>
    httpClient.delete(`/v1/tenants/${id}`),

  getUsage: (id: string) =>
    httpClient
      .get<{ data: any }>(`/v1/tenants/${id}/usage`)
      .then((r) => r.data.data),
}
