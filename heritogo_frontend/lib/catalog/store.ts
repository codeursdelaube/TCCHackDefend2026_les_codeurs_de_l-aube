import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/lib/supabase/service'
import { prisma } from '@/lib/prisma'
import type { CatalogDish, CatalogPlace } from './types'
import { mapDish, mapPlace } from './map'

type PlaceWrite = {
  slug: string
  name: string
  description: string
  history: string
  region: string
  locality: string
  latitude: number
  longitude: number
  image_url: string
  is_unesco: boolean
  is_published: boolean
  best_time: string | null
  duration: string | null
  outfit: string | null
  access_info: string | null
  fee: string | null
  related_dish_slugs: string[]
  translations?: Record<string, unknown>
}

type DishWrite = {
  slug: string
  name: string
  description: string
  history: string
  accompaniments: string | null
  category: string
  region: string | null
  image_url: string
  is_published: boolean
  translations?: Record<string, unknown>
}

function catalogClient() {
  const service = createServiceClient()
  if (service) return service
  // Fallback: anon client (no cookies/headers needed — safe for any context)
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

function throwIfError(error: { message?: string; code?: string; details?: string } | null) {
  if (!error) return
  const err = new Error([error.message, error.details].filter(Boolean).join(' — ') || 'Erreur catalogue')
  Object.assign(err, { code: error.code })
  throw err
}

function isUuid(value: string) {
  return /^[0-9a-f-]{36}$/i.test(value)
}

let translationsColumnReady = false
let dishTranslationsColumnReady = false

export async function ensurePlaceTranslationsColumn() {
  if (translationsColumnReady) return
  try {
    await prisma.$executeRawUnsafe(
      `alter table places add column if not exists translations jsonb not null default '{}'::jsonb`,
    )
    translationsColumnReady = true
  } catch (error) {
    console.error('[ensurePlaceTranslationsColumn]', error)
  }
}

export async function ensureDishTranslationsColumn() {
  if (dishTranslationsColumnReady) return
  try {
    await prisma.$executeRawUnsafe(
      `alter table dishes add column if not exists translations jsonb not null default '{}'::jsonb`,
    )
    dishTranslationsColumnReady = true
  } catch (error) {
    console.error('[ensureDishTranslationsColumn]', error)
  }
}

async function withPrismaFallback<T>(prismaFn: () => Promise<T>, supabaseFn: () => Promise<T>): Promise<T> {
  try {
    return await prismaFn()
  } catch (error) {
    console.error('[catalog prisma]', error)
    return supabaseFn()
  }
}

export async function listPlacesAdmin(): Promise<CatalogPlace[]> {
  await ensurePlaceTranslationsColumn()
  return withPrismaFallback(
    async () => {
      const places = await prisma.place.findMany({ orderBy: { updated_at: 'desc' } })
      return places.map((place) => mapPlace(place, 'fr'))
    },
    async () => {
      const supabase = catalogClient()
      const { data, error } = await supabase.from('places').select('*').order('updated_at', { ascending: false })
      throwIfError(error)
      return (data ?? []).map((row) => mapPlace(row, 'fr'))
    },
  )
}

export async function findPlaceBySlugOrId(id: string) {
  return withPrismaFallback(
    async () => prisma.place.findFirst({
      where: isUuid(id) ? { OR: [{ slug: id }, { id }] } : { slug: id },
    }),
    async () => {
      const supabase = catalogClient()
      const query = supabase.from('places').select('*')
      const { data, error } = isUuid(id)
        ? await query.or(`slug.eq.${id},id.eq.${id}`).maybeSingle()
        : await query.eq('slug', id).maybeSingle()
      throwIfError(error)
      return data
    },
  )
}

export async function findPlaceBySlug(slug: string) {
  return withPrismaFallback(
    async () => prisma.place.findUnique({ where: { slug } }),
    async () => {
      const supabase = catalogClient()
      const { data, error } = await supabase.from('places').select('*').eq('slug', slug).maybeSingle()
      throwIfError(error)
      return data
    },
  )
}

export async function createPlaceRow(input: PlaceWrite): Promise<{ place: CatalogPlace; id: string }> {
  await ensurePlaceTranslationsColumn()
  return withPrismaFallback(
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const place = await (prisma.place as any).create({ data: input })
      return { place: mapPlace(place, 'fr'), id: place.id }
    },
    async () => {
      const supabase = catalogClient()
      const { data, error } = await supabase.from('places').insert(input).select('*').single()
      throwIfError(error)
      return { place: mapPlace(data, 'fr'), id: String(data.id) }
    },
  )
}

export async function updatePlaceRow(id: string, input: Partial<PlaceWrite>): Promise<{ place: CatalogPlace; id: string }> {
  await ensurePlaceTranslationsColumn()
  return withPrismaFallback(
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const place = await (prisma.place as any).update({ where: { id }, data: input })
      return { place: mapPlace(place, 'fr'), id: place.id }
    },
    async () => {
      const supabase = catalogClient()
      const { data, error } = await supabase.from('places').update(input).eq('id', id).select('*').single()
      throwIfError(error)
      return { place: mapPlace(data, 'fr'), id: String(data.id) }
    },
  )
}

export async function deletePlaceRow(id: string) {
  return withPrismaFallback(
    async () => {
      await prisma.place.delete({ where: { id } })
    },
    async () => {
      const supabase = catalogClient()
      const { error } = await supabase.from('places').delete().eq('id', id)
      throwIfError(error)
    },
  )
}

export async function listDishesAdmin(): Promise<CatalogDish[]> {
  await ensureDishTranslationsColumn()
  return withPrismaFallback(
    async () => {
      const dishes = await prisma.dish.findMany({ orderBy: { updated_at: 'desc' } })
      return dishes.map((dish) => mapDish(dish, 'fr'))
    },
    async () => {
      const supabase = catalogClient()
      const { data, error } = await supabase.from('dishes').select('*').order('updated_at', { ascending: false })
      throwIfError(error)
      return (data ?? []).map((row) => mapDish(row, 'fr'))
    },
  )
}

export async function findDishBySlugOrId(id: string) {
  return withPrismaFallback(
    async () => prisma.dish.findFirst({
      where: isUuid(id) ? { OR: [{ slug: id }, { id }] } : { slug: id },
    }),
    async () => {
      const supabase = catalogClient()
      const query = supabase.from('dishes').select('*')
      const { data, error } = isUuid(id)
        ? await query.or(`slug.eq.${id},id.eq.${id}`).maybeSingle()
        : await query.eq('slug', id).maybeSingle()
      throwIfError(error)
      return data
    },
  )
}

export async function findDishBySlug(slug: string) {
  return withPrismaFallback(
    async () => prisma.dish.findUnique({ where: { slug } }),
    async () => {
      const supabase = catalogClient()
      const { data, error } = await supabase.from('dishes').select('*').eq('slug', slug).maybeSingle()
      throwIfError(error)
      return data
    },
  )
}

export async function createDishRow(input: DishWrite): Promise<{ dish: CatalogDish; id: string }> {
  await ensureDishTranslationsColumn()
  return withPrismaFallback(
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dish = await (prisma.dish as any).create({ data: input })
      return { dish: mapDish(dish, 'fr'), id: dish.id }
    },
    async () => {
      const supabase = catalogClient()
      const { data, error } = await supabase.from('dishes').insert(input).select('*').single()
      throwIfError(error)
      return { dish: mapDish(data, 'fr'), id: String(data.id) }
    },
  )
}

export async function updateDishRow(id: string, input: Partial<DishWrite>): Promise<{ dish: CatalogDish; id: string }> {
  await ensureDishTranslationsColumn()
  return withPrismaFallback(
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dish = await (prisma.dish as any).update({ where: { id }, data: input })
      return { dish: mapDish(dish, 'fr'), id: dish.id }
    },
    async () => {
      const supabase = catalogClient()
      const { data, error } = await supabase.from('dishes').update(input).eq('id', id).select('*').single()
      throwIfError(error)
      return { dish: mapDish(data, 'fr'), id: String(data.id) }
    },
  )
}

export async function deleteDishRow(id: string) {
  return withPrismaFallback(
    async () => {
      await prisma.dish.delete({ where: { id } })
    },
    async () => {
      const supabase = catalogClient()
      const { error } = await supabase.from('dishes').delete().eq('id', id)
      throwIfError(error)
    },
  )
}
