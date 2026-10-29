import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'
import { checkRateLimit } from '@/lib/rate-limit'
import { clipString, isUuid } from '@/lib/security/input'
import { notifyBookingParty } from '@/lib/bookings/notify'
import {
  GUIDE_CANCELLABLE,
  MAX_BOOKING_TEXT,
  MAX_QUOTE_AMOUNT,
  MAX_REASON_TEXT,
  bookingReference,
  formatBookingDate,
  formatXof,
  isContactShared,
} from '@/lib/bookings/status'

const TOURIST_BOOKINGS_PATH = '/dashboard/tourist?tab=bookings'

async function getGuide() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { error: 'Non autorisé', status: 401 } as const

  const guide = await prisma.guideProfile.findUnique({
    where: { user_id: user.id },
    include: { profile: { select: { full_name: true, is_active: true } } },
  })
  if (!guide) return { error: 'Profil guide introuvable', status: 404 } as const
  if (guide.status === 'suspended' || guide.profile.is_active === false) {
    return { error: 'Compte guide suspendu', status: 403 } as const
  }
  return { user, guide } as const
}

function startOfTodayUtc() {
  const now = new Date()
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
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
          documents: {
            orderBy: { created_at: 'desc' },
            select: {
              id: true,
              type: true,
              label: true,
              file_name: true,
              is_verified: true,
              created_at: true,
            },
          },
        },
      }),
      prisma.booking.findMany({
        where: { guide_id: auth.guide.id },
        include: {
          tourist: { select: { id: true, full_name: true, avatar_url: true, phone: true, preferred_lang: true, nationality: true } },
          review: { select: { id: true, rating_overall: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
    ])

    // Le numéro du voyageur n'est communiqué qu'une fois la réservation confirmée.
    const payload = bookings.map((booking) => ({
      ...booking,
      reference: bookingReference(booking.id),
      cancelled_by_me: booking.cancelled_by === auth.user.id,
      tourist: { ...booking.tourist, phone: isContactShared(booking.status) ? booking.tourist.phone : null },
    }))

    return NextResponse.json({ success: true, bookings: payload, guideProfile })
  } catch (error) {
    console.error('[GET /api/guide/bookings]', error)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getGuide()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

    if (!checkRateLimit(`booking:guide:${auth.user.id}`, 30, 60_000)) {
      return NextResponse.json({ error: 'Trop d’actions successives. Réessayez dans un instant.' }, { status: 429 })
    }

    const payload = await request.json().catch(() => null)
    const { bookingId, action, quoteAmount, quoteMessage, cancellationReason } = payload ?? {}
    if (!isUuid(bookingId) || typeof action !== 'string') {
      return NextResponse.json({ error: 'Données de réservation invalides.' }, { status: 400 })
    }

    if (action !== 'cancel' && auth.guide.status !== 'approved') {
      return NextResponse.json({ error: 'Votre profil doit être validé par un administrateur pour effectuer cette action.' }, { status: 403 })
    }

    const booking = await prisma.booking.findFirst({ where: { id: bookingId, guide_id: auth.guide.id } })
    if (!booking) return NextResponse.json({ error: 'Réservation introuvable ou non autorisée' }, { status: 404 })

    const reference = bookingReference(booking.id)
    const guideName = auth.guide.profile.full_name || 'Votre guide'

    let status: BookingStatus
    let updateData: Record<string, unknown>
    let title: string
    let body: string
    let actionLabel = 'Voir ma réservation'

    if (action === 'send_quote') {
      const amount = Number(quoteAmount)
      if (booking.status !== 'quote_requested') return NextResponse.json({ error: 'Un devis ne peut être envoyé que pour une nouvelle demande.' }, { status: 409 })
      if (new Date(booking.start_date).getTime() < startOfTodayUtc()) {
        return NextResponse.json({ error: 'La date demandée est passée : déclinez cette demande.' }, { status: 409 })
      }
      if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_QUOTE_AMOUNT || !Number.isInteger(amount)) {
        return NextResponse.json({ error: 'Montant du devis invalide (nombre entier en XOF).' }, { status: 400 })
      }
      if (quoteMessage !== undefined && quoteMessage !== null && (typeof quoteMessage !== 'string' || quoteMessage.length > MAX_BOOKING_TEXT)) {
        return NextResponse.json({ error: 'Message de devis invalide.' }, { status: 400 })
      }
      status = 'quote_sent'
      updateData = { status, quote_amount: amount, quote_message: clipString(quoteMessage, MAX_BOOKING_TEXT), quote_sent_at: new Date() }
      title = 'Vous avez reçu un devis'
      body = `${guideName} vous propose un devis de ${formatXof(amount)} pour votre visite du ${formatBookingDate(booking.start_date)} (réf. ${reference}). Acceptez-le pour confirmer la mission.`
      actionLabel = 'Consulter le devis'
    } else if (action === 'start_mission') {
      if (booking.status !== 'confirmed') return NextResponse.json({ error: 'La mission doit être confirmée par le voyageur.' }, { status: 409 })
      status = 'in_progress'
      updateData = { status, started_at: new Date() }
      title = 'Votre visite a commencé'
      body = `${guideName} a démarré la mission ${reference}. Bonne découverte !`
    } else if (action === 'complete_mission') {
      if (booking.status !== 'in_progress') return NextResponse.json({ error: 'Seule une mission en cours peut être terminée.' }, { status: 409 })
      status = 'completed'
      updateData = { status, completed_at: new Date() }
      title = 'Mission terminée — donnez votre avis'
      body = `La visite ${reference} avec ${guideName} est terminée. Votre avis vérifié aide les prochains voyageurs à choisir leur guide.`
      actionLabel = 'Laisser un avis'
    } else if (action === 'cancel') {
      if (!GUIDE_CANCELLABLE.includes(booking.status)) return NextResponse.json({ error: 'Cette réservation ne peut plus être annulée.' }, { status: 409 })
      if (cancellationReason !== undefined && cancellationReason !== null && (typeof cancellationReason !== 'string' || cancellationReason.length > MAX_REASON_TEXT)) {
        return NextResponse.json({ error: 'Motif d’annulation invalide.' }, { status: 400 })
      }
      const reason = clipString(cancellationReason, MAX_REASON_TEXT)
      if (booking.status === 'confirmed' && !reason) {
        return NextResponse.json({ error: 'Merci d’indiquer au voyageur le motif de l’annulation.' }, { status: 400 })
      }
      status = 'cancelled'
      updateData = {
        status,
        cancelled_at: new Date(),
        cancelled_by: auth.user.id,
        cancellation_reason: reason || (booking.status === 'quote_requested' ? 'Demande déclinée par le guide' : 'Annulée par le guide'),
      }
      title = booking.status === 'quote_requested' ? 'Demande déclinée par le guide' : 'Réservation annulée par le guide'
      body = `${guideName} ne peut pas assurer la réservation ${reference}.${reason ? ` Motif : ${reason}` : ''} Vous pouvez contacter un autre guide vérifié depuis l’annuaire.`
      actionLabel = 'Trouver un autre guide'
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

    await notifyBookingParty({
      userId: booking.tourist_id,
      bookingId: booking.id,
      title,
      body,
      actionPath: action === 'cancel' ? '/guides' : TOURIST_BOOKINGS_PATH,
      actionLabel,
    })
    return NextResponse.json({ success: true, booking: updated })
  } catch (error) {
    console.error('[POST /api/guide/bookings]', error)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}
