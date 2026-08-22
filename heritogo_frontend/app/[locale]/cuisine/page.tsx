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
    <main className="min-h-screen bg-base-100 px-3 pb-28 pt-20 text-base-content sm:px-6 lg:px-8 w-full overflow-hidden">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* ── 1. HEADER & RECHERCHE / FILTRES ── */}
        <section className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,1.1fr)] lg:items-stretch">
          
          {/* Bloc d'introduction */}
          <div className="overflow-hidden rounded-[28px] border border-border bg-base-200 p-5 shadow-xs sm:rounded-[32px] sm:p-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-secondary/15 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-secondary">
              <ChefHat className="h-4 w-4 shrink-0" />
              <span>{t('hero_badge')}</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-base-content sm:text-5xl">
              {t('page_title')}
            </h1>
            <p className="mt-3 text-sm font-medium leading-relaxed text-base-content/70">
              {t('page_subtitle')}
            </p>
          </div>

          {/* Recherche & Filtres Catégories */}
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
                <span>{t('filter_category')}</span>
              </div>
              
              <div className="flex w-full gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
                {categoryFilters.map((category) => {
                  const active = selectedCategory === category
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'border-[#3B2519] bg-[#3B2519] text-white dark:border-[#C99A3E] dark:bg-[#C99A3E] dark:text-[#2A1C14] shadow-xs'
                          : 'border-border bg-base-100 text-base-content/70 hover:border-secondary/50'
                      }`}
                    >
                      <Utensils className="h-3 w-3" />
                      <span>{getFilterLabel(category)}</span>
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

        {/* ── 2. SECTION PRINCIPALE : GALERIE DES PLATS TRADITIONNELS (VIENT EN PREMIER) ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
              Plats & Délices du Terroir
            </h2>
            <span className="text-xs font-bold text-base-content/50">
              {filteredPlats.length} {filteredPlats.length > 1 ? 'spécialités' : 'spécialité'}
            </span>
          </div>

          {filteredPlats.length === 0 ? (
            <div className="mx-auto my-12 max-w-md rounded-[28px] border border-border bg-base-200 p-8 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="mt-3 font-serif text-lg font-bold">{t('no_plats')}</p>
              <p className="mt-1 text-xs text-base-content/60">{t('try_other')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPlats.map((plat) => (
                <Link 
                  key={plat.id} 
                  href={`/cuisine/${plat.id}`} 
                  className="group relative flex h-88 flex-col justify-end overflow-hidden rounded-[28px] border border-border/40 bg-stone-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
                >
                  <Image 
                    src={plat.image} 
                    alt={tPlats(`${plat.id}.nom`)} 
                    fill 
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  <span className="absolute left-4 top-4 z-10 rounded-xl bg-black/45 backdrop-blur-md border border-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                    {getCategoryName(plat.catégorie)}
                  </span>

                  <div className="relative z-10 p-5 text-white space-y-2">
                    <h3 className="font-serif text-2xl font-bold leading-tight text-white group-hover:text-[#C99A3E] transition-colors">
                      {tPlats(`${plat.id}.nom`)}
                    </h3>
                    <p className="line-clamp-2 text-xs font-medium leading-relaxed text-white/80">
                      {tPlats(`${plat.id}.description`)}
                    </p>
                    <div className="pt-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#C99A3E]">
                      <span>{t('know_more')}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── 3. SECTION SECONDAIRE : OÙ DÉGUSTER / RESTAURANTS RECOMMANDÉS ── */}
        {categoryRestaurants.length > 0 && (
          <section className="rounded-[28px] border border-border bg-base-200 p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-base-content sm:text-2xl">
                  {selectedCategory === 'all' ? t('top_restaurants') : t('restaurants_available', { count: categoryRestaurants.length })}
                </h2>
                <p className="text-xs text-base-content/60">
                  Adresses recommandées pour déguster ces spécialités
                </p>
              </div>
              <span className="w-fit rounded-xl bg-[#3B2519] dark:bg-[#C99A3E] px-3 py-1 text-[10px] font-black uppercase text-white dark:text-[#2A1C14]">
                {selectedCategory === 'all' ? t('selection') : getFilterLabel(selectedCategory)}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {categoryRestaurants.map((resto, index) => (
                <article key={resto.id} className="rounded-2xl border border-border bg-base-100 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-base-content">{resto.nom}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-base-content/60">
                        <MapPin className="h-3.5 w-3.5 text-[#A9754A] shrink-0" />
                        <span className="truncate">{resto.quartier || t('lome_area')}</span>
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#C99A3E]/15 px-2 py-0.5 text-xs font-black text-[#A9754A] dark:text-[#C99A3E]">
                      <Star className="h-3 w-3 fill-current" />
                      {resto.note || 4 + index / 10}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-base-content/50 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {resto.horaires || t('default_hours')}
                    </span>
                    <a
                      href={`https://maps.google.com/?q=${resto.lat},${resto.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#3B2519] dark:bg-[#C99A3E] px-3.5 py-1.5 text-xs font-black text-white dark:text-[#2A1C14] transition-all hover:brightness-110"
                    >
                      <Navigation className="h-3 w-3" />
                      <span>{t('directions')}</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}