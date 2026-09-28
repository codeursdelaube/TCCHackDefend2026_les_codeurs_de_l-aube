import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/admin'
import { mapDish, slugify } from '@/lib/catalog/map'
import { DISH_CATEGORIES } from '@/lib/catalog/types'

function parseDishBody(body: Record<string, unknown>) {
  const name = String(body.name ?? '').trim()
  const description = String(body.description ?? '').trim()
  const history = String(body.history ?? '').trim()
  const category = String(body.category ?? '').trim()
  const image_url = String(body.image_url ?? '').trim()

  if (!name || !description || !history || !category || !image_url) {
    return { error: 'Tous les champs principaux sont requis, y compris une image.' }
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
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const dishes = await prisma.dish.findMany({ orderBy: { updated_at: 'desc' } })
  return NextResponse.json({ dishes: dishes.map(mapDish) })
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

    const existing = await prisma.dish.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) {
      return NextResponse.json({ error: 'Un plat avec cet identifiant existe déjà.' }, { status: 409 })
    }

    const dish = await prisma.dish.create({ data: parsed.data })
    await prisma.adminLog.create({
      data: {
        admin_id: auth.profile.id,
        action: 'create_dish',
        target_type: 'dish',
        target_id: dish.id,
        details: { slug: dish.slug, name: dish.name },
      },
    })

    return NextResponse.json({ dish: mapDish(dish) }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/dishes]', error)
    return NextResponse.json({ error: 'Impossible de créer le plat.' }, { status: 500 })
  }
}
