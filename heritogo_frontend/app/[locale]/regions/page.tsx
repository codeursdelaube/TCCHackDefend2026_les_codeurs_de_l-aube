'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Globe2, MapPin, Users, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import AuthGuardLink from '@/components/AuthGuardLink'
import SiteCard from '@/components/ui/SiteCard'
import DishCard from '@/components/ui/DishCard'
import { useDishes, usePlaces } from '@/hooks/useCatalog'

interface TogoRegion {
  id: 'maritime' | 'plateaux' | 'centrale' | 'kara' | 'savanes'
  regionKey: 'Maritime' | 'Plateaux' | 'Centrale' | 'Kara' | 'Savanes'
  capitale: string
  image: string
}

const REGIONS: TogoRegion[] = [
  { id: 'maritime', regionKey: 'Maritime', capitale: 'Lomé', image: '/Sites/palais_de_lome.webp' },
  { id: 'plateaux', regionKey: 'Plateaux', capitale: 'Atakpamé', image: '/Sites/kpalimé.jpg' },
  { id: 'centrale', regionKey: 'Centrale', capitale: 'Sokodé', image: '/Sites/fazao_malfakassa.jpg' },
  { id: 'kara', regionKey: 'Kara', capitale: 'Kara', image: '/Sites/koutamakou.jpg' },
  { id: 'savanes', regionKey: 'Savanes', capitale: 'Dapaong', image: '/Sites/grottes_nok.jpg' },
]

export default function RegionsPage() {
  const t = useTranslations('Regions')
  const tHome = useTranslations('Accueil')
  const reduceMotion = useReducedMotion()
  const { places } = usePlaces()
  const { dishes } = useDishes()
  const [selectedRegion, setSelectedRegion] = useState<TogoRegion['id']>('maritime')
  const region = REGIONS.find((r) => r.id === selectedRegion) ?? REGIONS[0]
  const regionName = tHome(`regions.${region.id}.name`)

  const regionPlaces = useMemo(() => places.filter((m) => m.région === region.regionKey), [places, region.regionKey])
  // Seuls les plats dont la région est renseignée dans le catalogue sont rattachés.
  const allRegionDishes = useMemo(
    () => dishes.filter((d) => (d.region || '').toLowerCase().includes(region.regionKey.toLowerCase())),
    [dishes, region.regionKey],
  )
  const regionDishes = allRegionDishes.slice(0, 4)
  const unescoCount = regionPlaces.filter((p) => p.isUnesco).length

  const facts = [
    { value: regionPlaces.length, label: t('stat_sites') },
    { value: unescoCount, label: t('stat_unesco') },
    ...(allRegionDishes.length > 0 ? [{ value: allRegionDishes.length, label: t('stat_dishes') }] : []),
  ]

  return (
    <main className="min-h-screen bg-background pb-32 pt-24 text-foreground">
      <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-xl border border-border bg-[#171009]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={region.id}
              className="absolute inset-0 -z-10"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image src={region.image} alt="" fill priority sizes="(max-width: 1152px) 100vw, 1152px" className="object-cover opacity-70" />
              <div className="absolute inset-0 bg-linear-to-t from-[#171009] via-[#171009]/60 to-transparent" />
            </motion.div>
          </AnimatePresence>

          <div className="flex min-h-80 flex-col justify-end px-6 pb-8 pt-24 sm:px-10">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
              <Globe2 className="h-4 w-4" />
              {t('hero_badge')}
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#FBF6EF] sm:text-5xl">{regionName}</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#FBF6EF]/80 sm:text-base">{tHome(`regions.${region.id}.tag`)}</p>
          </div>
        </section>

        {/* Sélecteur de région */}
        <div className="sticky top-16 z-20 -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur-md sm:mx-0 sm:px-0">
          <div className="flex gap-1 overflow-x-auto scrollbar-none" role="tablist" aria-label={t('hero_badge')}>
            {REGIONS.map((r) => {
              const active = selectedRegion === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedRegion(r.id)}
                  className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tHome(`regions.${r.id}.name`)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <section className="rounded-xl border border-border bg-card p-6 sm:p-8 lg:col-span-8">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
              <MapPin className="h-3.5 w-3.5" />
              {t('capital', { name: region.capitale })}
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">{t('spirit', { name: regionName })}</h2>
            <p className="mt-4 text-base leading-relaxed text-foreground/85">{tHome(`regions.${region.id}.desc`)}</p>
          </section>

          <aside className="rounded-xl border border-border bg-card p-6 lg:col-span-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('facts_title')}</p>
            <dl className="mt-4 divide-y divide-border">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-baseline justify-between py-3">
                  <dt className="text-sm text-muted-foreground">{fact.label}</dt>
                  <dd className="font-serif text-2xl font-bold text-primary">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {regionPlaces.length > 0 && (
          <section>
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">{t('monuments_kicker')}</p>
                <h2 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">{t('monuments_title', { name: regionName })}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t('monuments_subtitle', { count: regionPlaces.length })}</p>
              </div>
              <Link href="/lieux" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                {t('see_all_sites', { count: places.length })}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regionPlaces.map((m) => (
                <SiteCard
                  key={m.id}
                  id={m.id}
                  nom={m.nom}
                  region={m.région}
                  localite={m.localite}
                  description={m.description}
                  image={m.image}
                  isUnesco={m.isUnesco}
                />
              ))}
            </div>
          </section>
        )}

        {regionDishes.length > 0 && (
          <section>
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <h2 className="font-serif text-2xl font-bold sm:text-3xl">{t('dishes_title', { name: regionName })}</h2>
              <Link href="/cuisine" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                {t('see_cuisine')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {regionDishes.map((d) => (
                <DishCard key={d.id} id={d.id} nom={d.nom} categorie={d.catégorie} description={d.description} image={d.image} />
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
          <div>
            <h2 className="font-serif text-xl font-bold">{t('cta_title', { name: regionName })}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('cta_sub')}</p>
          </div>
          <AuthGuardLink href="/guides" className="btn-brand shrink-0">
            <Users className="h-4 w-4" />
            {t('cta_button')}
          </AuthGuardLink>
        </section>
      </div>
    </main>
  )
}
