import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServiceClient } from '@/lib/supabase/service'
import { mapPlace, resolveCatalogLocale } from '@/lib/catalog/map'
import { parsePlaceTranslations, placeCopyFromFrench, translatePlaceSingleLocale } from '@/lib/catalog/translate'
import type { TranslatableLocale } from '@/lib/catalog/i18n'

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

/** Persist translations via service client (bypasses RLS, works with pgbouncer) */
async function saveTranslations(placeId: string, translations: Record<string, unknown>) {
  const supabase = createServiceClient()
  if (supabase) {
    const { error } = await supabase
      .from('places')
      .update({ translations })
      .eq('id', placeId)
    if (error) console.error('[saveTranslations supabase]', error.message)
    return
  }
  // Fallback: try prisma (may fail on pgbouncer but won't crash the request)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.place as any).update({ where: { id: placeId }, data: { translations } })
  } catch (err) {
    console.error('[saveTranslations prisma]', err)
  }
}

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const locale = resolveCatalogLocale(new URL(request.url).searchParams.get('locale'))
    const place = await prisma.place.findFirst({
      where: {
        is_published: true,
        OR: isUuid(id) ? [{ slug: id }, { id }] : [{ slug: id }],
      },
    })
    if (!place) {
      return NextResponse.json({ error: 'Lieu introuvable.' }, { status: 404 })
    }

    if (locale !== 'fr') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed = parsePlaceTranslations((place as any).translations)
      if (!parsed[locale as TranslatableLocale]) {
        try {
          const copy = placeCopyFromFrench({
            name: place.name,
            description: place.description,
            history: place.history,
            best_time: place.best_time,
            duration: place.duration,
            outfit: place.outfit,
            access_info: place.access_info,
            fee: place.fee,
          })
          const translated = await translatePlaceSingleLocale(copy, locale as TranslatableLocale)
          parsed[locale as TranslatableLocale] = translated
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(place as any).translations = parsed
          // Persist asynchronously (don't block the response)
          saveTranslations(place.id, parsed as Record<string, unknown>).catch(() => {})
        } catch (err) {
          console.error(`[GET /api/places/:id auto-translate ${place.slug}]`, err)
        }
      }
    }

    return NextResponse.json({ place: mapPlace(place, locale) })
  } catch (error) {
    console.error('[GET /api/places/:id]', error)
    return NextResponse.json({ error: 'Impossible de charger ce lieu.' }, { status: 500 })
  }
}
