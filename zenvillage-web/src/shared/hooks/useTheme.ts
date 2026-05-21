import { useEffect } from 'react'
import { useAppStore } from '../store/app.store'

export function useTheme() {
  const { theme, setTheme, colorTheme, setColorTheme } = useAppStore()

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
    document.documentElement.setAttribute('data-color-theme', colorTheme)
  }, [colorTheme])

  return { theme, setTheme, colorTheme, setColorTheme }
}
