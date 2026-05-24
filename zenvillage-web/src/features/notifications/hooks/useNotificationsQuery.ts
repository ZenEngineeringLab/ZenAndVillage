import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '../services/notifications.service'

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: () => [...notificationKeys.lists()] as const,
}

export const useNotificationsQuery = () =>
  useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationsService.list(),
    staleTime: 30 * 1000, // 30s — notifications refresh frequently
    refetchInterval: 60 * 1000, // poll every 60s as fallback to WebSocket
  })

export const useMarkReadMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.lists() }),
  })
}

export const useMarkAllReadMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.lists() }),
  })
}
