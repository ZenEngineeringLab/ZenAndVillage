export type FontChoice = 'inter' | 'oxanium' | 'lora'

export interface Font {
  value: FontChoice
  label: string
  family: string
  sansFamily: boolean
}

export const FONTS: Font[] = [
  {
    value: 'inter',
    label: 'Inter',
    family: "'Inter', ui-sans-serif, system-ui, sans-serif",
    sansFamily: true,
  },
  {
    value: 'oxanium',
    label: 'Oxanium',
    family: "'Oxanium', ui-sans-serif, system-ui, sans-serif",
    sansFamily: true,
  },
  {
    value: 'lora',
    label: 'Lora',
    family: "'Lora', ui-serif, Georgia, serif",
    sansFamily: false,
  },
]

export const DEFAULT_BODY_FONT: FontChoice = 'inter'
export const DEFAULT_HEADING_FONT: FontChoice = 'inter'
