'use client'

import { useState, useActionState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { COLORS } from '@/lib/constants/colors'
import { Check, Loader2, Map, Moon, Settings, Shield, Sun, UserPlus, X } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { registerAction } from './actions'
import { getPasswordStrength } from '@/lib/utils/validation'
import PrivacyModal from '@/components/PrivacyModal'
import { useTheme } from '@/hooks/useTheme'

type RegisterRole = 'tourist' | 'guide'

function SubmitButton({ privacyAccepted }: { privacyAccepted: boolean }) {
  const { pending } = useFormStatus()
  const t = useTranslations('Auth')

  return (
    <button
      type="submit"
      disabled={pending || !privacyAccepted}
      className="btn w-full rounded-2xl border-none text-white disabled:cursor-not-allowed disabled:opacity-50"
      style={{ backgroundColor: COLORS.rust }}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t('register_loading')}
        </span>
      ) : (
        t('register_button')
      )}
    </button>
  )
}

const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']
const strengthLabels = ['', 'Tres faible', 'Faible', 'Moyen', 'Fort']
const languages = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'zh', label: 'ZH' },
]

function RegisterForm() {
  const t = useTranslations('Auth')
  const tNav = useTranslations('Navbar')
  const params = useParams<{ locale: string }>()
  const locale = params.locale
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect') || ''
  const { toggle, isDark, mounted } = useTheme()

  const [role, setRole] = useState<RegisterRole>('tourist')
  const [password, setPassword] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [privacyError, setPrivacyError] = useState(false)
  const [state, formAction] = useActionState(registerAction, null)

  const strength = getPasswordStrength(password)

  const requirements = [
    { label: t('password_req_length'), met: password.length >= 8 },
    { label: t('password_req_uppercase'), met: /[A-Z]/.test(password) },
    { label: t('password_req_lowercase'), met: /[a-z]/.test(password) },
    { label: t('password_req_number'), met: /[0-9]/.test(password) },
  ]

  return (
    <div className="rounded-[28px] border border-border bg-base-200 p-6 shadow-xl sm:p-8">
      <div className="relative mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all ${
            settingsOpen ? 'border-secondary bg-secondary text-secondary-content' : 'border-border bg-base-100'
          }`}
          aria-label={tNav('settings')}
        >
          <Settings className="h-4 w-4" />
        </button>

        {settingsOpen && (
          <div className="absolute right-0 top-full z-20 mt-3 w-[min(21rem,calc(100vw-3rem))] rounded-[28px] border border-border bg-base-200 p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-black uppercase tracking-wider">{tNav('settings')}</span>
              <button type="button" onClick={() => setSettingsOpen(false)} className="rounded-xl p-1 hover:bg-base-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {languages.map((lang) => (
                <Link
                  key={lang.code}
                  href={pathname}
                  locale={lang.code}
                  onClick={() => setSettingsOpen(false)}
                  className={`rounded-2xl border px-3 py-3 text-center text-xs font-black ${
                    locale === lang.code ? 'border-primary bg-primary text-primary-content' : 'border-border bg-base-100'
                  }`}
                >
                  {lang.label}
                </Link>
              ))}
            </div>
            {mounted && (
              <button
                type="button"
                onClick={toggle}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-base-100 py-3 text-sm font-bold"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? tNav('light') : tNav('dark')}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-6 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white"
          style={{ backgroundColor: COLORS.rust }}
        >
          <UserPlus className="h-7 w-7" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-base-content">{t('register_title')}</h1>
        <p className="mt-2 text-sm text-base-content/60">{t('register_subtitle')}</p>
      </div>

      <form
        action={formAction}
        className="space-y-4"
        onSubmit={(e) => {
          if (!privacyAccepted) {
            e.preventDefault()
            setPrivacyError(true)
          } else {
            setPrivacyError(false)
          }
        }}
      >
        <input type="hidden" name="role" value={role} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="redirect" value={redirectParam} />
        <input type="hidden" name="privacy_accepted" value={privacyAccepted ? 'true' : 'false'} />

        <label className="form-control w-full">
          <span className="label-text mb-1 text-sm font-semibold">{t('full_name')}</span>
          <input
            type="text"
            name="full_name"
            required
            className="input input-bordered w-full rounded-2xl bg-base-100"
            autoComplete="name"
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-1 text-sm font-semibold">{t('email')}</span>
          <input
            type="email"
            name="email"
            required
            className="input input-bordered w-full rounded-2xl bg-base-100"
            autoComplete="email"
          />
        </label>

        <div>
          <span className="mb-2 block text-sm font-semibold">{t('role_label')}</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('tourist')}
              className={`rounded-2xl border p-4 text-left transition-all ${
                role === 'tourist'
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                  : 'border-border bg-base-100 hover:border-primary/40'
              }`}
            >
              <UserPlus className="h-6 w-6 text-primary" />
              <p className="mt-2 font-bold text-sm">{t('role_tourist')}</p>
              <p className="mt-1 text-xs text-base-content/60">{t('role_tourist_desc')}</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('guide')}
              className={`rounded-2xl border p-4 text-left transition-all ${
                role === 'guide'
                  ? 'border-secondary bg-secondary/10 ring-2 ring-secondary/30'
                  : 'border-border bg-base-100 hover:border-secondary/40'
              }`}
            >
              <Map className="h-6 w-6 text-secondary" />
              <p className="mt-2 font-bold text-sm">{t('role_guide')}</p>
              <p className="mt-1 text-xs text-base-content/60">{t('role_guide_desc')}</p>
            </button>
          </div>
        </div>

        <label className="form-control w-full">
          <span className="label-text mb-1 text-sm font-semibold">{t('password')}</span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered w-full rounded-2xl bg-base-100"
            autoComplete="new-password"
          />

          {password.length > 0 && (
            <div className="mt-2 space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: strength >= level ? strengthColors[strength] : '#e5e7eb',
                    }}
                  />
                ))}
              </div>
              {strength > 0 && (
                <p
                  className="text-xs font-bold"
                  style={{ color: strengthColors[strength] }}
                >
                  {strengthLabels[strength]}
                </p>
              )}
              <ul className="space-y-1">
                {requirements.map((req) => (
                  <li
                    key={req.label}
                    className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                      req.met ? 'text-green-600' : 'text-base-content/50'
                    }`}
                  >
                    {req.met ? (
                      <Check className="h-3 w-3 shrink-0" />
                    ) : (
                      <X className="h-3 w-3 shrink-0" />
                    )}
                    {req.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </label>

        {state?.error && (
          <div className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            {state.success}
          </div>
        )}

        <div className="space-y-2">
          <label className="flex cursor-pointer items-start gap-3 group">
            <span className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                id="privacy-check"
                checked={privacyAccepted}
                onChange={(e) => {
                  setPrivacyAccepted(e.target.checked)
                  if (e.target.checked) setPrivacyError(false)
                }}
                className="sr-only"
              />
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                  privacyAccepted
                    ? 'border-transparent'
                    : privacyError
                      ? 'border-red-500 bg-red-50'
                      : 'border-border bg-background group-hover:border-primary'
                }`}
                style={privacyAccepted ? { backgroundColor: COLORS.forest, borderColor: COLORS.forest } : {}}
              >
                {privacyAccepted && (
                  <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
            </span>

            <span className="text-sm leading-relaxed text-base-content/70">
              {t('privacy_accept_prefix')}{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setPrivacyOpen(true)
                }}
                className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 transition-colors"
                style={{ color: COLORS.forest }}
              >
                <Shield className="h-3.5 w-3.5" />
                {t('privacy_policy_link')}
              </button>{' '}
              {t('privacy_accept_suffix')}
            </span>
          </label>

          {privacyError && (
            <p className="flex items-center gap-1.5 pl-8 text-xs font-semibold text-red-500">
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {t('privacy_required_error')}
            </p>
          )}
        </div>

        <SubmitButton privacyAccepted={privacyAccepted} />
      </form>

      <div className="mt-4 text-center text-sm">
        <p className="text-base-content/60">
          {t('has_account')}{' '}
          <Link href="/auth/login" className="font-bold hover:underline" style={{ color: COLORS.forest }}>
            {t('login_link')}
          </Link>
        </p>
        <Link href="/" className="mt-2 inline-block text-base-content/50 hover:underline">
          {t('back_home')}
        </Link>
      </div>

      <PrivacyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}

