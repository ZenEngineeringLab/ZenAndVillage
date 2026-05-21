import { useEffect } from 'react'
import { useAppStore } from '../store/app.store'
import { BUILTIN_PRESETS, buildPresetCSS } from '../data/presets'

const STYLE_ID = 'zen-preset-overrides'

export function useTheme() {
  const { theme, setTheme, activePreset, setActivePreset } = useAppStore()

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

  useEffect(() => {
    const preset = BUILTIN_PRESETS.find((p) => p.code === activePreset)
    if (!preset) return

    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = STYLE_ID
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = buildPresetCSS(preset)
  }, [activePreset])

  return { theme, setTheme, activePreset, setActivePreset }
}
