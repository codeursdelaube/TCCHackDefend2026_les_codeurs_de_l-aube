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
type ClientCacheStorage = 'session' | 'local'

interface CachedApiFetchOptions extends ApiFetchOptions {
  /** Stable key for public GET responses. Never use this for authenticated data. */
  cacheKey: string
  /** Cache lifetime in milliseconds. Defaults to 5 minutes. */
  ttlMs?: number
  storage?: ClientCacheStorage
}

interface ClientCacheEntry<T> {
  createdAt: number
  data: T
}

const CLIENT_CACHE_PREFIX = 'heritogo:api-cache:'
const memoryCache = new Map<string, ClientCacheEntry<unknown>>()
const inFlightRequests = new Map<string, Promise<ApiFetchResult<unknown>>>()

function getCacheStorage(storage: ClientCacheStorage): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return storage === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

function readCacheEntry<T>(key: string, ttlMs: number, storage: ClientCacheStorage): T | null {
  const now = Date.now()
  const inMemory = memoryCache.get(key) as ClientCacheEntry<T> | undefined
  if (inMemory && now - inMemory.createdAt < ttlMs) return inMemory.data
  if (inMemory) memoryCache.delete(key)

  const cacheStorage = getCacheStorage(storage)
  if (!cacheStorage) return null

  try {
    const raw = cacheStorage.getItem(`${CLIENT_CACHE_PREFIX}${key}`)
    if (!raw) return null

    const entry = JSON.parse(raw) as ClientCacheEntry<T>
    if (!entry || typeof entry.createdAt !== 'number' || now - entry.createdAt >= ttlMs) {
      cacheStorage.removeItem(`${CLIENT_CACHE_PREFIX}${key}`)
      return null
    }

    memoryCache.set(key, entry)
    return entry.data
  } catch {
    return null
  }
}

function writeCacheEntry<T>(key: string, data: T, storage: ClientCacheStorage) {
  const entry: ClientCacheEntry<T> = { createdAt: Date.now(), data }
  memoryCache.set(key, entry)

  try {
    getCacheStorage(storage)?.setItem(`${CLIENT_CACHE_PREFIX}${key}`, JSON.stringify(entry))
  } catch {
    // Storage is optional: the in-memory cache still prevents duplicate requests.
  }
}

/**
 * Cache an explicitly public GET response. Concurrent calls with the same key
 * are deduplicated; stale or failed responses are never cached.
 */
export async function apiFetchCached<T = unknown>(
  input: RequestInfo | URL,
  options: CachedApiFetchOptions
): Promise<ApiFetchResult<T>> {
  const { cacheKey, ttlMs = 5 * 60 * 1000, storage = 'session', ...requestOptions } = options
  const method = (requestOptions.method || 'GET').toUpperCase()

  if (method !== 'GET') return apiFetch<T>(input, requestOptions)

  const cached = readCacheEntry<T>(cacheKey, ttlMs, storage)
  if (cached !== null) {
    return { ok: true, status: 200, data: cached, error: null }
  }

  const existingRequest = inFlightRequests.get(cacheKey) as Promise<ApiFetchResult<T>> | undefined
  if (existingRequest) return existingRequest

  const request = apiFetch<T>(input, requestOptions)
    .then((result) => {
      if (result.ok && result.data !== null) writeCacheEntry(cacheKey, result.data, storage)
      return result
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey)
    })

  inFlightRequests.set(cacheKey, request as Promise<ApiFetchResult<unknown>>)
  return request
}

/** Remove cached public resources after a mutation that can change them. */
export function clearClientCache(keyPrefix = '') {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefix)) memoryCache.delete(key)
  }

  for (const storageType of ['session', 'local'] as const) {
    const cacheStorage = getCacheStorage(storageType)
    if (!cacheStorage) continue

    try {
      for (let index = cacheStorage.length - 1; index >= 0; index -= 1) {
        const key = cacheStorage.key(index)
        if (key?.startsWith(`${CLIENT_CACHE_PREFIX}${keyPrefix}`)) cacheStorage.removeItem(key)
      }
    } catch {
      // A blocked storage API simply means there is nothing to invalidate.
    }
  }
}