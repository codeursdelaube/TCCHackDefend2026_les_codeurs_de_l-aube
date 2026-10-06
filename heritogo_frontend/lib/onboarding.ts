import { safeLocalStorageGet, safeLocalStorageSet } from './utils/storage'

const KEY = 'heritogo_onboarding_done'

export function isFirstVisit(): boolean {
  if (typeof window === 'undefined') return false
  return !safeLocalStorageGet(KEY)
}

export function markOnboardingDone(): void {
  if (typeof window === 'undefined') return
  safeLocalStorageSet(KEY, 'true')
}