import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const UUID_RE =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })
    }

    const guide = await prisma.guideProfile.findFirst({
      where: { id, status: 'approved' },
      include: {
        profile: {
          select: {
            full_name: true,
            avatar_url: true,
            preferred_lang: true,
            bio: true
          }
        },
        availability: {
          where: {
            is_available: true,
            available_date: {
              gte: new Date()
            }
          },
          select: {
            available_date: true
          },
          orderBy: {
            available_date: 'asc'
          }
        }
      }
    })

    if (!guide) {
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })
    }

    return NextResponse.json({ guide })
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
