import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'
import { requireRole } from '@/lib/auth/session'
import { checkRateLimit } from '@/lib/rate-limit'
import { isUuid } from '@/lib/security/input'

export async function GET() {
  try {
    const auth = await requireRole(['guide'])
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const guideProfile = await prisma.guideProfile.findUnique({
      where: { user_id: auth.user.id },
      include: {
        profile: {
          select: {
            full_name: true,
            avatar_url: true,
            bio: true,
            phone: true,
            preferred_lang: true,
          },
        },
        documents: {
          orderBy: { created_at: 'desc' },
        },
      },
    })

    if (!guideProfile) {
      return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 })
    }

    const bookings = await prisma.booking.findMany({
      where: { guide_id: guideProfile.id },
      include: {
        tourist: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            phone: true,
            preferred_lang: true,
          },
        },
        review: true,
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json({ success: true, bookings, guideProfile })
  } catch (error: unknown) {
    console.error('[GET /api/guide/bookings]', error)
    const message = error instanceof Error && error.message.includes('P1001')
      ? 'Erreur de chargement. Vérifiez votre connexion.'
      : 'Une erreur est survenue. Veuillez réessayer.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST: Actions on bookings
export async function POST(request: Request) {
  try {
    const auth = await requireRole(['guide'])
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    if (!checkRateLimit(`guide-booking:${auth.user.id}`, 30, 60000)) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 })
    }

    const guideProfile = await prisma.guideProfile.findUnique({
      where: { user_id: auth.user.id },
      select: { id: true },
    })

    if (!guideProfile) {
      return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const { bookingId, action, quoteAmount, quoteMessage, cancellationReason } = body

    if (!isUuid(bookingId) || !action) {
      return NextResponse.json({ error: 'bookingId et action sont requis' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking || booking.guide_id !== guideProfile.id) {
      return NextResponse.json({ error: 'Réservation introuvable ou non autorisée' }, { status: 404 })
    }

    let updatedStatus: BookingStatus = booking.status
    let updateData: Record<string, unknown> = {}
    let notifTitle = ''
    let notifBody = ''

    if (action === 'send_quote') {
      if (booking.status !== 'quote_requested') {
        return NextResponse.json({ error: 'Action non autorisée pour ce statut' }, { status: 400 })
      }
      const amount = parseFloat(quoteAmount)
      if (!quoteAmount || !Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) {
        return NextResponse.json({ error: 'Le montant du devis est invalide' }, { status: 400 })
      }
      updatedStatus = 'quote_sent'
      updateData = {
        status: updatedStatus,
        quote_amount: amount,
        quote_message: typeof quoteMessage === 'string' ? quoteMessage.trim().slice(0, 1000) : null,
        quote_sent_at: new Date(),
      }
      notifTitle = 'Nouveau devis reçu'
      notifBody = `Le guide vous a envoyé un devis de ${amount} XOF.`

    } else if (action === 'start_mission') {
      if (booking.status !== 'quote_sent' && booking.status !== 'confirmed') {
        return NextResponse.json({ error: 'Action non autorisée pour ce statut' }, { status: 400 })
      }
      updatedStatus = 'in_progress'
      updateData = { status: updatedStatus, started_at: new Date() }
      notifTitle = 'Mission commencée'
      notifBody = 'Votre visite guidée a commencé.'

    } else if (action === 'complete_mission') {
      if (booking.status !== 'in_progress') {
        return NextResponse.json({ error: 'Action non autorisée pour ce statut' }, { status: 400 })
      }
      updatedStatus = 'completed'
      updateData = { status: updatedStatus, completed_at: new Date() }
      await prisma.guideProfile.update({
        where: { id: guideProfile.id },
        data: { total_missions: { increment: 1 } },
      })
      notifTitle = 'Mission terminée'
      notifBody = "La visite guidée est terminée. N'hésitez pas à laisser un avis."

    } else if (action === 'cancel') {
      if (booking.status === 'completed' || booking.status === 'cancelled') {
        return NextResponse.json({ error: 'Action non autorisée pour ce statut' }, { status: 400 })
      }
      const reason = typeof cancellationReason === 'string'
        ? cancellationReason.trim().slice(0, 500)
        : 'Annule par le guide'
      updatedStatus = 'cancelled'
      updateData = {
        status: updatedStatus,
        cancelled_at: new Date(),
        cancelled_by: auth.user.id,
        cancellation_reason: reason || 'Annule par le guide',
      }
      notifTitle = 'Réservation annulée'
      notifBody = `Le guide a annulé votre demande : "${reason || 'Aucun motif fourni'}"`

    } else {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    })

    await prisma.notification.create({
      data: {
        user_id: booking.tourist_id,
        type: 'booking',
        title: notifTitle,
        body: notifBody,
        data: { booking_id: booking.id },
      },
    })

    return NextResponse.json({ success: true, booking: updatedBooking })
  } catch (error: unknown) {
    console.error('[POST /api/guide/bookings]', error)
    const message = error instanceof Error && error.message.includes('P1001')
      ? 'Erreur de chargement. Vérifiez votre connexion.'
      : 'Une erreur est survenue. Veuillez réessayer.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}