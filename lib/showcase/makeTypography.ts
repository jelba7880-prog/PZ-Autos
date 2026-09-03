// Wordmark-evoking styles for makes the dealership actually carries (see
// lib/carOptions.ts CAR_MAKES_WITH_MODELS). These approximate each brand's
// real wordmark FEEL — weight, tracking, case, italic — using only the
// fonts already licensed and loaded for this site (Archivo/Barlow via
// next/font). No proprietary brand typeface is sourced or embedded; any
// make not in this map (including anything free-typed into the admin
// Make field) renders in the site's normal default type, unchanged.

export type MakeStyleConfig = {
  fontFamily: 'archivo' | 'barlow'
  fontWeight: 300 | 400 | 600 | 700 | 900
  letterSpacing: string
  textTransform: 'uppercase' | 'lowercase'
  fontStyle?: 'italic'
}

const MAKE_STYLES: Record<string, MakeStyleConfig> = {
  'mercedes-benz': { fontFamily: 'barlow', fontWeight: 400, letterSpacing: '0.16em', textTransform: 'uppercase' },
  bmw: { fontFamily: 'barlow', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' },
  audi: { fontFamily: 'barlow', fontWeight: 300, letterSpacing: '0.20em', textTransform: 'uppercase' },
  volkswagen: { fontFamily: 'barlow', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
  volvo: { fontFamily: 'barlow', fontWeight: 400, letterSpacing: '0.10em', textTransform: 'uppercase' },
  'land rover': { fontFamily: 'archivo', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' },
  'range rover': { fontFamily: 'barlow', fontWeight: 400, letterSpacing: '0.20em', textTransform: 'uppercase' },
  lexus: { fontFamily: 'barlow', fontWeight: 300, letterSpacing: '0.10em', textTransform: 'uppercase' },
  toyota: { fontFamily: 'archivo', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase' },
  kia: { fontFamily: 'barlow', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'lowercase', fontStyle: 'italic' },
  nissan: { fontFamily: 'archivo', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' },
  acura: { fontFamily: 'archivo', fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase' },
  infiniti: { fontFamily: 'barlow', fontWeight: 300, letterSpacing: '0.22em', textTransform: 'uppercase' },
  jeep: { fontFamily: 'archivo', fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase' },
  chevrolet: { fontFamily: 'archivo', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' },
}

export function normalizeMakeName(make: string): string {
  return make.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function getMakeTypography(make: string): MakeStyleConfig | undefined {
  return MAKE_STYLES[normalizeMakeName(make)]
}
