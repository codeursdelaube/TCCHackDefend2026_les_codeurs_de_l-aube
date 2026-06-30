/**
 * lib/rate-limit.ts
 * Rate limiter en mémoire (in-process) pour protéger les routes auth contre le brute-force.
 * Note : en production multi-instance, utiliser Redis. Ici adapté pour le hackathon.
 */

interface RateLimitRecord {
  count: number
  resetAt: number
}

const attempts = new Map<string, RateLimitRecord>()

/**
 * Vérifie si une clé peut effectuer une action.
 * @param key - Identifiant unique (ex: "login:ip:email")
 * @param maxAttempts - Nombre maximum de tentatives autorisées
 * @param windowMs - Fenêtre temporelle en millisecondes (défaut: 60s)
 * @returns true si autorisé, false si bloqué
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 60000
): boolean {
  const now = Date.now()
  const record = attempts.get(key)

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= maxAttempts) {
    return false // bloqué
  }

  record.count++
  return true
}

/**
 * Réinitialise le compteur pour une clé (ex: après connexion réussie).
 */
export function resetRateLimit(key: string): void {
  attempts.delete(key)
}
