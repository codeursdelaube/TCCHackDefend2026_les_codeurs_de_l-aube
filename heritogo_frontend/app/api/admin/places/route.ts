import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/admin'
import { mapPlace, slugify } from '@/lib/catalog/map'
import { PLACE_REGIONS } from '@/lib/catalog/types'

function parsePlaceBody(body: Record<string, unknown>) {
  const name = String(body.name ?? '').trim()
  const description = String(body.description ?? '').trim()
  const history = String(body.history ?? '').trim()
  const region = String(body.region ?? '').trim()
  const locality = String(body.locality ?? '').trim()
  const image_url = String(body.image_url ?? '').trim()
  const latitude = Number(body.latitude)
  const longitude = Number(body.longitude)

  if (!name || !description || !history || !region || !locality || !image_url) {
    return { error: 'Tous les champs principaux sont requis, y compris une image.' }
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
    },
  }
}

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const places = await prisma.place.findMany({ orderBy: { updated_at: 'desc' } })
  return NextResponse.json({ places: places.map(mapPlace) })
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

    const existing = await prisma.place.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) {
      return NextResponse.json({ error: 'Un lieu avec cet identifiant existe déjà.' }, { status: 409 })
    }

    const place = await prisma.place.create({ data: parsed.data })
    await prisma.adminLog.create({
      data: {
        admin_id: auth.profile.id,
        action: 'create_place',
        target_type: 'place',
        target_id: place.id,
        details: { slug: place.slug, name: place.name },
      },
    })

    return NextResponse.json({ place: mapPlace(place) }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/places]', error)
    return NextResponse.json({ error: 'Impossible de créer le lieu.' }, { status: 500 })
  }
}
