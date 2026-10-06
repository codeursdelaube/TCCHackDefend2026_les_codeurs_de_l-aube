import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ReportReason } from '@prisma/client'
import { requireUser } from '@/lib/auth/session'
import { checkRateLimit } from '@/lib/rate-limit'
import { clipString, isUuid } from '@/lib/security/input'

export async function POST(request: Request) {
  try {
    const auth = await requireUser()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    if (!checkRateLimit(`report:${auth.user.id}`, 5, 60000)) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 })
    }

    const body = await request.json()
    const reported_id = body.reported_id
    const reason = body.reason
    const description = clipString(body.description, 2000)
    const booking_id = body.booking_id ? body.booking_id : null

    if (!isUuid(reported_id) || !description || !Object.values(ReportReason).includes(reason as ReportReason)) {
      return NextResponse.json({ error: 'Données manquantes ou invalides' }, { status: 400 })
    }

    if (booking_id && !isUuid(booking_id)) {
      return NextResponse.json({ error: 'Réservation invalide' }, { status: 400 })
    }

    if (reported_id === auth.user.id) {
      return NextResponse.json({ error: 'Action non autorisée' }, { status: 400 })
    }

    const report = await prisma.report.create({
      data: {
        reporter_id: auth.user.id,
        reported_id,
        reason: reason as ReportReason,
        description,
        booking_id,
        status: 'open',
      },
    })

    return NextResponse.json({ success: true, report: { id: report.id } })
  } catch (error: unknown) {
    console.error('[POST /api/reports]', error)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}
