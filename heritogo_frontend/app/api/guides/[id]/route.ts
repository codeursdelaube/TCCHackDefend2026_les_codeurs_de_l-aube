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
    console.error('Erreur dans GET /api/guides/[id]:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
