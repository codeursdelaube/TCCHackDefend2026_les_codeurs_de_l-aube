'use client'

import { FormEvent, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { COLORS } from '@/lib/constants/colors'
import { KeyRound, Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/api/auth/callback?next=/auth/login`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSuccess(true)
    } catch {
      setError(t('error_generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-[28px] border border-border bg-base-200 p-6 shadow-xl sm:p-8">
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="form-control w-full">
          <span className="label-text mb-1 text-sm font-semibold">{t('email')}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered w-full rounded-2xl bg-base-100"
            autoComplete="email"
          />
        </label>

        {error && (
          <div className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            {t('success_forgot')}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn w-full rounded-2xl border-none text-white"
          style={{ backgroundColor: COLORS.gold }}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('forgot_button')}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link href="/auth/login" className="font-bold hover:underline" style={{ color: COLORS.forest }}>
          {t('login_link')}
        </Link>
      </div>
    </div>
  )
}
