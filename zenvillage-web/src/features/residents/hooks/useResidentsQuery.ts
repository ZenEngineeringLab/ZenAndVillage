import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { residentsService, type ResidentFilters } from '../services/residents.service'
import type { Resident } from '../types/resident.types'

export const residentKeys = {
  all: ['residents'] as const,
  lists: () => [...residentKeys.all, 'list'] as const,
  list: (f: ResidentFilters) => [...residentKeys.lists(), f] as const,
  details: () => [...residentKeys.all, 'detail'] as const,
  detail: (id: string) => [...residentKeys.details(), id] as const,
}

export const useResidentsQuery = (f: ResidentFilters = {}) =>
  useQuery({ queryKey: residentKeys.list(f), queryFn: () => residentsService.list(f), staleTime: 5 * 60 * 1000 })

export const useCreateResidentMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>) => residentsService.create(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: residentKeys.lists() }),
    onError: (e: any) => toast.error(e?.message ?? 'Failed to create resident'),
  })
}

export const useUpdateResidentMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Resident> & { id: string }) => residentsService.update(id, patch),
    onSuccess: (_, { id }) => { qc.invalidateQueries({ queryKey: residentKeys.lists() }); qc.invalidateQueries({ queryKey: residentKeys.detail(id) }) },
    onError: (e: any) => toast.error(e?.message ?? 'Failed to update'),
  })
}

export const useDeleteResidentMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => residentsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: residentKeys.lists() }),
    onError: (e: any) => toast.error(e?.message ?? 'Failed to delete'),
  })
}
