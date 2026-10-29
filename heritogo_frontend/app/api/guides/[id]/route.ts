import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isUuid } from '@/lib/security/input'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!isUuid(id)) {
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })
    }

    const guide = await prisma.guideProfile.findFirst({
      where: { id, status: 'approved', profile: { is: { is_active: true } } },
      select: {
        id: true,
        user_id: true,
        experience_years: true,
        specialties: true,
        languages: true,
        coverage_zones: true,
        hourly_rate: true,
        half_day_rate: true,
        full_day_rate: true,
        virtual_rate: true,
        currency: true,
        avg_rating: true,
        total_reviews: true,
        total_missions: true,
        reviewed_at: true,
        created_at: true,
        profile: {
          select: {
            full_name: true,
            avatar_url: true,
            preferred_lang: true,
            bio: true,
          },
        },
        availability: {
          where: {
            is_available: true,
            available_date: { gte: new Date() },
          },
          select: { available_date: true },
          orderBy: { available_date: 'asc' },
          take: 12,
        },
      },
    })

    if (!guide) {
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })
    }

    // Les commentaires restent privés : seules les notes agrégées sont publiées.
    const ratings = await prisma.review.aggregate({
      where: { guide_id: guide.id, is_hidden: false },
      _avg: {
        rating_overall: true,
        rating_punctuality: true,
        rating_knowledge: true,
        rating_communication: true,
      },
      _count: { _all: true },
    })

    return NextResponse.json({
      guide: {
        ...guide,
        rating_breakdown: {
          count: ratings._count._all,
          overall: ratings._avg.rating_overall,
          punctuality: ratings._avg.rating_punctuality,
          knowledge: ratings._avg.rating_knowledge,
          communication: ratings._avg.rating_communication,
        },
      },
    })
  } catch (error: unknown) {
    console.error('[GET /api/guides/[id]]', error)
    const isDbError = error instanceof Error &&
      (error.message.includes('P1001') || error.message.toLowerCase().includes("can't reach"))
    return NextResponse.json(
      {
        error: isDbError
          ? 'Erreur de chargement. Vérifiez votre connexion.'
          : 'Une erreur est survenue. Réessayez.'
      },
      { status: 500 }
    )
  }
}
