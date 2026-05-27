/**
 * Auth Adapter — single file that wraps AWS Amplify Auth.
 * This is the ONLY file in the codebase that imports from aws-amplify.
 * All other files use this adapter exclusively.
 */
import { Amplify } from 'aws-amplify'
import {
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  updateUserAttributes,
} from 'aws-amplify/auth'

// Amplify is configured once at app startup (called from main.tsx)
export const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? '',
        userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID ?? '',
        loginWith: { email: true },
      },
    },
  })
}

export interface AuthTokenClaims {
  sub: string
  email: string
  name?: string
  'custom:tenantId': string
  'custom:roles': string
  'custom:userId': string
  'custom:locale': string
  'custom:onboardingStatus': string
}

const decodeJwtPayload = (token: string): AuthTokenClaims => {
  const payload = token.split('.')[1]
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
}

export const authAdapter = {
  async signIn(email: string, password: string) {
    const result = await signIn({ username: email, password })
    return result
  },

  async signOut() {
    await signOut({ global: true })
  },

  async getCurrentUser() {
    try {
      return await getCurrentUser()
    } catch {
      return null
    }
  },

  async getAccessToken(): Promise<string> {
    const session = await fetchAuthSession({ forceRefresh: false })
    const token = session.tokens?.accessToken?.toString()
    if (!token) throw new Error('No access token available')
    return token
  },

  async refreshSession(): Promise<void> {
    await fetchAuthSession({ forceRefresh: true })
  },

  async getDecodedClaims(): Promise<AuthTokenClaims | null> {
    try {
      const token = await authAdapter.getAccessToken()
      return decodeJwtPayload(token)
    } catch {
      return null
    }
  },

  async updateLocale(locale: string): Promise<void> {
    await updateUserAttributes({ userAttributes: { 'custom:locale': locale } })
  },
}
