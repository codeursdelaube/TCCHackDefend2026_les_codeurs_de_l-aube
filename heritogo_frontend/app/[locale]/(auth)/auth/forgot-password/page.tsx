'use client'

import { Suspense, useActionState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { COLORS } from '@/lib/constants/colors'
import { KeyRound, Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { forgotPasswordAction } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  const t = useTranslations('Auth')

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn w-full rounded-2xl border-none text-white cursor-pointer"
      style={{ backgroundColor: COLORS.gold }}
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : t('forgot_button')}
    </button>
  )
}

function ForgotPasswordForm() {
  const t = useTranslations('Auth')
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || 'fr'

  const [state, formAction] = useActionState(forgotPasswordAction, null)

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <div className="rounded-xl border border-border bg-base-200 p-6 shadow-xl sm:p-8">
      <div className="mb-6 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white"
          style={{ backgroundColor: COLORS.gold }}
        >
          <KeyRound className="h-7 w-7" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-base-content">{t('forgot_title')}</h1>
        <p className="mt-2 text-sm text-base-content/60">{t('forgot_subtitle')}</p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <label className="form-control w-full">
          <span className="label-text mb-1 text-sm font-semibold">{t('email')}</span>
          <input
            type="email"
            name="email"
            required
            className="input input-bordered w-full rounded-2xl bg-base-100"
            autoComplete="email"
            placeholder="exemple@domaine.com"
          />
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
        <Link href="/auth/login" className="font-bold hover:underline" style={{ color: COLORS.forest }}>
          {t('login_link')}
        </Link>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  )
}
