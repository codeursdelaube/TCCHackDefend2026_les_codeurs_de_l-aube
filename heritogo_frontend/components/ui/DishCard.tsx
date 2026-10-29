'use client'

import Image, { StaticImageData } from 'next/image'
import { Link } from '@/i18n/navigation'
import { ArrowRight, MapPin } from 'lucide-react'
import Badge from './Badge'
import { useTranslations } from 'next-intl'

interface DishCardProps {
  id: string
  nom: string
  categorie: string
  description: string
  image: string | StaticImageData
  region?: string
}

export default function DishCard({ id, nom, categorie, description, image, region }: DishCardProps) {
  const t = useTranslations('Cuisine')
  return (
    <Link
      href={`/cuisine/${id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        <Image
          src={image}
          alt={nom}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge variant="neutral">{categorie}</Badge>
        </div>
        <h3 className="absolute bottom-3 left-4 right-4 line-clamp-1 font-serif text-lg font-bold leading-snug text-white">{nom}</h3>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
          {region ? (
            <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {region}
            </span>
          ) : <span />}
          <span className="inline-flex items-center gap-1 font-bold text-primary">
            {t('card_see')}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
