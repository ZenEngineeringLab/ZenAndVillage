import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { configureAmplify } from '@/shared/auth/auth.adapter'
import { setQueryClientRef, setClearSessionRef } from '@/shared/api/http-client'
import { queryClient } from '@/app/query-client'
import { useAuthStore } from '@/features/auth/store/auth.store'
import '@/i18n'

// Configure Amplify once at startup
configureAmplify()

// Wire query client and auth clear into the HTTP client interceptors
setQueryClientRef(queryClient)
setClearSessionRef(() => useAuthStore.getState().clearSession())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
