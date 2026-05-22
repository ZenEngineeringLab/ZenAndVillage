import { httpClient } from '@/shared/api/http-client'
import type { PaginatedResponse } from '@/shared/types/api.types'
import type { Condominium } from '../types/condominium.types'

export interface CondoFilters { page?: number; pageSize?: number; search?: string; type?: string; status?: string; propertyManagerId?: string }

export const condominiumsService = {
  list: (f: CondoFilters = {}) =>
    httpClient.get<{ data: PaginatedResponse<Condominium> }>('/v1/condominiums', { params: f }).then(r => r.data.data),
  getById: (id: string) =>
    httpClient.get<{ data: Condominium }>(`/v1/condominiums/${id}`).then(r => r.data.data),
  create: (p: Omit<Condominium, 'id' | 'createdAt' | 'updatedAt'>, key = crypto.randomUUID()) =>
    httpClient.post<{ data: Condominium }>('/v1/condominiums', p, { headers: { 'X-Idempotency-Key': key } }).then(r => r.data.data),
  update: (id: string, p: Partial<Condominium>) =>
    httpClient.patch<{ data: Condominium }>(`/v1/condominiums/${id}`, p).then(r => r.data.data),
  delete: (id: string) => httpClient.delete(`/v1/condominiums/${id}`),
}
