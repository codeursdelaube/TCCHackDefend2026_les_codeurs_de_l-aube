'use client'

import { useState } from 'react'
import { Check, Minus, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { safeLocalStorageSet } from '@/lib/utils/storage'
import { toast } from 'sonner'

export default function SubscriptionPage() {
  const t = useTranslations('Subscription')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Activation locale (mode démonstration) : aucun paiement n'est encaissé.
  const handleSubscribe = () => {
    setIsLoading(true)
    setTimeout(() => {
      safeLocalStorageSet('heritogo_premium', 'true')
      setIsLoading(false)
      toast.success(t('success'))
      router.push('/dashboard/tourist')
    }, 1200)
  }

  const freeFeatures = [
    { label: t('free_f1'), included: true },
    { label: t('free_f2'), included: true },
    { label: t('free_f3'), included: true },
    { label: t('free_f4'), included: false },
  ]
  const premiumFeatures = [t('premium_f1'), t('premium_f2'), t('premium_f3'), t('premium_f4')]

  return (
    <main className="min-h-screen bg-background pb-32 pt-24 text-foreground">
      <div className="mx-auto max-w-5xl space-y-10 px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-4 w-4" />
            {t('kicker')}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{t('subtitle')}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="flex flex-col justify-between rounded-xl border border-border bg-card p-8">
            <div>
              <h2 className="font-serif text-2xl font-bold">{t('free_title')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('free_sub')}</p>
              <p className="mt-6">
                <span className="font-serif text-4xl font-bold">0 FCFA</span>
                <span className="text-sm text-muted-foreground"> {t('per_month')}</span>
              </p>
              <ul className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
                {freeFeatures.map(({ label, included }) => (
                  <li key={label} className={`flex items-start gap-3 ${included ? '' : 'text-muted-foreground'}`}>
                    {included ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" /> : <Minus className="mt-0.5 h-4 w-4 shrink-0" />}
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <button type="button" disabled className="btn-outline-brand mt-8 w-full">
              {t('current_plan')}
            </button>
          </section>

          <section className="relative flex flex-col justify-between rounded-xl border-2 border-primary bg-card p-8">
            <span className="unesco-badge absolute -top-3 right-6 rounded-md px-3 py-1 text-[11px] uppercase tracking-wider">
              {t('recommended')}
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold">{t('premium_title')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('premium_sub')}</p>
              <p className="mt-6">
                <span className="font-serif text-4xl font-bold text-primary">2 000 FCFA</span>
                <span className="text-sm text-muted-foreground"> {t('per_month')}</span>
              </p>
              <ul className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
                {premiumFeatures.map((label) => (
                  <li key={label} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 space-y-2">
              <button type="button" onClick={handleSubscribe} disabled={isLoading} className="btn-brand min-h-12 w-full">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {t('cta')}
              </button>
              <p className="text-center text-xs text-muted-foreground">{t('instant')}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
