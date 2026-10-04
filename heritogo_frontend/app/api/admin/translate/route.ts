import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { placeCopyFromFrench, translatePlaceCopy } from '@/lib/catalog/libretranslate'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const name = String(body.name ?? '').trim()
    const description = String(body.description ?? '').trim()
    if (!name || !description) {
      return NextResponse.json({ error: 'Nom et description français sont requis pour traduire.' }, { status: 400 })
    }

    const translations = await translatePlaceCopy(
      placeCopyFromFrench({
        name,
        description,
        history: String(body.history ?? '').trim() || description,
        best_time: String(body.best_time ?? '').trim() || null,
        duration: String(body.duration ?? '').trim() || null,
        outfit: String(body.outfit ?? '').trim() || null,
        access_info: String(body.access_info ?? '').trim() || null,
        fee: String(body.fee ?? '').trim() || null,
      }),
    )

    return NextResponse.json({ translations })
  } catch (error) {
    console.error('[POST /api/admin/translate]', error)
    const message = error instanceof Error ? error.message : 'Traduction impossible.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
