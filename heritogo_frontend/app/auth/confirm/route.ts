import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | 'recovery' | 'invite' | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error) {
      // Récupérer le profil pour rediriger vers le bon dashboard
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, preferred_lang')
          .eq('id', user.id)
          .single()

        const locale = profile?.preferred_lang || 'fr'
        const role = profile?.role || 'tourist'

        const dashboard =
          role === 'admin' ? `/${locale}/dashboard/admin` :
          role === 'guide' ? `/${locale}/dashboard/guide` :
          `/${locale}/dashboard/tourist`

        return NextResponse.redirect(`${origin}${dashboard}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // En cas d'erreur, rediriger vers la page de login avec un message d'erreur
  return NextResponse.redirect(`${origin}/fr/auth/login?error=lien_expire`)
}
