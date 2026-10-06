'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BookOpenText, ChevronDown, Clock3, Globe2, Landmark, ScrollText, Sparkles } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import TextToSpeech from '@/components/TextToSpeech'
import Badge from '@/components/ui/Badge'

const langues = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'zh', label: '中文' },
]

export default function HistoirePage() {
  const t = useTranslations('Histoire')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const paragraphs = t.raw('paragraphs') as string[]
  const historyText = useMemo(() => paragraphs.join('\n\n'), [paragraphs])

  const changerLangue = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    router.push(newPath)
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-28 pt-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* ── BANDEAU ÉDITORIAL & LECTEUR AUDIO ── */}
        <section className="grid gap-6 lg:grid-cols-12 lg:items-start">
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="app-card relative overflow-hidden p-6 sm:p-8 lg:col-span-8 space-y-4 bg-gradient-to-br from-card via-card to-primary/5"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <Landmark className="h-4 w-4" />
              <span>{t('badge')}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {t('title')}
            </h1>
            <div className="togo-underline" />
            <p className="text-sm sm:text-base font-medium leading-relaxed text-muted-foreground pt-1">
              {t('subtitle')}
            </p>
          </motion.article>

          {/* ASIDE LANGUES & LECTEUR */}
          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
            className="app-card p-5 lg:col-span-4 space-y-4"
          >
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Globe2 className="h-4 w-4" />
                <span>{t('listen_language')}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {langues.map((lang) => {
                  const active = locale === lang.code
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => changerLangue(lang.code)}
                      className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-primary text-white shadow-sm'
                          : 'border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {lang.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <TextToSpeech text={historyText} className="w-full justify-center min-h-11 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
              <div className="rounded-2xl border border-border bg-muted/40 p-3 text-center">
                <Clock3 className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="font-serif text-base font-bold text-foreground">{t('stats.period')}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('stats.period_label')}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-3 text-center">
                <ScrollText className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="font-serif text-base font-bold text-foreground">{paragraphs.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('stats.sections')}</p>
              </div>
            </div>
          </motion.aside>
        </section>

        {/* ── CONTENU DU RÉCIT CHRONOLOGIQUE ── */}
        <section className="grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* Sommaire sticky sur desktop */}
          <motion.nav
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block lg:col-span-3 app-card p-4 sticky top-24 space-y-2 text-xs"
          >
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <BookOpenText className="h-4 w-4" />
              <span>{t('contents')}</span>
            </div>
            <div className="space-y-1.5">
              {paragraphs.map((_, index) => (
                <a
                  key={index}
                  href={`#section-${index + 1}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2 font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <span>{t('section')} {index + 1}</span>
                  <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-primary" />
                </a>
              ))}
            </div>
          </motion.nav>

          {/* Paragraphes éditoriaux */}
          <article className="lg:col-span-9 space-y-5">
            {paragraphs.map((paragraph, index) => (
              <motion.section
                key={`section-${index}`}
                id={`section-${index + 1}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="scroll-mt-24 app-card p-6 sm:p-8 space-y-3"
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-serif font-bold text-white shadow-xs">
                  {index + 1}
                </div>
                <p className="whitespace-pre-line text-sm sm:text-base font-medium leading-relaxed sm:leading-8 text-foreground">
                  {paragraph}
                </p>
              </motion.section>
            ))}
          </article>
        </section>

      </div>
    </main>
  )
}
