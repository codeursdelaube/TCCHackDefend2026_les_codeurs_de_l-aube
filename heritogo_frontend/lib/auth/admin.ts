import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export type AdminProfile = {
  id: string
  role: string
  is_active?: boolean | null
  full_name?: string | null
}

export async function requireAdmin(): Promise<
  { user: { id: string }; profile: AdminProfile } | { error: string; status: 401 | 403 }
> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Non autorisé', status: 401 }
  }

  const { data: sbProfile, error: sbError } = await supabase
    .from('profiles')
    .select('id, role, is_active, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (!sbError && sbProfile) {
    if (sbProfile.role !== 'admin') {
      return { error: 'Accès interdit', status: 403 }
    }
    if (sbProfile.is_active === false) {
      return { error: 'Compte inactif', status: 403 }
    }
    return { user, profile: sbProfile }
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    })

    if (!profile || profile.role !== 'admin') {
      return { error: 'Accès interdit', status: 403 }
    }

    if (!profile.is_active) {
      return { error: 'Compte inactif', status: 403 }
    }

    return { user, profile }
  } catch (error) {
    console.error('[requireAdmin]', error)
    return { error: 'Accès interdit', status: 403 }
  }
}
