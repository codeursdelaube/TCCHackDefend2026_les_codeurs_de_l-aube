import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { slugify } from '@/lib/catalog/map'
import { PLACE_REGIONS } from '@/lib/catalog/types'
import { catalogDbError, DEFAULT_TOGO_LAT, DEFAULT_TOGO_LNG, logAdminAction, parseCoord } from '@/lib/catalog/admin'
import { parsePlaceTranslations } from '@/lib/catalog/translate'
import { createPlaceRow, findPlaceBySlug, listPlacesAdmin } from '@/lib/catalog/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function parsePlaceBody(body: Record<string, unknown>) {
  const name = String(body.name ?? '').trim()
  const description = String(body.description ?? '').trim()
  const history = String(body.history ?? '').trim() || description
  const region = String(body.region ?? '').trim()
  const locality = String(body.locality ?? '').trim()
  const image_url = String(body.image_url ?? '').trim()
  const latitude = parseCoord(body.latitude, DEFAULT_TOGO_LAT)
  const longitude = parseCoord(body.longitude, DEFAULT_TOGO_LNG)

  if (!name || !description || !region || !locality || !image_url) {
    return { error: 'Nom, description, région, localité et image sont requis.' }
  }
  if (!PLACE_REGIONS.includes(region as (typeof PLACE_REGIONS)[number])) {
    return { error: 'Région invalide.' }
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { error: 'Les coordonnées GPS sont invalides.' }
  }

  const requestedSlug = String(body.slug ?? '').trim()
  const slug = slugify(requestedSlug || name)
  if (!slug) return { error: 'Identifiant invalide.' }

  return {
    data: {
      slug,
      name,
      description,
      history,
      region,
      locality,
      latitude,
      longitude,
      image_url,
      is_unesco: Boolean(body.is_unesco),
      is_published: body.is_published !== false,
      best_time: String(body.best_time ?? '').trim() || null,
      duration: String(body.duration ?? '').trim() || null,
      outfit: String(body.outfit ?? '').trim() || null,
      access_info: String(body.access_info ?? '').trim() || null,
      fee: String(body.fee ?? '').trim() || null,
      related_dish_slugs: Array.isArray(body.related_dish_slugs)
        ? body.related_dish_slugs.map((item) => String(item)).filter(Boolean)
        : [],
      translations: parsePlaceTranslations(body.translations),
    },
  }
}

export async function GET() {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const places = await listPlacesAdmin()
    return NextResponse.json({ places })
  } catch (error) {
    console.error('[GET /api/admin/places]', error)
    return NextResponse.json({ error: catalogDbError(error) || 'Chargement impossible.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const parsed = parsePlaceBody(await request.json())
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const existing = await findPlaceBySlug(parsed.data.slug)
    if (existing) {
      return NextResponse.json({ error: 'Un lieu avec cet identifiant existe déjà.' }, { status: 409 })
    }

    const created = await createPlaceRow(parsed.data)
    await logAdminAction({
      admin_id: auth.profile.id,
      action: 'create_place',
      target_type: 'place',
      target_id: created.id,
      details: { slug: created.place.slug, name: created.place.nom },
    })

    return NextResponse.json({ place: created.place }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/places]', error)
    return NextResponse.json({ error: catalogDbError(error) || 'Impossible de créer le lieu.' }, { status: 500 })
  }
}
