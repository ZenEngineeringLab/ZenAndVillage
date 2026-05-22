import { Sun, Moon, Monitor, Globe, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/shared/components/ui/separator'
import { useTheme } from '@/shared/hooks/useTheme'
import { useLocale } from '@/shared/hooks/useLocale'
import { cn } from '@/shared/lib/utils'
import { BUILTIN_PRESETS } from '@/shared/data/presets'
import { FONTS } from '@/shared/data/fonts'
import type { FontChoice } from '@/shared/data/fonts'
import type { Theme, Locale, RadiusOption, MenuColorOption, MenuAccentOption } from '@/shared/types/entities'

// ── Generic horizontal option list ────────────────────────────────────

interface OptionItem<T> {
  value: T
  label: string
  hint?: string
}

function OptionRow<T extends string>({
  items,
  selected,
  onChange,
  renderItem,
}: {
  items: OptionItem<T>[]
  selected: T
  onChange: (v: T) => void
  renderItem?: (item: OptionItem<T>, active: boolean) => React.ReactNode
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected === item.value
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
              active
                ? 'border-primary bg-primary/5 text-primary font-medium'
                : 'border-border hover:bg-accent',
            )}
          >
            {renderItem
              ? renderItem(item, active)
              : (
                <>
                  <span>{item.label}</span>
                  {item.hint && (
                    <span className={cn('text-xs', active ? 'text-primary/70' : 'text-muted-foreground')}>
                      {item.hint}
                    </span>
                  )}
                  {active && <Check className="h-3.5 w-3.5 shrink-0" />}
                </>
              )
            }
          </button>
        )
      })}
    </div>
  )
}

// ── Font option row ────────────────────────────────────────────────────

function FontRow({
  selected,
  onChange,
}: {
  selected: FontChoice
  onChange: (f: FontChoice) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FONTS.map((font) => {
        const active = selected === font.value
        return (
          <button
            key={font.value}
            onClick={() => onChange(font.value)}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-4 py-2.5 transition-colors',
              active
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-accent',
            )}
          >
            <span
              className={cn('text-sm font-semibold', active && 'text-primary')}
              style={{ fontFamily: font.family }}
            >
              {font.label}
            </span>
            <span
              className="text-xs text-muted-foreground"
              style={{ fontFamily: font.family }}
            >
              Aa
            </span>
            {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
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
    activeRadius, setActiveRadius,
    activeMenuColor, setActiveMenuColor,
    activeMenuAccent, setActiveMenuAccent,
    activeBodyFont, setActiveBodyFont,
    activeHeadingFont, setActiveHeadingFont,
  } = useTheme()
  const { locale, detectedLocale, changeLocale } = useLocale()

  // ── Option configs ─────────────────────────────────────────────────

  const themeItems: OptionItem<Theme>[] = [
    { value: 'light', label: t('preferences.theme.light'), hint: undefined },
    { value: 'dark',  label: t('preferences.theme.dark'),  hint: undefined },
    { value: 'auto',  label: t('preferences.theme.auto'),  hint: undefined },
  ]

  const themeIcons: Record<Theme, React.ElementType> = {
    light: Sun,
    dark:  Moon,
    auto:  Monitor,
  }

  const radiusItems: OptionItem<RadiusOption>[] = [
    { value: 'none',    label: t('preferences.radiusNone'),    hint: '0px' },
    { value: 'small',   label: t('preferences.radiusSmall'),   hint: '7px' },
    { value: 'default', label: t('preferences.radiusDefault'), hint: '10px' },
    { value: 'large',   label: t('preferences.radiusLarge'),   hint: '14px' },
  ]

  const menuColorItems: OptionItem<MenuColorOption>[] = [
    { value: 'default',  label: t('preferences.menuColorDefault') },
    { value: 'inverted', label: t('preferences.menuColorInverted') },
  ]

  const menuAccentItems: OptionItem<MenuAccentOption>[] = [
    { value: 'subtle', label: t('preferences.menuAccentSubtle') },
    { value: 'bold',   label: t('preferences.menuAccentBold') },
  ]

  const localeItems: { value: Locale; label: string }[] = [
    { value: 'pt_BR', label: t('preferences.locale.ptBR') },
    { value: 'en_US', label: t('preferences.locale.enUS') },
    { value: 'auto',  label: `${t('preferences.locale.auto')} (${detectedLocale.replace('_', '-')})` },
  ]

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t('preferences.title')}</h1>

      {/* ── Color Preset ─────────────────────────────────────────── */}
      <section className="space-y-4 mb-8">
        <div>
          <h2 className="text-lg font-semibold">{t('preferences.colorPreset')}</h2>
          <p className="text-sm text-muted-foreground">{t('preferences.colorPresetDesc')}</p>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {BUILTIN_PRESETS.map((preset) => {
            const active = activePreset === preset.code
            return (
              <button
                key={preset.code}
                onClick={() => setActivePreset(preset.code)}
                className="flex flex-col items-center gap-1.5 group"
                title={preset.name}
              >
                <span
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center text-[10px] font-semibold leading-tight px-1 text-center transition-all',
                    active
                      ? 'ring-[3px] ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-105',
                  )}
                  style={{
                    backgroundColor: preset.swatch,
                    color: preset.light['--primary-foreground'],
                  }}
                >
                  {active ? <Check className="h-5 w-5" /> : preset.name}
                </span>
                <span
                  className={cn(
                    'text-[11px] text-center leading-tight',
                    active ? 'font-semibold text-primary' : 'text-muted-foreground',
                  )}
                >
                  {preset.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Fixed items note */}
        <p className="text-xs text-muted-foreground pt-1">
          <span className="font-semibold text-foreground">{t('preferences.dimFixed')}</span>
          {' '}{t('preferences.dimFixedItems')}
        </p>
      </section>

      <Separator />

      {/* ── Radius ───────────────────────────────────────────────── */}
      <section className="space-y-3 my-8">
        <div>
          <h2 className="text-lg font-semibold">{t('preferences.radius')}</h2>
          <p className="text-sm text-muted-foreground">{t('preferences.radiusDesc')}</p>
        </div>
        <OptionRow items={radiusItems} selected={activeRadius} onChange={setActiveRadius} />
      </section>

      <Separator />

      {/* ── Menu ─────────────────────────────────────────────────── */}
      <section className="space-y-3 my-8">
        <div>
          <h2 className="text-lg font-semibold">{t('preferences.menuColor')}</h2>
          <p className="text-sm text-muted-foreground">{t('preferences.menuColorDesc')}</p>
        </div>
        <OptionRow items={menuColorItems} selected={activeMenuColor} onChange={setActiveMenuColor} />
      </section>

      <Separator />

      {/* ── Menu Accent ──────────────────────────────────────────── */}
      <section className="space-y-3 my-8">
        <div>
          <h2 className="text-lg font-semibold">{t('preferences.menuAccent')}</h2>
          <p className="text-sm text-muted-foreground">{t('preferences.menuAccentDesc')}</p>
        </div>
        <OptionRow items={menuAccentItems} selected={activeMenuAccent} onChange={setActiveMenuAccent} />
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
          <FontRow selected={activeHeadingFont} onChange={setActiveHeadingFont} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t('preferences.bodyFont')}</p>
          <FontRow selected={activeBodyFont} onChange={setActiveBodyFont} />
        </div>
      </section>

      <Separator />

      {/* ── Appearance ───────────────────────────────────────────── */}
      <section className="space-y-4 my-8">
        <div>
          <h2 className="text-lg font-semibold">{t('preferences.appearance')}</h2>
          <p className="text-sm text-muted-foreground">{t('preferences.appearanceDesc')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {themeItems.map(({ value, label }) => {
            const active = theme === value
            const Icon = themeIcons[value]
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
                  active
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-border hover:bg-accent',
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {active && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            )
          })}
        </div>
      </section>

      <Separator />

      {/* ── Language ─────────────────────────────────────────────── */}
      <section className="space-y-4 mt-8">
        <div>
          <h2 className="text-lg font-semibold">{t('preferences.language')}</h2>
          <p className="text-sm text-muted-foreground">{t('preferences.languageDesc')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {localeItems.map(({ value, label }) => {
            const active = locale === value
            return (
              <button
                key={value}
                onClick={() => changeLocale(value)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
                  active
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-border hover:bg-accent',
                )}
              >
                <Globe className="h-4 w-4" />
                <span>{label}</span>
                {active && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
