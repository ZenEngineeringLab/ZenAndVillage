import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/features/auth/store/auth.store'

export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}
