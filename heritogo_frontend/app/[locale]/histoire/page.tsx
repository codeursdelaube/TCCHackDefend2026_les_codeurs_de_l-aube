'use client'

import { useMemo } from 'react'
import { BookOpenText, Clock3, Landmark, ScrollText } from 'lucide-react'
import { useTranslations } from 'next-intl'
import TextToSpeech from '@/components/TextToSpeech'
import PageHeader from '@/components/ui/PageHeader'

export default function HistoirePage() {
  const t = useTranslations('Histoire')
  const paragraphs = t.raw('paragraphs') as string[]
  const historyText = useMemo(() => paragraphs.join('\n\n'), [paragraphs])

  return (
    <main className="min-h-screen bg-background pb-32 pt-24 text-foreground">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHeader
          kicker={t('badge')}
          kickerIcon={Landmark}
          title={t('title')}
          subtitle={t('subtitle')}
          image="/Sites/koutamakou.jpg"
          actions={<TextToSpeech text={historyText} className="min-h-11 rounded-lg" />}
        />

        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 space-y-4">
              <nav aria-label={t('contents')} className="rounded-xl border border-border bg-card p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <BookOpenText className="h-4 w-4 text-primary" />
                  {t('contents')}
                </p>
                <ol className="space-y-0.5 text-sm">
                  {paragraphs.map((_, index) => (
                    <li key={index}>
                      <a href={`#section-${index + 1}`} className="block rounded-md px-2 py-1.5 text-foreground/75 transition-colors hover:bg-muted hover:text-primary">
                        {t('section')} {index + 1}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <Clock3 className="mx-auto mb-1 h-4 w-4 text-primary" />
                  <p className="font-serif text-base font-bold">{t('stats.period')}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{t('stats.period_label')}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <ScrollText className="mx-auto mb-1 h-4 w-4 text-primary" />
                  <p className="font-serif text-base font-bold">{paragraphs.length}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{t('stats.sections')}</p>
                </div>
              </div>
            </div>
          </aside>

          <article className="rounded-xl border border-border bg-card p-6 sm:p-10 lg:col-span-9">
            {paragraphs.map((paragraph, index) => (
              <section key={index} id={`section-${index + 1}`} className="scroll-mt-24 border-b border-border py-6 first:pt-0 last:border-0 last:pb-0">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  {t('section')} {index + 1}
                </p>
                <p className="mt-2 whitespace-pre-line text-base leading-8 text-foreground/90">{paragraph}</p>
              </section>
            ))}
          </article>
        </div>
      </div>
    </main>
  )
}
