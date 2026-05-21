import { Sun, Moon, Monitor, Globe, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/shared/components/ui/separator'
import { useTheme } from '@/shared/hooks/useTheme'
import { useLocale } from '@/shared/hooks/useLocale'
import { cn } from '@/shared/lib/utils'
import type { Theme, ColorTheme } from '@/shared/types/entities'
import type { Locale } from '@/shared/types/entities'

const COLOR_THEMES: { value: ColorTheme; swatch: string }[] = [
  { value: 'teal',    swatch: 'oklch(0.596 0.145 180.72)' },
  { value: 'blue',    swatch: 'oklch(0.546 0.19 255)' },
  { value: 'violet',  swatch: 'oklch(0.557 0.19 293)' },
  { value: 'rose',    swatch: 'oklch(0.648 0.22 15)' },
  { value: 'amber',   swatch: 'oklch(0.73 0.16 75)' },
  { value: 'emerald', swatch: 'oklch(0.596 0.17 145)' },
  { value: 'indigo',  swatch: 'oklch(0.558 0.19 275)' },
  { value: 'coral',   swatch: 'oklch(0.68 0.19 40)' },
  { value: 'sky',     swatch: 'oklch(0.60 0.17 220)' },
  { value: 'fuchsia', swatch: 'oklch(0.60 0.20 310)' },
]

export function PreferencesPage() {
  const { t } = useTranslation()
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme()
  const { locale, detectedLocale, changeLocale } = useLocale()

  const themeOptions: { value: Theme; icon: React.ElementType; labelKey: string; descKey: string }[] = [
    { value: 'light', icon: Sun,     labelKey: 'preferences.theme.light', descKey: 'preferences.theme.lightDesc' },
    { value: 'dark',  icon: Moon,    labelKey: 'preferences.theme.dark',  descKey: 'preferences.theme.darkDesc' },
    { value: 'auto',  icon: Monitor, labelKey: 'preferences.theme.auto',  descKey: 'preferences.theme.autoDesc' },
  ]

  const localeOptions: { value: Locale; labelKey: string; descKey?: string }[] = [
    { value: 'pt_BR', labelKey: 'preferences.locale.ptBR' },
    { value: 'en_US', labelKey: 'preferences.locale.enUS' },
    { value: 'auto',  labelKey: 'preferences.locale.auto', descKey: 'preferences.locale.autoDesc' },
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
                theme === value ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
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

      <section className="space-y-4 my-8">
        <div>
          <h2 className="text-lg font-semibold">{t('preferences.colorTheme')}</h2>
          <p className="text-sm text-muted-foreground">{t('preferences.colorThemeDesc')}</p>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {COLOR_THEMES.map(({ value, swatch }) => {
            const active = colorTheme === value
            return (
              <button
                key={value}
                onClick={() => setColorTheme(value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors',
                  active ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                )}
              >
                <div className="relative h-8 w-8 rounded-full" style={{ backgroundColor: swatch }}>
                  {active && (
                    <Check
                      className="absolute inset-0 m-auto h-4 w-4"
                      style={{ color: value === 'amber' ? 'oklch(0.145 0 0)' : 'oklch(0.985 0 0)' }}
                    />
                  )}
                </div>
                <span className={cn('text-xs font-medium capitalize', active && 'text-primary')}>
                  {t(`preferences.themes.${value}`)}
                </span>
              </button>
            )
          })}
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
                  locale === value ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
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
