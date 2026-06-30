'use client'

import { useState, useActionState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { COLORS } from '@/lib/constants/colors'
import { Loader2, Map, UserPlus, Check, X } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { registerAction } from './actions'
import { getPasswordStrength } from '@/lib/utils/validation'

type RegisterRole = 'tourist' | 'guide'

function SubmitButton() {
  const { pending } = useFormStatus()
  const t = useTranslations('Auth')

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn w-full rounded-2xl border-none text-white"
      style={{ backgroundColor: COLORS.rust }}
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : t('register_button')}
    </button>
  )
}

const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']
const strengthLabels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort']

export default function RegisterPage() {
  const t = useTranslations('Auth')
  const params = useParams<{ locale: string }>()
  const locale = params.locale
  
  const [role, setRole] = useState<RegisterRole>('tourist')
  const [password, setPassword] = useState('')
  const [state, formAction] = useActionState(registerAction, null)

  const strength = getPasswordStrength(password)

  const requirements = [
    { label: 'Au moins 8 caractères', met: password.length >= 8 },
    { label: 'Une majuscule', met: /[A-Z]/.test(password) },
    { label: 'Une minuscule', met: /[a-z]/.test(password) },
    { label: 'Un chiffre', met: /[0-9]/.test(password) },
  ]

  return (
    <div className="rounded-[28px] border border-border bg-base-200 p-6 shadow-xl sm:p-8">
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

      <form action={formAction} className="space-y-4">
        {/* Hidden inputs to pass state to server action */}
        <input type="hidden" name="role" value={role} />
        <input type="hidden" name="locale" value={locale} />

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
              <span className="text-2xl">🧳</span>
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

          {/* Indicateur de force du mot de passe */}
          {password.length > 0 && (
            <div className="mt-2 space-y-2">
              {/* Barre de progression */}
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
              {/* Label de force */}
              {strength > 0 && (
                <p
                  className="text-xs font-bold"
                  style={{ color: strengthColors[strength] }}
                >
                  {strengthLabels[strength]}
                </p>
              )}
              {/* Checklist des exigences */}
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

        <SubmitButton />
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
    </div>
  )
}
