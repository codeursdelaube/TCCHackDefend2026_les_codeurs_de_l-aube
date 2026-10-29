'use client'

import Image, { StaticImageData } from 'next/image'
import { Link } from '@/i18n/navigation'
import { Headphones, MapPin, ArrowRight } from 'lucide-react'
import Badge from './Badge'
import { useTranslations } from 'next-intl'

interface SiteCardProps {
  id: string
  nom: string
  region: string
  localite: string
  description?: string
  image: string | StaticImageData
  isUnesco?: boolean
  priority?: boolean
}

export default function SiteCard({
  id,
  nom,
  region,
  localite,
  description,
  image,
  isUnesco = false,
  priority = false,
}: SiteCardProps) {
  const t = useTranslations('Lieux')

  return (
    <Link
      href={`/lieux/${id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        <Image
          src={image}
          alt={nom}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute left-3 top-3">
          {isUnesco ? <Badge variant="unesco">UNESCO</Badge> : <Badge variant="neutral">{region}</Badge>}
        </div>

        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="mb-0.5 flex items-center gap-1 text-xs font-medium text-white/85">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{localite}, {region}</span>
          </p>
          <h3 className="line-clamp-1 font-serif text-xl font-bold leading-snug text-white">{nom}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        {description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
            <Headphones className="h-3.5 w-3.5 text-primary" />
            {t('card_audio')}
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-primary">
            {t('card_discover')}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
