'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, Compass, Sparkles } from 'lucide-react'
import SitesTour from '@/app/LieuxT/site'

export default function ToutPage() {
  const [searchInput, setSearchInput] = useState('')
  const [, startTransition] = useTransition()

  const filteredSites = SitesTour.filter((site) => {
    if (!site?.nom) return false
    return site.nom.toLowerCase().includes(searchInput.toLowerCase())
  })

  const handleSearchChange = (value: string) => {
    startTransition(() => { setSearchInput(value) })
  }

  return (
    <main className="relative min-h-screen w-full bg-base-100 text-base-content
                     pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-x-hidden">

      {/* Halos décoratifs */}
      <div className="absolute top-10 left-1/4 w-[400px] h-[400px]
                      bg-green-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-125 h-125
                      bg-amber-500/5 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 container mx-auto">

        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tight text-base-content
                         sm:text-5xl uppercase flex items-center justify-center gap-3">
            <Compass className="text-green-500 h-8 w-8 animate-spin-slow" />
            <span>
              Découvrir le{' '}
              <span className="text-green-500">To</span>
              <span className="text-amber-500">go</span>
            </span>
          </h1>
          <p className="mt-3 text-base text-base-content/50 max-w-xl mx-auto">
            {"Explorez les richesses culturelles, historiques et naturelles de notre magnifique patrimoine national."}
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-md mx-auto mb-12 px-2">
          <div className="relative flex items-center bg-base-200
                          border border-base-content/10
                          focus-within:border-green-500/50
                          focus-within:ring-2 focus-within:ring-green-500/20
                          rounded-2xl overflow-hidden transition-all shadow-xl group">
            <div className="pl-4 text-base-content/40
                            group-focus-within:text-green-500 transition-colors">
              <Search size={20} />
            </div>
            <input
              type="search"
              defaultValue={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Rechercher un site touristique, une cascade..."
              className="w-full bg-transparent p-3.5 pl-3 text-sm
                         text-base-content placeholder:text-base-content/30
                         outline-none"
            />
          </div>

          {searchInput && (
            <p className="text-center text-xs italic text-base-content/40
                          mt-3 animate-fade-in">
              Résultats pour :{' '}
              <span className="text-green-500 font-semibold">{searchInput}</span>
            </p>
          )}
        </div>

        {/* Grille ou état vide */}
        {filteredSites.length === 0 ? (
          <div className="text-center py-20 bg-base-200 border border-base-content/5
                          rounded-3xl max-w-xl mx-auto">
            <Sparkles className="mx-auto h-8 w-8 text-amber-500/40 mb-3" />
            <p className="text-lg text-base-content/50 font-medium">
              Aucun site touristique trouvé
            </p>
            <p className="text-xs text-base-content/30 mt-1">
              Essayez une autre orthographe ou un autre mot-clé.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                          lg:grid-cols-4 gap-6 justify-items-center">
            {filteredSites.map((site) => (
              <div
                key={site.id}
                className="group bg-base-200 hover:bg-base-300 w-full max-w-xs
                           rounded-2xl border border-base-content/5
                           hover:border-base-content/10 shadow-xl hover:shadow-2xl
                           hover:-translate-y-1 transition-all duration-300
                           flex flex-col overflow-hidden"
              >
                {/* Image */}
                <figure className="relative w-full h-48 overflow-hidden bg-base-300">
                  <Image
                    src={site.image}
                    alt={site.nom}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700
                               ease-out group-hover:scale-105"
                  />
                  {/* Overlay image */}
                  <div className="absolute inset-0 bg-linear-to-t
                                  from-black/60 to-transparent" />

                  {/* Badge région */}
                  <span className="absolute top-3 right-3 badge bg-green-600
                                   border-none text-white font-bold text-[10px]
                                   tracking-wider uppercase px-2.5 py-1.5
                                   rounded-full shadow-lg">
                    {site.région}
                  </span>
                </figure>

                {/* Contenu */}
                <div className="p-5 flex flex-col justify-between grow gap-4">
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-base-content
                                   tracking-wide group-hover:text-green-500
                                   transition-colors line-clamp-1">
                      {site.nom}
                    </h2>

                    <p className="inline-flex items-center gap-1 text-xs
                                  text-amber-500 font-semibold
                                  bg-amber-400/10 px-2 py-0.5 rounded-md
                                  border border-amber-400/20">
                      <MapPin size={12} />
                      {site.localite}
                    </p>

                    <p className="text-sm text-base-content/60 line-clamp-3
                                  leading-relaxed pt-1">
                      {site.description}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="pt-3 border-t border-base-content/5
                                  flex justify-end">
                    <Link href={`/lieux/${site.id}`} className="w-full">
                      <button className="btn btn-sm btn-block rounded-xl
                                         border-none bg-base-content/5
                                         hover:bg-linear-to-r
                                         hover:from-green-500
                                         hover:to-emerald-600
                                         text-base-content/60
                                         hover:text-white transition-all
                                         duration-300 font-bold tracking-wide">
                        Découvrir
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}