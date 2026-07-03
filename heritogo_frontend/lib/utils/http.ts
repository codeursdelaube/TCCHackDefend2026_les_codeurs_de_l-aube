import { getUserFriendlyError } from './errors'

interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number
}

interface ApiFetchResult<T> {
  ok: boolean
  status: number
  data: T | null
  error: string | null
}

async function readJsonSafely<T>(response: Response): Promise<T | null> {
  const text = await response.text().catch(() => '')
  if (!text) return null

  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

function getPayloadError(data: unknown): string | null {
  if (data && typeof data === 'object' && 'error' in data) {
    const error = (data as { error?: unknown }).error
    if (typeof error === 'string' && error.trim()) return error
  }

  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }

  return null
}

function getStatusError(status: number): string {
  if (status === 401) return 'Session expirée. Veuillez vous reconnecter.'
  if (status === 403) return "Vous n'avez pas les droits pour cette action."
  if (status === 404) return 'Élément introuvable.'
  if (status === 413) return 'Le fichier envoyé est trop lourd.'
  if (status === 429) return 'Trop de tentatives. Réessayez plus tard.'
  if (status >= 500) return 'Le serveur est momentanément indisponible. Réessayez.'
  return 'Une erreur est survenue. Réessayez.'
}

export async function apiFetch<T = unknown>(input: RequestInfo | URL, options: ApiFetchOptions = {}): Promise<ApiFetchResult<T>> {
  const { timeoutMs = 30000, signal, ...init } = options
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  const abortFromCaller = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', abortFromCaller, { once: true })
  }

  try {
    const response = await fetch(input, { ...init, signal: controller.signal })
    const data = await readJsonSafely<T>(response)
    const payloadError = getPayloadError(data)

    return {
      ok: response.ok,
      status: response.status,
      data,
      error: response.ok ? null : payloadError || getStatusError(response.status),
    }
  } catch (error: unknown) {
    const aborted = error instanceof DOMException && error.name === 'AbortError'
    return {
      ok: false,
      status: 0,
      data: null,
      error: aborted ? 'La requête prend trop de temps. Vérifiez votre connexion et réessayez.' : getUserFriendlyError(error),
    }
  } finally {
    window.clearTimeout(timeout)
    if (signal) signal.removeEventListener('abort', abortFromCaller)
  }
}