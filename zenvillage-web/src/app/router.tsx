import { createBrowserRouter } from 'react-router'
import { lazy, Suspense } from 'react'
import { AppShell } from '@/shared/components/AppShell'
import { AuthGuard } from '@/shared/components/AuthGuard'
import { LoginPage } from '@/features/auth/pages/LoginPage'

const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const TenantsPage = lazy(() => import('@/features/tenants/TenantsPage').then(m => ({ default: m.TenantsPage })))
const PropertyManagersPage = lazy(() => import('@/features/property-managers/PropertyManagersPage').then(m => ({ default: m.PropertyManagersPage })))
const CondominiumsPage = lazy(() => import('@/features/condominiums/CondominiumsPage').then(m => ({ default: m.CondominiumsPage })))
const ResidentsPage = lazy(() => import('@/features/residents/ResidentsPage').then(m => ({ default: m.ResidentsPage })))
const EmployeesPage = lazy(() => import('@/features/employees/EmployeesPage').then(m => ({ default: m.EmployeesPage })))
const PreferencesPage = lazy(() => import('@/features/preferences/PreferencesPage').then(m => ({ default: m.PreferencesPage })))

const Loading = () => (
  <div className="flex h-full items-center justify-center p-12">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Suspense fallback={<Loading />}><DashboardPage /></Suspense> },
          { path: 'tenants', element: <Suspense fallback={<Loading />}><TenantsPage /></Suspense> },
          { path: 'property-managers', element: <Suspense fallback={<Loading />}><PropertyManagersPage /></Suspense> },
          { path: 'condominiums', element: <Suspense fallback={<Loading />}><CondominiumsPage /></Suspense> },
          { path: 'residents', element: <Suspense fallback={<Loading />}><ResidentsPage /></Suspense> },
          { path: 'employees', element: <Suspense fallback={<Loading />}><EmployeesPage /></Suspense> },
          { path: 'preferences', element: <Suspense fallback={<Loading />}><PreferencesPage /></Suspense> },
          { path: 'settings', element: <div className="p-4 text-muted-foreground">Settings (coming soon)</div> },
          { path: 'help', element: <div className="p-4 text-muted-foreground">Help (coming soon)</div> },
        ],
      },
    ],
  },
])
