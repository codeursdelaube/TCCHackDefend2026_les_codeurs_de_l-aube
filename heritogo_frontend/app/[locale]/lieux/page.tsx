'use client'

import { Fragment, useState, useTransition } from 'react'
import AdSlot from '@/components/ads/AdSlot'
import dynamic from 'next/dynamic'
import { Compass, LayoutGrid, Map as MapIcon, Search, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import SiteCard from '@/components/ui/SiteCard'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { usePlaces } from '@/hooks/useCatalog'
import type { CatalogPlace } from '@/lib/catalog/types'

const DynamicCarte = dynamic(() => import('@/app/_components/Carte'), {
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse rounded-lg bg-muted" />,
})

const regionsTogo = ['all', 'Maritime', 'Plateaux', 'Centrale', 'Kara', 'Savanes'] as const
type RegionFilter = (typeof regionsTogo)[number]

export default function ToutPage() {
  const t = useTranslations('Lieux')
  const { places, loading } = usePlaces()
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

  const filteredSites = places.filter((site: CatalogPlace) => {
    const siteName = site.nom.toLowerCase()
    const siteDescription = site.description.toLowerCase()
    const search = searchInput.toLowerCase()
    const matchesSearch =
      siteName.includes(search) ||
      siteDescription.includes(search) ||
      site.localite.toLowerCase().includes(search)
    const matchesRegion = selectedRegion === 'all' || site.région === selectedRegion
    return matchesSearch && matchesRegion
  })

  const resetFilters = () => {
    setSearchInput('')
    setSelectedRegion('all')
  }

  return (
    <main className="min-h-screen bg-background pb-32 pt-24 text-foreground">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHeader kicker={t('hero_badge')} kickerIcon={Compass} title={t('title')} subtitle={t('subtitle')} />

        {/* Recherche, filtres et mode d'affichage */}
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative flex items-center lg:w-96">
            <span className="sr-only">{t('search_placeholder')}</span>
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => startTransition(() => setSearchInput(e.target.value))}
              placeholder={t('search_placeholder')}
              className="field pl-9"
            />
          </label>

          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t('filter_region')}>
            {regionsTogo.map((rf) => {
              const active = selectedRegion === rf
              return (
                <button
                  key={rf}
                  type="button"
                  aria-pressed={active}
                  onClick={() => startTransition(() => setSelectedRegion(rf))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground/80 hover:border-primary/50'
                  }`}
                >
                  {getRegionName(rf)}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <span className="text-xs font-semibold text-muted-foreground">{t('results_count', { count: filteredSites.length })}</span>
            <div className="flex rounded-lg border border-border p-0.5" role="group">
              {(['grid', 'map'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={viewMode === mode}
                  onClick={() => setViewMode(mode)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    viewMode === mode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode === 'grid' ? <LayoutGrid className="h-3.5 w-3.5" /> : <MapIcon className="h-3.5 w-3.5" />}
                  {mode === 'grid' ? t('grid_view') : t('map_view')}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : viewMode === 'map' ? (
          <section className="overflow-hidden rounded-xl border border-border bg-card p-2">
            <div className="overflow-hidden rounded-lg">
              <DynamicCarte monumentsList={filteredSites} />
            </div>
          </section>
        ) : filteredSites.length === 0 ? (
          <EmptyState icon={Compass} title={t('empty_title')} description={t('empty_desc')} action={{ label: t('reset_filters'), onClick: resetFilters }} />
        ) : (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSites.map((site, index) => (
              <Fragment key={site.id}>
                <SiteCard
                  id={site.id}
                  nom={site.nom}
                  region={site.région}
                  localite={site.localite}
                  description={site.description}
                  image={site.image}
                  isUnesco={site.isUnesco}
                  priority={index < 3}
                />
                {index === 7 && (
                  <div className="col-span-full">
                    <AdSlot slot="places-list-slot" format="auto" />
                  </div>
                )}
              </Fragment>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
