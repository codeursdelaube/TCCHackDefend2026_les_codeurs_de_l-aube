'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Banknote, Info, Navigation, Phone, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import parcs, { Parc } from '@/app/P&Z/pzo'

export default function ParcsZoosPage() {
  const t = useTranslations('Loisirs')
  const tParcs = useTranslations('Parcs')
  const [searchInput, setSearchInput] = useState('')

  const normalizeText = (text: string): string => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const filteredParcs = useMemo(() => {
    const search = normalizeText(searchInput)
    return parcs.filter((parc: Parc) =>
      normalizeText(tParcs(`${parc.id}.nom`)).includes(search) || normalizeText(tParcs(`${parc.id}.description`)).includes(search)
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
    <main className="min-h-screen bg-base-100 px-4 pb-28 pt-20 text-base-content sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div className="rounded-xl border border-border bg-base-200 p-5 shadow-sm sm:p-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-[11px] font-black uppercase tracking-wide text-secondary-content">
              <Navigation className="h-4 w-4" />
              {t('tag')}
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl">{t('title')}</h1>
            <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-base-content/65">{t('subtitle')}</p>
          </div>

          <div className="rounded-xl border border-border bg-base-200 p-4 shadow-sm">
            <div className="relative flex items-center rounded-xl border border-border bg-base-100 px-4 transition-all focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/15">
              <Search className="h-5 w-5 shrink-0 text-base-content/40" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('search_placeholder')}
                className="min-h-14 w-full bg-transparent px-3 text-sm font-semibold outline-none placeholder:text-base-content/38"
              />
            </div>
          </div>
        </div>

        {filteredParcs.length === 0 ? (
          <div className="mx-auto mt-8 max-w-md rounded-xl border border-border bg-base-200 p-8 text-center shadow-sm">
            <Info className="mx-auto h-8 w-8 text-secondary" />
            <p className="mt-4 text-lg font-black">{t('no_parcs')}</p>
            <p className="mt-2 text-sm font-medium text-base-content/55">{t('try_other')}</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  className={`group overflow-hidden rounded-xl border border-border bg-base-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${index === 0 ? 'lg:col-span-2' : ''}`}
                >
                  <figure className={`${index === 0 ? 'h-72' : 'h-56'} relative overflow-hidden bg-base-300`}>
                    {parc.image ? (
                      <Image src={parc.image} alt={tParcs(`${parc.id}.nom`)} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-base-100 text-base-content/35">
                        <Navigation className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/10 to-transparent" />
                    <span className="absolute right-4 top-4 rounded-2xl bg-secondary px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-secondary-content">{region}</span>
                  </figure>

                  <div className="p-5">
                    <h2 className="text-xl font-black leading-tight tracking-normal group-hover:text-secondary">{tParcs(`${parc.id}.nom`)}</h2>
                    <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-base-content/60">{tParcs(`${parc.id}.description`)}</p>

                    <div className="mt-5 space-y-3 border-t border-border pt-4">
                      <div className="flex items-start gap-2 rounded-xl border border-border bg-base-100 p-3 text-xs font-semibold leading-5 text-base-content/65">
                        <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                        {tParcs(`${parc.id}.tarif`)}
                      </div>

                      {phone && (
                        <a href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-xs font-bold text-base-content/60 transition-colors hover:text-secondary">
                          <Phone className="h-4 w-4 text-secondary" />
                          {parc.numero}
                        </a>
                      )}

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <span className="text-[10px] font-black uppercase tracking-wide text-base-content/40">{t('gps_available')}</span>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${parc.lat},${parc.lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-black text-primary-content transition-all hover:-translate-y-0.5 active:scale-95 dark:bg-secondary dark:text-secondary-content">
                          <Navigation className="h-4 w-4" />
                          {t('rejoin')}
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
    </main>
  )
}
