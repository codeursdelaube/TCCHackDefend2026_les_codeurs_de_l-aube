'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ShieldCheck, SlidersHorizontal, Scale, ScanLine } from 'lucide-react'
import { toast } from 'sonner'

const EXPLORE_LINKS = [
  { href: '/lieux', key: 'sites' },
  { href: '/regions', key: 'regions' },
  { href: '/cuisine', key: 'cuisine' },
  { href: '/loisirs', key: 'leisure' },
  { href: '/histoire', key: 'history' },
] as const

const SERVICE_LINKS = [
  { href: '/guides', key: 'guides' },
  { href: '/scan', key: 'scanner' },
  { href: '/subscription', key: 'premium' },
  { href: '/auth/register', key: 'become_guide' },
] as const

export default function Footer() {
  const t = useTranslations('Footer')
  const tAds = useTranslations('Ads')

  const openConsentPreferences = () => {
    if (typeof window !== 'undefined' && window.googlefc?.showRevocationMessage) {
      window.googlefc.showRevocationMessage()
    } else {
      toast.info(t('consent_fallback'))
    }
  }

  return (
    <footer className="mt-auto border-t border-border bg-card text-foreground">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="space-y-4 md:col-span-5">
            <Link href="/" className="inline-block font-serif text-2xl font-bold tracking-tight text-primary">
              HeriTogo
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t('tagline')}</p>
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/15 px-3.5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-accent/25"
            >
              <ScanLine className="h-4 w-4 text-primary" />
              {t('scan_cta')}
            </Link>
          </div>

          <nav aria-label={t('explore')} className="md:col-span-2">
            <h2 className="mb-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('explore')}
            </h2>
            <ul className="space-y-2 text-sm">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-foreground/80 transition-colors hover:text-primary">
                    {t(`links.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('services')} className="md:col-span-2">
            <h2 className="mb-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('services')}
            </h2>
            <ul className="space-y-2 text-sm">
              {SERVICE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-foreground/80 transition-colors hover:text-primary">
                    {t(`links.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="mb-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('legal')}
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cgu" className="inline-flex items-center gap-2 text-foreground/80 transition-colors hover:text-primary">
                  <Scale className="h-4 w-4 text-primary" />
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="inline-flex items-center gap-2 text-foreground/80 transition-colors hover:text-primary">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {tAds('privacy_policy')}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  id="google-privacy-settings-btn"
                  onClick={openConsentPreferences}
                  className="inline-flex cursor-pointer items-center gap-2 text-left text-foreground/80 transition-colors hover:text-primary"
                >
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  {tAds('manage_preferences')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} HeriTogo — {t('rights')}</p>
          <p>{t('made_in')}</p>
        </div>
      </div>
    </footer>
  )
}
