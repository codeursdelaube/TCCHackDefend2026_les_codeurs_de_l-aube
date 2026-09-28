export const DEFAULT_TOGO_LAT = 8.6195
export const DEFAULT_TOGO_LNG = 0.8248

export function parseCoord(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const raw = String(value ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.')
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function catalogDbError(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? String((error as { code: unknown }).code) : ''
  const message =
    error && typeof error === 'object' && 'message' in error ? String((error as { message: unknown }).message) : ''
  if (
    code === 'P2021' ||
    code === 'P2022' ||
    /does not exist/i.test(message) ||
    /relation .* does not exist/i.test(message)
  ) {
    return 'Les tables lieux/plats sont absentes. Exécutez prisma/places_tables.sql dans l’éditeur SQL Supabase.'
  }
  return null
}

export async function logAdminAction(input: {
  admin_id: string
  action: string
  target_type: string
  target_id: string
  details: Record<string, string>
}) {
  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.adminLog.create({ data: input })
  } catch (error) {
    console.error('[adminLog]', error)
  }
}
