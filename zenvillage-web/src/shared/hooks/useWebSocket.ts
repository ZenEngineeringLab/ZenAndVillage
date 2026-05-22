import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authAdapter } from '@/shared/auth/auth.adapter'
import { useAuthStore } from '@/features/auth/store/auth.store'

const WS_ENDPOINT = import.meta.env.VITE_WS_ENDPOINT as string | undefined

// Domain → TanStack Query cache key prefix mapping
const DOMAIN_KEY_MAP: Record<string, string[]> = {
  notifications: ['notifications'],
  tenants: ['tenants'],
  'property-managers': ['property-managers'],
  condominiums: ['condominiums'],
  residents: ['residents'],
  employees: ['employees'],
}

/**
 * Connects to the WebSocket API once (called from AppShell).
 * On each message, invalidates the relevant TanStack Query cache key.
 * Reconnects with exponential back-off on unexpected disconnects.
 */
export function useWebSocket() {
  const qc = useQueryClient()
  const { activeTenantId, isAuthenticated } = useAuthStore()
  const wsRef = useRef<WebSocket | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)
  const maxDelay = 30_000

  useEffect(() => {
    if (!WS_ENDPOINT || !isAuthenticated || !activeTenantId) return

    let destroyed = false

    async function connect() {
      if (destroyed) return
      try {
        const token = await authAdapter.getAccessToken()
        const url = `${WS_ENDPOINT}?token=${encodeURIComponent(token)}&tenantId=${encodeURIComponent(activeTenantId!)}`
        const ws = new WebSocket(url)
        wsRef.current = ws

        ws.onopen = () => {
          retryCountRef.current = 0
        }

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data) as { domain?: string }
            const keys = msg.domain ? (DOMAIN_KEY_MAP[msg.domain] ?? null) : null
            if (keys) {
              qc.invalidateQueries({ queryKey: keys })
            } else {
              // Invalidate everything if no domain specified
              qc.invalidateQueries()
            }
          } catch {
            // Ignore malformed messages
          }
        }

        ws.onclose = () => {
          wsRef.current = null
          if (!destroyed) scheduleReconnect()
        }

        ws.onerror = () => {
          ws.close()
        }
      } catch {
        if (!destroyed) scheduleReconnect()
      }
    }

    function scheduleReconnect() {
      const delay = Math.min(1000 * 2 ** retryCountRef.current, maxDelay)
      retryCountRef.current += 1
      retryTimerRef.current = setTimeout(connect, delay)
    }

    connect()

    return () => {
      destroyed = true
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [isAuthenticated, activeTenantId, qc])
}
