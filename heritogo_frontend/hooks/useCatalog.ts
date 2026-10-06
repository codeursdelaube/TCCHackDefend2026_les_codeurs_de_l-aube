'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { apiFetchCached } from '@/lib/utils/http'
import type { CatalogDish, CatalogPlace } from '@/lib/catalog/types'

import { getLocalPlaces } from '@/lib/catalog/places'

const CATALOG_CACHE_TTL_MS = 30 * 60 * 1000 // 30 minutes

export function usePlaces() {
  const locale = useLocale()
  const [places, setPlaces] = useState<CatalogPlace[]>(() => getLocalPlaces(locale))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    apiFetchCached<{ places?: CatalogPlace[] }>(`/api/places?locale=${locale}`, {
      cacheKey: `public-places-${locale}`,
      ttlMs: CATALOG_CACHE_TTL_MS,
      storage: 'session',
    }).then((result) => {
      if (cancelled) return
      if (result.ok && result.data?.places && result.data.places.length > 0) {
        setPlaces(result.data.places)
      } else {
        setPlaces(getLocalPlaces(locale))
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  return { places, loading }
}

export function useDishes() {
  const locale = useLocale()
  const [dishes, setDishes] = useState<CatalogDish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiFetchCached<{ dishes?: CatalogDish[] }>(`/api/dishes?locale=${locale}`, {
      cacheKey: `public-dishes-${locale}`,
      ttlMs: CATALOG_CACHE_TTL_MS,
      storage: 'session',
    }).then((result) => {
      if (cancelled) return
      setDishes(result.ok && result.data?.dishes ? result.data.dishes : [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  return { dishes, loading }
}
