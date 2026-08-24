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
  } catch (error: unknown) {
    console.error('[GET /api/tourist/bookings]', error)
    const message = error instanceof Error && error.message.includes('P1001')
      ? 'Erreur de chargement. Vérifiez votre connexion.'
      : 'Une erreur est survenue. Veuillez réessayer.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { bookingId, action } = await request.json()
    if (typeof bookingId !== 'string' || action !== 'accept_quote') {
      return NextResponse.json({ error: 'Action invalide.' }, { status: 400 })
    }

    const booking = await prisma.booking.findFirst({ where: { id: bookingId, tourist_id: user.id } })
    if (!booking) return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 })
    if (booking.status !== 'quote_sent') {
      return NextResponse.json({ error: 'Ce devis ne peut plus être accepté.' }, { status: 409 })
    }

    const updated = await prisma.booking.updateMany({
      where: { id: booking.id, tourist_id: user.id, status: 'quote_sent' },
      data: { status: 'confirmed', confirmed_at: new Date() },
    })
    if (updated.count !== 1) return NextResponse.json({ error: 'La réservation vient d’être modifiée. Actualisez la page.' }, { status: 409 })

    const guide = await prisma.guideProfile.findUnique({ where: { id: booking.guide_id }, select: { user_id: true } })
    if (guide) await prisma.notification.create({
      data: {
        user_id: guide.user_id,
        type: 'booking',
        title: 'Devis accepté',
        body: 'Le touriste a accepté votre devis. La mission est confirmée.',
        data: { booking_id: booking.id },
      },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/tourist/bookings]', error)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}