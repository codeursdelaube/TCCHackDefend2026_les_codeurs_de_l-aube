import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { MissionType } from '@prisma/client'

const MAX_GROUP_SIZE = 30
const MAX_TEXT_LENGTH = 2_000

function isNonEmptyString(value: unknown, maxLength = MAX_TEXT_LENGTH): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const touristProfile = await prisma.profile.findUnique({ where: { id: user.id } })
    if (!touristProfile || touristProfile.role !== 'tourist' || !touristProfile.is_active) {
      return NextResponse.json({ error: 'Seul un compte touriste actif peut effectuer une réservation.' }, { status: 403 })
    }

    const body = await request.json()
    const { guide_id, mission_type, start_date, start_time, meeting_point, tourist_message, group_size, special_needs } = body
    if (!isNonEmptyString(guide_id, 64) || !Object.values(MissionType).includes(mission_type as MissionType) || !isNonEmptyString(start_date, 32)) {
      return NextResponse.json({ error: 'Données de réservation invalides.' }, { status: 400 })
    }

    const parsedStartDate = new Date(`${start_date}T00:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (Number.isNaN(parsedStartDate.getTime()) || parsedStartDate < today) {
      return NextResponse.json({ error: 'La date de visite doit être aujourd’hui ou ultérieure.' }, { status: 400 })
    }

    const parsedGroupSize = Number(group_size ?? 1)
    if (!Number.isInteger(parsedGroupSize) || parsedGroupSize < 1 || parsedGroupSize > MAX_GROUP_SIZE) {
      return NextResponse.json({ error: `Le groupe doit compter entre 1 et ${MAX_GROUP_SIZE} personnes.` }, { status: 400 })
    }

    let parsedStartTime: Date | null = null
    if (start_time !== undefined && start_time !== null && start_time !== '') {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(start_time)) {
        return NextResponse.json({ error: 'Heure de début invalide.' }, { status: 400 })
      }
      const [hours, minutes] = start_time.split(':').map(Number)
      parsedStartTime = new Date(1970, 0, 1, hours, minutes)
    }

    for (const value of [meeting_point, tourist_message, special_needs]) {
      if (value !== undefined && value !== null && value !== '' && !isNonEmptyString(value)) {
        return NextResponse.json({ error: 'Un des messages est trop long ou invalide.' }, { status: 400 })
      }
    }

    const guideProfile = await prisma.guideProfile.findFirst({
      where: { id: guide_id, status: 'approved', profile: { is: { is_active: true } } },
      include: { profile: true }
    })
    if (!guideProfile) return NextResponse.json({ error: 'Guide indisponible.' }, { status: 404 })

    const booking = await prisma.booking.create({
      data: {
        tourist_id: user.id,
        guide_id,
        status: 'quote_requested',
        mission_type: mission_type as MissionType,
        start_date: parsedStartDate,
        start_time: parsedStartTime,
        meeting_point: isNonEmptyString(meeting_point) ? meeting_point.trim() : null,
        tourist_message: isNonEmptyString(tourist_message) ? tourist_message.trim() : null,
        group_size: parsedGroupSize,
        special_needs: isNonEmptyString(special_needs) ? special_needs.trim() : null,
        payment_status: 'pending'
      }
    })

    await prisma.notification.create({
      data: {
        user_id: guideProfile.user_id,
        type: 'booking',
        title: 'Nouvelle demande de réservation',
        body: `Vous avez reçu une demande de réservation de ${touristProfile.full_name || 'un touriste'}.`,
        data: { booking_id: booking.id }
      }
    })

    return NextResponse.json({ success: true, booking })
  } catch (error: unknown) {
    console.error('[POST /api/bookings]', error)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}