import { getTranslations } from 'next-intl/server'
import { ShieldCheck } from 'lucide-react'
import { PRIVACY_POLICY, type PrivacyPolicyLocale } from '@/lib/privacy-policy'
import LegalDocument from '@/components/legal/LegalDocument'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Legal' })
  const policy = PRIVACY_POLICY[locale as PrivacyPolicyLocale] || PRIVACY_POLICY.fr
  return {
    title: policy.title,
    description: t('privacy_meta'),
  }
}

export default async function ConfidentialitePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Legal' })
  const tPrivacy = await getTranslations({ locale, namespace: 'Privacy' })
  const policy = PRIVACY_POLICY[locale as PrivacyPolicyLocale] || PRIVACY_POLICY.fr

  return (
    <LegalDocument
      kicker={tPrivacy('gdpr_kicker')}
      kickerIcon={ShieldCheck}
      title={policy.title}
      updatedLabel={policy.updatedLabel}
      lastUpdated={policy.lastUpdated}
      sections={policy.sections}
      backLabel={t('back_home')}
      contentsLabel={t('contents')}
    />
  )
}
