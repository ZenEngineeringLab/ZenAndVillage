import { httpClient } from '@/shared/api/http-client'
import type { PaginatedResponse } from '@/shared/types/api.types'

export interface AppNotification {
  id: string
  title: string
  description: string
  createdAt: string
  read: boolean
}

export const notificationsService = {
  list: (page = 1, pageSize = 50) =>
    httpClient
      .get<{ data: PaginatedResponse<AppNotification> }>('/v1/notifications', { params: { page, pageSize } })
      .then(r => r.data.data),

  markRead: (id: string) =>
    httpClient.patch(`/v1/notifications/${id}/read`),

  markAllRead: () =>
    httpClient.post('/v1/notifications/read-all'),
}
