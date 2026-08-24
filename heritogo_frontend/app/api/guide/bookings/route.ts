import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'

async function getGuide() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { error: 'Non autorisé', status: 401 } as const

  const guide = await prisma.guideProfile.findUnique({ where: { user_id: user.id } })
  if (!guide) return { error: 'Profil guide introuvable', status: 404 } as const
  if (guide.status !== 'approved') return { error: 'Profil guide non approuvé', status: 403 } as const
  return { user, guide } as const
}

export async function GET() {
  try {
    const auth = await getGuide()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const [guideProfile, bookings] = await Promise.all([
      prisma.guideProfile.findUnique({
        where: { id: auth.guide.id },
        include: {
          profile: { select: { full_name: true, avatar_url: true, bio: true, phone: true, preferred_lang: true } },
          documents: { orderBy: { created_at: 'desc' } },
        },
      }),
      prisma.booking.findMany({
        where: { guide_id: auth.guide.id },
        include: {
          tourist: { select: { id: true, full_name: true, avatar_url: true, phone: true, preferred_lang: true } },
          review: true,
        },
        orderBy: { created_at: 'desc' },
      }),
    ])
    return NextResponse.json({ success: true, bookings, guideProfile })
  } catch (error) {
    console.error('[GET /api/guide/bookings]', error)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getGuide()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { bookingId, action, quoteAmount, quoteMessage, cancellationReason } = await request.json()
    if (typeof bookingId !== 'string' || typeof action !== 'string') {
      return NextResponse.json({ error: 'Données de réservation invalides.' }, { status: 400 })
    }

    const booking = await prisma.booking.findFirst({ where: { id: bookingId, guide_id: auth.guide.id } })
    if (!booking) return NextResponse.json({ error: 'Réservation introuvable ou non autorisée' }, { status: 404 })

    let status: BookingStatus
    let updateData: Record<string, unknown>
    let title: string
    let body: string

    if (action === 'send_quote') {
      const amount = Number(quoteAmount)
      if (booking.status !== 'quote_requested') return NextResponse.json({ error: 'Un devis ne peut être envoyé que pour une nouvelle demande.' }, { status: 409 })
      if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) return NextResponse.json({ error: 'Montant du devis invalide.' }, { status: 400 })
      if (quoteMessage !== undefined && (typeof quoteMessage !== 'string' || quoteMessage.length > 2_000)) return NextResponse.json({ error: 'Message de devis invalide.' }, { status: 400 })
      status = 'quote_sent'
      updateData = { status, quote_amount: amount, quote_message: quoteMessage?.trim() || null, quote_sent_at: new Date() }
      title = 'Nouveau devis reçu'
      body = `Le guide vous a envoyé un devis de ${amount} XOF.`
    } else if (action === 'start_mission') {
      if (booking.status !== 'confirmed') return NextResponse.json({ error: 'La mission doit être confirmée par le touriste.' }, { status: 409 })
      status = 'in_progress'
      updateData = { status, started_at: new Date() }
      title = 'Mission commencée'
      body = 'Votre visite guidée a commencé.'
    } else if (action === 'complete_mission') {
      if (booking.status !== 'in_progress') return NextResponse.json({ error: 'Seule une mission en cours peut être terminée.' }, { status: 409 })
      status = 'completed'
      updateData = { status, completed_at: new Date() }
      title = 'Mission terminée'
      body = 'La visite guidée est terminée. Vous pouvez laisser un avis.'
    } else if (action === 'cancel') {
      if (!['quote_requested', 'quote_sent', 'confirmed'].includes(booking.status)) return NextResponse.json({ error: 'Cette réservation ne peut plus être annulée.' }, { status: 409 })
      if (cancellationReason !== undefined && (typeof cancellationReason !== 'string' || cancellationReason.length > 1_000)) return NextResponse.json({ error: 'Motif d’annulation invalide.' }, { status: 400 })
      status = 'cancelled'
      updateData = { status, cancelled_at: new Date(), cancelled_by: auth.user.id, cancellation_reason: cancellationReason?.trim() || 'Annulée par le guide' }
      title = 'Réservation annulée'
      body = 'Le guide a annulé votre demande de réservation.'
    } else {
      return NextResponse.json({ error: 'Action invalide.' }, { status: 400 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const changed = await tx.booking.updateMany({ where: { id: booking.id, guide_id: auth.guide.id, status: booking.status }, data: updateData })
      if (changed.count !== 1) return null
      if (status === 'completed') await tx.guideProfile.update({ where: { id: auth.guide.id }, data: { total_missions: { increment: 1 } } })
      return tx.booking.findUnique({ where: { id: booking.id } })
    })
    if (!updated) return NextResponse.json({ error: 'La réservation vient d’être modifiée. Actualisez la page.' }, { status: 409 })

    await prisma.notification.create({ data: { user_id: booking.tourist_id, type: 'booking', title, body, data: { booking_id: booking.id } } })
    return NextResponse.json({ success: true, booking: updated })
  } catch (error) {
    console.error('[POST /api/guide/bookings]', error)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}