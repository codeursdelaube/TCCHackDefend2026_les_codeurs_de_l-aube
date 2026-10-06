import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MissionType } from '@prisma/client'
import { requireRole } from '@/lib/auth/session'
import { checkRateLimit } from '@/lib/rate-limit'
import { clipString, isUuid, parseBoundedNumber } from '@/lib/security/input'

const MISSION_TYPES = new Set<string>(Object.values(MissionType))

export async function POST(request: Request) {
  try {
    const auth = await requireRole(['tourist'])
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    if (!checkRateLimit(`booking:${auth.user.id}`, 8, 60000)) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 })
    }

    const body = await request.json()
    const guide_id = body.guide_id
    const mission_type = body.mission_type
    const start_date = body.start_date

    if (!isUuid(guide_id) || typeof mission_type !== 'string' || !MISSION_TYPES.has(mission_type) || !start_date) {
      return NextResponse.json({ error: 'Champs obligatoires manquants ou invalides' }, { status: 400 })
    }

    const parsedStartDate = new Date(start_date)
    if (Number.isNaN(parsedStartDate.getTime())) {
      return NextResponse.json({ error: 'Date invalide' }, { status: 400 })
    }

    const guideProfile = await prisma.guideProfile.findFirst({
      where: { id: guide_id, status: 'approved' },
      include: { profile: true },
    })

    if (!guideProfile) {
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })
    }

    let parsedStartTime: Date | null = null
    if (typeof body.start_time === 'string' && /^\d{2}:\d{2}$/.test(body.start_time)) {
      const [hours, minutes] = body.start_time.split(':')
      parsedStartTime = new Date()
      parsedStartTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
    }

    const groupSize = parseBoundedNumber(body.group_size ?? 1, 1, 20) ?? 1

    const booking = await prisma.booking.create({
      data: {
        tourist_id: auth.user.id,
        guide_id,
        status: 'quote_requested',
        mission_type: mission_type as MissionType,
        start_date: parsedStartDate,
        start_time: parsedStartTime,
        meeting_point: clipString(body.meeting_point, 200),
        tourist_message: clipString(body.tourist_message, 1000),
        group_size: groupSize,
        special_needs: clipString(body.special_needs, 500),
        payment_status: 'pending',
      },
    })

    await prisma.notification.create({
      data: {
        user_id: guideProfile.user_id,
        type: 'booking',
        title: 'Nouvelle demande de réservation',
        body: `Vous avez reçu une demande de réservation de la part de ${auth.profile.full_name || 'un touriste'}.`,
        data: { booking_id: booking.id },
      },
    })

    return NextResponse.json({ success: true, booking })
  } catch (error: unknown) {
    console.error('[POST /api/bookings]', error)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}
