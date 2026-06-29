import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        guide_profile: true
      }
    })

    return NextResponse.json({ profile })
  } catch (error: unknown) {
    console.error('Erreur dans GET /api/profile:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

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
        bio
      }
    })

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (error: unknown) {
    console.error('Erreur dans POST /api/profile:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
