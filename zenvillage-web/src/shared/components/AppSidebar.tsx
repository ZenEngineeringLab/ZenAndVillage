import { NavLink } from 'react-router'
import {
  LayoutDashboard, Building2, Users, Home, UserCheck,
  Settings, HelpCircle, ShieldCheck, ListChecks, BookOpen,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../lib/utils'
import { Separator } from './ui/separator'
import { useAppStore } from '../store/app.store'
import { useAuthStore } from '@/features/auth/store/auth.store'

const mainNavItems = [
  { key: 'dashboard', href: '/', icon: LayoutDashboard },
  { key: 'tenants', href: '/tenants', icon: Building2 },
  { key: 'propertyManagers', href: '/property-managers', icon: Home },
  { key: 'condominiums', href: '/condominiums', icon: Building2 },
  { key: 'residents', href: '/residents', icon: Users },
  { key: 'employees', href: '/employees', icon: UserCheck },
]

const bottomNavItems = [
  { key: 'settings', href: '/settings', icon: Settings },
  { key: 'help', href: '/help', icon: HelpCircle },
]

const adminNavItems = [
  { key: 'adminOverview', href: '/admin', icon: ShieldCheck },
  { key: 'adminSubscriptions', href: '/admin/subscriptions', icon: ListChecks },
  { key: 'adminPlans', href: '/admin/plans', icon: BookOpen },
]

export function AppSidebar() {
  const { t } = useTranslation()
  const { sidebarExpanded } = useAppStore()
  const user = useAuthStore((s) => s.user)
  const isPlatformAdmin = user?.roles?.includes('platform_admin') ?? false

  return (
    <aside
      className={cn(
        'shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border',
        'transition-[width] duration-200 overflow-hidden',
        sidebarExpanded ? 'w-56' : 'w-14'
      )}
    >
      {/* ── Logo ──────────────────────────────────────────────── */}
      <div
        className={cn(
          'shrink-0 flex items-center h-14 px-3 border-b border-sidebar-border overflow-hidden',
          !sidebarExpanded && 'justify-center px-2',
        )}
      >
        {sidebarExpanded ? (
          <>
            <img
              src="/logo-light.svg"
              alt="ZenAndVillage"
              className="h-8 w-auto dark:hidden"
              draggable={false}
            />
            <img
              src="/logo-dark.svg"
              alt="ZenAndVillage"
              className="h-8 w-auto hidden dark:block"
              draggable={false}
            />
          </>
        ) : (
          <img
            src="/logo-icon.svg"
            alt="ZenAndVillage"
            className="h-8 w-8 shrink-0"
            draggable={false}
          />
        )}
      </div>

      <nav className="flex-1 py-2 overflow-hidden overflow-y-auto">
        <div className="space-y-0.5 px-2">
          {mainNavItems.map(({ key, href, icon: Icon }) => (
            <NavLink
              key={key}
              to={href}
              end={href === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive && 'bg-sidebar-primary/10 text-sidebar-primary font-semibold',
                  !sidebarExpanded && 'justify-center'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn('h-4 w-4 shrink-0', isActive && 'text-sidebar-primary')}
                    aria-label={!sidebarExpanded ? t(`nav.${key}`) : undefined}
                  />
                  {sidebarExpanded && (
                    <span className="truncate">{t(`nav.${key}`)}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {isPlatformAdmin && (
          <div className="mt-2 px-2">
            <Separator className="mb-2" />
            {sidebarExpanded && (
              <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('nav.admin')}
              </p>
            )}
            <div className="space-y-0.5">
              {adminNavItems.map(({ key, href, icon: Icon }) => (
                <NavLink
                  key={key}
                  to={href}
                  end={href === '/admin'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                      'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive && 'bg-sidebar-primary/10 text-sidebar-primary font-semibold',
                      !sidebarExpanded && 'justify-center'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn('h-4 w-4 shrink-0', isActive && 'text-sidebar-primary')}
                        aria-label={!sidebarExpanded ? t(`nav.${key}`) : undefined}
                      />
                      {sidebarExpanded && (
                        <span className="truncate">{t(`nav.${key}`)}</span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="px-2 pb-2">
        <Separator className="mb-2" />
        <div className="space-y-0.5">
          {bottomNavItems.map(({ key, href, icon: Icon }) => (
            <NavLink
              key={key}
              to={href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive && 'bg-sidebar-primary/10 text-sidebar-primary font-semibold',
                  !sidebarExpanded && 'justify-center'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn('h-4 w-4 shrink-0', isActive && 'text-sidebar-primary')}
                    aria-label={!sidebarExpanded ? t(`nav.${key}`) : undefined}
                  />
                  {sidebarExpanded && <span className="truncate">{t(`nav.${key}`)}</span>}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  )
}
