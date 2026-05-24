import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { propertyManagersService, type PMFilters } from '../services/property-managers.service'
import type { PropertyManager } from '../types/property-manager.types'

export const pmKeys = {
  all: ['property-managers'] as const,
  lists: () => [...pmKeys.all, 'list'] as const,
  list: (f: PMFilters) => [...pmKeys.lists(), f] as const,
  details: () => [...pmKeys.all, 'detail'] as const,
  detail: (id: string) => [...pmKeys.details(), id] as const,
}

export const usePropertyManagersQuery = (f: PMFilters = {}) =>
  useQuery({ queryKey: pmKeys.list(f), queryFn: () => propertyManagersService.list(f), staleTime: 5 * 60 * 1000 })

export const useCreatePMMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Omit<PropertyManager, 'id' | 'createdAt' | 'updatedAt'>) => propertyManagersService.create(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: pmKeys.lists() }),
    onError: (e: any) => toast.error(e?.message ?? 'Failed to create property manager'),
  })
}

export const useUpdatePMMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<PropertyManager> & { id: string }) => propertyManagersService.update(id, patch),
    onSuccess: (_, { id }) => { qc.invalidateQueries({ queryKey: pmKeys.lists() }); qc.invalidateQueries({ queryKey: pmKeys.detail(id) }) },
    onError: (e: any) => toast.error(e?.message ?? 'Failed to update'),
  })
}

export const useDeletePMMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => propertyManagersService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: pmKeys.lists() }),
    onError: (e: any) => toast.error(e?.message ?? 'Failed to delete'),
  })
}
