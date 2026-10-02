import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { prisma } from '@/lib/prisma'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  return supabase.auth.getUser()
}

export async function GET() {
  try {
    const { data: { user }, error: authError } = await getAuthenticatedUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        guide_profile: true,
      },
    })

    return NextResponse.json({ profile })
  } catch (error: unknown) {
    console.error('[GET /api/profile]', error)
    const message = error instanceof Error && error.message.includes('P1001')
      ? 'Erreur de chargement. Vérifiez votre connexion.'
      : 'Une erreur est survenue. Veuillez réessayer.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { data: { user }, error: authError } = await getAuthenticatedUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, phone, preferred_lang, bio } = body

    const updatedProfile = await prisma.profile.update({
      where: { id: user.id },
      data: {
        full_name,
        phone,
        preferred_lang,
        bio,
      },
    })

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (error: unknown) {
    console.error('[POST /api/profile]', error)
    const message = error instanceof Error && error.message.includes('P1001')
      ? 'Erreur de chargement. Vérifiez votre connexion.'
      : 'Une erreur est survenue. Veuillez réessayer.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = user.id
    const guide = await prisma.guideProfile.findUnique({
      where: { user_id: userId },
      select: { id: true },
    })

    await prisma.$transaction(async (tx) => {
      await tx.booking.updateMany({ where: { cancelled_by: userId }, data: { cancelled_by: null } })
      await tx.guideProfile.updateMany({ where: { reviewed_by: userId }, data: { reviewed_by: null } })
      await tx.guideDocument.updateMany({ where: { verified_by: userId }, data: { verified_by: null } })
      await tx.report.updateMany({ where: { handled_by: userId }, data: { handled_by: null } })

      if (guide) {
        await tx.guideTouristRating.deleteMany({ where: { guide_id: guide.id } })
        await tx.review.deleteMany({ where: { guide_id: guide.id } })
        await tx.report.deleteMany({ where: { reported_id: guide.id } })
        await tx.booking.deleteMany({ where: { guide_id: guide.id } })
        await tx.guideDocument.deleteMany({ where: { guide_id: guide.id } })
        await tx.guideAvailability.deleteMany({ where: { guide_id: guide.id } })
      }

      await tx.guideTouristRating.deleteMany({ where: { tourist_id: userId } })
      await tx.review.deleteMany({ where: { reviewer_id: userId } })
      await tx.report.deleteMany({ where: { reporter_id: userId } })
      await tx.notification.deleteMany({ where: { user_id: userId } })
      await tx.booking.deleteMany({ where: { tourist_id: userId } })
      await tx.adminLog.deleteMany({ where: { admin_id: userId } })

      if (guide) {
        await tx.guideProfile.delete({ where: { id: guide.id } })
      }

      await tx.profile.deleteMany({ where: { id: userId } })
    })

    const admin = createServiceClient()
    if (admin) {
      await admin.auth.admin.deleteUser(userId)
    } else {
      await supabase.auth.signOut()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/profile]', error instanceof Error ? error.message : 'error')
    return NextResponse.json(
      { error: 'Impossible de supprimer le compte pour le moment.' },
      { status: 500 }
    )
  }
}
