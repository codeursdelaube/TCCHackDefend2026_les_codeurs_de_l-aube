import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Banknote, ChefHat, ChevronRight, Flame, MapPin, Navigation, Phone, Soup, Utensils } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import platsTogolais from '@/app/Plats/plat'
import restaurants from '@/app/Resto/restaurants'
import TTSButton from '@/app/_components/TTSButton'
import Badge from '@/components/ui/Badge'
import StarRating from '@/components/ui/StarRating'

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
    <main className="min-h-screen bg-background pb-28 pt-8 text-foreground">
      {/* ── HERO BANNER ── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative h-80 sm:h-96 md:h-[420px] w-full overflow-hidden rounded-3xl border border-border shadow-lg">
          <Image
            src={plat.image}
            alt={platName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

          {/* Top Bar inside Hero */}
          <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between">
            <Link
              href="/cuisine"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('back_to_cuisine')}</span>
            </Link>
            <Badge variant="primary">{getCategoryName(plat.catégorie)}</Badge>
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-10 text-white space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-200">
              <ChefHat className="h-4 w-4" />
              <span>Gastronomie Togolaise Authentique</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight text-[#FBF6EF] drop-shadow-sm">
              {platName}
            </h1>
          </div>
        </div>
      </div>

      {/* ── CORPS DE LA FICHE ── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          
          <div className="space-y-6 lg:col-span-8">
            {/* Barre d'action rapide */}
            <div className="app-card flex flex-wrap items-center justify-between gap-3 p-4">
              <TTSButton text={`${platName}. ${platDescription}. ${platHistory}`} />
              <a
                href="#restaurants"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition-all"
              >
                <Utensils className="h-4 w-4" />
                <span>{t('find_nearby')}</span>
              </a>
            </div>

            {/* Description générale */}
            <article className="app-card p-6 sm:p-8 space-y-3">
              <h2 className="font-serif text-xl font-bold text-foreground">Saveurs &amp; Texture</h2>
              <p className="text-sm sm:text-base font-medium leading-relaxed text-muted-foreground">
                {platDescription}
              </p>
            </article>

            {/* Origine & Histoire */}
            <article className="app-card p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-2 text-primary font-serif text-xl font-bold text-foreground">
                <Soup className="h-5 w-5 text-primary" />
                <h2>{t('origin_tradition')}</h2>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground font-medium">
                {platHistory}
              </p>
            </article>

            {/* Accompagnements idéaux */}
            <article className="app-card p-6 border-accent/40 bg-accent/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8A3A20] dark:text-amber-200">
                <Flame className="h-4 w-4 text-accent" />
                <h3>{t('ideal_acc')}</h3>
              </div>
              <p className="text-sm font-semibold text-foreground leading-relaxed">
                {platAcc}
              </p>
            </article>

            {/* Restaurants associés */}
            <article id="restaurants" className="app-card p-6 sm:p-8 space-y-6 scroll-mt-24">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  <h2 className="font-serif text-xl font-bold text-foreground">{t('where_to_eat')}</h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {t('address_count', { count: nearbyRestaurants.length })}
                </span>
              </div>

              {nearbyRestaurants.length === 0 ? (
                <div className="rounded-2xl border border-border bg-muted/40 p-8 text-center space-y-2">
                  <Utensils className="mx-auto h-8 w-8 text-primary opacity-60" />
                  <p className="text-sm font-semibold text-muted-foreground">{t('no_resto')}</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {nearbyRestaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="app-card p-5 space-y-3 bg-muted/30 border-border"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-base font-bold text-foreground">{restaurant.nom}</h3>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{restaurant.quartier}</span>
                          </p>
                        </div>
                        {restaurant.note && (
                          <StarRating rating={restaurant.note} size="sm" showCount={false} />
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                        <p className="flex items-start gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="truncate">{restaurant.adresse}</span>
                        </p>
                        <p className="flex items-center gap-1.5 font-bold text-primary">
                          <Banknote className="h-3.5 w-3.5" />
                          <span>Budget ~ {restaurant.budget_fcfa} FCFA</span>
                        </p>
                      </div>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition-all mt-2"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        <span>{t('navigate')}</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </article>

            {/* Suggestions d'autres plats */}
            {suggestions.length > 0 && (
              <section className="space-y-4 pt-4">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  {t('other_plats', { category: getCategoryName(plat.catégorie) })}
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {suggestions.map((suggestion) => (
                    <Link
                      key={suggestion.id}
                      href={`/cuisine/${suggestion.id}`}
                      className="app-card group overflow-hidden transition-all hover:shadow-md"
                    >
                      <div className="relative h-32 overflow-hidden bg-muted">
                        <Image
                          src={suggestion.image}
                          alt={tPlats(`${suggestion.id}.nom`)}
                          fill
                          sizes="240px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3">
                        <p className="line-clamp-1 text-xs font-bold font-serif text-foreground group-hover:text-primary transition-colors">
                          {tPlats(`${suggestion.id}.nom`)}
                        </p>
                        <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── ASIDE FICHE SYNTHÈSE ── */}
          <aside className="app-card p-6 lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <h2 className="font-serif text-lg font-bold text-foreground">{t('sheet_title')}</h2>
            <div className="space-y-3 text-xs">
              <div className="rounded-2xl border border-border bg-muted/40 p-3.5">
                <p className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">{t('sheet.name')}</p>
                <p className="mt-1 font-bold text-foreground font-serif text-sm">{platName}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-3.5">
                <p className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">{t('sheet.category')}</p>
                <p className="mt-1 font-bold text-foreground text-sm">{getCategoryName(plat.catégorie)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-3.5">
                <p className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">{t('sheet.origin')}</p>
                <p className="mt-1 font-bold text-foreground text-sm">{t('origin_country')}</p>
              </div>
            </div>

            <a
              href="#restaurants"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-xs font-bold text-white shadow-md hover:bg-primary-dark transition-all"
            >
              <Utensils className="h-4 w-4" />
              <span>{t('view_restos')}</span>
            </a>
          </aside>

        </div>
      </div>
    </main>
  )
}
