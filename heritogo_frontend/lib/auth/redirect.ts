export type UserRole = 'tourist' | 'guide' | 'admin'

/** Chemin interne uniquement — bloque //evil.com, /\\evil.com, URLs absolues. */
export function isSafeInternalPath(path: string | null | undefined): path is string {
  if (!path) return false
  if (!path.startsWith('/')) return false
  if (path.startsWith('//') || path.startsWith('/\\')) return false
  if (path.includes('\\') || path.includes('://')) return false
  if (/[\u0000-\u001f\u007f]/.test(path)) return false
  return true
}

export function dashboardPath(locale: string, role: UserRole): string {
  switch (role) {
    case 'admin':
      return `/${locale}/dashboard/admin`
    case 'guide':
      return `/${locale}/dashboard/guide`
    default:
      return `/${locale}/dashboard/tourist`
  }
}

export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}
