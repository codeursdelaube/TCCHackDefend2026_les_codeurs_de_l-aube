'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { ArrowRight, Compass, Filter, MapPin, Search, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Monument, monuments } from '@/app/LieuxT/site'

const regionsTogo = ['all', 'Maritime', 'Plateaux', 'Centrale', 'Kara', 'Savanes'] as const

type RegionFilter = (typeof regionsTogo)[number]

export default function ToutPage() {
  const t = useTranslations('Lieux')
  const tMonuments = useTranslations('Monuments')
  const [searchInput, setSearchInput] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>('all')
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
    <main className="min-h-screen bg-base-100 px-3 pb-28 pt-24 text-base-content sm:px-6 lg:px-8 w-full overflow-hidden">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(22rem,1.08fr)] lg:items-stretch">
          
          {/* Bloc d'introduction */}
          <div className="overflow-hidden rounded-[28px] border border-border bg-base-200 p-5 shadow-sm sm:rounded-[32px] sm:p-7 lg:min-h-[18rem]">
            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-[10px] font-black uppercase tracking-wide text-secondary-content sm:text-[11px]">
              <Compass className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('hero_badge')}</span>
            </div>
            
            <h1 className="max-w-3xl text-2xl sm:text-4xl lg:text-6xl font-black leading-tight tracking-normal text-base-content">
              {t('title')}
            </h1>
            <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-base-content/65 sm:text-base">{t('subtitle')}</p>
          </div>

          {/* Bloc de recherche et Filtres */}
          <div className="rounded-[28px] border border-border bg-base-200 p-4 shadow-sm sm:rounded-[32px] lg:self-end w-full max-w-full overflow-hidden">
            <label className="relative flex min-h-14 items-center rounded-[22px] border border-border bg-base-100 px-4 transition-all focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/15 sm:rounded-[24px]">
              <Search className="h-5 w-5 shrink-0 text-base-content/40" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => startTransition(() => setSearchInput(event.target.value))}
                placeholder={t('search_placeholder')}
                className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-hidden placeholder:text-base-content/38"
              />
            </label>

            <div className="mt-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-base-content/50">
              <Filter className="h-3.5 w-3.5 shrink-0 text-secondary" />
              {t('filter_region')}
            </div>
            
            <div className="mt-3 flex w-full max-w-full gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:overflow-visible">
              {regionsTogo.map((region) => {
                const active = selectedRegion === region
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setSelectedRegion(region)}
                    className={`min-h-11 shrink-0 rounded-2xl border px-4 text-xs font-black transition-all active:scale-95 cursor-pointer ${
                      active
                        ? 'border-primary bg-primary text-primary-content dark:border-secondary dark:bg-secondary dark:text-secondary-content'
                        : 'border-border bg-base-100 text-base-content/65 hover:border-secondary/50'
                    }`}
                  >
                    {getRegionName(region)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {searchInput && (
          <p className="mt-5 rounded-2xl bg-base-200 px-4 py-3 text-sm font-semibold text-base-content/55">
            {t('results_for')} <span className="text-secondary">{searchInput}</span>
          </p>
        )}

        {/* Liste des monuments */}
        {filteredSites.length === 0 ? (
          <div className="mx-auto mt-8 max-w-md rounded-[28px] border border-border bg-base-200 p-8 text-center shadow-sm sm:rounded-[32px]">
            <Sparkles className="mx-auto h-8 w-8 text-secondary" />
            <p className="mt-4 text-lg font-black">{t('no_sites')}</p>
            <p className="mt-2 text-sm font-medium text-base-content/55">{t('try_other')}</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {filteredSites.map((site, index) => {
              const featured = index === 0
              return (
                <Link
                  key={site.id}
                  href={`/lieux/${site.id}`}
                  className={`group flex min-w-0 overflow-hidden rounded-[28px] border border-border bg-base-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:rounded-[32px] ${featured ? 'lg:col-span-2 lg:row-span-2' : ''}`}
                >
                  <article className="flex min-w-0 flex-1 flex-col w-full">
                    <figure className={`${featured ? 'h-56 sm:h-72 lg:h-[28rem]' : 'h-48 sm:h-52'} relative shrink-0 overflow-hidden bg-base-300`}>
                      <Image 
                        src={site.image} 
                        alt={tMonuments(`${site.id}.nom`)} 
                        fill 
                        placeholder="blur" 
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" 
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/15 to-transparent" />
                      <span className="absolute right-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-2xl bg-secondary px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-secondary-content sm:right-4 sm:top-4">
                        {getRegionName(site.région)}
                      </span>
                    </figure>
                    <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                      <h2 className="line-clamp-2 text-lg font-black leading-tight tracking-normal text-base-content group-hover:text-secondary sm:text-xl">{tMonuments(`${site.id}.nom`)}</h2>
                      <p className="mt-3 inline-flex w-fit max-w-full items-center gap-1.5 rounded-2xl border border-border bg-base-100 px-3 py-1.5 text-xs font-bold text-base-content/65">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary" />
                        <span className="truncate">{site.localite}</span>
                      </p>
                      <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-base-content/60">{tMonuments(`${site.id}.description`)}</p>
                      <span className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-black text-secondary">
                        {t('discover')}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}