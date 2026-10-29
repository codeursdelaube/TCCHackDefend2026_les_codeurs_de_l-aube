import { getTranslations } from 'next-intl/server'
import { FileText, ShieldCheck, Scale } from 'lucide-react'
import { TERMS_CGU, type TermsCguLocale } from '@/lib/terms-cgu'
import LegalDocument from '@/components/legal/LegalDocument'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Legal' })
  const terms = TERMS_CGU[locale as TermsCguLocale] || TERMS_CGU.fr
  return {
    title: terms.title,
    description: t('terms_meta'),
  }
}

export default async function CguPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Legal' })
  const terms = TERMS_CGU[locale as TermsCguLocale] || TERMS_CGU.fr

  const highlights = [
    { icon: ShieldCheck, title: t('highlight_verified_title'), desc: t('highlight_verified_desc'), tone: 'text-forest' },
    { icon: FileText, title: t('highlight_quotes_title'), desc: t('highlight_quotes_desc'), tone: 'text-primary' },
    { icon: Scale, title: t('highlight_ethics_title'), desc: t('highlight_ethics_desc'), tone: 'text-accent' },
  ]

  return (
    <LegalDocument
      kicker={t('terms_kicker')}
      kickerIcon={Scale}
      title={terms.title}
      updatedLabel={terms.updatedLabel}
      lastUpdated={terms.lastUpdated}
      intro={terms.intro}
      sections={terms.sections}
      backLabel={t('back_home')}
      contentsLabel={t('contents')}
      highlights={
        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, desc, tone }) => (
            <div key={title} className="rounded-lg border border-border bg-card p-5">
              <Icon className={`h-5 w-5 ${tone}`} />
              <p className="mt-3 text-sm font-bold">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      }
    />
  )
}
