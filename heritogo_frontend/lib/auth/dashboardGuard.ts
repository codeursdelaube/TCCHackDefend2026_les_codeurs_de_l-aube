import { redirect } from 'next/navigation'
import type { UserRole } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { requireRole, requireUser } from '@/lib/auth/session'

function isRedirectError(err: unknown) {
  return (
    err instanceof Error &&
    'digest' in err &&
    typeof (err as Error & { digest: unknown }).digest === 'string' &&
    (err as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT')
  )
}

/**
 * Garde serveur des espaces connectés. Une coupure passagère de la base
 * (pooler Supabase injoignable) ne doit pas afficher la page d'erreur :
 * on se rabat alors sur la seule session Supabase. Les routes API
 * revérifient les droits à chaque appel, la page reste donc sûre.
 */
export async function guardDashboard(locale: string, roles?: UserRole[]) {
  try {
    const auth = roles ? await requireRole(roles) : await requireUser()
    if ('error' in auth) {
      if (auth.status === 401) redirect(`/${locale}/auth/login`)
      redirect(`/${locale}/dashboard`)
    }
    return
  } catch (err) {
    if (isRedirectError(err)) throw err
    console.error('[guardDashboard] profil indisponible, repli sur la session :', err)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${locale}/auth/login`)
  } catch (err) {
    if (isRedirectError(err)) throw err
    redirect(`/${locale}/auth/login`)
  }
}
