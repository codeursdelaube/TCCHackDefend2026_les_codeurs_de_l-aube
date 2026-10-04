import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mapPlace, resolveCatalogLocale } from '@/lib/catalog/map'
import { ensurePlaceTranslationsColumn } from '@/lib/catalog/store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    await ensurePlaceTranslationsColumn()
    const locale = resolveCatalogLocale(new URL(request.url).searchParams.get('locale'))
    const places = await prisma.place.findMany({
      where: { is_published: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ places: places.map((place) => mapPlace(place, locale)) })
  } catch (error) {
    console.error('[GET /api/places]', error)
    return NextResponse.json({ error: 'Impossible de charger les lieux.' }, { status: 500 })
  }
}
