import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le profil pour vérifier le rôle
    const profile = await prisma.profile.findUnique({
      where: { id: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
    }

    if (profile.role !== 'guide') {
      return NextResponse.json({ error: 'Action interdite pour ce rôle' }, { status: 403 })
    }

    // Vérifier ou créer le guide_profile
    let guideProfile = await prisma.guideProfile.findUnique({
      where: { user_id: user.id }
    })

    if (!guideProfile) {
      guideProfile = await prisma.guideProfile.create({
        data: {
          user_id: user.id,
          status: 'pending',
          experience_years: 0,
          specialties: [],
          languages: [],
          coverage_zones: [],
        }
      })
    }

    return NextResponse.json({ success: true, guideProfile })
  } catch (error: unknown) {
    console.error('Erreur dans /api/auth/register-guide:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
