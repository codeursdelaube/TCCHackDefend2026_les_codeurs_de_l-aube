import { NextResponse } from 'next/server'
import { MissionType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth/session'
import { checkRateLimit } from '@/lib/rate-limit'
import { clipString, isUuid, parseBoundedNumber } from '@/lib/security/input'
import { notifyBookingParty } from '@/lib/bookings/notify'
import {
  ACTIVE_STATUSES,
  MAX_BOOKING_HORIZON_DAYS,
  MAX_BOOKING_TEXT,
  MAX_GROUP_SIZE,
  bookingReference,
  formatBookingDate,
} from '@/lib/bookings/status'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

function optionalText(value: unknown, max = MAX_BOOKING_TEXT): string | null | false {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string' || value.trim().length > max) return false
  return clipString(value, max)
}

export async function POST(request: Request) {
  try {
    const auth = await requireUser()
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { user, profile: touristProfile } = auth

    if (touristProfile.role !== 'tourist') {
      return NextResponse.json({ error: 'Seul un compte voyageur peut envoyer une demande de devis.' }, { status: 403 })
    }

    if (!checkRateLimit(`booking:create:${user.id}`, 5, 10 * 60_000)) {
      return NextResponse.json({ error: 'Trop de demandes envoyées. Patientez quelques minutes avant de réessayer.' }, { status: 429 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Données de réservation invalides.' }, { status: 400 })
    }

    const { guide_id, mission_type, start_date, start_time } = body as Record<string, unknown>

    if (!isUuid(guide_id) || !Object.values(MissionType).includes(mission_type as MissionType)) {
      return NextResponse.json({ error: 'Données de réservation invalides.' }, { status: 400 })
    }

    if (typeof start_date !== 'string' || !DATE_RE.test(start_date)) {
      return NextResponse.json({ error: 'Date de visite invalide.' }, { status: 400 })
    }
    const parsedStartDate = new Date(`${start_date}T00:00:00Z`)
    const today = new Date()
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    const horizon = new Date(todayUtc.getTime() + MAX_BOOKING_HORIZON_DAYS * 86_400_000)
    if (Number.isNaN(parsedStartDate.getTime()) || parsedStartDate < todayUtc) {
      return NextResponse.json({ error: 'La date de visite doit être aujourd’hui ou ultérieure.' }, { status: 400 })
    }
    if (parsedStartDate > horizon) {
      return NextResponse.json({ error: 'Les réservations sont ouvertes jusqu’à 12 mois à l’avance.' }, { status: 400 })
    }

    let parsedStartTime: Date | null = null
    if (start_time !== undefined && start_time !== null && start_time !== '') {
      if (typeof start_time !== 'string' || !TIME_RE.test(start_time)) {
        return NextResponse.json({ error: 'Heure de début invalide.' }, { status: 400 })
      }
      const [hours, minutes] = start_time.split(':').map(Number)
      parsedStartTime = new Date(Date.UTC(1970, 0, 1, hours, minutes))
    }

    const groupSize = parseBoundedNumber(body.group_size ?? 1, 1, MAX_GROUP_SIZE)
    if (groupSize === null || !Number.isInteger(groupSize)) {
      return NextResponse.json({ error: `Le groupe doit compter entre 1 et ${MAX_GROUP_SIZE} personnes.` }, { status: 400 })
    }

    let durationHours: number | null = null
    if (mission_type === 'hourly') {
      durationHours = parseBoundedNumber(body.duration_hours ?? 1, 1, 12)
      if (durationHours === null) {
        return NextResponse.json({ error: 'La durée doit être comprise entre 1 et 12 heures.' }, { status: 400 })
      }
    }

    const meetingPoint = optionalText(body.meeting_point, 200)
    const destination = optionalText(body.destination, 200)
    const touristMessage = optionalText(body.tourist_message)
    const specialNeeds = optionalText(body.special_needs, 500)
    if (meetingPoint === false || destination === false || touristMessage === false || specialNeeds === false) {
      return NextResponse.json({ error: 'Un des champs texte est trop long ou invalide.' }, { status: 400 })
    }
    if (mission_type !== 'virtual' && !meetingPoint) {
      return NextResponse.json({ error: 'Indiquez un point de rendez-vous pour la visite.' }, { status: 400 })
    }

    const guideProfile = await prisma.guideProfile.findFirst({
      where: { id: guide_id, status: 'approved', profile: { is: { is_active: true } } },
      select: { id: true, user_id: true },
    })
    if (!guideProfile) return NextResponse.json({ error: 'Ce guide n’est pas disponible pour le moment.' }, { status: 404 })
    if (guideProfile.user_id === user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas réserver votre propre profil.' }, { status: 400 })
    }

    const duplicate = await prisma.booking.findFirst({
      where: {
        tourist_id: user.id,
        guide_id,
        start_date: parsedStartDate,
        status: { in: ACTIVE_STATUSES },
      },
      select: { id: true },
    })
    if (duplicate) {
      return NextResponse.json(
        { error: `Une demande est déjà en cours avec ce guide pour cette date (réf. ${bookingReference(duplicate.id)}).` },
        { status: 409 },
      )
    }

    const booking = await prisma.booking.create({
      data: {
        tourist_id: user.id,
        guide_id,
        status: 'quote_requested',
        mission_type: mission_type as MissionType,
        start_date: parsedStartDate,
        start_time: parsedStartTime,
        duration_hours: durationHours,
        meeting_point: meetingPoint,
        destination,
        tourist_message: touristMessage,
        group_size: groupSize,
        special_needs: specialNeeds,
        payment_status: 'pending',
      },
      select: { id: true, status: true, start_date: true },
    })

    await notifyBookingParty({
      userId: guideProfile.user_id,
      bookingId: booking.id,
      title: 'Nouvelle demande de devis',
      body: `${touristProfile.full_name || 'Un voyageur'} souhaite une visite le ${formatBookingDate(parsedStartDate)} pour ${groupSize} personne(s). Répondez avec un devis depuis votre espace guide.`,
      actionPath: '/dashboard/guide?tab=quotes',
      actionLabel: 'Répondre à la demande',
    })

    return NextResponse.json({ success: true, booking: { ...booking, reference: bookingReference(booking.id) } })
  } catch (error: unknown) {
    console.error('[POST /api/bookings]', error)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}
