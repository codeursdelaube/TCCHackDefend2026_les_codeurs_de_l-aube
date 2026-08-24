'use client'

import Image, { StaticImageData } from 'next/image'
import { Banknote, MapPin, Phone, TreePine, Compass } from 'lucide-react'
import Badge from './Badge'

interface ParkCardProps {
  id: string
  nom: string
  region: string
  description: string
  image?: string | StaticImageData
  tarif?: string
  telephone?: string | null
}

export default function ParkCard({
  id,
  nom,
  region,
  description,
  image,
  tarif,
  telephone,
}: ParkCardProps) {
  return (
    <article className="app-card group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative h-52 w-full overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={nom}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-forest/10 text-forest">
            <TreePine className="h-12 w-12 opacity-60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        <div className="absolute top-3 left-3">
          <Badge variant="forest">{region}</Badge>
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

        <div className="space-y-2 border-t border-border pt-3">
          {tarif && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Banknote className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-semibold text-foreground line-clamp-1">{tarif}</span>
            </div>
          )}

          {telephone && (
            <div className="flex items-center justify-between pt-1">
              <a
                href={`tel:${telephone}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Phone className="h-3 w-3 text-primary" />
                <span>{telephone}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
