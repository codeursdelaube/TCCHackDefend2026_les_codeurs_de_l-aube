import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Banknote, ChefHat, ChevronRight, Flame, MapPin, Navigation, Phone, Soup, Star, Utensils } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import platsTogolais from '@/app/Plats/plat'
import restaurants from '@/app/Resto/restaurants'
import TTSButton from '@/app/_components/TTSButton'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function PlatDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'Cuisine' })
  const tPlats = await getTranslations({ locale: resolvedParams.locale, namespace: 'Plats' })
  const plat = platsTogolais.find((item) => item.id === resolvedParams.id)
  if (!plat) notFound()

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

  const suggestions = platsTogolais.filter((item) => item.catégorie === plat.catégorie && item.id !== plat.id).slice(0, 3)
  const nearbyRestaurants = restaurants.filter((restaurant) => restaurant.plats_ids.includes(plat.id))
  const platName = tPlats(`${plat.id}.nom`)
  const platDescription = tPlats(`${plat.id}.description`)
  const platHistory = tPlats(`${plat.id}.histoire`)
  const platAcc = tPlats(`${plat.id}.accompagnementsIdaux`)

  return (
    <main className="min-h-screen bg-base-100 pb-28 text-base-content">
      <section className="relative min-h-[62vh] overflow-hidden">
        <Image src={plat.image} alt={platName} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/78 via-black/25 to-black/40" />

        <div className="absolute left-4 right-4 top-20 z-10 mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/cuisine" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-card/90 px-4 text-sm font-black text-stone-950 shadow-sm transition-all hover:bg-card active:scale-95">
            <ArrowLeft className="h-5 w-5" />
            {t('back_to_cuisine')}
          </Link>
          <span className="rounded-2xl bg-secondary px-3 py-2 text-[11px] font-black uppercase tracking-wide text-secondary-content">{getCategoryName(plat.catégorie)}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-8">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-foreground/15 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white">
              <ChefHat className="h-4 w-4 text-secondary" />
              {t('cuisine_title')}
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-normal text-white sm:text-6xl">{platName}</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3 rounded-4xl border border-border bg-base-200 p-5 shadow-sm">
            <TTSButton text={`${platName}. ${platDescription}. ${platHistory}`} />
            <a href="#restaurants" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-secondary px-5 text-sm font-black text-secondary-content transition-all hover:-translate-y-0.5 active:scale-95">
              <Utensils className="h-5 w-5" />
              {t('find_nearby')}
            </a>
          </div>

          <article className="rounded-4xl border border-border bg-base-200 p-5 shadow-sm sm:p-7">
            <p className="m-0 text-lg font-bold leading-8 text-base-content/75">{platDescription}</p>
          </article>

          <article className="rounded-4xl border border-border bg-base-200 p-5 shadow-sm sm:p-7">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black tracking-normal"><Soup className="h-5 w-5 text-secondary" />{t('origin_tradition')}</h2>
            <p className="m-0 whitespace-pre-line text-sm font-medium leading-7 text-base-content/68">{platHistory}</p>
          </article>

          <article className="rounded-4xl border border-secondary/25 bg-secondary/10 p-5 shadow-sm sm:p-7">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-secondary"><Flame className="h-5 w-5" />{t('ideal_acc')}</h2>
            <p className="m-0 text-sm font-semibold leading-7 text-base-content/70">{platAcc}</p>
          </article>

          <article id="restaurants" className="scroll-mt-24 rounded-4xl border border-border bg-base-200 p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-black tracking-normal"><Utensils className="h-5 w-5 text-secondary" />{t('where_to_eat')}</h2>
              <span className="rounded-2xl border border-border bg-base-100 px-3 py-2 text-xs font-black text-base-content/60">{t('address_count', { count: nearbyRestaurants.length })}</span>
            </div>

            {nearbyRestaurants.length === 0 ? (
              <div className="rounded-xl border border-border bg-base-100 p-8 text-center">
                <Utensils className="mx-auto h-8 w-8 text-secondary" />
                <p className="mt-3 text-sm font-semibold text-base-content/55">{t('no_resto')}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {nearbyRestaurants.map((restaurant) => (
                  <article key={restaurant.id} className="rounded-xl border border-border bg-base-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-black">{restaurant.nom}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-base-content/55"><MapPin className="h-3.5 w-3.5 text-secondary" />{restaurant.quartier}</p>
                      </div>
                      {restaurant.note && <span className="inline-flex items-center gap-1 rounded-2xl border border-border bg-base-200 px-2.5 py-1 text-xs font-black"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />{restaurant.note}</span>}
                    </div>
                    <div className="mt-4 space-y-2 text-xs font-semibold text-base-content/60">
                      <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />{restaurant.adresse}</p>
                      <a href={`tel:${restaurant.telephone}`} className="flex items-center gap-2 transition-colors hover:text-secondary"><Phone className="h-3.5 w-3.5 text-secondary" />{restaurant.telephone}</a>
                      <p className="flex items-center gap-2"><Banknote className="h-3.5 w-3.5 text-secondary" />{restaurant.budget_fcfa} FCFA</p>
                    </div>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lng}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-black text-primary-content transition-all hover:-translate-y-0.5 active:scale-95 dark:bg-secondary dark:text-secondary-content">
                      <Navigation className="h-4 w-4" />
                      {t('navigate')}
                    </a>
                  </article>
                ))}
              </div>
            )}
          </article>

          {suggestions.length > 0 && (
            <article className="rounded-4xl border border-border bg-base-200 p-5 shadow-sm sm:p-7">
              <h2 className="mb-4 text-sm font-black uppercase tracking-wide text-base-content/50">{t('other_plats', { category: getCategoryName(plat.catégorie) })}</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {suggestions.map((suggestion) => (
                  <Link key={suggestion.id} href={`/cuisine/${suggestion.id}`} className="group overflow-hidden rounded-3xl border border-border bg-base-100 transition-all hover:-translate-y-1 hover:shadow-md">
                    <figure className="relative h-28 overflow-hidden bg-base-300">
                      <Image src={suggestion.image} alt={tPlats(`${suggestion.id}.nom`)} fill sizes="240px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </figure>
                    <div className="flex items-center justify-between gap-2 p-3">
                      <p className="line-clamp-1 text-xs font-black group-hover:text-secondary">{tPlats(`${suggestion.id}.nom`)}</p>
                      <ChevronRight className="h-4 w-4 shrink-0 text-secondary" />
                    </div>
                  </Link>
                ))}
              </div>
            </article>
          )}
        </div>

        <aside className="h-fit rounded-4xl border border-border bg-base-200 p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="mb-4 text-xs font-black uppercase tracking-wide text-base-content/50">{t('sheet_title')}</h2>
          <div className="space-y-3">
            {[
              { label: t('sheet.name'), value: platName },
              { label: t('sheet.category'), value: getCategoryName(plat.catégorie) },
              { label: t('sheet.origin'), value: t('origin_country') },
              { label: t('sheet.acc'), value: platAcc },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-base-100 p-4">
                <p className="text-[11px] font-black uppercase tracking-wide text-base-content/42">{item.label}</p>
                <p className="mt-1 line-clamp-3 text-sm font-bold leading-6 text-base-content/75">{item.value}</p>
              </div>
            ))}
          </div>
          <a href="#restaurants" className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-5 text-sm font-black text-secondary-content transition-all hover:-translate-y-0.5 active:scale-95">
            <Utensils className="h-5 w-5" />
            {t('view_restos')}
          </a>
        </aside>
      </section>
    </main>
  )
}
