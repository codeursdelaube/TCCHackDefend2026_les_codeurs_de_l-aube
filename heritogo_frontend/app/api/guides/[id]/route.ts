import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const guide = await prisma.guideProfile.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            full_name: true,
            avatar_url: true,
            phone: true,
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
