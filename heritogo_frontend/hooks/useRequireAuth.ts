'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

export function useRequireAuth() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || 'fr'
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (isAuthenticated) return

    const redirectPath = `${window.location.pathname}${window.location.search}`
    window.location.replace(
      `/${locale}/auth/login?redirect=${encodeURIComponent(redirectPath)}`,
    )
  }, [isAuthenticated, loading, locale])

  return { isAuthenticated, loading }
}
