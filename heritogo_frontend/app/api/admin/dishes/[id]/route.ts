import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/admin'
import { mapDish, slugify } from '@/lib/catalog/map'
import { DISH_CATEGORIES } from '@/lib/catalog/types'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const current = await prisma.dish.findFirst({
      where: /^[0-9a-f-]{36}$/i.test(id) ? { OR: [{ slug: id }, { id }] } : { slug: id },
    })
    if (!current) {
      return NextResponse.json({ error: 'Plat introuvable.' }, { status: 404 })
    }

    const body = await request.json()
    if (body.category && !DISH_CATEGORIES.includes(body.category as typeof DISH_CATEGORIES[number])) {
      return NextResponse.json({ error: 'Catégorie invalide.' }, { status: 400 })
    }

    const nextSlug = body.slug ? slugify(String(body.slug)) : current.slug
    if (nextSlug !== current.slug) {
      const clash = await prisma.dish.findUnique({ where: { slug: nextSlug } })
      if (clash) {
        return NextResponse.json({ error: 'Identifiant déjà utilisé.' }, { status: 409 })
      }
    }

    const dish = await prisma.dish.update({
      where: { id: current.id },
      data: {
        slug: nextSlug,
        name: body.name !== undefined ? String(body.name).trim() : undefined,
        description: body.description !== undefined ? String(body.description).trim() : undefined,
        history: body.history !== undefined ? String(body.history).trim() : undefined,
        accompaniments: body.accompaniments !== undefined ? String(body.accompaniments).trim() || null : undefined,
        category: body.category !== undefined ? String(body.category).trim() : undefined,
        region: body.region !== undefined ? String(body.region).trim() || null : undefined,
        image_url: body.image_url !== undefined ? String(body.image_url).trim() : undefined,
        is_published: body.is_published !== undefined ? Boolean(body.is_published) : undefined,
      },
    })

    await prisma.adminLog.create({
      data: {
        admin_id: auth.profile.id,
        action: 'update_dish',
        target_type: 'dish',
        target_id: dish.id,
        details: { slug: dish.slug },
      },
    })

    return NextResponse.json({ dish: mapDish(dish) })
  } catch (error) {
    console.error('[PATCH /api/admin/dishes/:id]', error)
    return NextResponse.json({ error: 'Impossible de modifier le plat.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const current = await prisma.dish.findFirst({
      where: /^[0-9a-f-]{36}$/i.test(id) ? { OR: [{ slug: id }, { id }] } : { slug: id },
    })
    if (!current) {
      return NextResponse.json({ error: 'Plat introuvable.' }, { status: 404 })
    }

    await prisma.dish.delete({ where: { id: current.id } })
    await prisma.adminLog.create({
      data: {
        admin_id: auth.profile.id,
        action: 'delete_dish',
        target_type: 'dish',
        target_id: current.id,
        details: { slug: current.slug, name: current.name },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/dishes/:id]', error)
    return NextResponse.json({ error: 'Impossible de supprimer le plat.' }, { status: 500 })
  }
}
