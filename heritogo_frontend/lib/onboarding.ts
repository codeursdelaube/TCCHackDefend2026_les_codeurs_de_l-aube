const KEY = 'heritogo_onboarding_done'

export function isFirstVisit(): boolean {
  if (typeof window === 'undefined') return false
  return !localStorage.getItem(KEY)
}

export function markOnboardingDone(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, 'true')
}
