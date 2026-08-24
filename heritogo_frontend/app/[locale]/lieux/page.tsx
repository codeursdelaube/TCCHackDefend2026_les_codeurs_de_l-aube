'use client'

import { useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import {
  Compass,
  Filter,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Monument, monuments } from '@/app/LieuxT/site'
import SiteCard from '@/components/ui/SiteCard'
import SectionHeader from '@/components/ui/SectionHeader'

const DynamicCarte = dynamic(() => import('@/app/_components/Carte'), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-card animate-pulse">
      <MapPin className="h-8 w-8 text-primary animate-bounce" />
      <span className="text-xs font-semibold text-muted-foreground">
        Chargement de la carte interactive du Togo…
      </span>
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
    const matchesSearch =
      siteName.includes(search) ||
      siteDescription.includes(search) ||
      site.localite.toLowerCase().includes(search)
    const matchesRegion = selectedRegion === 'all' || site.région === selectedRegion
    return matchesSearch && matchesRegion
  })

  return (
    <main className="min-h-screen bg-background px-3 pb-28 pt-8 text-foreground sm:px-6 lg:px-8 w-full">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* ── HEADER & SEARCH BAR ── */}
        <section className="app-card relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-card via-card to-primary/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <Compass className="h-4 w-4" />
                <span>{t('hero_badge')}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                {t('title')}
              </h1>
              <div className="togo-underline" />
              <p className="text-sm sm:text-base font-medium leading-relaxed text-muted-foreground pt-1">
                {t('subtitle')}
              </p>
            </div>

            {/* Search Input & View Mode Switch */}
            <div className="w-full lg:w-96 space-y-3">
              <div className="relative flex items-center rounded-2xl border border-border bg-card px-3.5 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => startTransition(() => setSearchInput(e.target.value))}
                  placeholder={t('search_placeholder')}
                  className="min-h-12 w-full bg-transparent px-3 text-sm font-medium outline-none placeholder:text-muted-foreground"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  {filteredSites.length} site{filteredSites.length > 1 ? 's' : ''} trouvé{filteredSites.length > 1 ? 's' : ''}
                </span>

                <div className="flex items-center rounded-xl border border-border bg-card p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Grille</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('map')}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                      viewMode === 'map'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <MapIcon className="h-3.5 w-3.5" />
                    <span>Carte</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Region Chips */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              <span>Régions :</span>
            </span>
            {regionsTogo.map((rf) => {
              const active = selectedRegion === rf
              return (
                <button
                  key={rf}
                  type="button"
                  onClick={() => startTransition(() => setSelectedRegion(rf))}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'border border-border bg-card text-foreground hover:border-primary/50'
                  }`}
                >
                  {getRegionName(rf)}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── CONTENT (GRID OR MAP) ── */}
        {viewMode === 'map' ? (
          <section className="app-card overflow-hidden p-2 sm:p-4">
            <div className="overflow-hidden rounded-2xl border border-border">
              <DynamicCarte monumentsList={filteredSites} />
            </div>
          </section>
        ) : (
          <section>
            {filteredSites.length === 0 ? (
              <div className="app-card flex flex-col items-center justify-center p-12 text-center space-y-3">
                <Compass className="h-10 w-10 text-primary opacity-60" />
                <h3 className="font-serif text-xl font-bold">{t('empty_title')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                  {t('empty_desc')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    setSelectedRegion('all')
                  }}
                  className="mt-2 inline-flex items-center rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-dark"
                >
                  {t('reset_filters')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSites.map((site, index) => (
                  <SiteCard
                    key={site.id}
                    id={site.id}
                    nom={tMonuments(`${site.id}.nom`)}
                    region={site.région}
                    localite={site.localite}
                    description={tMonuments(`${site.id}.description`)}
                    image={site.image}
                    priority={index < 3}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
