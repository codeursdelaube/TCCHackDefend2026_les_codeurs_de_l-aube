'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'

export default function Footer() {
  const t = useTranslations('Ads')
  const locale = useLocale()

  const openConsentPreferences = () => {
    if (typeof window !== 'undefined' && window.googlefc?.showRevocationMessage) {
      window.googlefc.showRevocationMessage()
    } else {
      toast.info(
        locale === 'fr'
          ? "Le panneau de préférences publicitaires Google s'active automatiquement pour les visiteurs sous réglementation RGPD (Europe). Vous pouvez également gérer vos choix sur Google Ad Settings."
          : 'Google consent preferences are automatically managed for visitors under GDPR regulations.'
      )
    }
  }

  return (
    <footer className="mt-auto border-t border-border bg-base-200/60 text-base-content">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo & Slogan */}
          <div className="flex flex-col items-center sm:items-start space-y-1">
            <span className="font-serif text-lg font-bold tracking-tight text-primary">
              HeriTogo
            </span>
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              Guide touristique & valorisation du patrimoine togolais
            </p>
          </div>

          {/* Navigation Rapide */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Accueil
            </Link>
            <Link href="/lieux" className="hover:text-primary transition-colors">
              Lieux
            </Link>
            <Link href="/cuisine" className="hover:text-primary transition-colors">
              Cuisine
            </Link>
            <Link href="/guides" className="hover:text-primary transition-colors">
              Guides
            </Link>
          </div>

          {/* Liens légaux & Consentement AdSense RGPD */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link
              href="/confidentialite"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>{t('privacy_policy')}</span>
            </Link>

            <button
              type="button"
              onClick={openConsentPreferences}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all font-medium"
              id="google-privacy-settings-btn"
            >
              <SlidersHorizontal className="h-3 w-3 text-primary" />
              <span>{t('manage_preferences')}</span>
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-border/50 pt-4 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} HeriTogo — Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
