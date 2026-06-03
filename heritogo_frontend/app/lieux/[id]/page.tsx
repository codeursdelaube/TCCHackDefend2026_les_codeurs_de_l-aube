'use client'

import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Compass, ShieldAlert, Navigation } from 'lucide-react'

import { monuments } from '@/app/LieuxT/site' // Importation de ton tableau exporté
import dynamic from 'next/dynamic'

// 🚨 CORRECTION : On importe le composant Carte.tsx de manière asynchrone à l'EXTÉRIEUR du render
const MapNoSSR = dynamic(() => import("@/app/_components/Carte"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] rounded-2xl bg-base-300 flex items-center justify-center border border-base-content/10">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-base-content/50 font-medium">Chargement de la carte locale...</p>
      </div>
    </div>
  ),
});

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SiteDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  
  // Recherche du monument spécifique dans ton tableau
  const site = monuments.find((m) => m.id === resolvedParams.id)
  if (!site) notFound()

  return (
    <main className="relative min-h-screen w-full bg-base-100 text-base-content
                     pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-x-hidden">

      {/* Halos décoratifs */}
      <div className="absolute top-1/3 left-1/4 w-125 h-125 bg-green-500/5 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-100 h-100 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 container mx-auto max-w-6xl">

        {/* Bouton Retour */}
        <Link
          href="/lieux"
          className="btn btn-ghost btn-sm text-base-content/50 hover:text-base-content hover:bg-base-content/5 rounded-full mb-6 inline-flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={16} />
          Retour aux sites
        </Link>

        {/* Conteneur principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start bg-base-200 border border-base-content/10 shadow-2xl rounded-3xl p-5 sm:p-6 md:p-8">

          {/* COLONNE GAUCHE : Image & Carte locale */}
          <div className="space-y-6 w-full">
            <div className="relative w-full h-80 sm:h-96 md:h-112 rounded-2xl overflow-hidden shadow-2xl border border-base-content/5 group bg-base-300">
              <Image
                src={site.image}
                alt={site.nom}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 badge bg-green-600 border-none text-white font-bold text-xs tracking-wider uppercase px-3 py-2 rounded-full shadow-lg">
                Région {site.région}
              </span>
            </div>

            {/* INTEGRATION DE LA CARTE ICI */}
            <div className="rounded-2xl overflow-hidden border border-base-content/10 shadow-lg bg-base-300 p-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/40 mb-2 px-2 flex items-center gap-2">
                <MapPin size={12} className="text-green-500" /> Emplacement géographique
              </h3>
              
              {/* On encapsule l'unique monument actuel dans un tableau [site] */}
              <MapNoSSR monumentsList={[site]} />
            </div>
          </div>

          {/* COLONNE DROITE : Infos */}
          <div className="flex flex-col justify-between h-full space-y-6 lg:pt-2">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 tracking-wider uppercase bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-xl">
                <MapPin size={14} />
                <span>{site.localite}</span>
                <span className="text-base-content/20">•</span>
                <span className="text-base-content/40 font-medium lowercase italic">Togo</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-base-content mt-4 mb-4 uppercase">
                {site.nom}
              </h1>

              <div className="h-px w-full bg-gradient-to-r from-base-content/10 to-transparent my-4" />

              <div className="bg-base-300 rounded-2xl p-4 border border-base-content/5 mb-6 shadow-inner">
                <p className="text-base-content/60 text-sm leading-relaxed italic">
                  {site.description}
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-lg font-black text-green-500 uppercase tracking-wide flex items-center gap-2">
                  <Compass size={18} className="animate-pulse" />
                  Histoire & Patrimoine
                </h2>
                <p className="text-base-content/70 text-justify leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">
                  {site.histoire}
                </p>
              </div>
            </div>

            {/* Pied : GPS + CTA */}
            <div className="pt-6 border-t border-base-content/5 mt-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-base-content/40 font-medium flex items-center gap-2">
                <ShieldAlert size={14} className="text-base-content/30" />
                <span>
                  Coordonnées GPS :{' '}
                  <span className="font-mono bg-base-300 text-base-content/70 border border-base-content/10 px-2 py-1 rounded-md ml-1">
                    {Number(site.lat).toFixed(4)}, {Number(site.lng).toFixed(4)}
                  </span>
                </span>
              </div>

              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${site.lat},${site.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <button className="w-full sm:w-auto btn rounded-xl border-none bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-green-600/10 flex items-center justify-center gap-2 px-5 py-3">
                  <Navigation size={16} />
                  {"S'y rendre (GPS)"}
                </button>
              </a>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}