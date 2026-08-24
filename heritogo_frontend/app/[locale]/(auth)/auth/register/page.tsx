'use client'

import { useState, useActionState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Check, Loader2, Map, Shield, UserPlus, X } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { registerAction } from './actions'
import { getPasswordStrength } from '@/lib/utils/validation'
import PrivacyModal from '@/components/PrivacyModal'

type RegisterRole = 'tourist' | 'guide'

function SubmitButton({ privacyAccepted }: { privacyAccepted: boolean }) {
  const { pending } = useFormStatus()
  const t = useTranslations('Auth')

  return (
    <button
      type="submit"
      disabled={pending || !privacyAccepted}
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 font-bold text-white shadow-md hover:bg-primary-dark transition-all text-sm cursor-pointer disabled:opacity-50"
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

const strengthColors = ['', '#DC2626', '#B5502E', '#D9A441', '#3E5C45']
const strengthLabels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort']

function RegisterForm() {
  const t = useTranslations('Auth')
  const params = useParams<{ locale: string }>()
  const locale = params.locale
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect') || ''

  const [role, setRole] = useState<RegisterRole>('tourist')
  const [password, setPassword] = useState('')
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
    <div className="app-card p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
          <UserPlus className="h-7 w-7" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{t('register_title')}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">{t('register_subtitle')}</p>
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

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('full_name')}</label>
          <input
            type="text"
            name="full_name"
            required
            className="w-full rounded-2xl border border-border bg-card p-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            autoComplete="name"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('email')}</label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-2xl border border-border bg-card p-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            autoComplete="email"
          />
        </div>

        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('role_label')}</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('tourist')}
              className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                role === 'tourist'
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <UserPlus className="h-5 w-5 text-primary" />
              <p className="mt-2 font-bold text-sm font-serif">{t('role_tourist')}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t('role_tourist_desc')}</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('guide')}
              className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                role === 'guide'
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <Map className="h-5 w-5 text-primary" />
              <p className="mt-2 font-bold text-sm font-serif">{t('role_guide')}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t('role_guide_desc')}</p>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('password')}</label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-border bg-card p-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                      backgroundColor: strength >= level ? strengthColors[strength] : 'var(--border)',
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
              <ul className="space-y-1 text-xs">
                {requirements.map((req) => (
                  <li
                    key={req.label}
                    className={`flex items-center gap-1.5 font-medium transition-colors ${
                      req.met ? 'text-emerald-600' : 'text-muted-foreground'
                    }`}
                  >
                    {req.met ? (
                      <Check className="h-3 w-3 shrink-0" />
                    ) : (
                      <X className="h-3 w-3 shrink-0" />
                    )}
                    <span>{req.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {state?.error && (
          <div className="rounded-2xl border border-red-300 bg-red-50/40 dark:bg-red-950/20 px-4 py-3 text-xs font-bold text-red-600">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 px-4 py-3 text-xs font-bold text-emerald-600">
            {state.success}
          </div>
        )}

        <div className="space-y-2 pt-2">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              id="privacy-check"
              checked={privacyAccepted}
              onChange={(e) => {
                setPrivacyAccepted(e.target.checked)
                if (e.target.checked) setPrivacyError(false)
              }}
              className="mt-1 h-4 w-4 rounded accent-primary cursor-pointer"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              {t('privacy_accept_prefix')}{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setPrivacyOpen(true)
                }}
                className="font-bold text-primary underline inline-flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                <span>{t('privacy_policy_link')}</span>
              </button>{' '}
              {t('privacy_accept_suffix')}
            </span>
          </label>

          {privacyError && (
            <p className="text-xs font-semibold text-red-500">
              {t('privacy_required_error')}
            </p>
          )}
        </div>

        <div className="pt-2">
          <SubmitButton privacyAccepted={privacyAccepted} />
        </div>
      </form>

      <div className="flex flex-col gap-2 text-center text-xs pt-2 border-t border-border">
        <p className="text-muted-foreground">
          {t('has_account')}{' '}
          <Link href="/auth/login" className="font-bold text-primary hover:underline">
            {t('login_link')}
          </Link>
        </p>
        <Link href="/" className="text-muted-foreground hover:text-foreground">
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
