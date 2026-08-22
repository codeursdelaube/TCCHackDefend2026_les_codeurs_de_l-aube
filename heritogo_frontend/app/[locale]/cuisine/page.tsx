'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import { ArrowRight, ChefHat, Clock, Filter, MapPin, Navigation, Search, Sparkles, Star, Utensils } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import platsTogolais from '@/app/Plats/plat'
import restaurants from '@/app/Resto/restaurants'

const categoryFilters = ['all', 'Ayimolou', 'Fufu', 'Djenkoumé', 'Gboma', 'Akoumé', 'Wagasi', 'Gombo', 'Boissons'] as const
type CategoryFilter = (typeof categoryFilters)[number]

const TV = {
  savane:   '#1B7E4B',
  laterite: '#C85C2D',
  or:       '#E8A923',
  sable:    '#F5F5F0',
  gris:     '#767676',
} as const

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
      case 'Wagasi': return 'Wagasi'
      case 'Gombo': return 'Gombo (Fétri)'
      case 'Boissons': return 'Boissons'
      default: return category
    }
  }

  const getCategoryName = (category: string): string => {
    switch (category) {
      case 'Accompagnement': return t('categories.accompagnement')
      case 'Plat Principal': return t('categories.plat_principal')
      case 'Street Food': return t('categories.street_food')
      case 'Sauce': return t('categories.sauce')
      case 'Boisson': return 'Boisson Traditionnelle'
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
    return restaurants.filter((restaurant) =>
      restaurant.plats_ids.some((platId) => {
        const plat = platsTogolais.find((item) => item.id === platId)
        return plat ? tPlats(`${plat.id}.nom`).toLowerCase().includes(selectedCategory.toLowerCase()) : false
      })
    )
  }, [selectedCategory, tPlats])

  return (
    <main className="min-h-screen bg-white px-3 pb-28 pt-20 text-[#1A1A1A] sm:px-6 lg:px-8 w-full overflow-hidden">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ── HEADER & FILTRES ── */}
        <section className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,1.1fr)] lg:items-stretch">

          {/* Bloc intro */}
          <div className="overflow-hidden rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] p-5 shadow-xs sm:p-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-[#C85C2D]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#C85C2D]">
              <ChefHat className="h-4 w-4 shrink-0" />
              <span>{t('hero_badge')}</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A] sm:text-5xl">
              {t('page_title')}
            </h1>
            <div className="togo-underline" />
            <p className="mt-3 text-sm font-medium leading-relaxed text-[#767676]">
              {t('page_subtitle')}
            </p>
          </div>

          {/* Recherche & Filtres */}
          <div className="rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] p-4 shadow-xs sm:p-5 flex flex-col justify-between">
            <label className="relative flex min-h-12 items-center rounded-2xl border border-[#E5E5E0] bg-white px-3.5 transition-all focus-within:border-[#C85C2D] focus-within:ring-2 focus-within:ring-[#C85C2D]/15 shadow-xs">
              <Search className="h-4 w-4 shrink-0 text-[#767676]" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => startTransition(() => setSearchInput(event.target.value))}
                placeholder={t('search_placeholder')}
                className="min-w-0 flex-1 bg-transparent px-3 text-xs font-medium outline-none placeholder:text-[#767676]"
              />
            </label>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#767676] mb-2.5">
                <Filter className="h-3.5 w-3.5 text-[#C85C2D]" />
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
                      className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'border-[#C85C2D] bg-[#C85C2D] text-white shadow-xs'
                          : 'border-[#E5E5E0] bg-white text-[#1A1A1A] hover:border-[#C85C2D]/50'
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
          <p className="rounded-xl bg-[#F5F5F0] border border-[#E5E5E0] px-4 py-2.5 text-xs font-semibold text-[#767676]">
            {t('results_for')} <span className="font-bold text-[#C85C2D]">{searchInput}</span>
          </p>
        )}

        {/* ── PLATS TRADITIONNELS ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A] sm:text-2xl">Plats &amp; Délices du Terroir</h2>
              <span className="text-xs text-[#767676] font-medium">
                {filteredPlats.length} {filteredPlats.length > 1 ? 'spécialités' : 'spécialité'}
              </span>
            </div>
          </div>

          {filteredPlats.length === 0 ? (
            <div className="mx-auto my-12 max-w-md rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] p-8 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C85C2D]/10 text-[#C85C2D]">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="mt-3 font-serif text-lg font-bold text-[#1A1A1A]">{t('no_plats')}</p>
              <p className="mt-1 text-xs text-[#767676]">{t('try_other')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPlats.map((plat) => (
                <Link
                  key={plat.id}
                  href={`/cuisine/${plat.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E5E0] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
                >
                  <div className="relative h-48 overflow-hidden bg-[#F5F5F0]">
                    <Image
                      src={plat.image}
                      alt={tPlats(`${plat.id}.nom`)}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-lg bg-[#C85C2D] px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                      {getCategoryName(plat.catégorie)}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4 space-y-2">
                    <div>
                      <h3 className="font-bold text-[#1A1A1A] leading-snug">
                        {tPlats(`${plat.id}.nom`)}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-[#767676] leading-relaxed">
                        {tPlats(`${plat.id}.description`)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#E5E5E0] pt-2">
                      <span className="text-xs font-semibold text-[#767676]">{t('know_more')}</span>
                      <ArrowRight className="h-4 w-4 text-[#C85C2D] transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── RESTAURANTS ── */}
        {categoryRestaurants.length > 0 && (
          <section className="rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E5E0] pb-3">
              <div>
                <h2 className="text-xl font-black text-[#1A1A1A] sm:text-2xl">
                  {selectedCategory === 'all' ? t('top_restaurants') : t('restaurants_available', { count: categoryRestaurants.length })}
                </h2>
                <p className="text-xs text-[#767676]">Adresses recommandées pour déguster ces spécialités</p>
              </div>
              <span className="w-fit rounded-xl bg-[#C85C2D] px-3 py-1 text-[10px] font-black uppercase text-white">
                {selectedCategory === 'all' ? t('selection') : getFilterLabel(selectedCategory)}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {categoryRestaurants.map((resto, index) => (
                <article key={resto.id} className="rounded-2xl border border-[#E5E5E0] bg-white p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-[#1A1A1A]">{resto.nom}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[#767676]">
                        <MapPin className="h-3.5 w-3.5 text-[#1B7E4B] shrink-0" />
                        <span className="truncate">{resto.quartier || t('lome_area')}</span>
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#E8A923]/15 px-2 py-0.5 text-xs font-black text-[#C85C2D]">
                      <Star className="h-3 w-3 fill-[#E8A923] text-[#E8A923]" />
                      {resto.note || (4 + index * 0.1).toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-[#767676] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {resto.horaires || t('default_hours')}
                    </span>
                    <a
                      href={`https://maps.google.com/?q=${resto.lat},${resto.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:brightness-110"
                      style={{ background: TV.savane }}
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

        {/* ── CONSEILS GOURMANDS DU TOURISTE ── */}
        <section className="rounded-3xl border border-[#E5E5E0] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#C85C2D]">
            <Utensils className="h-4 w-4" />
            <span>Guide Gourmand du Voyageur</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#1A1A1A]">Comment savourer la cuisine togolaise comme un local</h2>
          <div className="grid gap-3 sm:grid-cols-3 pt-2">
            <div className="rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] p-4 space-y-1.5">
              <span className="text-xl">🥣</span>
              <h3 className="font-bold text-xs text-[#1A1A1A]">L’art du Maquis &amp; du Bol d’eau</h3>
              <p className="text-[11px] text-[#767676] leading-relaxed">
                Avant de manger le Fufu ou l’Akoumé avec les doigts (main droite), on vous apportera toujours un bol d’eau tiède et du savon pour vous laver les mains.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] p-4 space-y-1.5">
              <span className="text-xl">🌶️</span>
              <h3 className="font-bold text-xs text-[#1A1A1A]">Piment selon votre goût</h3>
              <p className="text-[11px] text-[#767676] leading-relaxed">
                Si vous craignez le piment fort, demandez toujours <em className="text-[#1A1A1A] font-bold">« sans piment direct »</em> ou demandez le piment noir (Shito/Yébéessé) servi à part dans une coupelle.
              </p>
            </div>
            <div className="rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] p-4 space-y-1.5">
              <span className="text-xl">💵</span>
              <h3 className="font-bold text-xs text-[#1A1A1A]">Petits budgets, grands festins</h3>
              <p className="text-[11px] text-[#767676] leading-relaxed">
                Un copieux plat d’Ayimolou ou d’Ablo avec poisson coûte généralement entre 500 et 1 500 FCFA (0,80 € à 2,30 €). Ayez toujours de la petite monnaie.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}