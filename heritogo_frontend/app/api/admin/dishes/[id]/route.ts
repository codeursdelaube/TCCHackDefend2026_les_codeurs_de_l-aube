import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { slugify } from '@/lib/catalog/map'
import { DISH_CATEGORIES } from '@/lib/catalog/types'
import { catalogDbError, logAdminAction } from '@/lib/catalog/admin'
import { deleteDishRow, findDishBySlug, findDishBySlugOrId, updateDishRow } from '@/lib/catalog/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
    const current = await findDishBySlugOrId(id)
    if (!current) {
      return NextResponse.json({ error: 'Plat introuvable.' }, { status: 404 })
    }

    const body = await request.json()
    if (body.category && !DISH_CATEGORIES.includes(body.category as typeof DISH_CATEGORIES[number])) {
      return NextResponse.json({ error: 'Catégorie invalide.' }, { status: 400 })
    }

    const nextSlug = body.slug ? slugify(String(body.slug)) : current.slug
    if (nextSlug !== current.slug) {
      const clash = await findDishBySlug(nextSlug)
      if (clash) {
        return NextResponse.json({ error: 'Identifiant déjà utilisé.' }, { status: 409 })
      }
    }

    const updated = await updateDishRow(String(current.id), {
      slug: nextSlug,
      name: body.name !== undefined ? String(body.name).trim() : undefined,
      description: body.description !== undefined ? String(body.description).trim() : undefined,
      history: body.history !== undefined ? String(body.history).trim() : undefined,
      accompaniments: body.accompaniments !== undefined ? String(body.accompaniments).trim() || null : undefined,
      category: body.category !== undefined ? String(body.category).trim() : undefined,
      region: body.region !== undefined ? String(body.region).trim() || null : undefined,
      image_url: body.image_url !== undefined ? String(body.image_url).trim() : undefined,
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : undefined,
    })

    await logAdminAction({
      admin_id: auth.profile.id,
      action: 'update_dish',
      target_type: 'dish',
      target_id: updated.id,
      details: { slug: updated.dish.slug },
    })

    return NextResponse.json({ dish: updated.dish })
  } catch (error) {
    console.error('[PATCH /api/admin/dishes/:id]', error)
    return NextResponse.json({ error: catalogDbError(error) || 'Impossible de modifier le plat.' }, { status: 500 })
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
    const current = await findDishBySlugOrId(id)
    if (!current) {
      return NextResponse.json({ error: 'Plat introuvable.' }, { status: 404 })
    }

    await deleteDishRow(String(current.id))
    await logAdminAction({
      admin_id: auth.profile.id,
      action: 'delete_dish',
      target_type: 'dish',
      target_id: String(current.id),
      details: { slug: String(current.slug), name: String(current.name) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/dishes/:id]', error)
    return NextResponse.json({ error: catalogDbError(error) || 'Impossible de supprimer le plat.' }, { status: 500 })
  }
}
