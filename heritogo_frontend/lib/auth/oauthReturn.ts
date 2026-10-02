export const OAUTH_RETURN_COOKIE = 'heritogo_oauth_return'

export type OAuthReturnState = {
  next: string
  locale: string
  role?: 'tourist' | 'guide'
}

function isSafePath(path: string) {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('\\')
}

export function getOAuthCallbackUrl() {
  return `${window.location.origin}/api/auth/callback`
}

export function persistOAuthReturn(state: OAuthReturnState) {
  const payload: OAuthReturnState = {
    next: isSafePath(state.next) ? state.next : `/${state.locale}/dashboard`,
    locale: state.locale,
    ...(state.role ? { role: state.role } : {}),
  }

  document.cookie = `${OAUTH_RETURN_COOKIE}=${encodeURIComponent(JSON.stringify(payload))}; Path=/; Max-Age=600; SameSite=Lax`
}

export function parseOAuthReturn(raw: string | undefined): OAuthReturnState | null {
  if (!raw) return null
  try {
    const data = JSON.parse(decodeURIComponent(raw)) as Partial<OAuthReturnState>
    if (!data.locale || typeof data.locale !== 'string') return null
    const next =
      data.next && isSafePath(data.next) ? data.next : `/${data.locale}/dashboard`
    const role = data.role === 'guide' || data.role === 'tourist' ? data.role : undefined
    return { next, locale: data.locale, role }
  } catch {
    return null
  }
}
