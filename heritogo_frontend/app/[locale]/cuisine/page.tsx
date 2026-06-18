'use client'

/**
 * Page Cuisine
 * Liste des plats togolais avec :
 * - Recherche de plats
 * - Filtrage par catégorie
 * - Liste des restaurants proposant chaque plat
 */
import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Search, Utensils, ChefHat, Sparkles, Star, MapPin, Clock, Navigation } from 'lucide-react'
import platsTogolais from '@/app/Plats/plat'
import restaurants from '@/app/Resto/restaurants'
import { useTranslations } from 'next-intl'

export default function CuisinePage() {
  const t = useTranslations('Cuisine')
  const tPlats = useTranslations('Plats')
  const [searchInput, setSearchInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [, startTransition] = useTransition()

  const categories = [
    { id: 'all', name: t('all'), icon: '🍽️' },
    { id: 'Ayimolou', name: 'Ayimolou', icon: '🥘' },
    { id: 'Fufu', name: 'Fufu', icon: '🍠' },
    { id: 'Djenkoumé', name: 'Djenkoumé', icon: '🌾' },
    { id: 'Gboma', name: 'Gboma', icon: '🥬' },
    { id: 'Akoumé', name: 'Akoumé', icon: '🌾' },
  ]

  const filteredPlats = platsTogolais.filter((plat) => {
    const platNom = tPlats(`${plat.id}.nom`)
    const matchesNom = platNom.toLowerCase().includes(searchInput.toLowerCase())
    const matchesCategorie = plat.catégorie.toLowerCase().includes(searchInput.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || platNom.toLowerCase().includes(selectedCategory.toLowerCase())
    return (matchesNom || matchesCategorie) && matchesCategory
  })

  const handleSearchChange = (value: string) => {
    startTransition(() => { setSearchInput(value) })
  }

  const getCategoryName = (cat: string): string => {
    switch (cat) {
      case 'Accompagnement': return t('categories.accompagnement')
      case 'Plat Principal': return t('categories.plat_principal')
      case 'Street Food': return t('categories.street_food')
      case 'Sauce': return t('categories.sauce')
      default: return cat
    }
  }

  // Get restaurants for selected category
  const categoryRestaurants = selectedCategory === 'all' 
    ? restaurants.slice(0, 4)
    : restaurants.filter(r => r.plats_ids.some(pid => {
        const plat = platsTogolais.find(p => p.id === pid)
        const platNom = plat ? tPlats(`${plat.id}.nom`) : ''
        return plat && platNom.toLowerCase().includes(selectedCategory.toLowerCase())
      }))

  return (
    <main className="relative min-h-screen w-full bg-base-100 text-base-content
                     pt-20 pb-24 px-4 overflow-x-hidden">

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="text-orange-500 h-6 w-6" />
            <h1 className="text-2xl font-black text-base-content">
              {t('page_title')}
            </h1>
          </div>
          <p className="text-sm text-base-content/60">
            {t('page_subtitle')}
          </p>
        </div>

        {/* Catégories scrollables */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                  : 'bg-base-200 border-base-content/10 text-base-content/70 hover:bg-base-content/5'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-medium">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Section restaurants pour la catégorie */}
        {selectedCategory !== 'all' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-base-content">
                {selectedCategory} - {t('restaurants_available', { count: categoryRestaurants.length })}
              </h2>
            </div>

            <div className="space-y-4">
              {categoryRestaurants.map((resto) => (
                <div
                  key={resto.id}
                  className="bg-base-100 rounded-3xl p-4 border border-base-content/10 shadow-sm"
                >
                  {/* En-tête restaurant */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-base-content mb-1">
                        {resto.nom}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(resto.note || 4)].map((_, i) => (
                            <Star key={i} size={14} className="text-orange-400 fill-orange-400" />
                          ))}
                        </div>
                        <span className="text-xs text-base-content/50">
                          {resto.note || 4.5} ★
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-base-content/60">
                        <span className="text-orange-500 font-semibold">
                          {'$'.repeat(Math.floor(Number(resto.budget_fcfa || 5000) / 5000))}
                        </span>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-red-500" />
                          <span>{(Math.random() * 2 + 0.3).toFixed(1)} km</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges plats */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {resto.plats_ids.slice(0, 3).map((pid) => {
                      const plat = platsTogolais.find(p => p.id === pid)
                      return plat ? (
                        <span
                          key={pid}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-base-100 border border-base-content/10 text-base-content/70"
                        >
                          <span className="text-orange-500">•</span>
                          {tPlats(`${plat.id}.nom`)}
                        </span>
                      ) : null
                    })}
                  </div>

                  {/* Horaires et bouton */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-base-content/50">
                      <Clock size={12} />
                      <span>{resto.horaires || '07h-22h'}</span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${resto.lat},${resto.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-green-500 text-white hover:bg-green-600 active:scale-95 transition-all duration-200"
                    >
                      <Navigation size={14} />
                      {t('directions')}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative flex items-center bg-base-100
                          border border-base-content/10
                          focus-within:border-orange-500/50
                          rounded-2xl overflow-hidden transition-all">
            <div className="pl-4 text-base-content/40">
              <Search size={18} />
            </div>
            <input
              type="search"
              defaultValue={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full bg-transparent p-3 pl-3 text-sm
                         text-base-content placeholder:text-base-content/30
                         outline-none"
            />
          </div>
        </div>

        {/* Grille des plats */}
        {filteredPlats.length === 0 ? (
          <div className="text-center py-20 bg-base-200 border border-base-content/5
                          rounded-3xl max-w-xl mx-auto">
            <Sparkles className="mx-auto h-8 w-8 text-amber-500/40 mb-3" />
            <p className="text-lg text-base-content/50 font-medium">
              {t('no_plats')}
            </p>
            <p className="text-xs text-base-content/30 mt-1">
              {t('try_other')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                          lg:grid-cols-4 gap-4">
            {filteredPlats.map((plat) => (
              <Link key={plat.id} href={`/cuisine/${plat.id}`}>
                <div className="group bg-base-200 hover:bg-base-300 w-full
                           rounded-2xl border border-base-content/5
                           hover:border-base-content/10 shadow-sm hover:shadow-md
                           transition-all duration-300
                           flex flex-col overflow-hidden">
                  {/* Image */}
                  <figure className="relative w-full h-36 overflow-hidden bg-base-300">
                    <Image
                      src={plat.image}
                      alt={tPlats(`${plat.id}.nom`)}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500
                                 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t
                                    from-black/40 to-transparent" />
                  </figure>

                  {/* Contenu */}
                  <div className="p-4">
                    <h2 className="text-sm font-bold text-base-content tracking-wide
                                   group-hover:text-orange-500 transition-colors
                                   line-clamp-1 mb-2">
                      {tPlats(`${plat.id}.nom`)}
                    </h2>

                    <p className="text-xs text-base-content/60 line-clamp-2
                                  leading-relaxed">
                      {tPlats(`${plat.id}.description`)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}