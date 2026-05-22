import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { condominiumsService, type CondoFilters } from '../services/condominiums.service'
import type { Condominium } from '../types/condominium.types'

export const condoKeys = {
  all: ['condominiums'] as const,
  lists: () => [...condoKeys.all, 'list'] as const,
  list: (f: CondoFilters) => [...condoKeys.lists(), f] as const,
  details: () => [...condoKeys.all, 'detail'] as const,
  detail: (id: string) => [...condoKeys.details(), id] as const,
}

export const useCondominiumsQuery = (f: CondoFilters = {}) =>
  useQuery({ queryKey: condoKeys.list(f), queryFn: () => condominiumsService.list(f), staleTime: 5 * 60 * 1000 })

export const useCreateCondoMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Omit<Condominium, 'id' | 'createdAt' | 'updatedAt'>) => condominiumsService.create(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: condoKeys.lists() }),
    onError: (e: any) => toast.error(e?.message ?? 'Failed to create condominium'),
  })
}

export const useUpdateCondoMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Condominium> & { id: string }) => condominiumsService.update(id, patch),
    onSuccess: (_, { id }) => { qc.invalidateQueries({ queryKey: condoKeys.lists() }); qc.invalidateQueries({ queryKey: condoKeys.detail(id) }) },
    onError: (e: any) => toast.error(e?.message ?? 'Failed to update'),
  })
}

export const useDeleteCondoMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => condominiumsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: condoKeys.lists() }),
    onError: (e: any) => toast.error(e?.message ?? 'Failed to delete'),
  })
}
