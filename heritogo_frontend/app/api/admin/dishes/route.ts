import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { slugify } from '@/lib/catalog/map'
import { DISH_CATEGORIES } from '@/lib/catalog/types'
import { catalogDbError, logAdminAction } from '@/lib/catalog/admin'
import { createDishRow, findDishBySlug, listDishesAdmin } from '@/lib/catalog/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function parseDishBody(body: Record<string, unknown>) {
  const name = String(body.name ?? '').trim()
  const description = String(body.description ?? '').trim()
  const history = String(body.history ?? '').trim() || description
  const category = String(body.category ?? '').trim()
  const image_url = String(body.image_url ?? '').trim()

  if (!name || !description || !category || !image_url) {
    return { error: 'Nom, description, catégorie et image sont requis.' }
  }
  if (!DISH_CATEGORIES.includes(category as (typeof DISH_CATEGORIES)[number])) {
    return { error: 'Catégorie invalide.' }
  }

  const slug = slugify(String(body.slug ?? '').trim() || name)
  if (!slug) return { error: 'Identifiant invalide.' }

  return {
    data: {
      slug,
      name,
      description,
      history,
      category,
      image_url,
      accompaniments: String(body.accompaniments ?? '').trim() || null,
      region: String(body.region ?? '').trim() || null,
      is_published: body.is_published !== false,
    },
  }
}

export async function GET() {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const dishes = await listDishesAdmin()
    return NextResponse.json({ dishes })
  } catch (error) {
    console.error('[GET /api/admin/dishes]', error)
    return NextResponse.json({ error: catalogDbError(error) || 'Chargement impossible.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const parsed = parseDishBody(await request.json())
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const existing = await findDishBySlug(parsed.data.slug)
    if (existing) {
      return NextResponse.json({ error: 'Un plat avec cet identifiant existe déjà.' }, { status: 409 })
    }

    const created = await createDishRow(parsed.data)
    await logAdminAction({
      admin_id: auth.profile.id,
      action: 'create_dish',
      target_type: 'dish',
      target_id: created.id,
      details: { slug: created.dish.slug, name: created.dish.nom },
    })

    return NextResponse.json({ dish: created.dish }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/dishes]', error)
    return NextResponse.json({ error: catalogDbError(error) || 'Impossible de créer le plat.' }, { status: 500 })
  }
}
