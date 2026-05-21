import { Sun, Moon, Monitor, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/shared/components/ui/separator'
import { useTheme } from '@/shared/hooks/useTheme'
import { useLocale } from '@/shared/hooks/useLocale'
import { cn } from '@/shared/lib/utils'
import type { Theme } from '@/shared/types/entities'
import type { Locale } from '@/shared/types/entities'

export function PreferencesPage() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { locale, detectedLocale, changeLocale } = useLocale()

  const themeOptions: { value: Theme; icon: React.ElementType; labelKey: string; descKey: string }[] = [
    { value: 'light', icon: Sun, labelKey: 'preferences.theme.light', descKey: 'preferences.theme.lightDesc' },
    { value: 'dark', icon: Moon, labelKey: 'preferences.theme.dark', descKey: 'preferences.theme.darkDesc' },
    { value: 'auto', icon: Monitor, labelKey: 'preferences.theme.auto', descKey: 'preferences.theme.autoDesc' },
  ]

  const localeOptions: { value: Locale; labelKey: string; descKey?: string }[] = [
    { value: 'pt_BR', labelKey: 'preferences.locale.ptBR' },
    { value: 'en_US', labelKey: 'preferences.locale.enUS' },
    { value: 'auto', labelKey: 'preferences.locale.auto', descKey: 'preferences.locale.autoDesc' },
  ]

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t('preferences.title')}</h1>

      <section className="space-y-4 mb-8">
        <div>
          <h2 className="text-lg font-semibold">{t('preferences.appearance')}</h2>
          <p className="text-sm text-muted-foreground">{t('preferences.appearanceDesc')}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(({ value, icon: Icon, labelKey, descKey }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                theme === value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-accent'
              )}
            >
              <Icon className={cn('h-6 w-6', theme === value && 'text-primary')} />
              <span className={cn('text-sm font-medium', theme === value && 'text-primary')}>
                {t(labelKey)}
              </span>
              <span className="text-xs text-muted-foreground text-center">{t(descKey)}</span>
            </button>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-4 mt-8">
        <div>
          <h2 className="text-lg font-semibold">{t('preferences.language')}</h2>
          <p className="text-sm text-muted-foreground">{t('preferences.languageDesc')}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {localeOptions.map(({ value, labelKey, descKey }) => {
            const label = value === 'auto'
              ? `${t(labelKey)} (${detectedLocale.replace('_', '-')})`
              : t(labelKey)

            return (
              <button
                key={value}
                onClick={() => changeLocale(value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors',
                  locale === value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-accent'
                )}
              >
                <Globe className={cn('h-6 w-6', locale === value && 'text-primary')} />
                <span className={cn('text-sm font-medium text-center', locale === value && 'text-primary')}>
                  {label}
                </span>
                {descKey && (
                  <span className="text-xs text-muted-foreground text-center">{t(descKey)}</span>
                )}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
