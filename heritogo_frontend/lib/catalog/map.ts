import type { CatalogDish, CatalogPlace } from './types'
import { parseDishTranslations, parsePlaceTranslations } from './translate'
import type { CatalogLocale } from './i18n'

type PlaceRecord = {
  slug: string
  name: string
  description: string
  history: string
  region: string
  locality: string
  latitude: unknown
  longitude: unknown
  image_url: string
  is_unesco: boolean
  is_published: boolean
  best_time?: string | null
  duration?: string | null
  outfit?: string | null
  access_info?: string | null
  fee?: string | null
  related_dish_slugs?: string[] | null
  translations?: unknown
}

type DishRecord = {
  slug: string
  name: string
  description: string
  history: string
  accompaniments?: string | null
  category: string
  region?: string | null
  image_url: string
  is_published: boolean
  translations?: unknown
}

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  if (value && typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
    return value.toNumber()
  }
  return Number(value)
}

export function mapPlace(place: PlaceRecord, locale: string = 'fr'): CatalogPlace {
  const translations = parsePlaceTranslations(place.translations)
  const localized = locale !== 'fr' ? translations[locale as Exclude<CatalogLocale, 'fr'>] : undefined

  return {
    id: place.slug,
    slug: place.slug,
    nom: localized?.nom || place.name,
    description: localized?.description || place.description,
    histoire: localized?.histoire || place.history,
    région: place.region,
    localite: place.locality,
    lat: toNumber(place.latitude),
    lng: toNumber(place.longitude),
    image: place.image_url,
    isUnesco: Boolean(place.is_unesco),
    isPublished: place.is_published !== false,
    bestTime: localized?.bestTime || place.best_time,
    duration: localized?.duration || place.duration,
    outfit: localized?.outfit || place.outfit,
    access: localized?.access || place.access_info,
    fee: localized?.fee || place.fee,
    relatedDishSlugs: place.related_dish_slugs ?? [],
    translations,
  }
}

export function mapDish(dish: DishRecord, locale: string = 'fr'): CatalogDish {
  const translations = parseDishTranslations(dish.translations)
  const localized = locale !== 'fr' ? translations[locale as Exclude<CatalogLocale, 'fr'>] : undefined

  return {
    id: dish.slug,
    slug: dish.slug,
    nom: localized?.nom || dish.name,
    description: localized?.description || dish.description,
    histoire: localized?.histoire || dish.history,
    accompaniments: localized?.accompaniments ?? dish.accompaniments,
    catégorie: dish.category,
    region: dish.region,
    image: dish.image_url,
    isPublished: dish.is_published !== false,
    translations,
  }
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80)
}

export function resolveCatalogLocale(value: string | null | undefined) {
  if (value === 'en' || value === 'es' || value === 'zh' || value === 'fr') return value
  return 'fr'
}
