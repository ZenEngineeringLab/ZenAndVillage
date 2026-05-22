import { useRef, useEffect } from 'react'
import { ChevronDown, Building2, Settings, LogOut, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useAppStore } from '../store/app.store'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { cn } from '../lib/utils'

const MOCK_USER = { name: 'Admin User', email: 'heitor.rapcinski@gmail.com' }

interface UserMenuProps {
  open: boolean
  onToggle: () => void
  onClose: () => void
}

export function UserMenu({ open, onToggle, onClose }: UserMenuProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { tenants, activeTenantId, setActiveTenant } = useAppStore()
  const menuRef = useRef<HTMLDivElement>(null)
  const activeTenant = tenants.find((t) => t.id === activeTenantId)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open, onClose])

  const initials = MOCK_USER.name.split(' ').map((w) => w[0]).slice(0, 2).join('')

  const handlePreferences = () => { onClose(); navigate('/preferences') }
  const handleSignOut = () => { onClose(); navigate('/') }
  const handleSwitchTenant = (id: string) => { setActiveTenant(id); onClose(); window.location.reload() }

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 h-auto py-1.5 px-2"
        aria-expanded={open}
        onClick={onToggle}
      >
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col items-start leading-none">
          <span className="text-sm font-medium">{MOCK_USER.name}</span>
          <span className="text-xs text-muted-foreground">{activeTenant?.name}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border bg-popover shadow-lg z-50">
          <div className="px-4 py-3">
            <p className="text-sm font-semibold">{MOCK_USER.name}</p>
            <p className="text-xs text-muted-foreground">{MOCK_USER.email}</p>
          </div>

          <Separator />

          <div className="p-1">
            <button
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
              onClick={handlePreferences}
            >
              <Settings className="h-4 w-4" />
              {t('userMenu.preferences')}
            </button>
          </div>

          <Separator />

          <div className="px-2 py-1.5">
            <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">{t('userMenu.tenantSelector')}</p>
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                onClick={() => handleSwitchTenant(tenant.id)}
              >
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className={cn('flex-1 text-left truncate', tenant.id === activeTenantId && 'font-medium')}>{tenant.name}</span>
                {tenant.id === activeTenantId && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>

          <Separator />

          <div className="p-1">
            <button
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              {t('userMenu.signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
