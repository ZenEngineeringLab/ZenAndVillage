import { httpClient } from '@/shared/api/http-client'
import type { PaginatedResponse } from '@/shared/types/api.types'
import type { PropertyManager } from '../types/property-manager.types'

export interface PMFilters { page?: number; pageSize?: number; search?: string }

export const propertyManagersService = {
  list: (filters: PMFilters = {}) =>
    httpClient.get<{ data: PaginatedResponse<PropertyManager> }>('/v1/property-managers', { params: filters }).then(r => r.data.data),
  getById: (id: string) =>
    httpClient.get<{ data: PropertyManager }>(`/v1/property-managers/${id}`).then(r => r.data.data),
  create: (payload: Omit<PropertyManager, 'id' | 'createdAt' | 'updatedAt'>, key = crypto.randomUUID()) =>
    httpClient.post<{ data: PropertyManager }>('/v1/property-managers', payload, { headers: { 'X-Idempotency-Key': key } }).then(r => r.data.data),
  update: (id: string, payload: Partial<PropertyManager>) =>
    httpClient.patch<{ data: PropertyManager }>(`/v1/property-managers/${id}`, payload).then(r => r.data.data),
  delete: (id: string) => httpClient.delete(`/v1/property-managers/${id}`),
}
