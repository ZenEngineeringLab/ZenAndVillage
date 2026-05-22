import { Sun, Moon, Monitor, Globe, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/shared/components/ui/separator'
import { useTheme } from '@/shared/hooks/useTheme'
import { useLocale } from '@/shared/hooks/useLocale'
import { cn } from '@/shared/lib/utils'
import { BUILTIN_PRESETS } from '@/shared/data/presets'
import type { Preset } from '@/shared/data/presets'
import { FONTS } from '@/shared/data/fonts'
import type { FontChoice } from '@/shared/data/fonts'
import type { Theme, Locale } from '@/shared/types/entities'

// ── Helpers ───────────────────────────────────────────────────────────

const CHART_KEYS = [
  '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5',
] as const

/** Convert --radius value (e.g. "0.625rem" | "0") to a short display string */
function getRadiusLabel(preset: Preset): string {
  const r = preset.light['--radius']
  if (!r || r === '0') return '0px'
  const n = parseFloat(r)
  return isNaN(n) ? r : `${Math.round(n * 16)}px`
}

const FONT_SAMPLES: Record<FontChoice, string> = {
  inter:   'Aa — The quick brown fox',
  oxanium: 'Aa — The quick brown fox',
  lora:    'Aa — The quick brown fox',
}

// ── Sub-components ────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────

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

        {/* Comparison table */}
        <div className="overflow-x-auto rounded-lg border">
          {/* Header row */}
          <div
            className="grid items-center gap-x-3 px-4 py-2.5 bg-muted/40 border-b text-[11px] font-semibold text-muted-foreground uppercase tracking-wide"
            style={{ gridTemplateColumns: '1fr 36px 36px 90px 44px 36px 36px' }}
          >
            <span>{t('preferences.dimPreset')}</span>
            <span className="text-center">{t('preferences.dimTheme')}</span>
            <span className="text-center">{t('preferences.dimBase')}</span>
            <span className="text-center">{t('preferences.dimCharts')}</span>
            <span className="text-center">{t('preferences.dimRadius')}</span>
            <span className="text-center">{t('preferences.dimMenu')}</span>
            <span className="text-center">{t('preferences.dimAccent')}</span>
          </div>

          {/* Preset rows */}
          {BUILTIN_PRESETS.map((preset) => {
            const active = activePreset === preset.code
            const radius = getRadiusLabel(preset)
            return (
              <button
                key={preset.code}
                onClick={() => setActivePreset(preset.code)}
                className={cn(
                  'w-full grid items-center gap-x-3 px-4 py-3 text-left transition-colors border-b last:border-b-0',
                  active ? 'bg-primary/5' : 'hover:bg-accent/40'
                )}
                style={{ gridTemplateColumns: '1fr 36px 36px 90px 44px 36px 36px' }}
              >
                {/* Preset name + radio */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      'h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center',
                      active ? 'border-primary' : 'border-input'
                    )}
                  >
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-primary block" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className={cn('text-sm font-medium truncate', active && 'text-primary')}>
                      {preset.name}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">
                      {preset.code}
                    </p>
                  </div>
                </div>

                {/* Theme — primary color */}
                <div className="flex justify-center">
                  <span
                    className="h-5 w-5 rounded-full ring-1 ring-black/10 block"
                    style={{ backgroundColor: preset.light['--primary'] }}
                  />
                </div>

                {/* Base — muted/neutral palette */}
                <div className="flex justify-center">
                  <span
                    className="h-5 w-5 rounded ring-1 ring-black/10 block"
                    style={{ backgroundColor: preset.light['--muted'] }}
                  />
                </div>

                {/* Chart colors — 5 dots */}
                <div className="flex justify-center gap-0.5">
                  {CHART_KEYS.map((k) => (
                    <span
                      key={k}
                      className="h-3.5 w-3.5 rounded-full block"
                      style={{ backgroundColor: preset.light[k] }}
                    />
                  ))}
                </div>

                {/* Radius */}
                <div className="flex justify-center">
                  <span className="text-[11px] font-mono text-muted-foreground">{radius}</span>
                </div>

                {/* Menu — sidebar background */}
                <div className="flex justify-center">
                  <span
                    className="h-5 w-5 rounded ring-1 ring-black/10 block"
                    style={{ backgroundColor: preset.light['--sidebar'] }}
                  />
                </div>

                {/* Menu Accent — sidebar-primary */}
                <div className="flex justify-center">
                  <span
                    className="h-5 w-5 rounded-full ring-1 ring-black/10 block"
                    style={{ backgroundColor: preset.light['--sidebar-primary'] }}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* Coverage legend */}
        <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
          <p>
            <span className="font-semibold text-foreground">
              {t('preferences.dimSeparate')}
            </span>
            {' '}{t('preferences.dimSeparateItems')}
          </p>
          <p>
            <span className="font-semibold text-foreground">
              {t('preferences.dimFixed')}
            </span>
            {' '}{t('preferences.dimFixedItems')}
          </p>
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
