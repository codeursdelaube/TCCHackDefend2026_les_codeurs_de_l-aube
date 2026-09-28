import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mapDish } from '@/lib/catalog/map'

export async function GET() {
  try {
    const dishes = await prisma.dish.findMany({
      where: { is_published: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ dishes: dishes.map(mapDish) })
  } catch (error) {
    console.error('[GET /api/dishes]', error)
    return NextResponse.json({ error: 'Impossible de charger les plats.' }, { status: 500 })
  }
}
