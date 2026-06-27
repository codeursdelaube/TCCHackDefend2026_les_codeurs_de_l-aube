import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        tourist_id: user.id
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
  } catch (error: any) {
    console.error('Erreur dans GET /api/tourist/bookings:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
