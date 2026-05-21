import { useState } from 'react'
import { Sun, Moon, Monitor, Globe, Check, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/shared/components/ui/separator'
import { useTheme } from '@/shared/hooks/useTheme'
import { useLocale } from '@/shared/hooks/useLocale'
import { cn } from '@/shared/lib/utils'
import { BUILTIN_PRESETS } from '@/shared/data/presets'
import type { Theme } from '@/shared/types/entities'
import type { Locale } from '@/shared/types/entities'

export function PreferencesPage() {
  const { t } = useTranslation()
  const { theme, setTheme, activePreset, setActivePreset } = useTheme()
  const { locale, detectedLocale, changeLocale } = useLocale()
  const [customCode, setCustomCode] = useState('')
  const [customError, setCustomError] = useState('')

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

  function handleAddCustomCode() {
    const code = customCode.trim()
    if (!code) return
    if (!code.startsWith('b')) {
      setCustomError(t('preferences.presetInvalidCode'))
      return
    }
    if (BUILTIN_PRESETS.some((p) => p.code === code)) {
      setActivePreset(code)
      setCustomCode('')
      setCustomError('')
      return
    }
    setCustomError(t('preferences.presetNotFound'))
  }

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

        <div className="grid grid-cols-4 gap-3">
          {BUILTIN_PRESETS.map((preset) => {
            const active = activePreset === preset.code
            return (
              <button
                key={preset.code}
                onClick={() => setActivePreset(preset.code)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors',
                  active ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                )}
              >
                <div
                  className="relative h-9 w-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: preset.swatch }}
                >
                  {active && (
                    <Check className="h-4 w-4 text-white drop-shadow" />
                  )}
                </div>
                <span className={cn('text-xs font-medium', active && 'text-primary')}>
                  {preset.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{preset.code}</span>
              </button>
            )
          })}
        </div>

        <div className="space-y-2 pt-2">
          <p className="text-sm text-muted-foreground">{t('preferences.presetAddLabel')}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customCode}
              onChange={(e) => { setCustomCode(e.target.value); setCustomError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCode()}
              placeholder={t('preferences.presetCodePlaceholder')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              onClick={handleAddCustomCode}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground shadow hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              {t('preferences.presetAdd')}
            </button>
          </div>
          {customError && (
            <p className="text-sm text-destructive">{customError}</p>
          )}
          <p className="text-xs text-muted-foreground">{t('preferences.presetHint')}</p>
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
