'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/utils/http'
import type { CatalogDish, CatalogPlace } from '@/lib/catalog/types'

export function usePlaces() {
  const [places, setPlaces] = useState<CatalogPlace[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiFetch<{ places?: CatalogPlace[] }>('/api/places').then((result) => {
      if (cancelled) return
      setPlaces(result.ok && result.data?.places ? result.data.places : [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { places, loading }
}

export function useDishes() {
  const [dishes, setDishes] = useState<CatalogDish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiFetch<{ dishes?: CatalogDish[] }>('/api/dishes').then((result) => {
      if (cancelled) return
      setDishes(result.ok && result.data?.dishes ? result.data.dishes : [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { dishes, loading }
}
