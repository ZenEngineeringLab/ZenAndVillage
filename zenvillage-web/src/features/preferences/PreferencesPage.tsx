import { Sun, Moon, Monitor, Globe, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/shared/components/ui/separator'
import { useTheme } from '@/shared/hooks/useTheme'
import { useLocale } from '@/shared/hooks/useLocale'
import { cn } from '@/shared/lib/utils'
import { BUILTIN_PRESETS } from '@/shared/data/presets'
import { FONTS } from '@/shared/data/fonts'
import type { FontChoice } from '@/shared/data/fonts'
import type { Theme, Locale } from '@/shared/types/entities'

const FONT_SAMPLES: Record<FontChoice, string> = {
  inter:    'Aa — The quick brown fox',
  oxanium:  'Aa — The quick brown fox',
  lora:     'Aa — The quick brown fox',
}

export function PreferencesPage() {
  const { t } = useTranslation()
  const {
    theme, setTheme,
    activePreset, setActivePreset,
    activeBodyFont, setActiveBodyFont,
    activeHeadingFont, setActiveHeadingFont,
  } = useTheme()
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

  function FontPicker({
    selected,
    onChange,
  }: {
    selected: FontChoice
    onChange: (f: FontChoice) => void
  }) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {FONTS.map((font) => {
          const active = selected === font.value
          return (
            <button
              key={font.value}
              onClick={() => onChange(font.value)}
              className={cn(
                'flex flex-col items-start gap-1 rounded-lg border p-3 transition-colors text-left',
                active ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn('text-base font-semibold', active && 'text-primary')}
                  style={{ fontFamily: font.family }}
                >
                  {font.label}
                </span>
                {active && <Check className="h-4 w-4 text-primary shrink-0" />}
              </div>
              <span
                className="text-sm text-muted-foreground"
                style={{ fontFamily: font.family }}
              >
                {FONT_SAMPLES[font.value]}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t('preferences.title')}</h1>

      {/* ── Appearance ───────────────────────────────────────────── */}
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

      {/* ── Color Scheme ─────────────────────────────────────────── */}
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
                  {active && <Check className="h-4 w-4 text-white drop-shadow" />}
                </div>
                <span className={cn('text-xs font-medium', active && 'text-primary')}>
                  {preset.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{preset.code}</span>
              </button>
            )
          })}
        </div>

      </section>

      <Separator />

      {/* ── Typography ───────────────────────────────────────────── */}
      <section className="space-y-6 my-8">
        <div>
          <h2 className="text-lg font-semibold">{t('preferences.typography')}</h2>
          <p className="text-sm text-muted-foreground">{t('preferences.typographyDesc')}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t('preferences.headingFont')}</p>
          <FontPicker selected={activeHeadingFont} onChange={setActiveHeadingFont} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t('preferences.bodyFont')}</p>
          <FontPicker selected={activeBodyFont} onChange={setActiveBodyFont} />
        </div>
      </section>

      <Separator />

      {/* ── Language ─────────────────────────────────────────────── */}
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
