'use client'

import { Fragment, useMemo, useState, useTransition } from 'react'
import AdSlot from '@/components/ads/AdSlot'
import { ChefHat, MapPin, Search, Utensils, Navigation, Loader2, Phone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import restaurants from '@/lib/data/restaurants'
import DishCard from '@/components/ui/DishCard'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { useDishes } from '@/hooks/useCatalog'

export default function CuisinePage() {
  const t = useTranslations('Cuisine')
  const { dishes, loading } = useDishes()
  const [searchInput, setSearchInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [, startTransition] = useTransition()

  // Catégories issues des données réelles (déjà localisées par l'API).
  const categories = useMemo(
    () => ['all', ...Array.from(new Set(dishes.map((d) => d.catégorie).filter(Boolean)))],
    [dishes],
  )

  const filteredPlats = dishes.filter((plat) => {
    const search = searchInput.trim().toLowerCase()
    const matchesSearch =
      !search ||
      plat.nom.toLowerCase().includes(search) ||
      plat.description.toLowerCase().includes(search) ||
      plat.catégorie.toLowerCase().includes(search)
    const matchesCategory = selectedCategory === 'all' || plat.catégorie === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredRestaurants = restaurants.slice(0, 4)

  const resetFilters = () => {
    setSearchInput('')
    setSelectedCategory('all')
  }

  return (
    <main className="min-h-screen bg-background pb-32 pt-24 text-foreground">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHeader
          kicker={t('hero_badge')}
          kickerIcon={ChefHat}
          title={t('page_title')}
          subtitle={t('page_subtitle')}
          image="/fufuhero.webp"
        />

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
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t('specialties_label')}>
            {categories.map((category) => {
              const active = selectedCategory === category
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={active}
                  onClick={() => startTransition(() => setSelectedCategory(category))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground/80 hover:border-primary/50'
                  }`}
                >
                  {category === 'all' ? t('all') : category}
                </button>
              )
            })}
          </div>
          <span className="text-xs font-semibold text-muted-foreground lg:text-right">
            {t('results_count', { count: filteredPlats.length })}
          </span>
        </section>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPlats.length === 0 ? (
          <EmptyState icon={ChefHat} title={t('empty_search')} description={t('try_other')} action={{ label: t('reset_filters'), onClick: resetFilters }} />
        ) : (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPlats.map((plat, index) => (
              <Fragment key={plat.id}>
                <DishCard
                  id={plat.id}
                  nom={plat.nom}
                  categorie={plat.catégorie}
                  description={plat.description}
                  image={plat.image}
                  region={plat.region || undefined}
                />
                {index === 7 && (
                  <div className="col-span-full">
                    <AdSlot slot="dishes-list-slot" format="auto" />
                  </div>
                )}
              </Fragment>
            ))}
          </section>
        )}

        {featuredRestaurants.length > 0 && (
          <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-2 border-b border-border pb-4 sm:flex-row sm:items-end">
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <Utensils className="h-3.5 w-3.5" />
                  {t('restaurants_kicker')}
                </p>
                <h2 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">{t('restaurants_title')}</h2>
              </div>
              <p className="text-xs text-muted-foreground">{t('restaurants_sub')}</p>
            </div>

            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredRestaurants.map((resto) => (
                <li key={resto.id} className="flex flex-col justify-between rounded-lg border border-border p-4">
                  <div>
                    <h3 className="line-clamp-1 font-serif text-base font-bold">{resto.nom}</h3>
                    <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="line-clamp-2">{resto.adresse}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                      {resto.quartier && <span className="rounded-md bg-muted px-2 py-0.5 font-medium">{resto.quartier}</span>}
                      {resto.budget_fcfa && <span className="rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary">{resto.budget_fcfa} FCFA</span>}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                    {resto.telephone ? (
                      <a href={`tel:${resto.telephone}`} className="inline-flex items-center gap-1 font-semibold hover:text-primary">
                        <Phone className="h-3 w-3 text-primary" />
                        {resto.telephone}
                      </a>
                    ) : <span />}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${resto.nom} ${resto.adresse}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold hover:text-primary"
                    >
                      {t('directions')}
                      <Navigation className="h-3 w-3 text-primary" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
