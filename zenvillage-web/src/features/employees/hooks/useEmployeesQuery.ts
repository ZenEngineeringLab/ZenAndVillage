import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { employeesService, type EmployeeFilters } from '../services/employees.service'
import type { Employee } from '../types/employee.types'

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (f: EmployeeFilters) => [...employeeKeys.lists(), f] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
}

export const useEmployeesQuery = (f: EmployeeFilters = {}) =>
  useQuery({ queryKey: employeeKeys.list(f), queryFn: () => employeesService.list(f), staleTime: 5 * 60 * 1000 })

export const useCreateEmployeeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => employeesService.create(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeeKeys.lists() }),
    onError: (e: any) => toast.error(e?.message ?? 'Failed to create employee'),
  })
}

export const useUpdateEmployeeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Employee> & { id: string }) => employeesService.update(id, patch),
    onSuccess: (_, { id }) => { qc.invalidateQueries({ queryKey: employeeKeys.lists() }); qc.invalidateQueries({ queryKey: employeeKeys.detail(id) }) },
    onError: (e: any) => toast.error(e?.message ?? 'Failed to update'),
  })
}

export const useDeleteEmployeeMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => employeesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: employeeKeys.lists() }),
    onError: (e: any) => toast.error(e?.message ?? 'Failed to delete'),
  })
}
