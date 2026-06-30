import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { ReportReason } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { reported_id, reason, description, booking_id } = await request.json()

    if (!reported_id || !reason || !description) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Valider la raison
    if (!Object.values(ReportReason).includes(reason as ReportReason)) {
      return NextResponse.json({ error: 'Raison invalide' }, { status: 400 })
    }

    // Créer le report
    const report = await prisma.report.create({
      data: {
        reporter_id: user.id,
        reported_id,
        reason: reason as ReportReason,
        description,
        booking_id: booking_id || null,
        status: 'open'
      }
    })

    return NextResponse.json({ success: true, report })
  } catch (error: unknown) {
    console.error('[POST /api/reports]', error)
    const message = error instanceof Error && error.message.includes('P1001')
      ? 'Erreur de chargement. Vérifiez votre connexion.'
      : 'Une erreur est survenue. Veuillez réessayer.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
