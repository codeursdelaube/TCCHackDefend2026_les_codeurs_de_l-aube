'use client'

import { type ReactNode, type CSSProperties } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

interface AuthGuardLinkProps {
  href: string
  className?: string
  style?: CSSProperties
  children: ReactNode
  requireAuth?: boolean
}

/**
 * Wrapper de lien qui vérifie l'authentification en mémoire avant la navigation.
 * Si l'utilisateur n'est pas connecté, redirige vers la page login
 * avec un paramètre redirect pour retourner à la page demandée après connexion.
 */
export default function AuthGuardLink({
  href,
  className,
  style,
  children,
  requireAuth = true,
}: AuthGuardLinkProps) {
  const params = useParams<{ locale: string }>()
  const router = useRouter()
  const locale = params?.locale || 'fr'
  const { isAuthenticated, loading } = useAuth()

  const targetPath = href.startsWith('/') ? `/${locale}${href}` : href

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!requireAuth) return

    if (!loading && !isAuthenticated) {
      e.preventDefault()
      // Redirige vers login avec paramètre de retour
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(targetPath)}`)
    }
  }

  return (
    <a href={targetPath} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  )
}

