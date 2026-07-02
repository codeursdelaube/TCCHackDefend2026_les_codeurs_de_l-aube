'use client'

import { type ReactNode, type CSSProperties } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AuthGuardLinkProps {
  href: string
  className?: string
  style?: CSSProperties
  children: ReactNode
  requireAuth?: boolean
}

/**
 * Wrapper de lien qui vérifie l'authentification avant la navigation.
 * Si l'utilisateur n'est pas connecté, redirige vers la page register
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
  const locale = params?.locale || 'fr'
  const router = useRouter()

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!requireAuth) return

    e.preventDefault()

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Redirige vers register avec parametre de retour
      const targetPath = href.startsWith('/') ? `/${locale}${href}` : href
      router.push(`/${locale}/auth/register?redirect=${encodeURIComponent(targetPath)}`)
      return
    }

    // Naviguer vers la destination avec le bon préfixe locale
    const targetPath = href.startsWith('/') ? `/${locale}${href}` : href
    router.push(targetPath)
  }

  const fullHref = href.startsWith('/') ? `/${locale}${href}` : href

  return (
    <a href={fullHref} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  )
}
