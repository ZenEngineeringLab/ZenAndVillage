import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tenantsService, type TenantsFilters } from '../services/tenants.service'
import type { Tenant } from '../types/tenant.types'

export const tenantKeys = {
  all: ['tenants'] as const,
  lists: () => [...tenantKeys.all, 'list'] as const,
  list: (filters: TenantsFilters) => [...tenantKeys.lists(), filters] as const,
  details: () => [...tenantKeys.all, 'detail'] as const,
  detail: (id: string) => [...tenantKeys.details(), id] as const,
}

export const useTenantsQuery = (filters: TenantsFilters = {}) =>
  useQuery({
    queryKey: tenantKeys.list(filters),
    queryFn: () => tenantsService.list(filters),
    staleTime: 5 * 60 * 1000,
  })

export const useTenantQuery = (id: string) =>
  useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => tenantsService.getById(id),
    enabled: !!id,
  })

export const useCreateTenantMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) =>
      tenantsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.lists() }),
    onError: (e: any) => toast.error(e?.message ?? 'Failed to create tenant'),
  })
}

export const useUpdateTenantMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Tenant> & { id: string }) =>
      tenantsService.update(id, patch),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: tenantKeys.lists() })
      qc.invalidateQueries({ queryKey: tenantKeys.detail(id) })
    },
    onError: (e: any) => toast.error(e?.message ?? 'Failed to update tenant'),
  })
}

export const useDeleteTenantMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tenantsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.lists() }),
    onError: (e: any) => toast.error(e?.message ?? 'Failed to delete tenant'),
  })
}
