import type { User } from '@supabase/supabase-js'
import type { Profile } from '@prisma/client'
import { safeLocalStorageGet } from '@/lib/utils/storage'

/**
 * Vérifie si un utilisateur dispose d'un abonnement actif (Premium).
 * Utilisable côté serveur ou client en réutilisant l'objet `user` déjà récupéré,
 * afin de respecter la règle stricte "pas de double getUser()".
 */
export function isUserSubscribed(
  user?: User | null,
  profile?: Profile | null
): boolean {
  if (!user && !profile) return false

  // 1. Vérification dans les métadonnées Supabase Auth (app_metadata / user_metadata)
  if (user) {
    const appMeta = (user.app_metadata || {}) as Record<string, unknown>
    const userMeta = (user.user_metadata || {}) as Record<string, unknown>

    if (
      appMeta.is_premium === true ||
      appMeta.subscription === 'premium' ||
      appMeta.plan === 'premium' ||
      userMeta.is_premium === true ||
      userMeta.subscription === 'premium' ||
      userMeta.plan === 'premium'
    ) {
      return true
    }
  }

  // 2. Vérification dans le profil Prisma si un champ spécifique existe
  if (profile) {
    const p = profile as unknown as Record<string, unknown>
    if (p.is_premium === true || p.subscription === 'premium') {
      return true
    }
  }

  return false
}

/**
 * Vérification côté client (navigateur) incluant le stockage local PWA
 */
export function isClientSubscribed(user?: User | null): boolean {
  if (typeof window === 'undefined') return false

  // Si le flag local 'heritogo_premium' est activé (utilisé par la PWA et le mock de souscription)
  if (safeLocalStorageGet('heritogo_premium') === 'true') {
    return true
  }

  return isUserSubscribed(user)
}
