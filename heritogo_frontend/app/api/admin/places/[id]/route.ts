import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { slugify } from '@/lib/catalog/map'
import { PLACE_REGIONS } from '@/lib/catalog/types'
import { catalogDbError, DEFAULT_TOGO_LAT, DEFAULT_TOGO_LNG, logAdminAction, parseCoord } from '@/lib/catalog/admin'
import { parsePlaceTranslations } from '@/lib/catalog/libretranslate'
import { deletePlaceRow, findPlaceBySlug, findPlaceBySlugOrId, updatePlaceRow } from '@/lib/catalog/store'

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
    const current = await findPlaceBySlugOrId(id)
    if (!current) {
      return NextResponse.json({ error: 'Lieu introuvable.' }, { status: 404 })
    }

    const body = await request.json()
    const nextSlug = body.slug ? slugify(String(body.slug)) : current.slug
    if (body.region && !PLACE_REGIONS.includes(body.region as typeof PLACE_REGIONS[number])) {
      return NextResponse.json({ error: 'Région invalide.' }, { status: 400 })
    }

    if (nextSlug !== current.slug) {
      const clash = await findPlaceBySlug(nextSlug)
      if (clash) {
        return NextResponse.json({ error: 'Identifiant déjà utilisé.' }, { status: 409 })
      }
    }

    const updated = await updatePlaceRow(String(current.id), {
      slug: nextSlug,
      name: body.name !== undefined ? String(body.name).trim() : undefined,
      description: body.description !== undefined ? String(body.description).trim() : undefined,
      history: body.history !== undefined ? String(body.history).trim() : undefined,
      region: body.region !== undefined ? String(body.region).trim() : undefined,
      locality: body.locality !== undefined ? String(body.locality).trim() : undefined,
      latitude: body.latitude !== undefined ? parseCoord(body.latitude, DEFAULT_TOGO_LAT) : undefined,
      longitude: body.longitude !== undefined ? parseCoord(body.longitude, DEFAULT_TOGO_LNG) : undefined,
      image_url: body.image_url !== undefined ? String(body.image_url).trim() : undefined,
      is_unesco: body.is_unesco !== undefined ? Boolean(body.is_unesco) : undefined,
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : undefined,
      best_time: body.best_time !== undefined ? String(body.best_time).trim() || null : undefined,
      duration: body.duration !== undefined ? String(body.duration).trim() || null : undefined,
      outfit: body.outfit !== undefined ? String(body.outfit).trim() || null : undefined,
      access_info: body.access_info !== undefined ? String(body.access_info).trim() || null : undefined,
      fee: body.fee !== undefined ? String(body.fee).trim() || null : undefined,
      related_dish_slugs: Array.isArray(body.related_dish_slugs)
        ? body.related_dish_slugs.map((item: unknown) => String(item))
        : undefined,
      translations: body.translations !== undefined ? parsePlaceTranslations(body.translations) : undefined,
    })

    await logAdminAction({
      admin_id: auth.profile.id,
      action: 'update_place',
      target_type: 'place',
      target_id: updated.id,
      details: { slug: updated.place.slug },
    })

    return NextResponse.json({ place: updated.place })
  } catch (error) {
    console.error('[PATCH /api/admin/places/:id]', error)
    return NextResponse.json({ error: catalogDbError(error) || 'Impossible de modifier le lieu.' }, { status: 500 })
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
    const current = await findPlaceBySlugOrId(id)
    if (!current) {
      return NextResponse.json({ error: 'Lieu introuvable.' }, { status: 404 })
    }

    await deletePlaceRow(String(current.id))
    await logAdminAction({
      admin_id: auth.profile.id,
      action: 'delete_place',
      target_type: 'place',
      target_id: String(current.id),
      details: { slug: String(current.slug), name: String(current.name) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/places/:id]', error)
    return NextResponse.json({ error: catalogDbError(error) || 'Impossible de supprimer le lieu.' }, { status: 500 })
  }
}
