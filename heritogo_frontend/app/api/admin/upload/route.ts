import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

const BUCKET = 'places'
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const kind = String(formData.get('kind') ?? 'lieux') === 'plats' ? 'plats' : 'lieux'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 })
    }

    const ext = ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]
    if (!ext) {
      return NextResponse.json({ error: 'Format invalide. JPG, PNG ou WEBP uniquement.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE || file.size === 0) {
      return NextResponse.json({ error: 'Image trop lourde ou vide. Maximum 5 Mo.' }, { status: 400 })
    }

    const supabase = await createClient()
    const fileName = `${kind}/${crypto.randomUUID()}.${ext}`
    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, bytes, {
      contentType: file.type,
      upsert: false,
    })

    if (uploadError) {
      console.error('[POST /api/admin/upload]', uploadError)
      const msg = uploadError.message.toLowerCase()
      if (msg.includes('row-level security') || msg.includes('policy')) {
        return NextResponse.json(
          { error: "Le bucket « places » refuse l’upload. Ajoutez une policy Storage pour les admins authentifiés." },
          { status: 500 },
        )
      }
      return NextResponse.json({ error: "Échec de l'envoi de l'image." }, { status: 500 })
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
    return NextResponse.json({ url: data.publicUrl, path: fileName })
  } catch (error) {
    console.error('[POST /api/admin/upload]', error)
    return NextResponse.json({ error: "Erreur pendant l'upload." }, { status: 500 })
  }
}
