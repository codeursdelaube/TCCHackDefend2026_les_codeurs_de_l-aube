import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import type { Profile, UserRole } from '@prisma/client'
import type { User } from '@supabase/supabase-js'

type AuthFailure = { error: string; status: 401 | 403 }
type AuthSuccess = { user: User; profile: Profile }

export async function requireUser(): Promise<AuthFailure | AuthSuccess> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: 'Non autorisé', status: 401 }
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  if (!profile) {
    return { error: 'Profil introuvable', status: 403 }
  }

  if (profile.is_active === false) {
    return { error: 'Compte inactif', status: 403 }
  }

  return { user, profile }
}

export async function requireRole(roles: UserRole[]): Promise<AuthFailure | AuthSuccess> {
  const auth = await requireUser()
  if ('error' in auth) return auth
  if (!roles.includes(auth.profile.role)) {
    return { error: 'Accès interdit', status: 403 }
  }
  return auth
}

export function isAuthFailure(value: AuthFailure | AuthSuccess): value is AuthFailure {
  return 'error' in value
}
