'use client'

import Image, { StaticImageData } from 'next/image'
import { Link } from '@/i18n/navigation'
import { Utensils, ArrowRight, Flame } from 'lucide-react'
import Badge from './Badge'

interface DishCardProps {
  id: string
  nom: string
  categorie: string
  description: string
  image: string | StaticImageData
  region?: string
}

export default function DishCard({
  id,
  nom,
  categorie,
  description,
  image,
  region,
}: DishCardProps) {
  return (
    <Link
      href={`/cuisine/${id}`}
      className="app-card group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-muted">
        <Image
          src={image}
          alt={nom}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <Badge variant="primary">{categorie}</Badge>
          {region && (
            <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-md">
              {region}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-serif text-lg font-bold text-white line-clamp-1 leading-snug">
            {nom}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <Flame className="h-3.5 w-3.5" />
            <span>Recette & Maquis</span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:text-primary-dark transition-colors">
            <span>Voir</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}
