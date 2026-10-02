import platsTogolais from '@/app/Plats/plat'
import frMessages from '@/messages/fr.json'
import { prisma } from '@/lib/prisma'
import { mapDish } from '@/lib/catalog/map'
import type { CatalogDish } from '@/lib/catalog/types'

type PlatCopy = {
  nom?: string
  description?: string
  histoire?: string
  accompagnementsIdaux?: string
}

const platCopy = (frMessages as { Plats?: Record<string, PlatCopy> }).Plats ?? {}

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

export function getLocalDishes(): CatalogDish[] {
  return platsTogolais.map((plat) => {
    const copy = platCopy[plat.id] ?? {}
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

export function findLocalDish(rawId: string) {
  return getLocalDishes().find((dish) => dishMatches(dish, rawId)) ?? null
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

export async function findPublishedDish(rawId: string): Promise<CatalogDish | null> {
  try {
    const rows = await prisma.dish.findMany({
      where: { is_published: true },
    })
    const mapped = rows.map(mapDish)
    const matches = mapped.filter((dish) => dishMatches(dish, rawId))
    if (matches.length > 0) return pickBestDish(matches, rawId)
  } catch (error) {
    console.error('[findPublishedDish]', error)
  }
  return findLocalDish(rawId)
}

export async function listPublishedDishes(): Promise<CatalogDish[]> {
  try {
    const rows = await prisma.dish.findMany({
      where: { is_published: true },
      orderBy: { name: 'asc' },
    })
    if (rows.length > 0) return rows.map(mapDish)
  } catch (error) {
    console.error('[listPublishedDishes]', error)
  }
  return getLocalDishes()
}

export function dishLookupIds(dish: CatalogDish) {
  const ids = new Set([dish.id, dish.slug])
  if (!dish.slug.endsWith('_togolais') && !dish.slug.endsWith('_togolaise')) {
    ids.add(`${dish.slug}_togolais`)
  }
  return ids
}
