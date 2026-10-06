import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { createKycSession } from '@/lib/kyc/provider'
import { jsonNoStore } from '@/lib/kyc/references'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return jsonNoStore({ error: 'Non autorisé' }, 401)
    }

    const guide = await prisma.guideProfile.findUnique({ where: { user_id: user.id } })
    if (!guide) {
      return jsonNoStore({ error: 'Profil guide introuvable' }, 404)
    }

    const origin = new URL(request.url).origin
    const session = await createKycSession({
      guideId: guide.id,
      userId: user.id,
      returnUrl: `${origin}/fr/dashboard/guide?tab=documents`,
    })

    return jsonNoStore({
      sessionId: session.sessionId,
      hostedUrl: session.hostedUrl,
      provider: session.provider,
    })
  } catch (error) {
    console.error('[POST /api/kyc/session]', error instanceof Error ? error.message : 'error')
    return NextResponse.json(
      { error: 'Le prestataire KYC est temporairement indisponible.' },
      { status: 503 }
    )
  }
}
