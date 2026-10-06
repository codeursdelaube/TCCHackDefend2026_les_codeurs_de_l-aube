import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ensureProfileFromAuthUser } from '@/lib/auth/ensureProfile'
import { OAUTH_RETURN_COOKIE, parseOAuthReturn } from '@/lib/auth/oauthReturn'

function isSafePath(path: string) {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('\\')
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const cookieStore = await cookies()
  const oauthReturn = parseOAuthReturn(cookieStore.get(OAUTH_RETURN_COOKIE)?.value)

  const localeParam = searchParams.get('locale') ?? oauthReturn?.locale
  const requestedRole = searchParams.get('role') ?? oauthReturn?.role
  const nextParam = searchParams.get('next') ?? oauthReturn?.next

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Cookies may already be committed on some runtimes.
          }
        },
      },
    }
  )

  const finish = (path: string) => {
    const response = NextResponse.redirect(`${origin}${path}`)
    response.cookies.set(OAUTH_RETURN_COOKIE, '', { path: '/', maxAge: 0 })
    return response
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        try {
          await ensureProfileFromAuthUser(user, {
            role: requestedRole,
            locale: localeParam,
          })
        } catch (profileError) {
          console.error('[auth/callback] profile ensure failed:', profileError)
        }
      }

      const next = nextParam && isSafePath(nextParam) ? nextParam : `/${localeParam || 'fr'}/dashboard`
      return finish(next)
    }
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email' | 'signup' | 'recovery' | 'invite',
    })
    if (!error) {
      const locale = localeParam || 'fr'
      const next =
        type === 'recovery'
          ? `/${locale}/auth/login`
          : nextParam && isSafePath(nextParam)
            ? nextParam
            : `/${locale}/dashboard`
      return finish(next)
    }
  }

  return finish(`/${localeParam || 'fr'}/auth/login?error=oauth`)
}
