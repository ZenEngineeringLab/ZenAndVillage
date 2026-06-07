import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Clock, Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { authAdapter } from '@/shared/auth/auth.adapter'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { OnboardingStatus } from '@/features/auth/store/auth.store'

export function PendingApprovalPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, setUser, activeTenantId, clearSession } = useAuthStore()

  const [refreshing, setRefreshing] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await authAdapter.refreshSession()
      const claims = await authAdapter.getDecodedClaims()
      if (claims && user) {
        const newStatus = (claims['custom:onboardingStatus'] as OnboardingStatus | undefined)
          ?? user.onboardingStatus
        if (newStatus !== 'pending_approval') {
          setUser(
            {
              ...user,
              onboardingStatus: newStatus,
              roles: JSON.parse(claims['custom:roles'] ?? '[]'),
            },
            claims['custom:tenantId'] || activeTenantId || '',
          )
          // AuthGuard handles the redirect
          navigate('/', { replace: true })
        } else {
          toast.info(t('onboarding.pendingApproval.noChange'))
        }
      }
    } catch {
      toast.error(t('toast.error'))
    } finally {
      setRefreshing(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await authAdapter.signOut()
    } finally {
      clearSession()
      navigate('/login', { replace: true })
      setSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-6">
            <Clock className="h-12 w-12 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('onboarding.pendingApproval.title')}</h1>
          <p className="text-muted-foreground">{t('onboarding.pendingApproval.subtitle')}</p>
        </div>

        <p className="text-sm text-muted-foreground border rounded-lg p-4 bg-card">
          {t('onboarding.pendingApproval.description')}
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full"
          >
            {refreshing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {refreshing
              ? t('onboarding.pendingApproval.refreshing')
              : t('onboarding.pendingApproval.refreshStatus')}
          </Button>

          <Button
            variant="ghost"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full text-muted-foreground"
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            {t('onboarding.pendingApproval.signOut')}
          </Button>
        </div>
      </div>
    </div>
  )
}
