import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ChefHat, Utensils, Soup,
  Info, Share2, Volume2, ChevronRight, Flame
} from 'lucide-react'

import platsTogolais from '@/app/Plats/plat'
import TTSButton from '@/app/_components/TTSButton'


interface PageProps {
  params: Promise<{ id: string }>
}

const getCategoryStyle = (categorie: string) => {
  switch (categorie) {
    case 'Plat Principal': return { bg: 'bg-emerald-600', pill: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' }
    case 'Sauce':          return { bg: 'bg-red-600',     pill: 'bg-red-500/15 border-red-500/30 text-red-400' }
    case 'Street Food':    return { bg: 'bg-amber-600',   pill: 'bg-amber-500/15 border-amber-500/30 text-amber-400' }
    case 'Accompagnement': return { bg: 'bg-blue-600',    pill: 'bg-blue-500/15 border-blue-500/30 text-blue-400' }
    default:               return { bg: 'bg-base-content/40', pill: 'bg-base-content/10 border-base-content/20 text-base-content/50' }
  }
}

export default async function PlatDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const plat = platsTogolais.find((p) => p.id === resolvedParams.id)
  if (!plat) notFound()

  const style = getCategoryStyle(plat.catégorie)

  /* Plats de la même catégorie (suggérés) */
  const suggestions = platsTogolais
    .filter((p) => p.catégorie === plat.catégorie && p.id !== plat.id)
    .slice(0, 3)

  return (
    <main className="relative min-h-screen w-full bg-base-100 text-base-content overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════
          HERO IMAGE PLEIN ÉCRAN
      ══════════════════════════════════════════════════════ */}
      <section className="relative h-[55vh] min-h-[360px] w-full overflow-hidden">
        <Image
          src={plat.image}
          alt={plat.nom}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-[1.02] hover:scale-100 transition-transform duration-[2s]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-black/35 to-black/15" />

        {/* Nav dans le hero */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-6 px-4 sm:px-8
                        flex items-center justify-between">
          <Link href="/cuisine">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                            bg-black/30 backdrop-blur-md border border-white/15
                            text-white/80 text-xs font-semibold hover:bg-black/45
                            transition-all cursor-pointer">
              <ArrowLeft size={14} />
              Retour aux saveurs
            </div>
          </Link>

          {/* Badge catégorie */}
          <div className={`px-3 py-1.5 rounded-full ${style.bg} backdrop-blur-sm
                          text-white text-[10px] font-bold uppercase tracking-widest`}>
            {plat.catégorie}
          </div>
        </div>

        {/* Titre bas du hero */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-8 lg:px-16 pb-8">
          <div className="flex items-center gap-2 mb-2">
            <ChefHat size={13} className="text-amber-400" />
            <span className="text-amber-400 text-xs font-semibold tracking-wide">
              Patrimoine Culinaire · Togo
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight
                         text-white uppercase leading-none drop-shadow-xl">
            {plat.nom}
          </h1>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CONTENU PRINCIPAL
      ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">

        {/* Halos */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/4 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/4 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* ── COLONNE PRINCIPALE (2/3) ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Actions rapides */}
            <div className="flex flex-wrap items-center gap-2">
              {/* TTS — client-side, géré via script inline */}
              <TTSButton text={`${plat.nom}. ${plat.description}. ${plat.histoire}`} />

              <Link href="/restaurants">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                   text-xs font-bold border-none text-white
                                   bg-gradient-to-r from-emerald-500 to-green-600
                                   hover:scale-105 active:scale-95
                                   shadow-md shadow-emerald-500/20 transition-all duration-200">
                  <Utensils size={13} />
                  Trouver à proximité
                </button>
              </Link>
            </div>

            {/* Description */}
            <div className="bg-base-200 rounded-2xl p-6 border border-base-content/8">
              <p className="text-base-content/65 text-sm sm:text-base leading-relaxed italic">
                {plat.description}
              </p>
            </div>

            {/* Origine & Tradition */}
            <div className="space-y-4">
              <h2 className="flex items-center gap-2.5 text-base font-black
                             text-emerald-500 uppercase tracking-widest">
                <Soup size={16} className="animate-pulse" />
                Origine &amp; Tradition
              </h2>
              <p className="text-base-content/70 leading-relaxed text-sm md:text-base
                             whitespace-pre-line text-justify">
                {plat.histoire}
              </p>
            </div>

            {/* Accompagnement idéal */}
            <div className="flex items-start gap-4 p-5 rounded-2xl
                            bg-amber-500/6 border border-amber-500/15">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/20 shrink-0">
                <Flame size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
                  Accompagnement idéal
                </p>
                <p className="text-sm text-base-content/70 leading-relaxed">
                  {plat.accompagnementsIdaux}
                </p>
              </div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-base-content/40 uppercase
                               tracking-widest flex items-center gap-2">
                  <ChefHat size={12} />
                  Autres plats · {plat.catégorie}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {suggestions.map((p) => (
                    <Link key={p.id} href={`/cuisine/${p.id}`}>
                      <div className="group relative rounded-xl overflow-hidden
                                      border border-base-content/8 bg-base-200
                                      hover:border-base-content/20 hover:-translate-y-1
                                      transition-all duration-200 cursor-pointer">
                        <div className="relative h-24 w-full overflow-hidden">
                          <Image
                            src={p.image}
                            alt={p.nom}
                            fill
                            sizes="200px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <p className="text-xs font-bold text-base-content
                                        group-hover:text-emerald-500 transition-colors
                                        line-clamp-1">
                            {p.nom}
                          </p>
                          <ChevronRight size={12} className="text-base-content/30
                                                              group-hover:text-emerald-500 shrink-0" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── SIDEBAR STICKY (1/3) ── */}
          <aside className="space-y-5 lg:sticky lg:top-24 self-start">

            {/* Fiche récap */}
            <div className="rounded-2xl border border-base-content/8 bg-base-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-base-content/8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-base-content/35">
                  Fiche du plat
                </h3>
              </div>
              <div className="divide-y divide-base-content/5">
                {[
                  { label: 'Nom', value: plat.nom },
                  { label: 'Catégorie', value: plat.catégorie },
                  { label: 'Origine', value: 'Togo' },
                  { label: 'Accompagnement', value: plat.accompagnementsIdaux },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4 px-5 py-3">
                    <span className="text-xs text-base-content/40 shrink-0">{label}</span>
                    <span className="text-xs font-semibold text-base-content/80 text-right line-clamp-2">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badge catégorie stylé */}
            <div className={`rounded-2xl border p-5 ${style.pill}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">
                Catégorie
              </p>
              <p className="text-base font-black uppercase tracking-wide">
                {plat.catégorie}
              </p>
            </div>

            {/* CTA Restaurants */}
            <Link href="/restaurants" className="block">
              <button className="w-full btn rounded-2xl border-none text-white font-bold
                                 bg-gradient-to-r from-emerald-500 via-green-600 to-teal-500
                                 hover:scale-[1.02] active:scale-[0.98]
                                 shadow-xl shadow-emerald-500/20 transition-all duration-200
                                 flex items-center justify-center gap-2 py-4">
                <Utensils size={16} />
                Trouver ce plat près de moi
              </button>
            </Link>

          </aside>
        </div>
      </section>
    </main>
  )
}
