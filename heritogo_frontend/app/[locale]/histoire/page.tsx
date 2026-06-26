'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpenText, ChevronDown, Clock3, Globe2, Landmark, Pause, Play, ScrollText, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

const TOGO_HISTORY_TEXT = `
L'histoire du Togo est un récit captivant qui commence bien avant l'arrivée des Européens. Pour en retracer les grandes lignes, j'ai puisé dans différentes sources, et je vais vous la narrer en trois temps : les racines anciennes, la parenthèse coloniale allemande, et enfin le Togo indépendant et ses défis.

🌍 Aux Origines : Un Peuplement Ancien et des Royaumes
Le territoire du Togo actuel est habité depuis des temps très anciens, comme en témoignent les objets lithiques et les perles de pierre découverts, notamment dans le nord du pays. Dès le VIIIe siècle, la région des Bassar, au centre et au nord, s'impose comme l'un des principaux centres de production métallurgique d'Afrique de l'Ouest, exportant son fer jusqu'à Kano, au Nigeria.

Les vagues de peuplement successives ont façonné le paysage humain :
Dans le Nord : Des populations comme les Gourma, les Kotokoli et les Tchokossi se sont installées autour de Sokodé et Mango, tandis que les Kabyè et les Tamberma se sont réfugiés dans les montagnes pour résister aux razzias des royaumes voisins.
Dans le Sud : Les Éwés sont arrivés du Nigéria actuel entre le XVe et le XVIIe siècle. Ils se sont d'abord établis autour de Tado et de Notsé avant de se disperser vers l'ouest, jusqu'à la rive gauche de la Volta.
Au XVe siècle, les premiers explorateurs portugais accostent sur la côte, qui devient bientôt la "Côte des Esclaves". Ils y fondent des comptoirs pour le commerce, suivi par les Danois, les Hollandais et les Français. Cette région est alors un espace de contact et de rivalité entre le puissant royaume Ashanti (à l'ouest) et le royaume du Dahomey (à l'est).

⚔️ De la Colonie Allemande au Mandat Français (1884-1960)
La naissance du Togo en tant qu'entité politique est tardive.
Le Togoland allemand : En 1884, l'explorateur Gustav Nachtigal signe un traité de protectorat avec le chef local Mlapa III sur la plage de Baguida, donnant naissance au "Togoland" allemand. La Conférence de Berlin (1885) officialise la possession allemande. Les Allemands s'emploient à faire de cette colonie leur Musterkolonie, une "colonie modèle", en y développant des infrastructures (le port de Lomé, des voies ferrées, les grandes plantations de cacao et de café). Cependant, cette modernisation se fait au prix de travaux forcés et d'une administration brutale, matant dans le sang les révoltes des Kabyè et des Konkomba.

La Grande Guerre et le partage : La Première Guerre mondiale met fin à la présence allemande. En août 1914, les troupes alliées franco-britanniques envahissent le Togoland, forçant la reddition des Allemands. En 1919, le traité de Versailles entérine le partage du territoire :
Le Togo oriental (les 2/3, à l'est) est placé sous mandat de la France.
Le Togo occidental (1/3, à l'ouest) est placé sous mandat du Royaume-Uni, qui le rattachera à la Gold Coast (l'actuel Ghana).
Après la Seconde Guerre mondiale, la Société des Nations est remplacée par l'ONU, et les mandats deviennent des "tutelles". Le Togo français acquiert le statut de république autonome en 1956, avant d'être mené vers l'indépendance par la figure de Sylvanus Olympio, dont le parti (le Comité de l'unité togolaise, CUT) remporte les élections de 1958.

🇹🇬 Le Togo Indépendant : Entre Espoirs et Turbulences
Le 27 avril 1960, l'indépendance est proclamée, et Sylvanus Olympio devient le premier président du Togo. Cette période d'indépendance est marquée par une vie politique intense et mouvementée.

Le premier coup d'État et l'ère Eyadéma : Le 13 janvier 1963, le Togo connaît le premier coup d'État militaire de l'Afrique post-indépendance. Le président Olympio est assassiné, et l'instigateur est un sergent-chef originaire du Nord, Étienne Eyadéma. Après un bref intermède, le 13 janvier 1967, Gnassingbé Eyadéma (il a depuis changé ses prénoms) prend le pouvoir et instaure un régime de parti unique avec son parti, le Rassemblement du peuple togolais (RPT). Son règne, de près de 38 ans, est marqué par le culte de la personnalité, une politique d'"authenticité", des nationalisations et une répression féroce de toute opposition, notamment dans les années 1990 lorsque le multipartisme est imposé et que le pays sombre dans une grave crise politique.

La succession et l'ère Faure Gnassingbé : La mort de Gnassingbé Eyadéma en février 2005 ouvre une nouvelle page. L'armée place immédiatement son fils, Faure Gnassingbé, à la tête du pays, ce qui provoque des violences post-électorales. Depuis, Faure Gnassingbé est resté au pouvoir, s'appuyant sur une armée fidèle et un parti dominant, l'Union pour la République (UNIR). Il a par ailleurs modifié la constitution en 2019, ce qui lui permet de se représenter jusqu'en 2030. Son parcours politique illustre une volonté de réconciliation nationale tout en maintenant un contrôle ferme sur l'État.

💎 En résumé
L'histoire du Togo est marquée par :
1. Un peuplement ancien et diversifié, avec des royaumes et des migrations internes.
2. Une parenthèse coloniale d'abord allemande (brève mais intense, d'où le nom du pays), puis française.
3. Une vie politique post-indépendance singulière, rythmée par l'absence d'alternance démocratique et dominée par la dynastie Gnassingbé, installée par un coup d'État en 1963.

Cette trame historique est essentielle pour comprendre les dynamiques sociales et politiques du Togo contemporain.
`

const speechLanguages = [
  { code: 'fr-FR', label: 'FR' },
  { code: 'en-US', label: 'EN' },
  { code: 'es-ES', label: 'ES' },
  { code: 'zh-CN', label: 'ZH' },
] as const

type SpeechLanguage = (typeof speechLanguages)[number]['code']

export default function HistoirePage() {
  const t = useTranslations('Histoire')
  const [selectedLanguage, setSelectedLanguage] = useState<SpeechLanguage>('fr-FR')
  const [speaking, setSpeaking] = useState(false)

  const translatedParagraphs = t.raw('paragraphs') as string[]
  const customParagraphs = TOGO_HISTORY_TEXT.trim()
    ? TOGO_HISTORY_TEXT.trim().split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean)
    : []
  const paragraphs = customParagraphs.length > 0 ? customParagraphs : translatedParagraphs
  const historyText = useMemo(() => paragraphs.join('\n\n'), [paragraphs])

  const toggleSpeech = () => {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(historyText)
    utterance.lang = selectedLanguage
    utterance.rate = selectedLanguage === 'zh-CN' ? 0.9 : 0.96
    utterance.pitch = 1
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-base-100 px-3 pb-28 pt-20 text-base-content sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-5">
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[28px] border border-border bg-base-200 p-5 shadow-sm sm:rounded-[32px] sm:p-7 lg:min-h-[22rem]"
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
          className="h-fit rounded-[28px] border border-border bg-base-200 p-4 shadow-sm sm:rounded-[32px] lg:sticky lg:top-24"
        >
          <div className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-base-content/50">
            <Globe2 className="h-4 w-4 text-secondary" />
            {t('listen_language')}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {speechLanguages.map((language) => {
              const active = selectedLanguage === language.code
              return (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => setSelectedLanguage(language.code)}
                  className={`min-h-11 rounded-2xl border text-xs font-black transition-all active:scale-95 ${
                    active
                      ? 'border-primary bg-primary text-primary-content dark:border-secondary dark:bg-secondary dark:text-secondary-content'
                      : 'border-border bg-base-100 text-base-content/65 hover:border-secondary/50'
                  }`}
                >
                  {language.label}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={toggleSpeech}
            className={`mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[20px] px-5 text-sm font-black transition-all active:scale-95 ${
              speaking ? 'bg-secondary text-secondary-content' : 'bg-primary text-primary-content dark:bg-secondary dark:text-secondary-content'
            }`}
          >
            {speaking ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {speaking ? t('stop') : t('listen')}
          </button>

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
                key={`${paragraph.slice(0, 24)}-${index}`}
                id={`section-${index + 1}`}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                className="scroll-mt-24 rounded-[28px] border border-border bg-base-200 p-5 shadow-sm sm:rounded-[32px] sm:p-7"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-sm font-black text-secondary-content">
                  {index + 1}
                </div>
                <p className="m-0 whitespace-pre-line text-base font-medium leading-8 text-base-content/72 sm:text-lg sm:leading-9">{paragraph}</p>
              </motion.section>
            ))}

            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="rounded-[28px] border border-secondary/25 bg-secondary/10 p-5 sm:rounded-[32px] sm:p-7"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-5 w-5 shrink-0 text-secondary" />
                <p className="m-0 text-sm font-bold leading-7 text-base-content/70">{t('paste_hint')}</p>
              </div>
            </motion.div>
          </article>
        </motion.div>
      </section>
    </main>
  )
}
