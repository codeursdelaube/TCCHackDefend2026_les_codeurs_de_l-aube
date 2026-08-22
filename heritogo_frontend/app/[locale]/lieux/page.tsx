'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { ArrowRight, Compass, Filter, LayoutGrid, Map as MapIcon, MapPin, Search, Sparkles, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Monument, monuments } from '@/app/LieuxT/site'

const DynamicCarte = dynamic(() => import('@/app/_components/Carte'), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#182B1E] animate-pulse">
      <MapPin className="h-8 w-8 text-[#1B7E4B] animate-bounce" />
      <span className="text-xs font-semibold text-[#767676] dark:text-[#9CA89E]">Chargement de la carte interactive du Togo…</span>
    </div>
  ),
})

const regionsTogo = ['all', 'Maritime', 'Plateaux', 'Centrale', 'Kara', 'Savanes'] as const
type RegionFilter = (typeof regionsTogo)[number]

import { getSiteRating } from '@/lib/constants/ratings'

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1,2,3,4,5].map(i => (
          <Star
            key={i}
            className="h-3 w-3"
            style={{
              fill: i <= full ? '#E8A923' : i === full + 1 && half ? '#E8A923' : 'transparent',
              color: i <= full || (i === full + 1 && half) ? '#E8A923' : '#D1D1CC',
            }}
          />
        ))}
      </div>
      <span className="text-xs text-[#767676] dark:text-[#9CA89E]">({count})</span>
    </div>
  )
}

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
    <main className="min-h-screen bg-white dark:bg-[#182B1E] dark:bg-[#0F1F16] px-3 pb-28 pt-20 text-[#1A1A1A] dark:text-[#F0F0EC] dark:text-[#F0F0EC] sm:px-6 lg:px-8 w-full overflow-hidden">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-8">
        
        {/* ── HEADER & FILTRES ── */}
        <section className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,1.1fr)] lg:items-stretch">
          
          {/* Bloc intro */}
          <div className="overflow-hidden rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#182B1E] p-5 shadow-xs sm:p-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-[#1B7E4B]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1B7E4B]">
              <Compass className="h-4 w-4 shrink-0" />
              <span>{t('hero_badge')}</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F0F0EC] sm:text-5xl">
              {t('title')}
            </h1>
            <div className="togo-underline" />
            <p className="mt-3 text-sm font-medium leading-relaxed text-[#767676] dark:text-[#9CA89E]">
              {t('subtitle')}
            </p>
          </div>

          {/* Recherche & Filtres */}
          <div className="rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#182B1E] p-4 shadow-xs sm:p-5 flex flex-col justify-between">
            <label className="relative flex min-h-12 items-center rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-white dark:bg-[#182B1E] px-3.5 transition-all focus-within:border-[#1B7E4B] focus-within:ring-2 focus-within:ring-[#1B7E4B]/15 shadow-xs">
              <Search className="h-4 w-4 shrink-0 text-[#767676] dark:text-[#9CA89E]" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => startTransition(() => setSearchInput(event.target.value))}
                placeholder={t('search_placeholder')}
                className="min-w-0 flex-1 bg-transparent px-3 text-xs font-medium outline-none placeholder:text-[#767676] dark:text-[#9CA89E]"
              />
            </label>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#767676] dark:text-[#9CA89E] mb-2.5">
                <Filter className="h-3.5 w-3.5 text-[#1B7E4B]" />
                <span>{t('filter_region')}</span>
              </div>
              
              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {regionsTogo.map((region) => {
                  const active = selectedRegion === region
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => setSelectedRegion(region)}
                      className={`inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'border-[#1B7E4B] bg-[#1B7E4B] text-white shadow-xs'
                          : 'border-[#E5E5E0] dark:border-[#243B2C] bg-white dark:bg-[#182B1E] text-[#1A1A1A] dark:text-[#F0F0EC] hover:border-[#1B7E4B]/50'
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
          <p className="rounded-xl bg-[#F5F5F0] dark:bg-[#182B1E] border border-[#E5E5E0] dark:border-[#243B2C] px-4 py-2.5 text-xs font-semibold text-[#767676] dark:text-[#9CA89E]">
            {t('results_for')} <span className="font-bold text-[#1B7E4B]">{searchInput}</span>
          </p>
        )}

        {/* ── BARRE TITRE & COMMUTATEUR ── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E5E5E0] dark:border-[#243B2C] pb-3">
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A] dark:text-[#F0F0EC] sm:text-2xl">
                Monuments & Sites Emblématiques
              </h2>
              <span className="text-xs text-[#767676] dark:text-[#9CA89E] font-medium">
                {filteredSites.length} {filteredSites.length > 1 ? 'sites répertoriés' : 'site répertorié'}
              </span>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#182B1E] p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#1B7E4B] text-white shadow-xs' : 'text-[#767676] dark:text-[#9CA89E] hover:text-[#1A1A1A] dark:text-[#F0F0EC]'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Galerie</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'map' ? 'bg-[#1B7E4B] text-white shadow-xs' : 'text-[#767676] dark:text-[#9CA89E] hover:text-[#1A1A1A] dark:text-[#F0F0EC]'
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span>Carte</span>
              </button>
            </div>
          </div>

          {/* Contenu */}
          {viewMode === 'map' ? (
            <div className="overflow-hidden rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] shadow-sm">
              <DynamicCarte monumentsList={filteredSites} />
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="mx-auto my-12 max-w-md rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#182B1E] p-8 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1B7E4B]/10 text-[#1B7E4B]">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="mt-3 font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#F0F0EC]">{t('no_sites')}</p>
              <p className="mt-1 text-xs text-[#767676] dark:text-[#9CA89E]">{t('try_other')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSites.map((site) => {
                const ratingData = getSiteRating(site.id)
                return (
                  <Link
                    key={site.id}
                    href={`/lieux/${site.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-white dark:bg-[#182B1E] shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-48 overflow-hidden bg-[#F5F5F0] dark:bg-[#182B1E]">
                      <Image 
                        src={site.image} 
                        alt={tMonuments(`${site.id}.nom`)} 
                        fill 
                        placeholder="blur" 
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <span className="absolute left-3 top-3 rounded-lg bg-[#1B7E4B] px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                        {getRegionName(site.région)}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-4 space-y-2">
                      <div>
                        <h3 className="font-bold text-[#1A1A1A] dark:text-[#F0F0EC] leading-snug">
                          {tMonuments(`${site.id}.nom`)}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-xs text-[#767676] dark:text-[#9CA89E]">
                          <MapPin className="h-3.5 w-3.5 text-[#1B7E4B] shrink-0" />
                          {site.localite}, Togo
                        </p>
                        <p className="mt-1.5 line-clamp-2 text-xs text-[#767676] dark:text-[#9CA89E] leading-relaxed">
                          {tMonuments(`${site.id}.description`)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#E5E5E0] dark:border-[#243B2C] pt-2">
                        <StarRating rating={ratingData.rating} count={ratingData.count} />
                        <span className="rounded-lg bg-[#1B7E4B] px-2.5 py-1 text-xs font-black text-white">
                          {ratingData.rating}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}