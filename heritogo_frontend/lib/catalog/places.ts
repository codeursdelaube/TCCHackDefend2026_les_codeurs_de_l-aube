import { monuments } from '@/app/LieuxT/site'
import { SITE_DETAILS } from '@/lib/constants/siteDetails'
import frMessages from '@/messages/fr.json'
import enMessages from '@/messages/en.json'
import esMessages from '@/messages/es.json'
import zhMessages from '@/messages/zh.json'
import type { CatalogPlace } from '@/lib/catalog/types'

type PlaceCopy = {
  nom?: string
  description?: string
  histoire?: string
}

const MESSAGES_BY_LOCALE: Record<string, Record<string, PlaceCopy>> = {
  fr: (frMessages as { Monuments?: Record<string, PlaceCopy> }).Monuments ?? {},
  en: (enMessages as { Monuments?: Record<string, PlaceCopy> }).Monuments ?? {},
  es: (esMessages as { Monuments?: Record<string, PlaceCopy> }).Monuments ?? {},
  zh: (zhMessages as { Monuments?: Record<string, PlaceCopy> }).Monuments ?? {},
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function getLocalPlaces(locale: string = 'fr'): CatalogPlace[] {
  const placeCopy = MESSAGES_BY_LOCALE[locale] ?? MESSAGES_BY_LOCALE.fr
  const fallbackCopy = MESSAGES_BY_LOCALE.fr

  return monuments.map((m) => {
    const copy = (placeCopy[m.id] || fallbackCopy[m.id] || {}) as PlaceCopy
    const details = SITE_DETAILS[m.id]
    const image = typeof m.image === 'string' ? m.image : m.image.src
    const isUnesco = m.id.includes('koutamakou') || m.id.includes('koutammakou')

    return {
      id: m.id,
      slug: m.id,
      nom: copy.nom || m.id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      description: copy.description || '',
      histoire: copy.histoire || '',
      région: m.région,
      localite: m.localite,
      lat: m.lat,
      lng: m.lng,
      image,
      isUnesco,
      isPublished: true,
      bestTime: details?.practicalInfo?.bestTime || null,
      duration: details?.practicalInfo?.duration || null,
      outfit: details?.practicalInfo?.outfit || null,
      access: details?.practicalInfo?.access || null,
      fee: details?.practicalInfo?.fee || null,
      relatedDishSlugs: details?.dishesIds || [],
    }
  })
}

export function findLocalPlace(rawId: string, locale: string = 'fr'): CatalogPlace | null {
  if (!rawId) return null
  const decoded = decodeURIComponent(rawId).trim()
  const normId = normalize(decoded)
  const places = getLocalPlaces(locale)

  return (
    places.find((p) => {
      const pNormId = normalize(p.id)
      const pNormSlug = normalize(p.slug)
      const pNormNom = normalize(p.nom)

      return (
        pNormId === normId ||
        pNormSlug === normId ||
        pNormNom === normId ||
        (normId.includes('koutam') && pNormId.includes('koutam')) ||
        (normId.includes('vial') && pNormId.includes('vial')) ||
        (normId.includes('independance') && pNormId.includes('independance')) ||
        (normId.includes('cathedrale') && pNormId.includes('cathedrale')) ||
        (normId.includes('marche') && pNormId.includes('marche'))
      )
    }) ?? null
  )
}
