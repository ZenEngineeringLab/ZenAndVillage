import { useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { cn } from '../lib/utils'
import {
  useNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} from '@/features/notifications/hooks/useNotificationsQuery'

interface NotificationPanelProps {
  open: boolean
  onToggle: () => void
  onClose: () => void
}

export function NotificationPanel({ open, onToggle, onClose }: NotificationPanelProps) {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)

  const { data } = useNotificationsQuery()
  const markReadMutation = useMarkReadMutation()
  const markAllReadMutation = useMarkAllReadMutation()

  const notifications = data?.items ?? []
  const count = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open, onClose])

  const formatRelative = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div ref={panelRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('notifications.title')}
        aria-expanded={open}
        onClick={onToggle}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-popover shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-sm">{t('notifications.title')}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              {t('notifications.markAllRead')}
            </Button>
          </div>
          <ScrollArea className="max-h-80">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">{t('notifications.empty')}</p>
            ) : (
              <div className="divide-y">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    className="w-full text-left px-4 py-3 hover:bg-accent transition-colors flex gap-2"
                    onClick={() => markReadMutation.mutate(n.id)}
                  >
                    <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-primary')} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm truncate', !n.read && 'font-medium')}>{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatRelative(n.createdAt)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="border-t px-4 py-2">
            <Button variant="ghost" size="sm" className="w-full text-xs text-primary">
              {t('notifications.viewAll')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
