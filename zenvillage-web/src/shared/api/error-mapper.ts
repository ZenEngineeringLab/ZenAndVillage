import type { AxiosError } from 'axios'

export interface ApiError {
  code: string
  message: string
  requestId: string
  timestamp: string
}

export const mapApiError = (error: AxiosError): ApiError => ({
  code: (error.response?.data as any)?.error?.code ?? 'UNKNOWN_ERROR',
  message: (error.response?.data as any)?.error?.message ?? error.message ?? 'An unexpected error occurred.',
  // requestId is read from the BODY — never from HTTP headers
  requestId: (error.response?.data as any)?.error?.requestId ?? '',
  timestamp: (error.response?.data as any)?.error?.timestamp ?? new Date().toISOString(),
})
