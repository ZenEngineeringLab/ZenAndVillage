import { httpClient } from '@/shared/api/http-client'
import type { PaginatedResponse } from '@/shared/types/api.types'
import type { Resident } from '../types/resident.types'

export interface ResidentFilters { page?: number; pageSize?: number; search?: string; condoId?: string; occupancyType?: string; financialStatus?: string }

export const residentsService = {
  list: (f: ResidentFilters = {}) =>
    httpClient.get<{ data: PaginatedResponse<Resident> }>('/v1/residents', { params: f }).then(r => r.data.data),
  getById: (id: string) =>
    httpClient.get<{ data: Resident }>(`/v1/residents/${id}`).then(r => r.data.data),
  create: (p: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>, key = crypto.randomUUID()) =>
    httpClient.post<{ data: Resident }>('/v1/residents', p, { headers: { 'X-Idempotency-Key': key } }).then(r => r.data.data),
  update: (id: string, p: Partial<Resident>) =>
    httpClient.patch<{ data: Resident }>(`/v1/residents/${id}`, p).then(r => r.data.data),
  delete: (id: string) => httpClient.delete(`/v1/residents/${id}`),
}
