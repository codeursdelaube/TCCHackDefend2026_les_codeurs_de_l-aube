export const CATALOG_LOCALES = ['fr', 'en', 'es', 'zh'] as const
export type CatalogLocale = (typeof CATALOG_LOCALES)[number]
export const TRANSLATABLE_LOCALES = ['en', 'es', 'zh'] as const
export type TranslatableLocale = (typeof TRANSLATABLE_LOCALES)[number]

export type PlaceCopy = {
  nom: string
  description: string
  histoire: string
  bestTime?: string | null
  duration?: string | null
  outfit?: string | null
  access?: string | null
  fee?: string | null
}

export type PlaceTranslations = Partial<Record<TranslatableLocale, PlaceCopy>>
