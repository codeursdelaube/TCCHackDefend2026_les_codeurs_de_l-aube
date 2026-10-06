import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServiceClient } from '@/lib/supabase/service'
import { mapPlace, resolveCatalogLocale } from '@/lib/catalog/map'
import { ensurePlaceTranslationsColumn } from '@/lib/catalog/store'
import { parsePlaceTranslations, placeCopyFromFrench, translatePlaceSingleLocale } from '@/lib/catalog/translate'
import type { TranslatableLocale } from '@/lib/catalog/i18n'

export const dynamic = 'force-dynamic'

async function saveTranslations(placeId: string, translations: Record<string, unknown>) {
  const supabase = createServiceClient()
  if (supabase) {
    const { error } = await supabase
      .from('places')
      .update({ translations })
      .eq('id', placeId)
    if (error) console.error('[places saveTranslations]', error.message)
    return
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.place as any).update({ where: { id: placeId }, data: { translations } })
  } catch (err) {
    console.error('[places saveTranslations prisma]', err)
  }
}

export async function GET(request: Request) {
  try {
    await ensurePlaceTranslationsColumn()
    const locale = resolveCatalogLocale(new URL(request.url).searchParams.get('locale'))
    const places = await prisma.place.findMany({
      where: { is_published: true },
      orderBy: { name: 'asc' },
    })

    if (locale !== 'fr') {
      await Promise.all(
        places.map(async (place) => {
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
              // Persist asynchronously
              saveTranslations(place.id, parsed as Record<string, unknown>).catch(() => {})
            } catch (err) {
              console.error(`[GET /api/places auto-translate ${place.slug}]`, err)
            }
          }
        }),
      )
    }

    return NextResponse.json(
      { places: places.map((place) => mapPlace(place, locale)) },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    console.error('[GET /api/places]', error)
    return NextResponse.json({ error: 'Impossible de charger les lieux.' }, { status: 500 })
  }
}
