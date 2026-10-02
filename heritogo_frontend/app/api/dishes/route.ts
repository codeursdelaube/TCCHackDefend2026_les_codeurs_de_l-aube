import { NextResponse } from 'next/server'
import { findPublishedDish, listPublishedDishes } from '@/lib/catalog/dishes'

export async function GET() {
  try {
    const dishes = await listPublishedDishes()
    return NextResponse.json({ dishes })
  } catch (error) {
    console.error('[GET /api/dishes]', error)
    return NextResponse.json({ error: 'Impossible de charger les plats.' }, { status: 500 })
  }
}
