'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Banknote, Info, Navigation, Phone, Search, TreePine, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import parcs, { Parc } from '@/app/P&Z/pzo'
import Badge from '@/components/ui/Badge'
import SectionHeader from '@/components/ui/SectionHeader'

export default function ParcsZoosPage() {
  const t = useTranslations('Loisirs')
  const tParcs = useTranslations('Parcs')
  const [searchInput, setSearchInput] = useState('')

  const normalizeText = (text: string): string =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const filteredParcs = useMemo(() => {
    const search = normalizeText(searchInput)
    return parcs.filter((parc: Parc) =>
      normalizeText(tParcs(`${parc.id}.nom`)).includes(search) ||
      normalizeText(tParcs(`${parc.id}.description`)).includes(search)
    )
  }, [searchInput, tParcs])

  const getRegion = (lat: number): string => {
    if (lat > 10) return t('regions.savanes')
    if (lat > 9) return t('regions.kara')
    if (lat > 8) return t('regions.centrale')
    if (lat > 6.8) return t('regions.plateaux')
    return t('regions.maritime')
  }

  return (
    <main className="min-h-screen bg-background pb-28 pt-8 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ── HEADER BANNER ── */}
        <section className="app-card relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-card via-card to-forest/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-forest dark:text-emerald-300">
                <TreePine className="h-4 w-4" />
                <span>{t('tag')}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                {t('title')}
              </h1>
              <div className="togo-underline" />
              <p className="text-sm sm:text-base font-medium leading-relaxed text-muted-foreground pt-1">
                {t('subtitle')}
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full lg:w-96 space-y-2">
              <div className="relative flex items-center rounded-2xl border border-border bg-card px-3.5 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="min-h-12 w-full bg-transparent px-3 text-sm font-medium outline-none placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-xs font-semibold text-muted-foreground text-right">
                {filteredParcs.length} parc{filteredParcs.length > 1 ? 's' : ''} & espace{filteredParcs.length > 1 ? 's' : ''} répertorié{filteredParcs.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </section>

        {/* ── LISTE DES PARCS ── */}
        <section className="space-y-6">
          <SectionHeader
            kicker="Nature & Safari"
            title="Espaces Verts, Réserves & Loisirs du Togo"
            icon={Sparkles}
          />

          {filteredParcs.length === 0 ? (
            <div className="app-card flex flex-col items-center justify-center p-12 text-center space-y-3">
              <TreePine className="h-10 w-10 text-primary opacity-60" />
              <h3 className="font-serif text-xl font-bold">{t('no_parcs')}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                {t('try_other')}
              </p>
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="mt-2 inline-flex items-center rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-dark"
              >
                Réinitialiser la recherche
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredParcs.map((parc: Parc, index) => {
                const region = getRegion(parc.lat)
                const hasPhone = parc.numero && parc.numero !== 'Non disponible'
                const phone = hasPhone ? parc.numero.split('/')[0].trim() : null

                return (
                  <motion.article
                    key={parc.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.18) }}
                    className="app-card group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="relative h-56 w-full overflow-hidden bg-muted">
                      {parc.image ? (
                        <Image
                          src={parc.image}
                          alt={tParcs(`${parc.id}.nom`)}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-forest/10 text-forest">
                          <TreePine className="h-12 w-12 opacity-60" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                      
                      <div className="absolute top-3 left-3">
                        <Badge variant="forest">{region}</Badge>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-serif text-lg font-bold text-white line-clamp-1 leading-snug">
                          {tParcs(`${parc.id}.nom`)}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                      <p className="line-clamp-3 text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                        {tParcs(`${parc.id}.description`)}
                      </p>

                      <div className="space-y-3 border-t border-border pt-4">
                        <div className="flex items-center gap-2 rounded-xl bg-muted/40 p-3 text-xs font-semibold text-foreground">
                          <Banknote className="h-4 w-4 text-primary shrink-0" />
                          <span className="line-clamp-1">{tParcs(`${parc.id}.tarif`)}</span>
                        </div>

                        {phone && (
                          <a
                            href={`tel:${phone.replace(/\s+/g, '')}`}
                            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5 text-primary" />
                            <span>{parc.numero}</span>
                          </a>
                        )}

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {t('gps_available')}
                          </span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${parc.lat},${parc.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition-all"
                          >
                            <Navigation className="h-3.5 w-3.5" />
                            <span>{t('rejoin')}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
