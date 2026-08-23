'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import { ArrowRight, ChefHat, Clock, Filter, MapPin, Navigation, Search, Star, Utensils } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import platsTogolais from '@/app/Plats/plat'
import restaurants from '@/app/Resto/restaurants'

const categoryFilters = ['all', 'Ayimolou', 'Fufu', 'Djenkoumé', 'Gboma', 'Akoumé', 'Wagasi', 'Gombo', 'Boissons'] as const
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
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-card px-3 pb-28 pt-20 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl min-w-0 space-y-8">

        {/* ── HEADER & FILTRES ── */}
        {/* Fix débordement mobile : les enfants d'un grid/flex ont une largeur
            min-content implicite (min-width: auto). Le badge "hero_badge" en
            inline-flex + uppercase + tracking-wider forçait sa ligne à rester
            entière et poussait tout le bloc plus large que l'écran. Fix :
            grid-cols-1 explicite en base + min-w-0 sur chaque item + le badge
            peut désormais retourner à la ligne (flex-wrap + max-w-full). */}
        <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,1.1fr)] lg:items-stretch">

          {/* Bloc intro */}
          <div className="min-w-0 overflow-hidden rounded-2xl bg-muted p-5 shadow-[0_4px_14px_rgba(34,29,23,0.05)] sm:p-7">
            <div className="mb-3 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">
              <ChefHat className="h-4 w-4 shrink-0" />
              <span className="break-words">{t('hero_badge')}</span>
            </div>
            <h1 className="break-words font-serif text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('page_title')}
            </h1>
            <div className="togo-underline" />
            <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
              {t('page_subtitle')}
            </p>
          </div>

          {/* Recherche & Filtres */}
          <div className="flex min-w-0 flex-col justify-between rounded-2xl bg-muted p-4 shadow-[0_4px_14px_rgba(34,29,23,0.05)] sm:p-5">
            <label className="flex min-h-12 min-w-0 items-center rounded-2xl bg-card px-3.5 shadow-[0_1px_4px_rgba(34,29,23,0.06)] transition-all focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => startTransition(() => setSearchInput(event.target.value))}
                placeholder={t('search_placeholder')}
                className="min-w-0 flex-1 bg-transparent px-3 text-xs font-medium outline-none placeholder:text-muted-foreground"
              />
            </label>

            <div className="mt-4 min-w-0">
              <div className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <Filter className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>{t('filter_category')}</span>
              </div>

              <div className="-mx-1 flex w-full min-w-0 gap-2 overflow-x-auto px-1 pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible">
                {categoryFilters.map((category) => {
                  const active = selectedCategory === category
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(34,29,23,0.1)]'
                          : 'bg-card text-foreground hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      <Utensils className="h-3 w-3 shrink-0" />
                      <span className="whitespace-nowrap">{getFilterLabel(category)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {searchInput && (
          <p className="break-words rounded-full bg-muted px-4 py-2.5 text-xs font-semibold text-muted-foreground">
            {t('results_for')} <span className="font-bold text-primary">{searchInput}</span>
          </p>
        )}

        {/* ── PLATS TRADITIONNELS ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="min-w-0">
              <h2 className="text-xl font-black text-foreground sm:text-2xl">Plats &amp; Délices du Terroir</h2>
              <span className="text-xs font-medium text-muted-foreground">
                {filteredPlats.length} {filteredPlats.length > 1 ? 'spécialités' : 'spécialité'}
              </span>
            </div>
          </div>

          {filteredPlats.length === 0 ? (
            <div className="mx-auto my-12 max-w-md rounded-2xl bg-muted p-8 text-center shadow-[0_4px_14px_rgba(34,29,23,0.05)]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <ChefHat className="h-6 w-6" />
              </div>
              <p className="mt-3 font-serif text-lg font-bold text-foreground">{t('no_plats')}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('try_other')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPlats.map((plat) => (
                <Link
                  key={plat.id}
                  href={`/cuisine/${plat.id}`}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl bg-card shadow-[0_4px_14px_rgba(34,29,23,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(34,29,23,0.12)] active:scale-[0.98]"
                >
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <Image
                      src={plat.image}
                      alt={tPlats(`${plat.id}.nom`)}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground shadow-sm">
                      {getCategoryName(plat.catégorie)}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between space-y-2 p-4">
                    <div className="min-w-0">
                      <h3 className="break-words font-bold leading-snug text-foreground">
                        {tPlats(`${plat.id}.nom`)}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {tPlats(`${plat.id}.description`)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <span className="text-xs font-semibold text-muted-foreground">{t('know_more')}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── RESTAURANTS ── */}
        {categoryRestaurants.length > 0 && (
          <section className="space-y-4 rounded-2xl bg-muted p-5 shadow-[0_4px_14px_rgba(34,29,23,0.05)] sm:p-7">
            <div className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-black text-foreground sm:text-2xl">
                  {selectedCategory === 'all' ? t('top_restaurants') : t('restaurants_available', { count: categoryRestaurants.length })}
                </h2>
                <p className="text-xs text-muted-foreground">Adresses recommandées pour déguster ces spécialités</p>
              </div>
              <span className="w-fit shrink-0 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase text-primary-foreground">
                {selectedCategory === 'all' ? t('selection') : getFilterLabel(selectedCategory)}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {categoryRestaurants.map((resto, index) => (
                <article key={resto.id} className="min-w-0 space-y-3 rounded-2xl bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-foreground">{resto.nom}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{resto.quartier || t('lome_area')}</span>
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-black text-primary">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      {resto.note || (4 + index * 0.1).toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="flex min-w-0 items-center gap-1 truncate text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" />
                      {resto.horaires || t('default_hours')}
                    </span>
                    <a
                      href={`https://maps.google.com/?q=${resto.lat},${resto.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground transition-all hover:brightness-110"
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
        <section className="space-y-4 rounded-3xl bg-card p-6 shadow-[0_4px_14px_rgba(34,29,23,0.05)]">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
            <Utensils className="h-4 w-4 shrink-0" />
            <span>Guide Gourmand du Voyageur</span>
          </div>
          <h2 className="break-words font-serif text-xl font-bold text-foreground">Comment savourer la cuisine togolaise comme un local</h2>
          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            <div className="min-w-0 space-y-1.5 rounded-2xl bg-muted p-4">
              <ChefHat className="h-5 w-5 text-primary" />
              <h3 className="text-xs font-bold text-foreground">L’art du Maquis &amp; du Bol d’eau</h3>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Avant de manger le Fufu ou l’Akoumé avec les doigts (main droite), on vous apportera toujours un bol d’eau tiède et du savon pour vous laver les mains.
              </p>
            </div>
            <div className="min-w-0 space-y-1.5 rounded-2xl bg-muted p-4">
              <Utensils className="h-5 w-5 text-primary" />
              <h3 className="text-xs font-bold text-foreground">Piment selon votre goût</h3>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Si vous craignez le piment fort, demandez toujours <em className="font-bold text-foreground">« sans piment direct »</em> ou demandez le piment noir (Shito/Yébéessé) servi à part dans une coupelle.
              </p>
            </div>
            <div className="min-w-0 space-y-1.5 rounded-2xl bg-muted p-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-xs font-bold text-foreground">Petits budgets, grands festins</h3>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Un copieux plat d’Ayimolou ou d’Ablo avec poisson coûte généralement entre 500 et 1 500 FCFA (0,80 € à 2,30 €). Ayez toujours de la petite monnaie.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}