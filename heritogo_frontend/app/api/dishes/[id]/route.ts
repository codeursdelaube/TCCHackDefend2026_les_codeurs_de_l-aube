import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mapDish } from '@/lib/catalog/map'

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const dish = await prisma.dish.findFirst({
      where: {
        is_published: true,
        OR: isUuid(id) ? [{ slug: id }, { id }] : [{ slug: id }],
      },
    })
    if (!dish) {
      return NextResponse.json({ error: 'Plat introuvable.' }, { status: 404 })
    }
    return NextResponse.json({ dish: mapDish(dish) })
  } catch (error) {
    console.error('[GET /api/dishes/:id]', error)
    return NextResponse.json({ error: 'Impossible de charger ce plat.' }, { status: 500 })
  }
}
