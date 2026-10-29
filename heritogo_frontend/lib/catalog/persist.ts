import { after } from 'next/server'

/**
 * Planifie une écriture non bloquante (ex. sauvegarde d'une traduction).
 * `after` garantit son exécution sur Vercel une fois la réponse envoyée ;
 * hors contexte de requête, on se rabat sur une promesse détachée.
 */
export function persistLater(task: () => Promise<unknown>) {
  try {
    after(() => task().catch((err) => console.error('[persistLater]', err)))
  } catch {
    task().catch((err) => console.error('[persistLater]', err))
  }
}
