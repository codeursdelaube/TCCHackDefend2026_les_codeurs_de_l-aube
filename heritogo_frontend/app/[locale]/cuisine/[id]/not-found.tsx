import { ChefHat } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function CuisineNotFound() {
  const t = await getTranslations('Cuisine')

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 pb-28 pt-20">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <ChefHat className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-foreground">{t('no_plats')}</h1>
        <p className="text-sm text-muted-foreground">{t('try_other')}</p>
        <Link
          href="/cuisine"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white"
        >
          {t('back_to_cuisine')}
        </Link>
      </div>
    </main>
  )
}
