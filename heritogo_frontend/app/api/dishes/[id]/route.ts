import { NextResponse } from 'next/server'
import { findPublishedDish } from '@/lib/catalog/dishes'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const dish = await findPublishedDish(id)
    if (!dish) {
      return NextResponse.json({ error: 'Plat introuvable.' }, { status: 404 })
    }
    return NextResponse.json({ dish })
  } catch (error) {
    console.error('[GET /api/dishes/:id]', error)
    return NextResponse.json({ error: 'Impossible de charger ce plat.' }, { status: 500 })
  }
}
