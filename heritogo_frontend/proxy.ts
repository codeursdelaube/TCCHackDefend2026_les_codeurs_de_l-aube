import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Routes publiques → pas d'appel Supabase nécessaire
const PUBLIC_PREFIXES = [
  '/cuisine',
  '/lieux',
  '/histoire',
  '/loisirs',
  '/scan',
  '/offline',
  '/auth/callback',
  '/auth/confirm',
  '/auth/reset-password',
  '/auth/error',
]

// Routes qui nécessitent une vérification de session
const PROTECTED_PREFIXES = ['/dashboard', '/booking', '/guides']
const LOGIN_PREFIXES = ['/auth/login', '/auth/register', '/auth/forgot-password']

function extractLocaleAndPath(pathname: string): { locale: string; pathWithoutLocale: string } {
  const locales = ['fr', 'en', 'es', 'zh']
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return {
        locale,
        pathWithoutLocale: pathname.replace(`/${locale}`, '') || '/',
      }
    }
  }
  return { locale: 'fr', pathWithoutLocale: pathname }
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const { locale: currentLocale, pathWithoutLocale } = extractLocaleAndPath(pathname)

  // ── Fast path : routes publiques → i18n directement, sans appel Supabase ──────
  // Cela évite les timeouts Edge qui causent des 404 intermittents en production
  const isPublic = PUBLIC_PREFIXES.some((p) => pathWithoutLocale.startsWith(p))
  if (isPublic) {
    return intlMiddleware(request)
  }

  const isRoot = pathWithoutLocale === '/' || pathWithoutLocale === ''
  const isProtected = PROTECTED_PREFIXES.some((p) => pathWithoutLocale.startsWith(p))
  const isLoginOrRegister = LOGIN_PREFIXES.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  )

  // Routes qui n'ont pas besoin d'auth check → passer directement à i18n
  if (!isRoot && !isProtected && !isLoginOrRegister) {
    return intlMiddleware(request)
  }

  // ── Appel Supabase uniquement pour root / pages protégées / login ────────────
  const response = NextResponse.next({ request })

  let user = null
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
              })
            })
          },
        },
      }
    )
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Si Supabase est indisponible : fail-open sur les routes non protégées
    // Les routes protégées redirigent vers login par sécurité
    if (isProtected) {
      const loginUrl = new URL(`/${currentLocale}/auth/login`, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Accueil avec session → dashboard
  if (user && isRoot) {
    return NextResponse.redirect(new URL(`/${currentLocale}/dashboard`, request.url))
  }

  // Connecté sur login/register → dashboard
  if (user && isLoginOrRegister) {
    return NextResponse.redirect(new URL(`/${currentLocale}/dashboard`, request.url))
  }

  // Non connecté sur route protégée → login
  if (!user && isProtected) {
    const loginUrl = new URL(`/${currentLocale}/auth/login`, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Appliquer i18n et propager les cookies de session ───────────────────────
  const intlResponse = intlMiddleware(request)
  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value)
  })

  return intlResponse
}

export const config = {
  matcher: [
    /*
     * Intercepter toutes les routes SAUF :
     * - /api/*       → routes API Next.js
     * - /_next/*     → assets statiques Next.js (JS, CSS, images optimisées)
     * - /_vercel/*   → infra Vercel interne
     * - /.*\..*      → fichiers avec extension (favicon.ico, manifest.json…)
     */
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
