import { NextResponse } from 'next/server'
import { listPublishedDishes } from '@/lib/catalog/dishes'
import { resolveCatalogLocale } from '@/lib/catalog/map'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const locale = resolveCatalogLocale(new URL(request.url).searchParams.get('locale'))
    const dishes = await listPublishedDishes(locale)
    return NextResponse.json({ dishes })
  } catch (error) {
    console.error('[GET /api/dishes]', error)
    return NextResponse.json({ error: 'Impossible de charger les plats.' }, { status: 500 })
  }
}
