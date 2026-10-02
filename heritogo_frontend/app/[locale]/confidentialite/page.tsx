import { PRIVACY_POLICY, type PrivacyPolicyLocale } from '@/lib/privacy-policy'

export default async function ConfidentialitePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const policy = PRIVACY_POLICY[(locale as PrivacyPolicyLocale)] || PRIVACY_POLICY.fr

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-28">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">RGPD</p>
      <h1 className="mt-2 font-serif text-3xl font-bold">{policy.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {policy.updatedLabel} : {policy.lastUpdated}
      </p>
      <div className="mt-8 space-y-6">
        {policy.sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-serif text-xl font-bold">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.content}</p>
          </section>
        ))}
      </div>
    </main>
  )
}
