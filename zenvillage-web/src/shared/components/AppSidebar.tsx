import { useState } from 'react'
import { NavLink } from 'react-router'
import {
  LayoutDashboard, Building2, Users, Home, UserCheck,
  Settings, HelpCircle, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

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

export function AppSidebar() {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const [hoverExpanded, setHoverExpanded] = useState(false)

  const isExpanded = !collapsed || hoverExpanded

  return (
    <aside
      className={cn(
        'fixed left-0 top-14 bottom-0 z-30 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200',
        isExpanded ? 'w-56' : 'w-14'
      )}
      onMouseEnter={() => { if (collapsed) setHoverExpanded(true) }}
      onMouseLeave={() => setHoverExpanded(false)}
    >
      <nav className="flex-1 py-2 overflow-hidden">
        <div className="space-y-0.5 px-2">
          {mainNavItems.map(({ key, href, icon: Icon }) => (
            <NavLink
              key={key}
              to={href}
              end={href === '/'}
              aria-current={undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive && 'bg-sidebar-primary/10 text-sidebar-primary font-semibold',
                  !isExpanded && 'justify-center'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn('h-4 w-4 shrink-0', isActive && 'text-sidebar-primary')}
                    aria-label={!isExpanded ? t(`nav.${key}`) : undefined}
                  />
                  {isExpanded && (
                    <span className="truncate">{t(`nav.${key}`)}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
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
                  !isExpanded && 'justify-center'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn('h-4 w-4 shrink-0', isActive && 'text-sidebar-primary')}
                    aria-label={!isExpanded ? t(`nav.${key}`) : undefined}
                  />
                  {isExpanded && <span className="truncate">{t(`nav.${key}`)}</span>}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <Separator className="my-2" />

        <Button
          variant="ghost"
          size="icon"
          className={cn('h-7 w-7', !isExpanded && 'mx-auto')}
          onClick={() => { setCollapsed((v) => !v); setHoverExpanded(false) }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  )
}
