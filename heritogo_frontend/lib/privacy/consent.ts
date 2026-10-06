export const CONSENT_STORAGE_KEY = 'heritogo_privacy_consent'
export const CONSENT_COOKIE = 'heritogo_privacy_consent'

export type PrivacyConsent = {
  geo: boolean | null
  notifications: boolean | null
  updatedAt: string | null
}

const DEFAULT_CONSENT: PrivacyConsent = {
  geo: null,
  notifications: null,
  updatedAt: null,
}

function canUseDom() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

export function readPrivacyConsent(): PrivacyConsent {
  if (!canUseDom()) return DEFAULT_CONSENT
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return DEFAULT_CONSENT
    const parsed = JSON.parse(raw) as Partial<PrivacyConsent>
    return {
      geo: parsed.geo === true ? true : parsed.geo === false ? false : null,
      notifications: parsed.notifications === true ? true : parsed.notifications === false ? false : null,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
    }
  } catch {
    return DEFAULT_CONSENT
  }
}

export function writePrivacyConsent(patch: Partial<Pick<PrivacyConsent, 'geo' | 'notifications'>>): PrivacyConsent {
  const next: PrivacyConsent = {
    ...readPrivacyConsent(),
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  if (!canUseDom()) return next
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next))
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({
    geo: next.geo,
    notifications: next.notifications,
  }))}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
  window.dispatchEvent(new Event('heritogo-consent-change'))
  return next
}

export function clearPrivacyConsent() {
  if (!canUseDom()) return
  window.localStorage.removeItem(CONSENT_STORAGE_KEY)
  document.cookie = `${CONSENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
  window.localStorage.removeItem('heritogo_scans')
  window.localStorage.removeItem('heritogo_favorites')
}
