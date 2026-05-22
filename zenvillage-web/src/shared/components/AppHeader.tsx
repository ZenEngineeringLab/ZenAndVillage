import { useState, useRef, useEffect } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { NotificationPanel } from './NotificationPanel'
import { UserMenu } from './UserMenu'
import { useAppStore } from '../store/app.store'
import { cn } from '../lib/utils'

// ── Inline search field (md+ screens) ────────────────────────────────
function SearchInline() {
  const { t } = useTranslation()
  return (
    <div className="relative hidden md:block w-52 lg:w-64 shrink-0">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={t('header.search')}
        className="pl-8 pr-14 h-8 text-sm"
        readOnly
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
        {t('header.searchHint')}
      </kbd>
    </div>
  )
}

// ── Collapsible search button (< md screens) ──────────────────────────
function SearchPopover() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when dropdown opens
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={wrapperRef} className="relative md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('header.search')}
        aria-expanded={open}
      >
        {open ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
      </Button>

      <div
        className={cn(
          'absolute right-0 top-[calc(100%+6px)] z-50 w-72 rounded-lg border bg-background shadow-lg p-2',
          'transition-all duration-150 origin-top-right',
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            placeholder={t('header.search')}
            className="pl-8 h-9 text-sm"
            readOnly
          />
        </div>
      </div>
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────────
export function AppHeader() {
  const { t } = useTranslation()
  const { toggleSidebar } = useAppStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const handleNotifToggle = () => { setNotifOpen((v) => !v); setUserOpen(false) }
  const handleUserToggle  = () => { setUserOpen((v) => !v);  setNotifOpen(false) }

  return (
    <header className="shrink-0 h-14 flex items-center border-b bg-background px-4 gap-3">
      {/* Hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-8 w-8"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">Z</span>
        </div>
        <span className="font-semibold text-sm hidden sm:block">ZenAndVillage</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search — inline on md+, popover on smaller screens */}
        <SearchInline />
        <SearchPopover />

        <Separator orientation="vertical" className="h-6" />

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
