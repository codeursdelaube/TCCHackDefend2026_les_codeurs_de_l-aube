import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mapPlace, resolveCatalogLocale } from '@/lib/catalog/map'

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
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
    return NextResponse.json({ place: mapPlace(place, locale) })
  } catch (error) {
    console.error('[GET /api/places/:id]', error)
    return NextResponse.json({ error: 'Impossible de charger ce lieu.' }, { status: 500 })
  }
}
