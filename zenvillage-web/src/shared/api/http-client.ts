import axios from 'axios'
import type { AxiosError } from 'axios'
import { authAdapter } from '@/shared/auth/auth.adapter'
import { mapApiError } from './error-mapper'

// queryClient is imported lazily to avoid circular dependency
let _queryClient: { clear: () => void } | null = null
export const setQueryClientRef = (qc: { clear: () => void }) => {
  _queryClient = qc
}

// useAuthStore is imported lazily
let _clearSession: (() => void) | null = null
export const setClearSessionRef = (fn: () => void) => {
  _clearSession = fn
}

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor ──────────────────────────────────────────────────────
httpClient.interceptors.request.use(async (config) => {
  // Import auth store here to avoid circular dependency
  const { useAuthStore } = await import('@/features/auth/store/auth.store')
  const tenantId = useAuthStore.getState().activeTenantId

  try {
    const token = await authAdapter.getAccessToken()
    config.headers.Authorization = `Bearer ${token}`
  } catch {
    // Token not available — let the request fail naturally with 401
  }

  if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId
  }

  if (['post', 'put', 'patch'].includes(config.method ?? '')) {
    config.headers['X-Idempotency-Key'] =
      (config.headers['X-Idempotency-Key'] as string) ?? crypto.randomUUID()
  }

  return config
})

// ── Response interceptor ─────────────────────────────────────────────────────
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as any
    if (error.response?.status === 401 && !config?._retried) {
      try {
        config._retried = true
        await authAdapter.refreshSession()
        return httpClient.request(config)
      } catch {
        _clearSession?.()
        _queryClient?.clear()
        window.location.replace('/login')
      }
    }
    return Promise.reject(mapApiError(error))
  }
)
