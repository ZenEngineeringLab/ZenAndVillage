import type { RadiusOption, MenuColorOption, MenuAccentOption } from '../types/entities'

// ── Types ──────────────────────────────────────────────────────────────

interface PartialThemeVars {
  '--primary': string
  '--primary-foreground': string
  '--chart-1': string
  '--chart-2': string
  '--chart-3': string
  '--chart-4': string
  '--chart-5': string
}

export interface ColorPreset {
  code: string
  name: string
  /** Light-mode primary color — used to render the circle swatch */
  swatch: string
  light: PartialThemeVars
  dark: PartialThemeVars
}

// ── Radius map ─────────────────────────────────────────────────────────

export const RADIUS_VALUES: Record<RadiusOption, string> = {
  none:    '0',
  small:   '0.45rem',
  default: '0.625rem',
  large:   '0.875rem',
}

// ── Sidebar vars for menu-color: inverted ──────────────────────────────

const INVERTED_LIGHT = [
  '--sidebar: oklch(0.145 0 0)',
  '--sidebar-foreground: oklch(0.985 0 0)',
  '--sidebar-accent: oklch(0.269 0 0)',
  '--sidebar-accent-foreground: oklch(0.985 0 0)',
  '--sidebar-border: oklch(1 0 0 / 10%)',
  '--sidebar-ring: oklch(0.556 0 0)',
]

const INVERTED_DARK = [
  '--sidebar: oklch(0.095 0 0)',
]

// ── Presets ────────────────────────────────────────────────────────────

export const BUILTIN_PRESETS: ColorPreset[] = [
  {
    code: 'b48',
    name: 'Neutral',
    swatch: 'oklch(0.205 0 0)',
    light: {
      '--primary':            'oklch(0.205 0 0)',
      '--primary-foreground': 'oklch(0.985 0 0)',
      '--chart-1': 'oklch(0.87 0 0)',
      '--chart-2': 'oklch(0.556 0 0)',
      '--chart-3': 'oklch(0.439 0 0)',
      '--chart-4': 'oklch(0.371 0 0)',
      '--chart-5': 'oklch(0.269 0 0)',
    },
    dark: {
      '--primary':            'oklch(0.922 0 0)',
      '--primary-foreground': 'oklch(0.205 0 0)',
      '--chart-1': 'oklch(0.87 0 0)',
      '--chart-2': 'oklch(0.556 0 0)',
      '--chart-3': 'oklch(0.439 0 0)',
      '--chart-4': 'oklch(0.371 0 0)',
      '--chart-5': 'oklch(0.269 0 0)',
    },
  },
  {
    code: 'b1Ymqvgiu',
    name: 'Blue',
    swatch: 'oklch(0.488 0.243 264.376)',
    light: {
      '--primary':            'oklch(0.488 0.243 264.376)',
      '--primary-foreground': 'oklch(0.97 0.014 254.604)',
      '--chart-1': 'oklch(0.809 0.105 251.813)',
      '--chart-2': 'oklch(0.623 0.214 259.815)',
      '--chart-3': 'oklch(0.546 0.245 262.881)',
      '--chart-4': 'oklch(0.488 0.243 264.376)',
      '--chart-5': 'oklch(0.424 0.199 265.638)',
    },
    dark: {
      '--primary':            'oklch(0.424 0.199 265.638)',
      '--primary-foreground': 'oklch(0.97 0.014 254.604)',
      '--chart-1': 'oklch(0.809 0.105 251.813)',
      '--chart-2': 'oklch(0.623 0.214 259.815)',
      '--chart-3': 'oklch(0.546 0.245 262.881)',
      '--chart-4': 'oklch(0.488 0.243 264.376)',
      '--chart-5': 'oklch(0.424 0.199 265.638)',
    },
  },
  {
    code: 'b1s91W1fU',
    name: 'Cyan',
    swatch: 'oklch(0.52 0.105 223.128)',
    light: {
      '--primary':            'oklch(0.52 0.105 223.128)',
      '--primary-foreground': 'oklch(0.984 0.019 200.873)',
      '--chart-1': 'oklch(0.865 0.127 207.078)',
      '--chart-2': 'oklch(0.715 0.143 215.221)',
      '--chart-3': 'oklch(0.609 0.126 221.723)',
      '--chart-4': 'oklch(0.52 0.105 223.128)',
      '--chart-5': 'oklch(0.45 0.085 224.283)',
    },
    dark: {
      '--primary':            'oklch(0.45 0.085 224.283)',
      '--primary-foreground': 'oklch(0.984 0.019 200.873)',
      '--chart-1': 'oklch(0.865 0.127 207.078)',
      '--chart-2': 'oklch(0.715 0.143 215.221)',
      '--chart-3': 'oklch(0.609 0.126 221.723)',
      '--chart-4': 'oklch(0.52 0.105 223.128)',
      '--chart-5': 'oklch(0.45 0.085 224.283)',
    },
  },
  {
    code: 'emerald',
    name: 'Emerald',
    swatch: 'oklch(0.508 0.118 165.612)',
    light: {
      '--primary':            'oklch(0.508 0.118 165.612)',
      '--primary-foreground': 'oklch(0.979 0.021 166.113)',
      '--chart-1': 'oklch(0.845 0.143 164.978)',
      '--chart-2': 'oklch(0.696 0.17 162.48)',
      '--chart-3': 'oklch(0.596 0.145 163.225)',
      '--chart-4': 'oklch(0.508 0.118 165.612)',
      '--chart-5': 'oklch(0.432 0.095 166.913)',
    },
    dark: {
      '--primary':            'oklch(0.432 0.095 166.913)',
      '--primary-foreground': 'oklch(0.979 0.021 166.113)',
      '--chart-1': 'oklch(0.845 0.143 164.978)',
      '--chart-2': 'oklch(0.696 0.17 162.48)',
      '--chart-3': 'oklch(0.596 0.145 163.225)',
      '--chart-4': 'oklch(0.508 0.118 165.612)',
      '--chart-5': 'oklch(0.432 0.095 166.913)',
    },
  },
  {
    code: 'b43eDcOHY',
    name: 'Pink',
    swatch: 'oklch(0.525 0.223 3.958)',
    light: {
      '--primary':            'oklch(0.525 0.223 3.958)',
      '--primary-foreground': 'oklch(0.971 0.014 343.198)',
      '--chart-1': 'oklch(0.823 0.12 346.018)',
      '--chart-2': 'oklch(0.656 0.241 354.308)',
      '--chart-3': 'oklch(0.592 0.249 0.584)',
      '--chart-4': 'oklch(0.525 0.223 3.958)',
      '--chart-5': 'oklch(0.459 0.187 3.815)',
    },
    dark: {
      '--primary':            'oklch(0.459 0.187 3.815)',
      '--primary-foreground': 'oklch(0.971 0.014 343.198)',
      '--chart-1': 'oklch(0.823 0.12 346.018)',
      '--chart-2': 'oklch(0.656 0.241 354.308)',
      '--chart-3': 'oklch(0.592 0.249 0.584)',
      '--chart-4': 'oklch(0.525 0.223 3.958)',
      '--chart-5': 'oklch(0.459 0.187 3.815)',
    },
  },
  {
    code: 'b6F9Piktc',
    name: 'Yellow',
    swatch: 'oklch(0.852 0.199 91.936)',
    light: {
      '--primary':            'oklch(0.852 0.199 91.936)',
      '--primary-foreground': 'oklch(0.421 0.095 57.708)',
      '--chart-1': 'oklch(0.905 0.182 98.111)',
      '--chart-2': 'oklch(0.795 0.184 86.047)',
      '--chart-3': 'oklch(0.681 0.162 75.834)',
      '--chart-4': 'oklch(0.554 0.135 66.442)',
      '--chart-5': 'oklch(0.476 0.114 61.907)',
    },
    dark: {
      '--primary':            'oklch(0.795 0.184 86.047)',
      '--primary-foreground': 'oklch(0.421 0.095 57.708)',
      '--chart-1': 'oklch(0.905 0.182 98.111)',
      '--chart-2': 'oklch(0.795 0.184 86.047)',
      '--chart-3': 'oklch(0.681 0.162 75.834)',
      '--chart-4': 'oklch(0.554 0.135 66.442)',
      '--chart-5': 'oklch(0.476 0.114 61.907)',
    },
  },
  {
    code: 'b6F9OrxVQ',
    name: 'Sky',
    swatch: 'oklch(0.5 0.134 242.749)',
    light: {
      '--primary':            'oklch(0.5 0.134 242.749)',
      '--primary-foreground': 'oklch(0.977 0.013 236.62)',
      '--chart-1': 'oklch(0.905 0.182 98.111)',
      '--chart-2': 'oklch(0.795 0.184 86.047)',
      '--chart-3': 'oklch(0.681 0.162 75.834)',
      '--chart-4': 'oklch(0.554 0.135 66.442)',
      '--chart-5': 'oklch(0.476 0.114 61.907)',
    },
    dark: {
      '--primary':            'oklch(0.443 0.11 240.79)',
      '--primary-foreground': 'oklch(0.977 0.013 236.62)',
      '--chart-1': 'oklch(0.905 0.182 98.111)',
      '--chart-2': 'oklch(0.795 0.184 86.047)',
      '--chart-3': 'oklch(0.681 0.162 75.834)',
      '--chart-4': 'oklch(0.554 0.135 66.442)',
      '--chart-5': 'oklch(0.476 0.114 61.907)',
    },
  },
  {
    code: 'b2oDXYddI',
    name: 'Indigo',
    swatch: 'oklch(0.457 0.24 277.023)',
    light: {
      '--primary':            'oklch(0.457 0.24 277.023)',
      '--primary-foreground': 'oklch(0.962 0.018 272.314)',
      '--chart-1': 'oklch(0.871 0.15 154.449)',
      '--chart-2': 'oklch(0.723 0.219 149.579)',
      '--chart-3': 'oklch(0.627 0.194 149.214)',
      '--chart-4': 'oklch(0.527 0.154 150.069)',
      '--chart-5': 'oklch(0.448 0.119 151.328)',
    },
    dark: {
      '--primary':            'oklch(0.398 0.195 277.366)',
      '--primary-foreground': 'oklch(0.962 0.018 272.314)',
      '--chart-1': 'oklch(0.871 0.15 154.449)',
      '--chart-2': 'oklch(0.723 0.219 149.579)',
      '--chart-3': 'oklch(0.627 0.194 149.214)',
      '--chart-4': 'oklch(0.527 0.154 150.069)',
      '--chart-5': 'oklch(0.448 0.119 151.328)',
    },
  },
  {
    code: 'b4gMVfTk0',
    name: 'Amber',
    swatch: 'oklch(0.555 0.163 48.998)',
    light: {
      '--primary':            'oklch(0.555 0.163 48.998)',
      '--primary-foreground': 'oklch(0.987 0.022 95.277)',
      '--chart-1': 'oklch(0.808 0.114 19.571)',
      '--chart-2': 'oklch(0.637 0.237 25.331)',
      '--chart-3': 'oklch(0.577 0.245 27.325)',
      '--chart-4': 'oklch(0.505 0.213 27.518)',
      '--chart-5': 'oklch(0.444 0.177 26.899)',
    },
    dark: {
      '--primary':            'oklch(0.473 0.137 46.201)',
      '--primary-foreground': 'oklch(0.987 0.022 95.277)',
      '--chart-1': 'oklch(0.808 0.114 19.571)',
      '--chart-2': 'oklch(0.637 0.237 25.331)',
      '--chart-3': 'oklch(0.577 0.245 27.325)',
      '--chart-4': 'oklch(0.505 0.213 27.518)',
      '--chart-5': 'oklch(0.444 0.177 26.899)',
    },
  },
  {
    code: 'b5cR2Yt60',
    name: 'Lime',
    swatch: 'oklch(0.841 0.238 128.85)',
    light: {
      '--primary':            'oklch(0.841 0.238 128.85)',
      '--primary-foreground': 'oklch(0.405 0.101 131.063)',
      '--chart-1': 'oklch(0.855 0.138 181.071)',
      '--chart-2': 'oklch(0.704 0.14 182.503)',
      '--chart-3': 'oklch(0.6 0.118 184.704)',
      '--chart-4': 'oklch(0.511 0.096 186.391)',
      '--chart-5': 'oklch(0.437 0.078 188.216)',
    },
    dark: {
      '--primary':            'oklch(0.768 0.233 130.85)',
      '--primary-foreground': 'oklch(0.405 0.101 131.063)',
      '--chart-1': 'oklch(0.855 0.138 181.071)',
      '--chart-2': 'oklch(0.704 0.14 182.503)',
      '--chart-3': 'oklch(0.6 0.118 184.704)',
      '--chart-4': 'oklch(0.511 0.096 186.391)',
      '--chart-5': 'oklch(0.437 0.078 188.216)',
    },
  },
]

// ── CSS builder ────────────────────────────────────────────────────────

export function buildPresetCSS(
  preset:      ColorPreset,
  radius:      RadiusOption,
  menuColor:   MenuColorOption,
  menuAccent:  MenuAccentOption,
): string {
  const rootLines: string[] = []
  const darkLines: string[] = []

  // Primary + charts
  for (const [k, v] of Object.entries(preset.light)) {
    rootLines.push(`  ${k}: ${v};`)
  }
  for (const [k, v] of Object.entries(preset.dark)) {
    darkLines.push(`  ${k}: ${v};`)
  }

  // Radius
  rootLines.push(`  --radius: ${RADIUS_VALUES[radius]};`)

  // Menu color — inverted: dark sidebar in light mode
  if (menuColor === 'inverted') {
    for (const decl of INVERTED_LIGHT) {
      rootLines.push(`  ${decl};`)
    }
    for (const decl of INVERTED_DARK) {
      darkLines.push(`  ${decl};`)
    }
  }

  // Menu accent — bold: sidebar active item uses primary
  if (menuAccent === 'bold') {
    rootLines.push(
      '  --sidebar-primary: var(--primary);',
      '  --sidebar-primary-foreground: var(--primary-foreground);',
    )
    darkLines.push(
      '  --sidebar-primary: var(--primary);',
      '  --sidebar-primary-foreground: var(--primary-foreground);',
    )
  }

  return `:root {\n${rootLines.join('\n')}\n}\n.dark {\n${darkLines.join('\n')}\n}`
}
