'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Banknote, Navigation, Phone, Search, TreePine } from 'lucide-react'
import { useTranslations } from 'next-intl'
import parcs, { Parc } from '@/lib/data/parks'
import Badge from '@/components/ui/Badge'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'

const normalizeText = (text: string): string =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function ParcsZoosPage() {
  const t = useTranslations('Loisirs')
  const tParcs = useTranslations('Parcs')
  const [searchInput, setSearchInput] = useState('')

  const filteredParcs = useMemo(() => {
    const search = normalizeText(searchInput)
    return parcs.filter((parc: Parc) =>
      normalizeText(tParcs(`${parc.id}.nom`)).includes(search) ||
      normalizeText(tParcs(`${parc.id}.description`)).includes(search)
    )
  }, [searchInput, tParcs])

  // Région déduite de la latitude (découpage nord-sud du Togo).
  const getRegion = (lat: number): string => {
    if (lat > 10) return t('regions.savanes')
    if (lat > 9) return t('regions.kara')
    if (lat > 8) return t('regions.centrale')
    if (lat > 6.8) return t('regions.plateaux')
    return t('regions.maritime')
  }

  return (
    <main className="min-h-screen bg-background pb-32 pt-24 text-foreground">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHeader kicker={t('tag')} kickerIcon={TreePine} title={t('title')} subtitle={t('subtitle')} />

        <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative flex items-center sm:w-96">
            <span className="sr-only">{t('search_placeholder')}</span>
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('search_placeholder')}
              className="field pl-9"
            />
          </label>
          <span className="text-xs font-semibold text-muted-foreground">{t('parcs_found', { count: filteredParcs.length })}</span>
        </section>

        {filteredParcs.length === 0 ? (
          <EmptyState icon={TreePine} title={t('no_parcs')} description={t('try_other')} action={{ label: t('reset_search'), onClick: () => setSearchInput('') }} />
        ) : (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredParcs.map((parc: Parc) => {
              const name = tParcs(`${parc.id}.nom`)
              const hasPhone = parc.numero && parc.numero !== 'Non disponible'
              const phone = hasPhone ? parc.numero.split('/')[0].trim() : null

              return (
                <article key={parc.id} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-300 hover:shadow-lg">
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                    {parc.image ? (
                      <Image
                        src={parc.image}
                        alt={name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-forest/10 text-forest">
                        <TreePine className="h-12 w-12 opacity-60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent" />
                    <div className="absolute left-3 top-3">
                      <Badge variant="neutral">{getRegion(parc.lat)}</Badge>
                    </div>
                    <h2 className="absolute bottom-3 left-4 right-4 line-clamp-1 font-serif text-lg font-bold leading-snug text-white">{name}</h2>
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{tParcs(`${parc.id}.description`)}</p>

                    <div className="space-y-3 border-t border-border pt-4 text-sm">
                      <p className="flex items-start gap-2">
                        <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="line-clamp-2 font-medium">{tParcs(`${parc.id}.tarif`)}</span>
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        {phone ? (
                          <a href={`tel:${phone.replace(/\s+/g, '')}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary">
                            <Phone className="h-3.5 w-3.5 text-primary" />
                            {parc.numero}
                          </a>
                        ) : <span />}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${parc.lat},${parc.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline-brand min-h-9 px-3 text-xs"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          {t('rejoin')}
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}
