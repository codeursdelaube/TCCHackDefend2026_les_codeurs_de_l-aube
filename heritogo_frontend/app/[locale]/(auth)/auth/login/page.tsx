'use client'

import { Suspense, useActionState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
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
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 font-bold text-white shadow-md hover:bg-primary-dark transition-all text-sm cursor-pointer disabled:opacity-50"
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
    <div className="app-card p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
          <LogIn className="h-7 w-7" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{t('login_title')}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">{t('login_subtitle')}</p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="redirect" value={redirectParam} />

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('email')}
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-2xl border border-border bg-card p-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t('password')}
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="w-full rounded-2xl border border-border bg-card p-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            autoComplete="current-password"
          />
        </div>

        {state?.error && (
          <div className="rounded-2xl border border-red-300 bg-red-50/40 dark:bg-red-950/20 px-4 py-3 text-xs font-bold text-red-600">
            {state.error}
          </div>
        )}

        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>

      <div className="flex flex-col gap-2 text-center text-xs pt-2 border-t border-border">
        <Link href="/auth/forgot-password" className="font-bold text-primary hover:underline">
          {t('forgot_link')}
        </Link>
        <p className="text-muted-foreground">
          {t('no_account')}{' '}
          <Link href="/auth/register" className="font-bold text-primary hover:underline">
            {t('register_link')}
          </Link>
        </p>
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          {t('back_home')}
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
