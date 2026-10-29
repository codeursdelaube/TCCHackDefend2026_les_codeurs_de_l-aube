import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth/session'
import { checkRateLimit } from '@/lib/rate-limit'
import { clipString, isUuid, parseBoundedNumber } from '@/lib/security/input'
import { notifyBookingParty } from '@/lib/bookings/notify'
import { bookingReference } from '@/lib/bookings/status'

function optionalRating(value: unknown): number | null | false {
  if (value === undefined || value === null || value === '') return null
  const rating = parseBoundedNumber(value, 1, 5)
  return rating !== null && Number.isInteger(rating) ? rating : false
}

export async function POST(request: Request) {
  try {
    const auth = await requireUser()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    if (!checkRateLimit(`review:${auth.user.id}`, 10, 60000)) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 })
    }

    const body = await request.json().catch(() => ({}))
    const booking_id = body.booking_id
    const rating_overall = parseBoundedNumber(body.rating_overall, 1, 5)
    const rating_punctuality = optionalRating(body.rating_punctuality)
    const rating_knowledge = optionalRating(body.rating_knowledge)
    const rating_communication = optionalRating(body.rating_communication)
    const comment = clipString(body.comment, 1000)

    if (
      !isUuid(booking_id) ||
      rating_overall === null ||
      !Number.isInteger(rating_overall) ||
      rating_punctuality === false ||
      rating_knowledge === false ||
      rating_communication === false
    ) {
      return NextResponse.json({ error: 'Données manquantes ou invalides' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: booking_id },
      include: { guide: { select: { user_id: true } } },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    if (booking.tourist_id !== auth.user.id) {
      return NextResponse.json({ error: 'Action non autorisée' }, { status: 403 })
    }

    if (booking.status !== 'completed') {
      return NextResponse.json({ error: 'La réservation doit être terminée pour laisser un avis' }, { status: 400 })
    }

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          booking_id,
          reviewer_id: auth.user.id,
          guide_id: booking.guide_id,
          rating_overall,
          rating_punctuality,
          rating_knowledge,
          rating_communication,
          comment,
          // Le commentaire reste privé (modération) ; seules les notes sont publiques.
          is_visible_public: false,
        },
      })

      const stats = await tx.review.aggregate({
        where: { guide_id: booking.guide_id, is_hidden: false },
        _avg: { rating_overall: true },
        _count: { _all: true },
      })

      await tx.guideProfile.update({
        where: { id: booking.guide_id },
        data: {
          avg_rating: stats._avg.rating_overall ?? 0,
          total_reviews: stats._count._all,
        },
      })

      return created
    })

    await notifyBookingParty({
      userId: booking.guide.user_id,
      bookingId: booking.id,
      title: `Nouvel avis : ${rating_overall}/5`,
      body: `Le voyageur de la mission ${bookingReference(booking.id)} vous a attribué la note de ${rating_overall}/5.`,
      actionPath: '/dashboard/guide?tab=history',
      actionLabel: 'Voir mes missions',
    })

    return NextResponse.json({ success: true, review: { id: review.id, rating_overall: review.rating_overall } })
  } catch (error: unknown) {
    console.error('[POST /api/reviews]', error)
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'P2002') {
      return NextResponse.json({ error: 'Vous avez déjà laissé un avis pour cette réservation' }, { status: 400 })
    }
    const message = error instanceof Error && error.message.includes('P1001')
      ? 'Erreur de chargement. Vérifiez votre connexion.'
      : 'Une erreur est survenue. Veuillez réessayer.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
