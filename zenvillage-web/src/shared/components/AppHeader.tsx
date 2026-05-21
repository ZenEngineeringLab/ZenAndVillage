import { useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { NotificationPanel } from './NotificationPanel'
import { UserMenu } from './UserMenu'

export function AppHeader() {
  const { t } = useTranslation()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const handleNotifToggle = () => { setNotifOpen((v) => !v); setUserOpen(false) }
  const handleUserToggle = () => { setUserOpen((v) => !v); setNotifOpen(false) }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center border-b bg-background px-4 gap-4">
      <div className="w-56 shrink-0 flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">Z</span>
        </div>
        <span className="font-semibold text-sm">ZenAndVillage</span>
      </div>

      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('header.search')}
            className="pl-8 pr-16"
            readOnly
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            {t('header.searchHint')}
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <NotificationPanel
          open={notifOpen}
          onToggle={handleNotifToggle}
          onClose={() => setNotifOpen(false)}
        />
        <Separator orientation="vertical" className="h-6" />
        <UserMenu
          open={userOpen}
          onToggle={handleUserToggle}
          onClose={() => setUserOpen(false)}
        />
      </div>
    </header>
  )
}
