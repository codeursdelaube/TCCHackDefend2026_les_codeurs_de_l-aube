'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BookOpenText, ChevronDown, Clock3, Globe2, Landmark, ScrollText, Sparkles } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import TextToSpeech from '@/components/TextToSpeech'

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

  // Le contenu vient entièrement de useTranslations pour la synchronisation i18n
  const paragraphs = t.raw('paragraphs') as string[]
  const historyText = useMemo(() => paragraphs.join('\n\n'), [paragraphs])

  const changerLangue = (newLocale: string) => {
    // Remplace le locale actuel dans le pathname
    // ex: /fr/histoire → /en/histoire
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    router.push(newPath)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-base-100 px-3 pb-28 pt-20 text-base-content sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-5">
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[28px] border border-border bg-base-200 p-5 shadow-sm sm:rounded-4xl sm:p-7 lg:min-h-88"
        >
          <div className="absolute right-5 top-5 hidden h-28 w-28 rounded-full border border-secondary/20 sm:block" />
          <div className="relative z-10">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-[10px] font-black uppercase tracking-wide text-secondary-content sm:text-[11px]">
              <Landmark className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('badge')}</span>
            </div>
            <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">{t('title')}</h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-base-content/65 sm:text-base">{t('subtitle')}</p>
          </div>
        </motion.article>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
          className="h-fit rounded-[28px] border border-border bg-base-200 p-4 shadow-sm sm:rounded-4xl lg:sticky lg:top-24"
        >
          <div className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-base-content/50">
            <Globe2 className="h-4 w-4 text-secondary" />
            {t('listen_language')}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {langues.map((lang) => {
              const active = locale === lang.code
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changerLangue(lang.code)}
                  className={`min-h-11 rounded-2xl border text-xs font-black transition-all active:scale-95 ${
                    active
                      ? 'border-primary bg-primary text-primary-content dark:border-secondary dark:bg-secondary dark:text-secondary-content'
                      : 'border-border bg-base-100 text-base-content/65 hover:border-secondary/50'
                  }`}
                >
                  {lang.label}
                </button>
              )
            })}
          </div>

          <div className="mt-4">
            <TextToSpeech text={historyText} className="w-full justify-center min-h-12 rounded-2xl" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-[22px] border border-border bg-base-100 p-4">
              <Clock3 className="h-5 w-5 text-secondary" />
              <p className="mt-2 text-lg font-black">{t('stats.period')}</p>
              <p className="text-[11px] font-bold uppercase tracking-wide text-base-content/45">{t('stats.period_label')}</p>
            </div>
            <div className="rounded-[22px] border border-border bg-base-100 p-4">
              <ScrollText className="h-5 w-5 text-secondary" />
              <p className="mt-2 text-lg font-black">{paragraphs.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-wide text-base-content/45">{t('stats.sections')}</p>
            </div>
          </div>
        </motion.aside>
      </section>

      <section className="mx-auto mt-5 max-w-7xl">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-5"
        >
          <motion.nav
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
            className="hidden h-fit rounded-[28px] border border-border bg-base-200 p-4 shadow-sm lg:sticky lg:top-24 lg:block"
          >
            <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-base-content/50">
              <BookOpenText className="h-4 w-4 text-secondary" />
              {t('contents')}
            </div>
            <div className="space-y-2">
              {paragraphs.slice(0, 6).map((_, index) => (
                <a key={index} href={`#section-${index + 1}`} className="flex items-center justify-between rounded-2xl border border-border bg-base-100 px-3 py-3 text-xs font-black text-base-content/65 transition-colors hover:border-secondary/50 hover:text-secondary">
                  {t('section')} {index + 1}
                  <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                </a>
              ))}
            </div>
          </motion.nav>

          <article className="space-y-4">
            {paragraphs.map((paragraph, index) => (
              <motion.section
                key={`section-${index}`}
                id={`section-${index + 1}`}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                className="scroll-mt-24 rounded-[28px] border border-border bg-base-200 p-5 shadow-sm sm:rounded-4xl sm:p-7"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-sm font-black text-secondary-content">
                  {index + 1}
                </div>
                <p className="m-0 whitespace-pre-line text-base font-medium leading-8 text-base-content/72 sm:text-lg sm:leading-9">{paragraph}</p>
              </motion.section>
            ))}

          </article>
        </motion.div>
      </section>
    </main>
  )
}
