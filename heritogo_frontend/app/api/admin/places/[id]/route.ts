import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { slugify } from '@/lib/catalog/map'
import { PLACE_REGIONS } from '@/lib/catalog/types'
import { catalogDbError, DEFAULT_TOGO_LAT, DEFAULT_TOGO_LNG, logAdminAction, parseCoord } from '@/lib/catalog/admin'
import { parsePlaceTranslations, placeCopyFromFrench, translatePlaceCopy } from '@/lib/catalog/translate'
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

    const nextName = body.name !== undefined ? String(body.name).trim() : current.name
    const nextDescription = body.description !== undefined ? String(body.description).trim() : current.description
    const nextHistory = body.history !== undefined ? String(body.history).trim() : current.history
    const nextBestTime = body.best_time !== undefined ? String(body.best_time).trim() || null : current.best_time
    const nextDuration = body.duration !== undefined ? String(body.duration).trim() || null : current.duration
    const nextOutfit = body.outfit !== undefined ? String(body.outfit).trim() || null : current.outfit
    const nextAccess = body.access_info !== undefined ? String(body.access_info).trim() || null : current.access_info
    const nextFee = body.fee !== undefined ? String(body.fee).trim() || null : current.fee

    let nextTranslations = body.translations !== undefined ? parsePlaceTranslations(body.translations) : undefined

    // Si le texte français a été modifié et qu'aucune traduction manuelle n'a été transmise,
    // on régénère automatiquement les traductions pour remplacer directement l'ancien contenu en BD
    const frChanged =
      (body.name !== undefined && body.name.trim() !== current.name) ||
      (body.description !== undefined && body.description.trim() !== current.description) ||
      (body.history !== undefined && body.history.trim() !== current.history) ||
      (body.best_time !== undefined && body.best_time !== current.best_time) ||
      (body.duration !== undefined && body.duration !== current.duration) ||
      (body.outfit !== undefined && body.outfit !== current.outfit) ||
      (body.access_info !== undefined && body.access_info !== current.access_info) ||
      (body.fee !== undefined && body.fee !== current.fee)

    if (frChanged && nextTranslations === undefined) {
      nextTranslations = await translatePlaceCopy(
        placeCopyFromFrench({
          name: nextName,
          description: nextDescription,
          history: nextHistory,
          best_time: nextBestTime,
          duration: nextDuration,
          outfit: nextOutfit,
          access_info: nextAccess,
          fee: nextFee,
        }),
      )
    }

    const updated = await updatePlaceRow(String(current.id), {
      slug: nextSlug,
      name: body.name !== undefined ? nextName : undefined,
      description: body.description !== undefined ? nextDescription : undefined,
      history: body.history !== undefined ? nextHistory : undefined,
      region: body.region !== undefined ? String(body.region).trim() : undefined,
      locality: body.locality !== undefined ? String(body.locality).trim() : undefined,
      latitude: body.latitude !== undefined ? parseCoord(body.latitude, DEFAULT_TOGO_LAT) : undefined,
      longitude: body.longitude !== undefined ? parseCoord(body.longitude, DEFAULT_TOGO_LNG) : undefined,
      image_url: body.image_url !== undefined ? String(body.image_url).trim() : undefined,
      is_unesco: body.is_unesco !== undefined ? Boolean(body.is_unesco) : undefined,
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : undefined,
      best_time: body.best_time !== undefined ? nextBestTime : undefined,
      duration: body.duration !== undefined ? nextDuration : undefined,
      outfit: body.outfit !== undefined ? nextOutfit : undefined,
      access_info: body.access_info !== undefined ? nextAccess : undefined,
      fee: body.fee !== undefined ? nextFee : undefined,
      related_dish_slugs: Array.isArray(body.related_dish_slugs)
        ? body.related_dish_slugs.map((item: unknown) => String(item))
        : undefined,
      translations: nextTranslations,
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
