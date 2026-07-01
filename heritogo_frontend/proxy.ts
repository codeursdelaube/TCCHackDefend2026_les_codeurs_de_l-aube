import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

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

  // UN SEUL appel — rafraîchit le token ET récupère l'user
  const { data: { user } } = await supabase.auth.getUser()

  const locales = ['fr', 'en', 'es', 'zh']
  const pathname = request.nextUrl.pathname

  let pathWithoutLocale = pathname
  let currentLocale = 'fr'
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
      currentLocale = locale
      break
    }
  }

  const isRoot = pathWithoutLocale === '/' || pathWithoutLocale === ''

  // Accueil avec session -> profil/dashboard, accueil public sinon
  if (user && isRoot) {
    return NextResponse.redirect(
      new URL(`/${currentLocale}/dashboard`, request.url)
    )
  }

  // Déjà connecté sur page auth → dashboard
  if (user && pathWithoutLocale.startsWith('/auth/')) {
    return NextResponse.redirect(
      new URL(`/${currentLocale}/dashboard`, request.url)
    )
  }

  // Seules ces routes nécessitent une connexion
  // scan, lieux, cuisine, histoire sont publiques pour les touristes
  const protectedPaths = [
    '/dashboard',
    '/booking',
    '/guides/reserve',
  ]
  const isProtected = protectedPaths.some(p =>
    pathWithoutLocale.startsWith(p)
  )

  if (!user && isProtected) {
    const loginUrl = new URL(`/${currentLocale}/auth/login`, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Appliquer i18n et propager les cookies de session
  const intlResponse = intlMiddleware(request)

  response.cookies.getAll().forEach(cookie => {
    intlResponse.cookies.set(cookie.name, cookie.value)
  })

  return intlResponse
}

export const config = {
  matcher: [
    '/',
    '/(fr|en|es|zh)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
}