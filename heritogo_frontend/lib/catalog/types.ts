import type { PlaceTranslations } from './i18n'

export const PLACE_REGIONS = ['Maritime', 'Plateaux', 'Centrale', 'Kara', 'Savanes'] as const
export type PlaceRegion = (typeof PLACE_REGIONS)[number]

export const DISH_CATEGORIES = [
  'Plat Principal',
  'Accompagnement',
  'Street Food',
  'Sauce',
  'Boisson',
] as const
export type DishCategory = (typeof DISH_CATEGORIES)[number]

export type CatalogPlace = {
  id: string
  slug: string
  nom: string
  description: string
  histoire: string
  région: PlaceRegion | string
  localite: string
  lat: number
  lng: number
  image: string
  isUnesco: boolean
  isPublished: boolean
  bestTime?: string | null
  duration?: string | null
  outfit?: string | null
  access?: string | null
  fee?: string | null
  relatedDishSlugs: string[]
  translations?: PlaceTranslations
}

export type CatalogDish = {
  id: string
  slug: string
  nom: string
  description: string
  histoire: string
  accompaniments?: string | null
  catégorie: DishCategory | string
  region?: string | null
  image: string
  isPublished: boolean
}

export type Monument = {
  id: string
  région: string
  localite: string
  lat: number
  lng: number
  image: string
  nom?: string
  description?: string
}
