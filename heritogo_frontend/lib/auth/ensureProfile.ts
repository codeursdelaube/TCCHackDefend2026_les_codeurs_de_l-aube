import type { User } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

type AppRole = 'tourist' | 'guide'

function asAppRole(value: unknown): AppRole | null {
  if (value === 'guide' || value === 'tourist') return value
  return null
}

function asLocale(value: unknown): string {
  if (value === 'en' || value === 'es' || value === 'zh' || value === 'fr') return value
  return 'fr'
}

export async function ensureProfileFromAuthUser(
  user: User,
  options?: { role?: string | null; locale?: string | null }
) {
  const meta = user.user_metadata ?? {}
  const fullName = String(
    meta.full_name || meta.name || user.email?.split('@')[0] || 'Utilisateur HeriTogo'
  )
  const avatar = (meta.avatar_url || meta.picture || null) as string | null
  const locale = asLocale(options?.locale || meta.preferred_lang)

  const existing = await prisma.profile.findUnique({ where: { id: user.id } })
  if (existing) {
    if (!existing.avatar_url && avatar) {
      return prisma.profile.update({
        where: { id: user.id },
        data: { avatar_url: avatar },
      })
    }
    return existing
  }

  const role: AppRole = asAppRole(options?.role) ?? asAppRole(meta.role) ?? 'tourist'

  const profile = await prisma.profile.create({
    data: {
      id: user.id,
      full_name: fullName,
      avatar_url: avatar,
      role,
      preferred_lang: locale,
      is_active: true,
    },
  })

  if (role === 'guide') {
    const existingGuide = await prisma.guideProfile.findUnique({
      where: { user_id: user.id },
      select: { id: true },
    })
    if (!existingGuide) {
      await prisma.guideProfile.create({
        data: {
          user_id: user.id,
          status: 'pending',
          experience_years: 0,
          specialties: [],
          languages: [],
          coverage_zones: [],
        },
      })
    }
  }

  return profile
}
