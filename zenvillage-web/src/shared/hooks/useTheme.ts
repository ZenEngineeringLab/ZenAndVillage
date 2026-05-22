import { useEffect } from 'react'
import { useAppStore } from '../store/app.store'
import { BUILTIN_PRESETS, buildPresetCSS } from '../data/presets'
import { FONTS } from '../data/fonts'

const STYLE_ID = 'zen-preset-overrides'

export function useTheme() {
  const {
    theme, setTheme,
    activePreset, setActivePreset,
    activeRadius, setActiveRadius,
    activeMenuColor, setActiveMenuColor,
    activeMenuAccent, setActiveMenuAccent,
    activeBodyFont, setActiveBodyFont,
    activeHeadingFont, setActiveHeadingFont,
  } = useAppStore()

  // ── Dark/light class ────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const apply = (e: MediaQueryListEvent | MediaQueryList) => {
        if (e.matches) root.classList.add('dark')
        else root.classList.remove('dark')
      }
      apply(mediaQuery)
      mediaQuery.addEventListener('change', apply)
      return () => mediaQuery.removeEventListener('change', apply)
    }
  }, [theme])

  // ── Preset + radius + menu vars ─────────────────────────────────────
  useEffect(() => {
    const preset = BUILTIN_PRESETS.find((p) => p.code === activePreset)
    if (!preset) return

    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = STYLE_ID
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = buildPresetCSS(preset, activeRadius, activeMenuColor, activeMenuAccent)
  }, [activePreset, activeRadius, activeMenuColor, activeMenuAccent])

  // ── Body font ───────────────────────────────────────────────────────
  useEffect(() => {
    const font = FONTS.find((f) => f.value === activeBodyFont)
    if (font) {
      document.documentElement.style.setProperty('--font-body', font.family)
    }
  }, [activeBodyFont])

  // ── Heading font ────────────────────────────────────────────────────
  useEffect(() => {
    const font = FONTS.find((f) => f.value === activeHeadingFont)
    if (font) {
      document.documentElement.style.setProperty('--font-heading-family', font.family)
    }
  }, [activeHeadingFont])

  return {
    theme, setTheme,
    activePreset, setActivePreset,
    activeRadius, setActiveRadius,
    activeMenuColor, setActiveMenuColor,
    activeMenuAccent, setActiveMenuAccent,
    activeBodyFont, setActiveBodyFont,
    activeHeadingFont, setActiveHeadingFont,
  }
}
