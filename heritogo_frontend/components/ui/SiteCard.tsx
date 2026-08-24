'use client'

import Image, { StaticImageData } from 'next/image'
import { Link } from '@/i18n/navigation'
import { Headphones, MapPin, ArrowRight } from 'lucide-react'
import StarRating from './StarRating'
import Badge from './Badge'
import { getSiteRating } from '@/lib/constants/ratings'

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
  const ratingData = getSiteRating(id)
  const isKoutammakou = isUnesco || id === 'koutamakou'

  return (
    <Link
      href={`/lieux/${id}`}
      className="app-card group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Photo Header */}
      <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-muted">
        <Image
          src={image}
          alt={nom}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Badges on top */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {isKoutammakou ? (
            <Badge variant="unesco">✦ UNESCO</Badge>
          ) : (
            <Badge variant="neutral">{region}</Badge>
          )}

          <div className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md">
            <Headphones className="h-3 w-3 text-accent" />
            <span>Audio</span>
          </div>
        </div>

        {/* Name & Localite in overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-200/90 mb-0.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{localite}, {region}</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-snug line-clamp-1 drop-shadow-sm">
            {nom}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        {description && (
          <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <StarRating rating={ratingData.rating} count={ratingData.count} />

          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:text-primary-dark transition-colors">
            <span>Découvrir</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}
