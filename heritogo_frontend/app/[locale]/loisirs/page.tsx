'use client'

import { useState } from 'react'
import { Search, Sparkles, Navigation, Info, Phone, Banknote } from 'lucide-react'
import Image from 'next/image'
import parcs, { Parc } from '@/app/P&Z/pzo'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

export default function ParcsZoosPage() {
  const t = useTranslations('Loisirs')
  const tParcs = useTranslations('Parcs')
  const [searchInput, setSearchInput] = useState<string>('')

  const rawList: Parc[] = parcs;

  // Fonction utilitaire pour ignorer les accents et la casse
  const normaliserTexte = (texte: string): string => {
    return texte ? texte.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : ''
  }

  // Filtrage robuste et sécurisé avec le type Parc
  const filteredParcs = rawList.filter((parc: Parc) => {
    const parcNom = tParcs(`${parc.id}.nom`)
    const parcDescription = tParcs(`${parc.id}.description`)
    const rechercheNettoyee = normaliserTexte(searchInput)
    const matchesNom = normaliserTexte(parcNom).includes(rechercheNettoyee)
    const matchesDesc = normaliserTexte(parcDescription).includes(rechercheNettoyee)
    return matchesNom || matchesDesc
  })

  // Détermination de la région géographique selon la latitude
  const obtenirRegion = (lat: number): string => {
    if (lat > 10) return t('regions.savanes')
    if (lat > 9) return t('regions.kara')
    if (lat > 8) return t('regions.centrale')
    if (lat > 6.8) return t('regions.plateaux')
    return t('regions.maritime')
  }

  return (
    <main className="min-h-screen w-full bg-base-100 text-base-content pt-20 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Arrière-plan */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* En-tête */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> {t('tag')}
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
            {t('title')}
          </h1>
          <p className="text-sm text-base-content/60">
            {t('subtitle')}
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-md mx-auto relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-base-content/40">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-base-200 border border-base-content/10 rounded-2xl text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner text-base-content"
          />
        </div>

        {/* Grille de résultats */}
        {filteredParcs.length === 0 ? (
          <div className="bg-base-200/50 rounded-3xl border border-dashed border-base-content/10 p-12 text-center max-w-md mx-auto">
            <Info className="mx-auto text-base-content/20 mb-3" size={32} />
            <p className="text-sm font-bold text-base-content/50">{t('no_parcs')}</p>
            <p className="text-xs text-base-content/40 mt-1">
              {t('try_other')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParcs.map((parc: Parc) => {
              const regionText = obtenirRegion(parc.lat)
              
              // Sécurisation du numéro de téléphone
              const estNumeroValide = parc.numero && parc.numero !== "Non disponible"
              const telephoneBrut = estNumeroValide ? parc.numero.split('/')[0].trim() : null

              return (
                <motion.div
                  key={parc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-base-200 border border-base-content/10 rounded-3xl overflow-hidden shadow-lg flex flex-col group hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="w-full h-48 bg-base-300 relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent z-10" />
                    
                    {parc.image ? (
                      <Image 
                        src={parc.image} 
                        alt={tParcs(`${parc.id}.nom`)}
                        fill
                        placeholder="blur"
                        sizes="(max-w-7xl) 33vw, 100vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-secondary/20 text-primary text-4xl">
                        🌳
                      </div>
                    )}

                    <span className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border border-white/10 tracking-wider">
                      {regionText}
                    </span>
                  </div>

                  {/* Contenu */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h2 className="font-black text-lg tracking-tight leading-tight uppercase text-base-content group-hover:text-primary transition-colors">
                        {tParcs(`${parc.id}.nom`)}
                      </h2>
                      <p className="text-xs text-base-content/60 leading-relaxed line-clamp-3">
                        {tParcs(`${parc.id}.description`)}
                      </p>
                    </div>

                    {/* Tarifs et Actions */}
                    <div className="pt-3 border-t border-base-content/5 space-y-2">
                      
                      {tParcs(`${parc.id}.tarif`) && (
                        <div className="flex items-start gap-1.5 text-xs text-base-content/70 bg-base-300/40 p-2 rounded-xl border border-base-content/5">
                          <Banknote size={14} className="text-primary shrink-0 mt-0.5" />
                          <span className="leading-tight font-medium">{tParcs(`${parc.id}.tarif`)}</span>
                        </div>
                      )}

                      {telephoneBrut && (
                        <div className="flex items-center gap-1.5 text-xs text-base-content/50 px-0.5">
                          <Phone size={13} className="text-secondary shrink-0" />
                          <a href={`tel:${telephoneBrut.replace(/\s+/g, '')}`} className="hover:underline hover:text-primary transition-colors truncate">
                            {parc.numero}
                          </a>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 text-xs pt-1 px-0.5">
                        <span className="font-mono text-base-content/20 text-[9px] uppercase tracking-wider">
                          {t('gps_available')}
                        </span>
                        
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${parc.lat},${parc.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-bold text-primary hover:text-secondary transition-colors cursor-pointer"
                        >
                          <Navigation size={13} /> {t('rejoin')}
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}