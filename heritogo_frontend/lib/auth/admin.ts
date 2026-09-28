import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Non autorisé', status: 401 as const }
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  })

  if (!profile || profile.role !== 'admin') {
    return { error: 'Accès interdit', status: 403 as const }
  }

  if (!profile.is_active) {
    return { error: 'Compte inactif', status: 403 as const }
  }

  return { user, profile }
}
