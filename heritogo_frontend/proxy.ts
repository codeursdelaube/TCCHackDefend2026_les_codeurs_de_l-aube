import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

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

  // Rafraîchit le token à chaque requête (session persistante)
  await supabase.auth.getUser()

  const locales = ['fr', 'en', 'es', 'zh']
  const pathname = request.nextUrl.pathname

  // Extraire le locale et le path sans locale
  let pathWithoutLocale = pathname
  let currentLocale = 'fr'
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
      currentLocale = locale
      break
    }
  }

  // Routes auth et publiques — laisser passer
  const publicPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/callback',
    '/api',
    '/_next',
  ]

  const isPublic = publicPaths.some(p => pathWithoutLocale.startsWith(p))
  const isRoot = pathWithoutLocale === '/' || pathWithoutLocale === ''

  // Vérifier si l'utilisateur est connecté
  const { data: { user } } = await supabase.auth.getUser()

  // Si pas connecté ET sur la page d'accueil → redirect inscription
  if (!user && isRoot) {
    return NextResponse.redirect(
      new URL(`/${currentLocale}/auth/register`, request.url)
    )
  }

  // Si connecté ET sur page auth → redirect dashboard
  if (user && pathWithoutLocale.startsWith('/auth/')) {
    return NextResponse.redirect(
      new URL(`/${currentLocale}/dashboard`, request.url)
    )
  }

  // Routes protégées — redirige vers login si pas connecté
  const protectedPaths = [
    '/dashboard',
    '/booking',
    '/guides/reserve',
    '/scan',
    '/lieux',
    '/cuisine',
    '/guides',
    '/histoire',
    '/loisirs',
    '/subscription',
  ]
  const isProtected = protectedPaths.some(p => pathWithoutLocale.startsWith(p))

  if (!user && isProtected) {
    return NextResponse.redirect(
      new URL(`/${currentLocale}/auth/login`, request.url)
    )
  }

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
