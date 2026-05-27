import { createBrowserRouter } from 'react-router'
import { lazy, Suspense } from 'react'
import { AppShell } from '@/shared/components/AppShell'
import { AuthGuard } from '@/shared/components/AuthGuard'
import { LoginPage } from '@/features/auth/pages/LoginPage'

const Loading = () => (
  <div className="flex h-full items-center justify-center p-12">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
  </div>
)

// ─── Main app pages ───────────────────────────────────────────────────────────
const DashboardPage        = lazy(() => import('@/features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const TenantsPage          = lazy(() => import('@/features/tenants/TenantsPage').then(m => ({ default: m.TenantsPage })))
const PropertyManagersPage = lazy(() => import('@/features/property-managers/PropertyManagersPage').then(m => ({ default: m.PropertyManagersPage })))
const CondominiumsPage     = lazy(() => import('@/features/condominiums/CondominiumsPage').then(m => ({ default: m.CondominiumsPage })))
const ResidentsPage        = lazy(() => import('@/features/residents/ResidentsPage').then(m => ({ default: m.ResidentsPage })))
const EmployeesPage        = lazy(() => import('@/features/employees/EmployeesPage').then(m => ({ default: m.EmployeesPage })))
const PreferencesPage      = lazy(() => import('@/features/preferences/PreferencesPage').then(m => ({ default: m.PreferencesPage })))

// ─── Onboarding pages (Tasks #7 and #8 — scaffolded, fleshed out in later tasks) ──
const RegisterPage         = lazy(() => import('@/features/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const VerifyEmailPage      = lazy(() => import('@/features/onboarding/pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })))
const PlanSelectionPage    = lazy(() => import('@/features/onboarding/pages/PlanSelectionPage').then(m => ({ default: m.PlanSelectionPage })))
const PendingApprovalPage  = lazy(() => import('@/features/onboarding/pages/PendingApprovalPage').then(m => ({ default: m.PendingApprovalPage })))
const FirstCondoWizardPage = lazy(() => import('@/features/onboarding/pages/FirstCondoWizardPage').then(m => ({ default: m.FirstCondoWizardPage })))

// ─── Platform Admin pages (Task #9 — scaffolded, fleshed out in later tasks) ─
const AdminOverviewPage       = lazy(() => import('@/features/admin/pages/AdminOverviewPage').then(m => ({ default: m.AdminOverviewPage })))
const AdminSubscriptionsPage  = lazy(() => import('@/features/admin/pages/AdminSubscriptionsPage').then(m => ({ default: m.AdminSubscriptionsPage })))
const AdminTenantsPage        = lazy(() => import('@/features/admin/pages/AdminTenantsPage').then(m => ({ default: m.AdminTenantsPage })))
const AdminPlansPage          = lazy(() => import('@/features/admin/pages/AdminPlansPage').then(m => ({ default: m.AdminPlansPage })))

export const router = createBrowserRouter([
  // ─── Public routes ─────────────────────────────────────────────────────────
  { path: '/login',    element: <LoginPage /> },
  { path: '/register', element: <Suspense fallback={<Loading />}><RegisterPage /></Suspense> },

  // ─── Authenticated routes (guarded by AuthGuard) ──────────────────────────
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      // Onboarding funnel — AuthGuard enforces access by onboardingStatus
      { path: 'onboarding/verify-email',     element: <Suspense fallback={<Loading />}><VerifyEmailPage /></Suspense> },
      { path: 'onboarding/plan-selection',   element: <Suspense fallback={<Loading />}><PlanSelectionPage /></Suspense> },
      { path: 'onboarding/pending-approval', element: <Suspense fallback={<Loading />}><PendingApprovalPage /></Suspense> },
      { path: 'onboarding/setup',            element: <Suspense fallback={<Loading />}><FirstCondoWizardPage /></Suspense> },

      // App shell wraps main app + admin pages
      {
        element: <AppShell />,
        children: [
          // ─── Main app ───────────────────────────────────────────────────
          { index: true,               element: <Suspense fallback={<Loading />}><DashboardPage /></Suspense> },
          { path: 'tenants',           element: <Suspense fallback={<Loading />}><TenantsPage /></Suspense> },
          { path: 'property-managers', element: <Suspense fallback={<Loading />}><PropertyManagersPage /></Suspense> },
          { path: 'condominiums',      element: <Suspense fallback={<Loading />}><CondominiumsPage /></Suspense> },
          { path: 'residents',         element: <Suspense fallback={<Loading />}><ResidentsPage /></Suspense> },
          { path: 'employees',         element: <Suspense fallback={<Loading />}><EmployeesPage /></Suspense> },
          { path: 'preferences',       element: <Suspense fallback={<Loading />}><PreferencesPage /></Suspense> },
          { path: 'settings',          element: <div className="p-4 text-muted-foreground">Settings (coming soon)</div> },
          { path: 'help',              element: <div className="p-4 text-muted-foreground">Help (coming soon)</div> },

          // ─── Platform Admin (further gated by AdminGuard inside each page) ─
          { path: 'admin',                    element: <Suspense fallback={<Loading />}><AdminOverviewPage /></Suspense> },
          { path: 'admin/subscriptions',      element: <Suspense fallback={<Loading />}><AdminSubscriptionsPage /></Suspense> },
          { path: 'admin/tenants',            element: <Suspense fallback={<Loading />}><AdminTenantsPage /></Suspense> },
          { path: 'admin/plans',              element: <Suspense fallback={<Loading />}><AdminPlansPage /></Suspense> },
        ],
      },
    ],
  },
])
