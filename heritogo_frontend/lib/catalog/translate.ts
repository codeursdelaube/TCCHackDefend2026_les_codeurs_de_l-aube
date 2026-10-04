import {
  TRANSLATABLE_LOCALES,
  type DishCopy,
  type DishTranslations,
  type PlaceCopy,
  type PlaceTranslations,
  type TranslatableLocale,
} from './i18n'

// Map next-intl locale codes -> Google Translate / translation language codes
const LOCALE_TO_GTRANS: Record<TranslatableLocale, string> = {
  en: 'en',
  es: 'es',
  zh: 'zh-CN',
}

async function translateWithGoogleGtx(text: string, to: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
  if (!res.ok) throw new Error(`Google GTX HTTP ${res.status}`)
  const data = await res.json()
  if (Array.isArray(data) && Array.isArray(data[0])) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const translated = data[0].map((item: any) => item?.[0] || '').join('')
    if (translated.trim()) return translated
  }
  throw new Error('Empty translation from Google GTX')
}

async function translateWithMyMemory(text: string, to: string): Promise<string> {
  const langPair = `fr|${to === 'zh-CN' ? 'zh' : to}`
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}&de=contact@heritogo.com`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`)
  const data = await res.json()
  const translated = data?.responseData?.translatedText
  if (translated && typeof translated === 'string' && !translated.startsWith('MYMEMORY WARNING:')) {
    return translated
  }
  throw new Error('Empty or rate-limited translation from MyMemory')
}

async function translateText(text: string, to: string): Promise<string> {
  const clean = text.trim()
  if (!clean) return text
  try {
    return await translateWithGoogleGtx(clean, to)
  } catch {
    try {
      return await translateWithMyMemory(clean, to)
    } catch {
      return text
    }
  }
}

const COPY_KEYS = [
  'nom',
  'description',
  'histoire',
  'bestTime',
  'duration',
  'outfit',
  'access',
  'fee',
] as const

export async function translatePlaceCopy(source: PlaceCopy): Promise<PlaceTranslations> {
  const entries = COPY_KEYS
    .map((key) => [key, String(source[key] ?? '').trim()] as const)
    .filter(([, value]) => value.length > 0)

  if (entries.length === 0) return {}

  const translations: PlaceTranslations = {}

  for (const locale of TRANSLATABLE_LOCALES) {
    const gtLang = LOCALE_TO_GTRANS[locale]
    const translated = await Promise.all(
      entries.map(([, value]) => translateText(value, gtLang)),
    )

    const copy: PlaceCopy = {
      nom: source.nom,
      description: source.description,
      histoire: source.histoire,
    }
    entries.forEach(([key], index) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(copy as any)[key] = translated[index] || source[key]
    })
    translations[locale] = copy
  }

  return translations
}

export function parsePlaceTranslations(value: unknown): PlaceTranslations {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: PlaceTranslations = {}
  for (const locale of TRANSLATABLE_LOCALES) {
    const raw = (value as Record<string, unknown>)[locale]
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const row = raw as Record<string, unknown>
    result[locale as TranslatableLocale] = {
      nom: String(row.nom ?? ''),
      description: String(row.description ?? ''),
      histoire: String(row.histoire ?? ''),
      bestTime: row.bestTime != null ? String(row.bestTime) : null,
      duration: row.duration != null ? String(row.duration) : null,
      outfit: row.outfit != null ? String(row.outfit) : null,
      access: row.access != null ? String(row.access) : null,
      fee: row.fee != null ? String(row.fee) : null,
    }
  }
  return result
}

export async function translatePlaceSingleLocale(source: PlaceCopy, locale: TranslatableLocale): Promise<PlaceCopy> {
  const entries = COPY_KEYS
    .map((key) => [key, String(source[key] ?? '').trim()] as const)
    .filter(([, value]) => value.length > 0)

  if (entries.length === 0) return { ...source }

  const gtLang = LOCALE_TO_GTRANS[locale]
  const translated = await Promise.all(
    entries.map(([, value]) => translateText(value, gtLang)),
  )

  const copy: PlaceCopy = {
    nom: source.nom,
    description: source.description,
    histoire: source.histoire,
  }
  entries.forEach(([key], index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(copy as any)[key] = translated[index] || source[key]
  })
  return copy
}

const DISH_COPY_KEYS = ['nom', 'description', 'histoire', 'accompaniments'] as const

export async function translateDishSingleLocale(source: DishCopy, locale: TranslatableLocale): Promise<DishCopy> {
  const entries = DISH_COPY_KEYS
    .map((key) => [key, String(source[key] ?? '').trim()] as const)
    .filter(([, value]) => value.length > 0)

  if (entries.length === 0) return { ...source }

  const gtLang = LOCALE_TO_GTRANS[locale]
  const translated = await Promise.all(
    entries.map(([, value]) => translateText(value, gtLang)),
  )

  const copy: DishCopy = {
    nom: source.nom,
    description: source.description,
    histoire: source.histoire,
    accompaniments: source.accompaniments,
  }
  entries.forEach(([key], index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(copy as any)[key] = translated[index] || source[key]
  })
  return copy
}

export async function translateDishCopy(source: DishCopy): Promise<DishTranslations> {
  const entries = DISH_COPY_KEYS
    .map((key) => [key, String(source[key] ?? '').trim()] as const)
    .filter(([, value]) => value.length > 0)

  if (entries.length === 0) return {}

  const translations: DishTranslations = {}

  for (const locale of TRANSLATABLE_LOCALES) {
    translations[locale] = await translateDishSingleLocale(source, locale)
  }

  return translations
}

export function parseDishTranslations(value: unknown): DishTranslations {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: DishTranslations = {}
  for (const locale of TRANSLATABLE_LOCALES) {
    const raw = (value as Record<string, unknown>)[locale]
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const row = raw as Record<string, unknown>
    result[locale as TranslatableLocale] = {
      nom: String(row.nom ?? ''),
      description: String(row.description ?? ''),
      histoire: String(row.histoire ?? ''),
      accompaniments: row.accompaniments != null ? String(row.accompaniments) : null,
    }
  }
  return result
}

export function dishCopyFromFrench(input: {
  name: string
  description: string
  history?: string | null
  accompaniments?: string | null
}): DishCopy {
  return {
    nom: input.name,
    description: input.description,
    histoire: input.history || input.description,
    accompaniments: input.accompaniments ?? null,
  }
}

export function placeCopyFromFrench(input: {
  name: string
  description: string
  history: string
  best_time?: string | null
  duration?: string | null
  outfit?: string | null
  access_info?: string | null
  fee?: string | null
}): PlaceCopy {
  return {
    nom: input.name,
    description: input.description,
    histoire: input.history,
    bestTime: input.best_time,
    duration: input.duration,
    outfit: input.outfit,
    access: input.access_info,
    fee: input.fee,
  }
}
