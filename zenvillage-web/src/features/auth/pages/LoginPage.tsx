import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { authAdapter } from '@/shared/auth/auth.adapter'
import { useAuthStore, type OnboardingStatus } from '../store/auth.store'

const schema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(8),
})
type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }: FormValues) => {
    setLoading(true)
    try {
      const result = await authAdapter.signIn(email, password)
      if (result.isSignedIn) {
        const claims = await authAdapter.getDecodedClaims()
        if (claims) {
          const onboardingStatus = (claims['custom:onboardingStatus'] as OnboardingStatus | undefined)
            ?? 'pending_verification'
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
          // AuthGuard handles the redirect; navigate to root and let it decide
          navigate('/', { replace: true })
        }
      }
    } catch (err: any) {
      const msg = err?.message ?? t('auth.loginError')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <img src="/logo-icon.svg" alt="ZenAndVillage" className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl">ZenAndVillage</CardTitle>
          <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t('auth.signIn')}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              {t('auth.signUpLink')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
