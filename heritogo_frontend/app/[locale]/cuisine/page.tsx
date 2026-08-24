'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import { ChefHat, Filter, MapPin, Search, Utensils, Sparkles, Navigation, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import platsTogolais from '@/app/Plats/plat'
import restaurants from '@/app/Resto/restaurants'
import DishCard from '@/components/ui/DishCard'
import SectionHeader from '@/components/ui/SectionHeader'

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
      case 'Wagasi': return 'Wagasi (Fromage)'
      case 'Gombo': return 'Gombo (Fétri)'
      case 'Boissons': return 'Boissons locales'
      default: return category
    }
  }

  const filteredPlats = platsTogolais.filter((plat) => {
    const platName = tPlats(`${plat.id}.nom`).toLowerCase()
    const platDescription = tPlats(`${plat.id}.description`).toLowerCase()
    const search = searchInput.toLowerCase()
    const matchesSearch =
      platName.includes(search) ||
      platDescription.includes(search) ||
      plat.catégorie.toLowerCase().includes(search)
    const matchesCategory =
      selectedCategory === 'all' || platName.includes(selectedCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

  const featuredRestaurants = useMemo(() => {
    return restaurants.slice(0, 4)
  }, [])

  return (
    <main className="min-h-screen bg-background pb-28 pt-8 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ── HEADER & SEARCH BANNER ── */}
        <section className="app-card relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-card via-card to-primary/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <ChefHat className="h-4 w-4" />
                <span>{t('hero_badge')}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                {t('page_title')}
              </h1>
              <div className="togo-underline" />
              <p className="text-sm sm:text-base font-medium leading-relaxed text-muted-foreground pt-1">
                {t('page_subtitle')}
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full lg:w-96 space-y-2">
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
              <p className="text-xs font-semibold text-muted-foreground text-right">
                {filteredPlats.length} spécialité{filteredPlats.length > 1 ? 's' : ''} togolaise{filteredPlats.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              <span>Spécialités :</span>
            </span>
            {categoryFilters.map((category) => {
              const active = selectedCategory === category
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => startTransition(() => setSelectedCategory(category))}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'border border-border bg-card text-foreground hover:border-primary/50'
                  }`}
                >
                  {getFilterLabel(category)}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── GRILLE DES PLATS ── */}
        <section className="space-y-6">
          <SectionHeader
            kicker="Terroir & Saveurs"
            title="Spécialités Emblématiques du Togo"
            subtitle="Explorez les recettes traditionnelles, sauces riches et street-food légendaire du pays."
            icon={Sparkles}
          />

          {filteredPlats.length === 0 ? (
            <div className="app-card flex flex-col items-center justify-center p-12 text-center space-y-3">
              <ChefHat className="h-10 w-10 text-primary opacity-60" />
              <h3 className="font-serif text-xl font-bold">{t('empty_search')}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                {t('try_other')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setSelectedCategory('all')
                }}
                className="mt-2 inline-flex items-center rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-dark"
              >
                {t('reset_filters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPlats.map((plat) => (
                <DishCard
                  key={plat.id}
                  id={plat.id}
                  nom={tPlats(`${plat.id}.nom`)}
                  categorie={plat.catégorie}
                  description={tPlats(`${plat.id}.description`)}
                  image={plat.image}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── RESTAURANTS & MAQUIS EN VEDETTE ── */}
        <section className="app-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Utensils className="h-3.5 w-3.5" />
                <span>Bonnes Tables</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                Où déguster la gastronomie togolaise ?
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              Maquis authentiques & restaurants renommés
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredRestaurants.map((resto) => (
              <div
                key={resto.id}
                className="app-card flex flex-col justify-between p-4 bg-muted/40 border-border"
              >
                <div className="space-y-2">
                  <h3 className="font-serif text-base font-bold text-foreground line-clamp-1">
                    {resto.nom}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate">{resto.adresse}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {resto.quartier && (
                      <span className="rounded-full bg-card border border-border px-2.5 py-0.5 text-[10px] font-semibold text-foreground">
                        {resto.quartier}
                      </span>
                    )}
                    {resto.budget_fcfa && (
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        {resto.budget_fcfa} FCFA
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="font-bold text-primary">{resto.telephone || 'Lomé, Togo'}</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resto.nom + ' ' + resto.adresse)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    <span>GPS</span>
                    <Navigation className="h-3 w-3 text-primary" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}