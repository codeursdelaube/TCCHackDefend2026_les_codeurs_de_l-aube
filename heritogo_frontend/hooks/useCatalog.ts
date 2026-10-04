'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { apiFetch } from '@/lib/utils/http'
import type { CatalogDish, CatalogPlace } from '@/lib/catalog/types'

export function usePlaces() {
  const locale = useLocale()
  const [places, setPlaces] = useState<CatalogPlace[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiFetch<{ places?: CatalogPlace[] }>(`/api/places?locale=${locale}`).then((result) => {
      if (cancelled) return
      setPlaces(result.ok && result.data?.places ? result.data.places : [])
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
    apiFetch<{ dishes?: CatalogDish[] }>(`/api/dishes?locale=${locale}`).then((result) => {
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
