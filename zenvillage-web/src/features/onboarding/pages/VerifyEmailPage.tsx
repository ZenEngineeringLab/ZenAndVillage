import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { authAdapter } from '@/shared/auth/auth.adapter'
import { httpClient } from '@/shared/api/http-client'
import { useAuthStore, type OnboardingStatus } from '@/features/auth/store/auth.store'

interface VerifyEmailLocationState {
  email: string
  password: string
  name: string
  cognitoSub: string
}

const schema = z.object({
  code: z
    .string()
    .min(6, 'Enter the 6-digit code')
    .max(6, 'Enter the 6-digit code')
    .regex(/^\d{6}$/, 'Code must be 6 digits'),
})
type FormValues = z.infer<typeof schema>

export function VerifyEmailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuthStore()

  const state = location.state as VerifyEmailLocationState | null
  const email = state?.email ?? ''
  const password = state?.password ?? ''
  const name = state?.name ?? ''
  const cognitoSub = state?.cognitoSub ?? ''

  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  // Guard: if someone navigates here directly without registration state,
  // send them back to the register page.
  if (!email || !password || !cognitoSub) {
    return <Navigate to="/register" replace />
  }

  const onSubmit = async ({ code }: FormValues) => {
    setLoading(true)
    try {
      // 1. Confirm the Cognito sign-up
      await authAdapter.confirmSignUp(email, code)

      // 2. Create the user record in DynamoDB (public route — no token required)
      await httpClient.post('/v1/users', {
        cognitoSub,
        email,
        name,
      })

      // 3. Sign in — pre-token Lambda will find the new user record and
      //    auto-advance onboardingStatus to pending_subscription because
      //    email is now verified.
      const signInResult = await authAdapter.signIn(email, password)
      if (!signInResult.isSignedIn) {
        throw new Error('Sign-in did not complete after email verification.')
      }

      // 4. Read fresh claims and populate the auth store
      const claims = await authAdapter.getDecodedClaims()
      if (claims) {
        const onboardingStatus = (claims['custom:onboardingStatus'] as OnboardingStatus | undefined)
          ?? 'pending_subscription'
        setUser(
          {
            id: claims['custom:userId'] || claims.sub,
            cognitoSub: claims.sub,
            email: claims.email,
            name: claims.name ?? email.split('@')[0],
            roles: JSON.parse(claims['custom:roles'] ?? '[]'),
            locale: claims['custom:locale'] ?? 'auto',
            onboardingStatus,
          },
          claims['custom:tenantId']
        )
      }

      // 5. Navigate to root — AuthGuard will route to /onboarding/plan-selection
      navigate('/', { replace: true })
    } catch (err: any) {
      const msg = err?.message ?? t('auth.verifyEmailError')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await authAdapter.resendSignUpCode(email)
      toast.success(t('auth.resendCodeSent'))
    } catch (err: any) {
      toast.error(err?.message ?? t('toast.error'))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t('auth.verifyEmailTitle')}</CardTitle>
          <CardDescription>
            {t('auth.verifyEmailSubtitle', { email })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="code">{t('auth.verificationCode')}</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder={t('auth.verificationCodePlaceholder')}
                maxLength={6}
                className="text-center text-xl tracking-widest font-mono"
                {...register('code')}
                aria-invalid={!!errors.code}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t('auth.verifyEmail')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={resending}
              onClick={handleResend}
              className="text-muted-foreground"
            >
              {resending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              {t('auth.resendCode')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
