/**
 * lib/utils/errors.ts
 * Mapper universel d'erreurs techniques vers des messages lisibles pour l'utilisateur.
 */

/**
 * Transforme n'importe quelle erreur capturée en message clair pour l'utilisateur.
 * Ne jamais exposer les détails techniques bruts (Prisma, Supabase, réseau).
 */
export function getUserFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()

    if (
      msg.includes("can't reach") ||
      msg.includes('p1001') ||
      msg.includes('p1002') ||
      msg.includes('connection') ||
      msg.includes('econnrefused') ||
      msg.includes('failed to fetch') ||
      msg.includes('network') ||
      msg.includes('networkerror')
    ) {
      return 'Erreur de chargement. Vérifiez votre connexion internet.'
    }
    if (msg.includes('timeout') || msg.includes('timed out')) {
      return 'La requête a pris trop de temps. Réessayez.'
    }
    if (msg.includes('unauthorized') || msg.includes('401')) {
      return 'Session expirée. Veuillez vous reconnecter.'
    }
    if (msg.includes('forbidden') || msg.includes('403')) {
      return "Vous n'avez pas les droits pour cette action."
    }
    if (msg.includes('not found') || msg.includes('404') || msg.includes('p2025')) {
      return 'Élément introuvable.'
    }
    if (msg.includes('database') || msg.includes('prisma')) {
      return 'Erreur de chargement. Vérifiez votre connexion.'
    }
    if (msg.includes('authretryablefetcherror') || msg.includes('supabase')) {
      return 'Erreur de connexion au service. Réessayez dans quelques instants.'
    }
  }
  return 'Une erreur est survenue. Réessayez ou vérifiez votre connexion.'
}

/**
 * Transforme une erreur Supabase Auth en message sécurisé (sans exposer les détails).
 */
export function getSafeAuthErrorMessage(error: { message: string }): string {
  const msg = error.message.toLowerCase()

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Email ou mot de passe incorrect.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Veuillez confirmer votre email avant de vous connecter.'
  }
  if (msg.includes('user already registered') || msg.includes('already exists')) {
    return 'Un compte existe déjà avec cet email.'
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Trop de tentatives. Réessayez plus tard.'
  }
  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('authretryablefetcherror')) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion.'
  }
  if (msg.includes('password') && msg.includes('weak')) {
    return 'Le mot de passe est trop faible. Utilisez au moins 8 caractères avec majuscules et chiffres.'
  }
  // Ne jamais exposer le message brut Supabase à l'utilisateur
  return 'Une erreur est survenue. Veuillez réessayer.'
}

/**
 * Pattern pour les routes API — catch final.
 * Retourne un message sécurisé selon le type d'erreur.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message
    if (msg.includes('P1001') || msg.includes('P1002')) {
      return 'Erreur de chargement. Vérifiez votre connexion.'
    }
  }
  return 'Une erreur est survenue. Veuillez réessayer.'
}
