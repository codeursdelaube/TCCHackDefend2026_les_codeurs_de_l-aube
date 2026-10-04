import { TRANSLATABLE_LOCALES, type PlaceCopy, type PlaceTranslations, type TranslatableLocale } from './i18n'

const DEFAULT_ENDPOINT = 'https://libretranslate.com/translate'

function endpoint() {
  return (process.env.LIBRETRANSLATE_URL || DEFAULT_ENDPOINT).replace(/\/$/, '')
}

function apiKey() {
  return process.env.LIBRETRANSLATE_API_KEY || process.env.LIBRETRANSLATE_KEY || ''
}

async function translateBatch(texts: string[], source: string, target: string): Promise<string[]> {
  if (texts.length === 0) return []

  const payload: Record<string, unknown> = {
    q: texts.length === 1 ? texts[0] : texts,
    source,
    target,
    format: 'text',
  }
  const key = apiKey()
  if (key) payload.api_key = key

  const response = await fetch(endpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const json = (await response.json().catch(() => ({}))) as {
    translatedText?: string | string[]
    error?: string
  }

  if (!response.ok) {
    const message = json.error || `LibreTranslate HTTP ${response.status}`
    if (/api key/i.test(message)) {
      throw new Error(
        'LibreTranslate.com exige une clé API. Ajoutez LIBRETRANSLATE_API_KEY (https://portal.libretranslate.com) ou définissez LIBRETRANSLATE_URL vers une instance auto-hébergée.',
      )
    }
    throw new Error(message)
  }

  if (Array.isArray(json.translatedText)) return json.translatedText.map((item) => String(item ?? ''))
  if (typeof json.translatedText === 'string') return [json.translatedText]
  throw new Error('Réponse LibreTranslate inattendue.')
}

const COPY_KEYS = ['nom', 'description', 'histoire', 'bestTime', 'duration', 'outfit', 'access', 'fee'] as const

export async function translatePlaceCopy(source: PlaceCopy): Promise<PlaceTranslations> {
  const entries = COPY_KEYS
    .map((key) => [key, String(source[key] ?? '').trim()] as const)
    .filter(([, value]) => value.length > 0)

  if (entries.length === 0) return {}

  const translations: PlaceTranslations = {}
  for (const locale of TRANSLATABLE_LOCALES) {
    const translated = await translateBatch(
      entries.map(([, value]) => value),
      'fr',
      locale,
    )
    const copy: PlaceCopy = {
      nom: source.nom,
      description: source.description,
      histoire: source.histoire,
    }
    entries.forEach(([key], index) => {
      copy[key] = translated[index] || source[key]
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
