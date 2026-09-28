import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/auth/admin'

export const maxDuration = 60
export const runtime = 'nodejs'

const BUCKET = 'places'
const MAX_SIZE = 5 * 1024 * 1024
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/pjpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function extensionFromName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'jpeg' || ext === 'jpg') return 'jpg'
  if (ext === 'png' || ext === 'webp') return ext
  return null
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return Boolean(value) && typeof value === 'object' && typeof (value as Blob).arrayBuffer === 'function' && 'size' in (value as Blob)
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const kind = String(formData.get('kind') ?? 'lieux') === 'plats' ? 'plats' : 'lieux'

    if (!isUploadFile(file)) {
      return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 })
    }

    const fileName = 'name' in file && typeof file.name === 'string' ? file.name : 'image.jpg'
    const ext = EXT_BY_TYPE[file.type] || extensionFromName(fileName)
    if (!ext) {
      return NextResponse.json({ error: 'Format invalide. JPG, PNG ou WEBP uniquement.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE || file.size === 0) {
      return NextResponse.json({ error: 'Image trop lourde ou vide. Maximum 5 Mo.' }, { status: 400 })
    }

    const contentType =
      ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
    const objectPath = `${kind}/${crypto.randomUUID()}.${ext}`
    const bytes = await file.arrayBuffer()

    const service = createServiceClient()
    const supabase = service ?? (await createClient())
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
      contentType,
      upsert: true,
    })

    if (uploadError) {
      console.error('[POST /api/admin/upload]', uploadError)
      const msg = uploadError.message.toLowerCase()
      if (msg.includes('row-level security') || msg.includes('policy') || msg.includes('unauthorized') || msg.includes('permission')) {
        return NextResponse.json(
          {
            error:
              "Le bucket « places » bloque l'écriture (RLS). Dans Supabase → Storage → policies, autorisez INSERT pour les utilisateurs authentifiés.",
          },
          { status: 500 },
        )
      }
      if (msg.includes('not found') || msg.includes('bucket')) {
        return NextResponse.json({ error: 'Le bucket « places » est introuvable.' }, { status: 500 })
      }
      return NextResponse.json({ error: uploadError.message || "Échec de l'envoi de l'image." }, { status: 500 })
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)
    return NextResponse.json({ url: data.publicUrl, path: objectPath })
  } catch (error) {
    console.error('[POST /api/admin/upload]', error)
    return NextResponse.json({ error: "Erreur pendant l'upload." }, { status: 500 })
  }
}
