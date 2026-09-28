import type { Dish, Place } from '@prisma/client'
import type { CatalogDish, CatalogPlace } from './types'

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  if (value && typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
    return value.toNumber()
  }
  return Number(value)
}

export function mapPlace(place: Place): CatalogPlace {
  return {
    id: place.slug,
    slug: place.slug,
    nom: place.name,
    description: place.description,
    histoire: place.history,
    région: place.region,
    localite: place.locality,
    lat: toNumber(place.latitude),
    lng: toNumber(place.longitude),
    image: place.image_url,
    isUnesco: place.is_unesco,
    isPublished: place.is_published,
    bestTime: place.best_time,
    duration: place.duration,
    outfit: place.outfit,
    access: place.access_info,
    fee: place.fee,
    relatedDishSlugs: place.related_dish_slugs ?? [],
  }
}

export function mapDish(dish: Dish): CatalogDish {
  return {
    id: dish.slug,
    slug: dish.slug,
    nom: dish.name,
    description: dish.description,
    histoire: dish.history,
    accompaniments: dish.accompaniments,
    catégorie: dish.category,
    region: dish.region,
    image: dish.image_url,
    isPublished: dish.is_published,
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
