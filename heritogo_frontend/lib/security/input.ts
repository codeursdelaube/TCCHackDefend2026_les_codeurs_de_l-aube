const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value)
}

export function clipString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

export function asStringArray(value: unknown, maxItems = 20, maxItemLength = 40): string[] | null {
  if (!Array.isArray(value)) return null
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, maxItemLength))
    .filter(Boolean)
    .slice(0, maxItems)
}

export function isSafeHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}

export function parseBoundedNumber(
  value: unknown,
  min: number,
  max: number
): number | null {
  const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(num) || num < min || num > max) return null
  return num
}

const ALLOWED_LANGS = new Set(['fr', 'en', 'es', 'zh'])

export function parseLocale(value: unknown, fallback = 'fr'): string {
  if (typeof value === 'string' && ALLOWED_LANGS.has(value)) return value
  return fallback
}
