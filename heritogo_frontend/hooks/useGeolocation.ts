'use client'

import { useEffect, useState } from 'react'

interface Position {
  lat: number
  long: number
}

export function useGeolocation() {
  const [position, setPosition] = useState<Position | null>(null)
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLoading(false)
      return
    }

    const handleSuccess = (pos: GeolocationPosition) => {
      setPosition({
        lat: pos.coords.latitude,
        long: pos.coords.longitude
      })
      setLoading(false)
      setDenied(false)
    }

    const handleError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setDenied(true)
      }
      setLoading(false)
    }

    // Démarrage de la géolocalisation
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    })

    // Suivi continu
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    })

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  return { position, loading, denied }
}
