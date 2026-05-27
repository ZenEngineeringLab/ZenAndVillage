import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/auth.store'

/**
 * AdminGuard — wraps admin page content. Only renders children for users
 * with the `platform_admin` role; everyone else sees an access-denied message.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  const isPlatformAdmin = user?.roles?.includes('platform_admin') ?? false

  if (!isPlatformAdmin) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground text-sm">
          {t('onboarding.admin.access_denied', { defaultValue: 'Access denied.' })}
        </p>
      </div>
    )
  }

  return <>{children}</>
}
