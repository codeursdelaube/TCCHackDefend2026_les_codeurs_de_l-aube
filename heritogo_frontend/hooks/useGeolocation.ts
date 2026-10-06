'use client'

import { useEffect, useState } from 'react'

interface Position {
  lat: number
  lng: number
}

export function useGeolocation(options?: { enabled?: boolean }) {
  const enabled = options?.enabled === true
  const [position, setPosition] = useState<Position | null>(null)
  const [loading, setLoading] = useState(false)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !navigator.geolocation) {
      setPosition(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    const handleSuccess = (pos: GeolocationPosition) => {
      if (cancelled) return
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      })
      setLoading(false)
      setDenied(false)
    }

    const handleError = (error: GeolocationPositionError) => {
      if (cancelled) return
      if (error.code === error.PERMISSION_DENIED) {
        setDenied(true)
      }
      setLoading(false)
    }

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    })

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    })

    return () => {
      cancelled = true
      navigator.geolocation.clearWatch(watchId)
      setPosition(null)
    }
  }, [enabled])

  return { position, loading, denied }
}
