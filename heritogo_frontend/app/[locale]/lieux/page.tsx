'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { ArrowRight, Compass, Filter, Landmark, LayoutGrid, Map as MapIcon, MapPin, Search, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Monument, monuments } from '@/app/LieuxT/site'

const DynamicCarte = dynamic(() => import('@/app/_components/Carte'), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full flex-col items-center justify-center gap-3 rounded-[28px] border border-border bg-base-200 animate-pulse">
      <MapPin className="h-8 w-8 text-[#A9754A] animate-bounce" />
      <span className="text-xs font-bold text-base-content/60">Chargement de la carte interactive du Togo…</span>
    </div>
  ),
})

const regionsTogo = ['all', 'Maritime', 'Plateaux', 'Centrale', 'Kara', 'Savanes'] as const
type RegionFilter = (typeof regionsTogo)[number]

export default function ToutPage() {
  const t = useTranslations('Lieux')
  const tMonuments = useTranslations('Monuments')
  const [searchInput, setSearchInput] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [, startTransition] = useTransition()

  const getRegionName = (region: string): string => {
    switch (region) {
      case 'all': return t('regions.all')
      case 'Maritime': return t('regions.maritime')
      case 'Plateaux': return t('regions.plateaux')
      case 'Kara': return t('regions.kara')
      case 'Centrale': return t('regions.centrale')
      case 'Savanes': return t('regions.savanes')
      default: return region
    }
  }

  const filteredSites = monuments.filter((site: Monument) => {
    const siteName = tMonuments(`${site.id}.nom`).toLowerCase()
    const siteDescription = tMonuments(`${site.id}.description`).toLowerCase()
    const search = searchInput.toLowerCase()
    const matchesSearch = siteName.includes(search) || siteDescription.includes(search) || site.localite.toLowerCase().includes(search)
    const matchesRegion = selectedRegion === 'all' || site.région === selectedRegion
    return matchesSearch && matchesRegion
  })

  return (
    <main className="min-h-screen bg-base-100 px-3 pb-28 pt-20 text-base-content sm:px-6 lg:px-8 w-full overflow-hidden">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* ── 1. HEADER & RECHERCHE / FILTRES (Même style que Cuisine) ── */}
        <section className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,1.1fr)] lg:items-stretch">
          
          {/* Bloc d'introduction */}
          <div className="overflow-hidden rounded-[28px] border border-border bg-base-200 p-5 shadow-xs sm:rounded-[32px] sm:p-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-secondary/15 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-secondary">
              <Compass className="h-4 w-4 shrink-0" />
              <span>{t('hero_badge')}</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-base-content sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-3 text-sm font-medium leading-relaxed text-base-content/70">
              {t('subtitle')}
            </p>
          </div>

          {/* Recherche & Filtres Régions */}
          <div className="rounded-[28px] border border-border bg-base-200 p-4 shadow-xs sm:rounded-[32px] sm:p-5 flex flex-col justify-between">
            <label className="relative flex min-h-12 items-center rounded-2xl border border-border bg-base-100 px-3.5 transition-all focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/15">
              <Search className="h-4 w-4 shrink-0 text-base-content/40" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => startTransition(() => setSearchInput(event.target.value))}
                placeholder={t('search_placeholder')}
                className="min-w-0 flex-1 bg-transparent px-3 text-xs font-semibold outline-hidden placeholder:text-base-content/40"
              />
            </label>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-base-content/50 mb-2.5">
                <Filter className="h-3.5 w-3.5 text-secondary" />
                <span>{t('filter_region')}</span>
              </div>
              
              <div className="flex w-full gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
                {regionsTogo.map((region) => {
                  const active = selectedRegion === region
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => setSelectedRegion(region)}
                      className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'border-[#3B2519] bg-[#3B2519] text-white dark:border-[#C99A3E] dark:bg-[#C99A3E] dark:text-[#2A1C14] shadow-xs'
                          : 'border-border bg-base-100 text-base-content/70 hover:border-secondary/50'
                      }`}
                    >
                      <MapPin className="h-3 w-3" />
                      <span>{getRegionName(region)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {searchInput && (
          <p className="rounded-2xl bg-base-200 px-4 py-2.5 text-xs font-bold text-base-content/60">
            {t('results_for')} <span className="text-secondary">{searchInput}</span>
          </p>
        )}

        {/* ── 2. BARRE DE CONTRÔLE : TITRE, COMPTEUR & COMMUTATEUR GALERIE / CARTE ── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
                Monuments & Sites Emblématiques
              </h2>
              <span className="text-xs font-bold text-base-content/50">
                {filteredSites.length} {filteredSites.length > 1 ? 'sites répertoriés' : 'site répertorié'}
              </span>
            </div>

            {/* Commutateur Vue Galerie / Carte Interactive */}
            <div className="flex items-center gap-1 rounded-2xl border border-border bg-base-200 p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#3B2519] text-white dark:bg-[#C99A3E] dark:text-[#2A1C14] shadow-xs'
                    : 'text-base-content/70 hover:text-base-content'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Galerie</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-[#3B2519] text-white dark:bg-[#C99A3E] dark:text-[#2A1C14] shadow-xs'
                    : 'text-base-content/70 hover:text-base-content'
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span>Carte</span>
              </button>
            </div>
          </div>

          {/* ── 3. AFFICHAGE DES CONTENUS (CARTE OU GRILLE) ── */}
          {viewMode === 'map' ? (
            <div className="overflow-hidden rounded-[28px] border border-border shadow-md">
              <DynamicCarte monumentsList={filteredSites} />
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="mx-auto my-12 max-w-md rounded-[28px] border border-border bg-base-200 p-8 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="mt-3 font-serif text-lg font-bold">{t('no_sites')}</p>
              <p className="mt-1 text-xs text-base-content/60">{t('try_other')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSites.map((site) => (
                <Link
                  key={site.id}
                  href={`/lieux/${site.id}`}
                  className="group relative flex h-88 flex-col justify-end overflow-hidden rounded-[28px] border border-border/40 bg-stone-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
                >
                  <Image 
                    src={site.image} 
                    alt={tMonuments(`${site.id}.nom`)} 
                    fill 
                    placeholder="blur" 
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Badge région */}
                  <div className="absolute left-4 top-4 z-10">
                    <span className="rounded-xl bg-black/45 backdrop-blur-md border border-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                      {getRegionName(site.région)}
                    </span>
                  </div>

                  {/* Contenu de la carte */}
                  <div className="relative z-10 p-5 text-white space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#C99A3E]">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{site.localite}</span>
                    </p>
                    
                    <h3 className="font-serif text-2xl font-bold leading-tight text-white group-hover:text-[#C99A3E] transition-colors">
                      {tMonuments(`${site.id}.nom`)}
                    </h3>

                    <p className="line-clamp-2 text-xs font-medium leading-relaxed text-white/80">
                      {tMonuments(`${site.id}.description`)}
                    </p>

                    <div className="pt-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#C99A3E]">
                      <span>{t('discover')}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}