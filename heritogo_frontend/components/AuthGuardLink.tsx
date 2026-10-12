'use client'

import { type ReactNode, type CSSProperties } from 'react'
import { useParams } from 'next/navigation'
import { useRouter, Link } from '@/i18n/navigation'
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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!requireAuth) return
    if (isAuthenticated && !loading) return
    e.preventDefault()
    if (loading) return
    // Utilise router i18n — le préfixe locale est géré automatiquement
    router.push(`/auth/login?redirect=${encodeURIComponent(`/${locale}${href}`)}`)
  }

  return (
    // Link de @/i18n/navigation préfixe automatiquement la locale
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link href={href as any} onClick={handleClick} className={className} style={style}>
      {children}
    </Link>
  )
}
