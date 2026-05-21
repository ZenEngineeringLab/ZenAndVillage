import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/shared/components/AppShell'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { TenantsPage } from '@/features/tenants/TenantsPage'
import { PropertyManagersPage } from '@/features/property-managers/PropertyManagersPage'
import { CondominiumsPage } from '@/features/condominiums/CondominiumsPage'
import { ResidentsPage } from '@/features/residents/ResidentsPage'
import { EmployeesPage } from '@/features/employees/EmployeesPage'
import { PreferencesPage } from '@/features/preferences/PreferencesPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'tenants', element: <TenantsPage /> },
      { path: 'property-managers', element: <PropertyManagersPage /> },
      { path: 'condominiums', element: <CondominiumsPage /> },
      { path: 'residents', element: <ResidentsPage /> },
      { path: 'employees', element: <EmployeesPage /> },
      { path: 'preferences', element: <PreferencesPage /> },
      { path: 'settings', element: <div className="p-4 text-muted-foreground">Settings (coming soon)</div> },
      { path: 'help', element: <div className="p-4 text-muted-foreground">Help (coming soon)</div> },
    ],
  },
])
