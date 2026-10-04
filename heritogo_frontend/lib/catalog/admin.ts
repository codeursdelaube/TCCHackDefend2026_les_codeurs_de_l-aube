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
    code === '42P01' ||
    code === 'PGRST205' ||
    /does not exist/i.test(message) ||
    /relation .* does not exist/i.test(message) ||
    /could not find the table/i.test(message)
  ) {
    return 'Les tables lieux/plats sont absentes. Exécutez prisma/places_tables.sql dans l’éditeur SQL Supabase.'
  }
  if (code === 'P2002' || code === '23505' || /duplicate key/i.test(message) || /unique constraint/i.test(message)) {
    return 'Cet identifiant existe déjà.'
  }
  if (/row-level security|permission denied|not allowed/i.test(message)) {
    return 'La base refuse l’écriture (RLS). Vérifiez les policies SQL des tables places/dishes.'
  }
  if (message) return message.slice(0, 240)
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
    if (!/^[0-9a-f-]{36}$/i.test(input.target_id)) return
    const { prisma } = await import('@/lib/prisma')
    await prisma.adminLog.create({ data: input })
  } catch (error) {
    console.error('[adminLog]', error)
  }
}
