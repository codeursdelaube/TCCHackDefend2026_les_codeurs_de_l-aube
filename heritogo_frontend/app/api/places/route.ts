import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mapPlace } from '@/lib/catalog/map'

export async function GET() {
  try {
    const places = await prisma.place.findMany({
      where: { is_published: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ places: places.map(mapPlace) })
  } catch (error) {
    console.error('[GET /api/places]', error)
    return NextResponse.json({ error: 'Impossible de charger les lieux.' }, { status: 500 })
  }
}
