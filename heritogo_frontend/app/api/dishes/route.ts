import { NextResponse } from 'next/server'
import { getLocalDishes, listPublishedDishes } from '@/lib/catalog/dishes'
import { resolveCatalogLocale } from '@/lib/catalog/map'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const locale = resolveCatalogLocale(new URL(request.url).searchParams.get('locale'))
    const dishes = await listPublishedDishes(locale)
    return NextResponse.json(
      { dishes },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    console.error('[GET /api/dishes]', error)
    // Repli sur le catalogue local : la page Cuisine ne doit jamais rester vide.
    const locale = resolveCatalogLocale(new URL(request.url).searchParams.get('locale'))
    return NextResponse.json({ dishes: getLocalDishes(locale) })
  }
}
