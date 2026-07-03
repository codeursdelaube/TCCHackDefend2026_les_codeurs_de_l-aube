import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_AVATAR_SIZE = 5 * 1024 * 1024
const AVATAR_BUCKET = 'avatars'
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const

function getStorageErrorMessage(errorMessage: string) {
  const msg = errorMessage.toLowerCase()

  if (msg.includes('bucket') || msg.includes('not found')) {
    return "Le stockage des photos de profil n'est pas disponible pour le moment."
  }
  if (msg.includes('row-level security') || msg.includes('permission') || msg.includes('unauthorized')) {
    return "Vous n'avez pas les droits pour envoyer cette photo."
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
    return "Erreur de connexion pendant l'envoi. Vérifiez votre réseau."
  }

  return "Erreur lors de l'envoi de la photo. Réessayez."
}

async function updateProfileAvatar(userId: string, avatarUrl: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
    .select('avatar_url')
    .single()

  if (!error) return

  console.error('[POST /api/upload/avatar] Supabase profile update error:', error)

  const { prisma } = await import('@/lib/prisma')
  await prisma.profile.update({
    where: { id: userId },
    data: { avatar_url: avatarUrl },
  })
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('avatar')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const ext = ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]
    if (!ext) {
      return NextResponse.json(
        { error: 'Format invalide. JPG, PNG ou WEBP uniquement.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        { error: 'Image trop lourde. Maximum 5MB.' },
        { status: 400 }
      )
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'Le fichier est vide.' },
        { status: 400 }
      )
    }

    const fileName = `${user.id}/avatar.${ext}`
    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(fileName, bytes, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('[POST /api/upload/avatar] Upload error:', uploadError)
      return NextResponse.json(
        { error: getStorageErrorMessage(uploadError.message) },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl
    await updateProfileAvatar(user.id, publicUrl)

    return NextResponse.json({ success: true, avatar_url: publicUrl })
  } catch (error: unknown) {
    console.error('[POST /api/upload/avatar]', error)
    const message = error instanceof Error ? error.message.toLowerCase() : ''
    const isDbError =
      message.includes('p1001') ||
      message.includes('p1002') ||
      message.includes("can't reach") ||
      message.includes('database')
    const isNetworkError =
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('timeout')

    return NextResponse.json(
      {
        error: isDbError || isNetworkError
          ? 'Photo envoyée, mais la mise à jour du profil a échoué. Vérifiez votre connexion et réessayez.'
          : 'Une erreur est survenue. Réessayez.'
      },
      { status: 500 }
    )
  }
}
