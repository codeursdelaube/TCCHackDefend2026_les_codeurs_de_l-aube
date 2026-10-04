import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { slugify } from '@/lib/catalog/map'
import { DISH_CATEGORIES } from '@/lib/catalog/types'
import { catalogDbError, logAdminAction } from '@/lib/catalog/admin'
import { dishCopyFromFrench, parseDishTranslations, translateDishCopy } from '@/lib/catalog/translate'
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

    const nextName = body.name !== undefined ? String(body.name).trim() : current.name
    const nextDescription = body.description !== undefined ? String(body.description).trim() : current.description
    const nextHistory = body.history !== undefined ? String(body.history).trim() : current.history
    const nextAccompaniments = body.accompaniments !== undefined ? String(body.accompaniments).trim() || null : current.accompaniments

    let nextTranslations = body.translations !== undefined ? parseDishTranslations(body.translations) : undefined

    // Si le texte français a été modifié et qu'aucune traduction manuelle n'a été transmise,
    // on régénère automatiquement les traductions pour remplacer directement l'ancien contenu
    const frChanged =
      (body.name !== undefined && body.name.trim() !== current.name) ||
      (body.description !== undefined && body.description.trim() !== current.description) ||
      (body.history !== undefined && body.history.trim() !== current.history)

    if (frChanged && nextTranslations === undefined) {
      nextTranslations = await translateDishCopy(
        dishCopyFromFrench({
          name: nextName,
          description: nextDescription,
          history: nextHistory,
          accompaniments: nextAccompaniments,
        }),
      )
    }

    const updated = await updateDishRow(String(current.id), {
      slug: nextSlug,
      name: body.name !== undefined ? nextName : undefined,
      description: body.description !== undefined ? nextDescription : undefined,
      history: body.history !== undefined ? nextHistory : undefined,
      accompaniments: body.accompaniments !== undefined ? nextAccompaniments : undefined,
      category: body.category !== undefined ? String(body.category).trim() : undefined,
      region: body.region !== undefined ? String(body.region).trim() || null : undefined,
      image_url: body.image_url !== undefined ? String(body.image_url).trim() : undefined,
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : undefined,
      translations: nextTranslations,
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
