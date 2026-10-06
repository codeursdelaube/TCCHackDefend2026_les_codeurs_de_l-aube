import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth/session'

export async function GET() {
  try {
    const auth = await requireUser()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        tourist_id: auth.user.id
      },
      include: {
        guide: {
          include: {
            profile: {
              select: {
                full_name: true,
                avatar_url: true
              }
            }
          }
        },
        review: {
          select: {
            id: true,
            rating_overall: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({ bookings })
  } catch (error: unknown) {
    console.error('[GET /api/tourist/bookings]', error)
    const message = error instanceof Error && error.message.includes('P1001')
      ? 'Erreur de chargement. Vérifiez votre connexion.'
      : 'Une erreur est survenue. Veuillez réessayer.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
