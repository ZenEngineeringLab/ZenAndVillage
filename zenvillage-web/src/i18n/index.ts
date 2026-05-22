import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import enUS from './locales/en_US.json'
import ptBR from './locales/pt_BR.json'

const SUPPORTED_LOCALES = ['en_US', 'pt_BR'] as const
export type SupportedLocale = typeof SUPPORTED_LOCALES[number]

function detectBrowserLocale(): SupportedLocale {
  for (const lang of navigator.languages ?? [navigator.language]) {
    const normalized = lang.replace('-', '_')
    if ((SUPPORTED_LOCALES as readonly string[]).includes(normalized)) {
      return normalized as SupportedLocale
    }
    if (lang.startsWith('pt')) return 'pt_BR'
    if (lang.startsWith('en')) return 'en_US'
  }
  return 'en_US'
}

export function resolveLocale(preference: string): SupportedLocale {
  if (preference === 'en_US' || preference === 'pt_BR') return preference
  return detectBrowserLocale()
}

export function getDetectedLocale(): SupportedLocale {
  return detectBrowserLocale()
}

i18next
  .use(initReactI18next)
  .init({
    supportedLngs: ['en_US', 'pt_BR'],
    fallbackLng: 'en_US',
    lng: resolveLocale('auto'),
    interpolation: { escapeValue: false },
    resources: {
      en_US: { translation: enUS },
      pt_BR: { translation: ptBR },
    },
  })

export default i18next
