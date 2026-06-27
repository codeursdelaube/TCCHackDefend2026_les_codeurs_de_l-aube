import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang')
    const zone = searchParams.get('zone')
    const maxPrice = searchParams.get('price')

    const whereClause: any = {
      status: 'approved'
    }

    if (lang) {
      whereClause.languages = {
        has: lang
      }
    }

    if (zone) {
      whereClause.coverage_zones = {
        has: zone
      }
    }

    if (maxPrice) {
      const price = parseFloat(maxPrice)
      if (!isNaN(price)) {
        whereClause.full_day_rate = {
          lte: price
        }
      }
    }

    const guides = await prisma.guideProfile.findMany({
      where: whereClause,
      include: {
        profile: {
          select: {
            full_name: true,
            avatar_url: true,
            phone: true,
            preferred_lang: true,
            bio: true
          }
        }
      },
      orderBy: {
        avg_rating: 'desc'
      }
    })

    return NextResponse.json({ guides })
  } catch (error: any) {
    console.error('Erreur dans GET /api/guides:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
