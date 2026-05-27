import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuthStore } from '@/features/auth/store/auth.store'

/** Routes that the onboarding flow is allowed to reach without being redirected. */
const ONBOARDING_ROUTES = new Set([
  '/onboarding/verify-email',
  '/onboarding/plan-selection',
  '/onboarding/pending-approval',
  '/onboarding/setup',
])

/** Routes accessible to all authenticated users regardless of onboarding status. */
const SHARED_ROUTES = new Set(['/preferences'])

/**
 * AuthGuard — enforces authentication and onboarding state machine routing.
 *
 * Routing rules (checked in order):
 *   1. Not authenticated            → /login
 *   2. pending_verification         → /onboarding/verify-email
 *   3. pending_subscription         → /onboarding/plan-selection
 *   4. pending_approval             → /onboarding/pending-approval
 *   5. onboarding                   → /onboarding/setup (first-condo wizard)
 *      unless already on a SHARED or ONBOARDING route
 *   6. complete                     → allow through
 */
export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const status = user?.onboardingStatus ?? 'pending_verification'
  const pathname = location.pathname

  // Shared routes are always accessible once authenticated
  if (SHARED_ROUTES.has(pathname)) return <Outlet />

  switch (status) {
    case 'pending_verification':
      if (pathname === '/onboarding/verify-email') return <Outlet />
      return <Navigate to="/onboarding/verify-email" replace />

    case 'pending_subscription':
      if (pathname === '/onboarding/plan-selection') return <Outlet />
      return <Navigate to="/onboarding/plan-selection" replace />

    case 'pending_approval':
      if (pathname === '/onboarding/pending-approval') return <Outlet />
      return <Navigate to="/onboarding/pending-approval" replace />

    case 'onboarding':
      // Approved — must complete first condominium setup before accessing the app
      if (ONBOARDING_ROUTES.has(pathname)) return <Outlet />
      return <Navigate to="/onboarding/setup" replace />

    case 'complete':
      // Fully onboarded — redirect away from onboarding routes if user navigates back
      if (ONBOARDING_ROUTES.has(pathname)) return <Navigate to="/" replace />
      return <Outlet />

    default:
      return <Navigate to="/onboarding/verify-email" replace />
  }
}
