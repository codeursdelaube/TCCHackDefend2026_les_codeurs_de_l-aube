'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import { ArrowRight, ChefHat, Clock, Filter, MapPin, Navigation, Search, Sparkles, Star, Utensils } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import platsTogolais from '@/app/Plats/plat'
import restaurants from '@/app/Resto/restaurants'

const categoryFilters = ['all', 'Ayimolou', 'Fufu', 'Djenkoumé', 'Gboma', 'Akoumé'] as const
type CategoryFilter = (typeof categoryFilters)[number]

export default function CuisinePage() {
  const t = useTranslations('Cuisine')
  const tPlats = useTranslations('Plats')
  const [searchInput, setSearchInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [, startTransition] = useTransition()

  const getFilterLabel = (category: CategoryFilter): string => {
    switch (category) {
      case 'all': return t('all')
      case 'Ayimolou': return t('filters.ayimolou')
      case 'Fufu': return t('filters.fufu')
      case 'Djenkoumé': return t('filters.djenkoume')
      case 'Gboma': return t('filters.gboma')
      case 'Akoumé': return t('filters.akoume')
      default: return category
    }
  }

  const getCategoryName = (category: string): string => {
    switch (category) {
      case 'Accompagnement': return t('categories.accompagnement')
      case 'Plat Principal': return t('categories.plat_principal')
      case 'Street Food': return t('categories.street_food')
      case 'Sauce': return t('categories.sauce')
      default: return category
    }
  }

  const filteredPlats = platsTogolais.filter((plat) => {
    const platName = tPlats(`${plat.id}.nom`).toLowerCase()
    const platDescription = tPlats(`${plat.id}.description`).toLowerCase()
    const search = searchInput.toLowerCase()
    const matchesSearch = platName.includes(search) || platDescription.includes(search) || plat.catégorie.toLowerCase().includes(search)
    const matchesCategory = selectedCategory === 'all' || platName.includes(selectedCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

  const categoryRestaurants = useMemo(() => {
    if (selectedCategory === 'all') return restaurants.slice(0, 4)
    return restaurants.filter((restaurant) => restaurant.plats_ids.some((platId) => {
      const plat = platsTogolais.find((item) => item.id === platId)
      return plat ? tPlats(`${plat.id}.nom`).toLowerCase().includes(selectedCategory.toLowerCase()) : false
    }))
  }, [selectedCategory, tPlats])

  return (
    <main className="min-h-screen bg-base-100 px-3 pb-28 pt-24 text-base-content sm:px-6 lg:px-8 w-full overflow-hidden">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,1.05fr)] lg:items-stretch">
          
          <div className="overflow-hidden rounded-[28px] border border-border bg-base-200 p-5 shadow-sm sm:rounded-4xl sm:p-7 lg:min-h-72">
            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-[10px] font-black uppercase tracking-wide text-secondary-content sm:text-[11px]">
              <ChefHat className="h-4 w-4 shrink-0" />
              <span className="truncate">{t('hero_badge')}</span>
            </div>
            <h1 className="max-w-3xl text-2xl sm:text-4xl lg:text-6xl font-black leading-tight tracking-normal text-base-content">
              {t('page_title')}
            </h1>
            <span className="heritage-weave" />
            <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-base-content/65 sm:text-base">{t('page_subtitle')}</p>
          </div>

          <div className="rounded-[28px] border border-border bg-base-200 p-4 shadow-sm sm:rounded-4xl lg:self-end w-full max-w-full overflow-hidden">
            <label className="relative flex min-h-14 items-center rounded-[22px] border border-border bg-base-100 px-4 transition-all focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/15 sm:rounded-3xl">
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
              {t('filter_category')}
            </div>
            
            <div className="mt-3 flex w-full max-w-full gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:overflow-visible">
              {categoryFilters.map((category) => {
                const active = selectedCategory === category
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border px-4 text-xs font-black transition-all active:scale-95 cursor-pointer ${
                      active
                        ? 'border-primary bg-primary text-primary-content dark:border-secondary dark:bg-secondary dark:text-secondary-content'
                        : 'border-border bg-base-100 text-base-content/65 hover:border-secondary/50'
                    }`}
                  >
                    <Utensils className="h-3.5 w-3.5 shrink-0" />
                    {getFilterLabel(category)}
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

        {categoryRestaurants.length > 0 && (
          <section className="mt-5 rounded-[28px] border border-border bg-base-200 p-4 shadow-sm sm:rounded-4xl sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-black tracking-normal">
                {selectedCategory === 'all' ? t('top_restaurants') : t('restaurants_available', { count: categoryRestaurants.length })}
              </h2>
              <span className="w-fit rounded-2xl bg-secondary px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-secondary-content">
                {selectedCategory === 'all' ? t('selection') : getFilterLabel(selectedCategory)}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {categoryRestaurants.map((resto, index) => (
                <article key={resto.id} className="rounded-3xl border border-border bg-base-100 p-4 sm:rounded-[28px]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-base font-black">{resto.nom}</h3>
                      <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs font-semibold text-base-content/55">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary" />
                        <span className="truncate">{resto.quartier || t('lome_area')}</span>
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-2xl border border-border bg-base-200 px-2.5 py-1 text-xs font-black">
                      <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                      {resto.note || 4 + index / 10}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-base-content/55">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {resto.horaires || t('default_hours')}
                    </span>
                    <a href={`https://maps.google.com/?q=${resto.lat},${resto.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-2 text-xs font-black text-secondary-content transition-all hover:-translate-y-0.5 active:scale-95 sm:w-auto">
                      <Navigation className="h-4 w-4" />
                      {t('directions')}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {filteredPlats.length === 0 ? (
          <div className="mx-auto mt-8 max-w-md rounded-[28px] border border-border bg-base-200 p-8 text-center shadow-sm sm:rounded-4xl">
            <Sparkles className="mx-auto h-8 w-8 text-secondary" />
            <p className="mt-4 text-lg font-black">{t('no_plats')}</p>
            <p className="mt-2 text-sm font-medium text-base-content/55">{t('try_other')}</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {filteredPlats.map((plat, index) => {
              const featured = index === 0
              return (
                <Link key={plat.id} href={`/cuisine/${plat.id}`} className={`group flex min-w-0 overflow-hidden rounded-[28px] border border-border bg-base-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:rounded-4xl ${featured ? 'lg:col-span-2' : ''}`}>
                  <article className="flex min-w-0 flex-1 flex-col w-full">
                    <figure className={`${featured ? 'h-56 sm:h-72' : 'h-48 sm:h-52'} relative shrink-0 overflow-hidden bg-base-300`}>
                      <Image src={plat.image} alt={tPlats(`${plat.id}.nom`)} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-linear-to-t from-black/72 via-black/15 to-transparent" />
                      <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-2xl bg-secondary px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-secondary-content sm:left-4 sm:top-4">{getCategoryName(plat.catégorie)}</span>
                    </figure>
                    <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                      <h2 className="line-clamp-2 text-lg font-black leading-tight tracking-normal text-base-content group-hover:text-secondary sm:text-xl">{tPlats(`${plat.id}.nom`)}</h2>
                      <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-base-content/60">{tPlats(`${plat.id}.description`)}</p>
                      <span className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-black text-secondary">
                        {t('know_more')}
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