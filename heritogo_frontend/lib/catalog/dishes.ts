import platsTogolais from '@/app/Plats/plat'
import frMessages from '@/messages/fr.json'
import enMessages from '@/messages/en.json'
import esMessages from '@/messages/es.json'
import zhMessages from '@/messages/zh.json'
import { prisma } from '@/lib/prisma'
import { createServiceClient } from '@/lib/supabase/service'
import { mapDish } from '@/lib/catalog/map'
import type { CatalogDish } from '@/lib/catalog/types'
import { ensureDishTranslationsColumn } from '@/lib/catalog/store'
import {
  dishCopyFromFrench,
  parseDishTranslations,
  translateDishSingleLocale,
} from '@/lib/catalog/translate'
import type { TranslatableLocale } from '@/lib/catalog/i18n'

async function saveDishTranslations(dishId: string, translations: Record<string, unknown>) {
  const supabase = createServiceClient()
  if (supabase) {
    const { error } = await supabase.from('dishes').update({ translations }).eq('id', dishId)
    if (error) console.error('[saveDishTranslations supabase]', error.message)
    return
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.dish as any).update({ where: { id: dishId }, data: { translations } })
  } catch (err) {
    console.error('[saveDishTranslations prisma]', err)
  }
}

type PlatCopy = {
  nom?: string
  description?: string
  histoire?: string
  accompagnementsIdaux?: string
}

const MESSAGES_BY_LOCALE: Record<string, Record<string, PlatCopy>> = {
  fr: (frMessages as { Plats?: Record<string, PlatCopy> }).Plats ?? {},
  en: (enMessages as { Plats?: Record<string, PlatCopy> }).Plats ?? {},
  es: (esMessages as { Plats?: Record<string, PlatCopy> }).Plats ?? {},
  zh: (zhMessages as { Plats?: Record<string, PlatCopy> }).Plats ?? {},
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function slugify(value: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

export function getLocalDishes(locale: string = 'fr'): CatalogDish[] {
  const platCopy = MESSAGES_BY_LOCALE[locale] ?? MESSAGES_BY_LOCALE.fr
  const fallbackCopy = MESSAGES_BY_LOCALE.fr

  return platsTogolais.map((plat) => {
    const copy = platCopy[plat.id] ?? fallbackCopy[plat.id] ?? {}
    const image = typeof plat.image === 'string' ? plat.image : plat.image.src
    return {
      id: plat.id,
      slug: plat.id,
      nom: copy.nom || plat.id,
      description: copy.description || '',
      histoire: copy.histoire || '',
      accompaniments: copy.accompagnementsIdaux || null,
      catégorie: plat.catégorie,
      region: null,
      image,
      isPublished: true,
    }
  })
}

export function dishMatches(dish: CatalogDish, rawId: string) {
  const query = slugify(decodeURIComponent(rawId))
  if (!query) return false
  const slug = slugify(dish.slug)
  const id = slugify(dish.id)
  const name = slugify(dish.nom)
  const aliases = new Set([
    slug,
    id,
    name,
    slug.replace(/_togolais[e]?$/, ''),
    slug.replace(/_dessi$/, ''),
    name.replace(/_togolais[e]?$/, ''),
  ])
  if (aliases.has(query)) return true
  return slug.startsWith(`${query}_`) || id.startsWith(`${query}_`)
}

export function findLocalDish(rawId: string, locale: string = 'fr') {
  return getLocalDishes(locale).find((dish) => dishMatches(dish, rawId)) ?? null
}

function pickBestDish(dishes: CatalogDish[], rawId: string) {
  const query = slugify(rawId)
  return [...dishes].sort((a, b) => {
    const score = (dish: CatalogDish) => {
      if (slugify(dish.slug) === query || slugify(dish.id) === query) return 3
      if (slugify(dish.nom) === query) return 2
      return 1
    }
    return score(b) - score(a)
  })[0]
}

export async function findPublishedDish(rawId: string, locale: string = 'fr'): Promise<CatalogDish | null> {
  try {
    await ensureDishTranslationsColumn()
    const rows = await prisma.dish.findMany({
      where: { is_published: true },
    })

    if (locale !== 'fr') {
      await Promise.all(
        rows.map(async (dish) => {
          const parsed = parseDishTranslations((dish as any).translations)
          if (!parsed[locale as TranslatableLocale]) {
            try {
              const copy = dishCopyFromFrench({
                name: dish.name,
                description: dish.description,
                history: dish.history,
                accompaniments: dish.accompaniments,
              })
              const translated = await translateDishSingleLocale(copy, locale as TranslatableLocale)
              parsed[locale as TranslatableLocale] = translated
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(dish as any).translations = parsed
              saveDishTranslations(dish.id, parsed as Record<string, unknown>).catch(() => {})
            } catch (err) {
              console.error(`[findPublishedDish auto-translate ${dish.slug}]`, err)
            }
          }
        }),
      )
    }

    const mapped = rows.map((dish) => mapDish(dish, locale))
    const matches = mapped.filter((dish) => dishMatches(dish, rawId))
    if (matches.length > 0) return pickBestDish(matches, rawId)
  } catch (error) {
    console.error('[findPublishedDish]', error)
  }
  return findLocalDish(rawId, locale)
}

export async function listPublishedDishes(locale: string = 'fr'): Promise<CatalogDish[]> {
  try {
    await ensureDishTranslationsColumn()
    const rows = await prisma.dish.findMany({
      where: { is_published: true },
      orderBy: { name: 'asc' },
    })

    if (rows.length > 0) {
      if (locale !== 'fr') {
        await Promise.all(
          rows.map(async (dish) => {
            const parsed = parseDishTranslations((dish as any).translations)
            if (!parsed[locale as TranslatableLocale]) {
              try {
                const copy = dishCopyFromFrench({
                  name: dish.name,
                  description: dish.description,
                  history: dish.history,
                  accompaniments: dish.accompaniments,
                })
                const translated = await translateDishSingleLocale(copy, locale as TranslatableLocale)
                parsed[locale as TranslatableLocale] = translated
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ;(dish as any).translations = parsed
                saveDishTranslations(dish.id, parsed as Record<string, unknown>).catch(() => {})
              } catch (err) {
                console.error(`[listPublishedDishes auto-translate ${dish.slug}]`, err)
              }
            }
          }),
        )
      }
      return rows.map((dish) => mapDish(dish, locale))
    }
  } catch (error) {
    console.error('[listPublishedDishes]', error)
  }
  return getLocalDishes(locale)
}

export function dishLookupIds(dish: CatalogDish) {
  const ids = new Set([dish.id, dish.slug])
  if (!dish.slug.endsWith('_togolais') && !dish.slug.endsWith('_togolaise')) {
    ids.add(`${dish.slug}_togolais`)
  }
  return ids
}
