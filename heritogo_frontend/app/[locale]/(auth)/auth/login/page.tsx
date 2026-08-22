'use client'

import { Suspense, useActionState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { COLORS } from '@/lib/constants/colors'
import { Loader2, LogIn } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { loginAction } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  const t = useTranslations('Auth')

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn w-full rounded-2xl border-none text-white cursor-pointer"
      style={{ backgroundColor: COLORS.forest }}
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : t('login_button')}
    </button>
  )
}

function LoginForm() {
  const t = useTranslations('Auth')
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || 'fr'
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect') || ''

  const [state, formAction] = useActionState(loginAction, null)

  return (
    <div className="rounded-[28px] border border-border bg-base-200 p-6 shadow-xl sm:p-8">
      <div className="mb-6 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white"
          style={{ backgroundColor: COLORS.forest }}
        >
          <LogIn className="h-7 w-7" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-base-content">{t('login_title')}</h1>
        <p className="mt-2 text-sm text-base-content/60">{t('login_subtitle')}</p>
      </div>

      <form action={formAction} className="space-y-4">
        {/* Hidden inputs to pass state to server action */}
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="redirect" value={redirectParam} />

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

        <label className="form-control w-full">
          <span className="label-text mb-1 text-sm font-semibold">{t('password')}</span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="input input-bordered w-full rounded-2xl bg-base-100"
            autoComplete="current-password"
          />
        </label>

        {state?.error && (
          <div className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {state.error}
          </div>
        )}

        <SubmitButton />
      </form>

      <div className="mt-4 flex flex-col gap-2 text-center text-sm">
        <Link href="/auth/forgot-password" className="font-semibold hover:underline" style={{ color: COLORS.rust }}>
          {t('forgot_link')}
        </Link>
        <p className="text-base-content/60">
          {t('no_account')}{' '}
          <Link href="/auth/register" className="font-bold hover:underline" style={{ color: COLORS.forest }}>
            {t('register_link')}
          </Link>
        </p>
        <Link href="/" className="text-base-content/50 hover:underline">
          {t('back_home')}
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
