import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/app.store'
import { resolveLocale, getDetectedLocale } from '@/i18n'
import type { Locale } from '../types/entities'

export function useLocale() {
  const { locale, setLocale } = useAppStore()
  const { i18n } = useTranslation()

  useEffect(() => {
    const resolved = resolveLocale(locale)
    if (i18n.language !== resolved) {
      i18n.changeLanguage(resolved)
    }
  }, [locale, i18n])

  const detectedLocale = getDetectedLocale()
  const resolvedLocale = resolveLocale(locale)

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
  }

  return { locale, resolvedLocale, detectedLocale, changeLocale }
}
