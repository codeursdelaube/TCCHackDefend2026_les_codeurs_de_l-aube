import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth/session'
import { checkRateLimit } from '@/lib/rate-limit'
import { clipString, isUuid } from '@/lib/security/input'
import { notifyBookingParty } from '@/lib/bookings/notify'
import { MAX_REASON_TEXT, TOURIST_CANCELLABLE, bookingReference, formatXof, isContactShared } from '@/lib/bookings/status'

const ACTIONS = ['accept_quote', 'decline_quote', 'cancel_request'] as const
type TouristAction = (typeof ACTIONS)[number]

export async function GET() {
  try {
    const auth = await requireUser()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const bookings = await prisma.booking.findMany({
      where: { tourist_id: auth.user.id },
      select: {
        id: true,
        status: true,
        mission_type: true,
        start_date: true,
        start_time: true,
        duration_hours: true,
        meeting_point: true,
        destination: true,
        tourist_message: true,
        group_size: true,
        special_needs: true,
        quote_amount: true,
        quote_message: true,
        quote_sent_at: true,
        confirmed_at: true,
        started_at: true,
        completed_at: true,
        cancelled_at: true,
        cancelled_by: true,
        cancellation_reason: true,
        created_at: true,
        guide: {
          select: {
            id: true,
            avg_rating: true,
            total_reviews: true,
            languages: true,
            profile: { select: { full_name: true, avatar_url: true, phone: true } },
          },
        },
        review: { select: { id: true, rating_overall: true } },
      },
      orderBy: { created_at: 'desc' },
    })

    // Le numéro du guide n'est communiqué qu'une fois la réservation confirmée.
    const payload = bookings.map((booking) => ({
      ...booking,
      reference: bookingReference(booking.id),
      cancelled_by_me: booking.cancelled_by === auth.user.id,
      guide: {
        ...booking.guide,
        profile: {
          ...booking.guide.profile,
          phone: isContactShared(booking.status) ? booking.guide.profile.phone : null,
        },
      },
    }))

    return NextResponse.json({ bookings: payload })
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
    const auth = await requireUser()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { user, profile } = auth

    if (!checkRateLimit(`booking:tourist:${user.id}`, 20, 60_000)) {
      return NextResponse.json({ error: 'Trop d’actions successives. Réessayez dans un instant.' }, { status: 429 })
    }

    const body = await request.json().catch(() => null)
    const bookingId = body?.bookingId
    const action = body?.action as TouristAction
    if (!isUuid(bookingId) || !ACTIONS.includes(action)) {
      return NextResponse.json({ error: 'Action invalide.' }, { status: 400 })
    }

    const rawReason = body?.reason
    if (rawReason !== undefined && rawReason !== null && (typeof rawReason !== 'string' || rawReason.length > MAX_REASON_TEXT)) {
      return NextResponse.json({ error: `Le motif ne doit pas dépasser ${MAX_REASON_TEXT} caractères.` }, { status: 400 })
    }
    const reason = clipString(rawReason, MAX_REASON_TEXT)

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, tourist_id: user.id },
      include: { guide: { select: { user_id: true } } },
    })
    if (!booking) return NextResponse.json({ error: 'Réservation introuvable.' }, { status: 404 })

    const reference = bookingReference(booking.id)
    const touristName = profile.full_name || 'Le voyageur'

    if (action === 'accept_quote') {
      if (booking.status !== 'quote_sent') {
        return NextResponse.json({ error: 'Ce devis ne peut plus être accepté.' }, { status: 409 })
      }
      const startDay = new Date(booking.start_date)
      const today = new Date()
      if (startDay.getTime() < Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) {
        return NextResponse.json({ error: 'La date de la visite est passée : ce devis ne peut plus être accepté.' }, { status: 409 })
      }

      const updated = await prisma.booking.updateMany({
        where: { id: booking.id, tourist_id: user.id, status: 'quote_sent' },
        data: { status: 'confirmed', confirmed_at: new Date() },
      })
      if (updated.count !== 1) return NextResponse.json({ error: 'La réservation vient d’être modifiée. Actualisez la page.' }, { status: 409 })

      await notifyBookingParty({
        userId: booking.guide.user_id,
        bookingId: booking.id,
        title: 'Devis accepté — mission confirmée',
        body: `${touristName} a accepté votre devis de ${formatXof(booking.quote_amount?.toString())} (réf. ${reference}). Ses coordonnées sont désormais visibles dans votre espace guide.`,
        actionPath: '/dashboard/guide?tab=missions',
        actionLabel: 'Voir la mission',
      })
      return NextResponse.json({ success: true, status: 'confirmed' })
    }

    // decline_quote / cancel_request
    if (!TOURIST_CANCELLABLE.includes(booking.status)) {
      return NextResponse.json({ error: 'Cette réservation ne peut plus être annulée.' }, { status: 409 })
    }
    if (action === 'decline_quote' && booking.status !== 'quote_sent') {
      return NextResponse.json({ error: 'Aucun devis en attente pour cette réservation.' }, { status: 409 })
    }
    if (booking.status === 'confirmed' && !reason) {
      return NextResponse.json({ error: 'Merci d’indiquer au guide le motif de l’annulation.' }, { status: 400 })
    }

    const cancelReason = reason
      ?? (action === 'decline_quote' ? 'Devis décliné par le voyageur' : 'Demande annulée par le voyageur')

    const updated = await prisma.booking.updateMany({
      where: { id: booking.id, tourist_id: user.id, status: booking.status },
      data: {
        status: 'cancelled',
        cancelled_at: new Date(),
        cancelled_by: user.id,
        cancellation_reason: cancelReason,
      },
    })
    if (updated.count !== 1) return NextResponse.json({ error: 'La réservation vient d’être modifiée. Actualisez la page.' }, { status: 409 })

    const title = action === 'decline_quote'
      ? 'Devis décliné'
      : booking.status === 'confirmed' ? 'Mission annulée par le voyageur' : 'Demande annulée'

    await notifyBookingParty({
      userId: booking.guide.user_id,
      bookingId: booking.id,
      title,
      body: `${touristName} a annulé la réservation ${reference}. Motif : ${cancelReason}`,
      actionPath: '/dashboard/guide?tab=history',
      actionLabel: 'Ouvrir mon espace guide',
    })
    return NextResponse.json({ success: true, status: 'cancelled' })
  } catch (error) {
    console.error('[POST /api/tourist/bookings]', error)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}
