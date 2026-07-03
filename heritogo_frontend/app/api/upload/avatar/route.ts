import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Validation du type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format invalide. JPG, PNG ou WEBP uniquement.' },
        { status: 400 }
      )
    }

    // Validation de la taille (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image trop lourde. Maximum 5MB.' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${ext}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload dans Supabase Storage bucket "avatars"
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('[POST /api/upload/avatar] Upload error:', uploadError)
      return NextResponse.json(
        { error: "Erreur lors de l'upload." },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl

    // Mettre à jour avatar_url dans profiles via Prisma
    const { prisma } = await import('@/lib/prisma')
    await prisma.profile.update({
      where: { id: user.id },
      data: { avatar_url: publicUrl },
    })

    return NextResponse.json({ success: true, avatar_url: publicUrl })
  } catch (error: unknown) {
    console.error('[POST /api/upload/avatar]', error)
    const isDbError = error instanceof Error &&
      (error.message.includes('P1001') || error.message.toLowerCase().includes("can't reach"))
    return NextResponse.json(
      {
        error: isDbError
          ? 'Erreur de chargement. Vérifiez votre connexion.'
          : 'Une erreur est survenue. Réessayez.'
      },
      { status: 500 }
    )
  }
}
