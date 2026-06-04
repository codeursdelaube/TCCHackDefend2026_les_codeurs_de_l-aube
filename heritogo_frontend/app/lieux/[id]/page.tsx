'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, MapPin, Compass, Navigation,
  Volume2, VolumeX, Share2, Check, Clock,
  Camera, ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

import { monuments } from '@/app/LieuxT/site'
import HotelsProches from '@/app/_components/HotelsProches'

type MonumentWithRegionAlias = {
  region?: string
}

/* ── Carte chargée côté client uniquement ── */
const MapNoSSR = dynamic(() => import('@/app/_components/Carte'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] rounded-2xl bg-base-300 flex items-center justify-center border border-base-content/10">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-[3px] border-success border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-base-content/40 font-medium">Chargement de la carte…</p>
      </div>
    </div>
  ),
})

interface PageProps {
  params: Promise<{ id: string }>
}

/* ── Composant bouton TTS ── */
function TTSButton({ text, label }: { text: string; label: string }) {
  const [speaking, setSpeaking] = useState(false)

  const toggle = () => {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fr-FR'
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold
                  border transition-all duration-200
                  ${speaking
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-base-300 border-base-content/10 text-base-content/50 hover:text-base-content hover:border-base-content/20'
                  }`}
    >
      {speaking
        ? <><VolumeX size={13} className="animate-pulse" /> Arrêter</>
        : <><Volume2 size={13} /> {label}</>
      }
    </button>
  )
}

/* ── Composant bouton Partage ── */
function ShareButton({ nom }: { nom: string; lat: number; lng: number }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: nom, url })
      } catch (err) {
        console.log("Partage annulé ou non supporté")
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold
                 bg-base-300 border border-base-content/10 text-base-content/50
                 hover:text-base-content hover:border-base-content/20 transition-all duration-200"
    >
      {copied
        ? <><Check size={13} className="text-green-500" /> Copié !</>
        : <><Share2 size={13} /> Partager</>
      }
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
    PAGE PRINCIPALE
───────────────────────────────────────────────────────────────────────────── */
export default function SiteDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const site = monuments.find((m) => m.id === resolvedParams.id)
  if (!site) notFound()

  // Protection anti-crash pour gérer aussi bien 'région' que 'region' dans ton fichier site.ts
  const siteRegion = site.région || (site as MonumentWithRegionAlias).region

  /* Monuments voisins (même région, exclu le courant) */
  const voisins = monuments
    .filter((m) => (m.région === siteRegion || (m as MonumentWithRegionAlias).region === siteRegion) && m.id !== site.id)
    .slice(0, 3)

  // 🛠️ CORRECTION : Syntaxe propre et valide pour l'ouverture d'un itinéraire Google Maps
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`

  return (
    <main className="relative min-h-screen w-full bg-base-100 text-base-content overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════════
          HERO IMAGE — plein largeur avec overlay
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative h-[55vh] min-h-[360px] w-full overflow-hidden">
        <Image
          src={site.image}
          alt={site.nom}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-[1.02] hover:scale-100 transition-transform duration-[2s]"
        />
        {/* Overlay bas → haut pour fond de texte */}
        <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-black/30 to-black/20" />

        {/* Barre de navigation dans le hero */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-6 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/lieux">
            <motion.div
              whileHover={{ x: -3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                         bg-black/30 backdrop-blur-md border border-white/15
                         text-white/80 text-xs font-semibold hover:bg-black/45
                         transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              Retour aux sites
            </motion.div>
          </Link>

          {/* Badge région */}
          <div className="px-3 py-1.5 rounded-full bg-green-600/80 backdrop-blur-sm
                          border border-green-500/40 text-white text-[10px]
                          font-bold uppercase tracking-widest">
            Région {siteRegion}
          </div>
        </div>

        {/* Titre en bas du hero */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-8 lg:px-16 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={13} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-semibold tracking-wide">
                {site.localite} · Togo
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight
                           text-white uppercase leading-none drop-shadow-xl">
              {site.nom}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CONTENU PRINCIPAL
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">

        {/* Halos arrière-plan */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/4 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/4 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* ── COLONNE PRINCIPALE (2/3) ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Actions rapides */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap items-center gap-2"
            >
              <TTSButton text={`${site.nom}. ${site.description}. ${site.histoire}`} label="Écouter l'histoire" />
              <ShareButton nom={site.nom} lat={Number(site.lat)} lng={Number(site.lng)} />
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                   text-xs font-bold border-none text-white
                                   bg-gradient-to-r from-emerald-500 to-green-600
                                   hover:scale-105 active:scale-95
                                   shadow-md shadow-green-500/20 transition-all duration-200">
                  <Navigation size={13} />
                  {" S'y rendre"}
                </button>
              </a>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-base-200 rounded-2xl p-6 border border-base-content/8"
            >
              <p className="text-base-content/65 text-sm sm:text-base leading-relaxed italic">
                {site.description}
              </p>
            </motion.div>

            {/* Histoire & Patrimoine */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="space-y-4"
            >
              <h2 className="flex items-center gap-2.5 text-base font-black
                             text-green-500 uppercase tracking-widest">
                <Compass size={16} className="animate-pulse" />
                Histoire & Patrimoine
              </h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-base-content/70 leading-relaxed text-sm md:text-base
                              whitespace-pre-line text-justify">
                  {site.histoire}
                </p>
              </div>
            </motion.div>

            {/* Coordonnées GPS */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-3 py-4 border-t border-base-content/8"
            >
              <MapPin size={14} className="text-base-content/25 shrink-0" />
              <span className="text-xs text-base-content/40">Coordonnées GPS :</span>
              <code className="text-xs font-mono bg-base-200 border border-base-content/10
                               text-base-content/60 px-2.5 py-1 rounded-lg">
                {Number(site.lat).toFixed(5)}, {Number(site.lng).toFixed(5)}
              </code>
            </motion.div>

            {/* Sites voisins */}
            {voisins.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 pt-2"
              >
                <h3 className="text-xs font-bold text-base-content/40 uppercase tracking-widest
                               flex items-center gap-2">
                  <Camera size={12} />
                  Autres sites dans la région {siteRegion}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {voisins.map((v) => (
                    <Link key={v.id} href={`/lieux/${v.id}`}>
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="group relative rounded-xl overflow-hidden
                                   border border-base-content/8 bg-base-200
                                   hover:border-base-content/20 transition-all duration-200
                                   cursor-pointer"
                      >
                        <div className="relative h-24 w-full overflow-hidden">
                          <Image
                            src={v.image}
                            alt={v.nom}
                            fill
                            sizes="200px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <p className="text-xs font-bold text-base-content leading-tight
                                        group-hover:text-green-500 transition-colors line-clamp-1">
                            {v.nom}
                          </p>
                          <ChevronRight size={12} className="text-base-content/30
                                                                group-hover:text-green-500 shrink-0" />
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── COLONNE LATÉRALE (1/3) — Sticky ── */}
          <aside className="space-y-5 lg:sticky lg:top-24 self-start">

            {/* Carte */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl overflow-hidden border border-base-content/8
                         bg-base-200 p-3 shadow-sm"
            >
              <h3 className="text-[10px] font-bold uppercase tracking-widest
                             text-base-content/35 mb-2.5 px-1 flex items-center gap-1.5">
                <MapPin size={10} className="text-success" />
                Emplacement géographique
              </h3>
              <MapNoSSR monumentsList={[site]} />
            </motion.div>

            {/* Fiche récap */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.38 }}
              className="rounded-2xl border border-base-content/8 bg-base-200 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-base-content/8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-base-content/35">
                  Fiche du site
                </h3>
              </div>
              <div className="divide-y divide-base-content/5">
                {[
                  { label: 'Nom', value: site.nom },
                  { label: 'Localité', value: site.localite },
                  { label: 'Région', value: `Région ${siteRegion}` },
                  { label: 'Latitude', value: Number(site.lat).toFixed(5) },
                  { label: 'Longitude', value: Number(site.lng).toFixed(5) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4 px-5 py-3">
                    <span className="text-xs text-base-content/40 shrink-0">{label}</span>
                    <span className="text-xs font-semibold text-base-content/80 text-right">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA GPS grand format */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.44 }}
            >
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <button className="w-full btn rounded-2xl border-none text-white font-bold
                                   bg-gradient-to-r from-emerald-500 via-green-600 to-teal-500
                                   hover:scale-[1.02] active:scale-[0.98]
                                   shadow-xl shadow-green-500/20 transition-all duration-200
                                   flex items-center justify-center gap-2 py-4">
                  <Navigation size={16} />
                  {"S'y rendre (Google Maps)"}
                </button>
              </a>
            </motion.div>

          </aside>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION REMISE EN DESSOUS : DÉCOUVERTES PROCHES
      ══════════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2">
            {/* Intégration unifiée mixée Hôtels + Restos */}
            <HotelsProches monumentLat={Number(site.lat)} monumentLng={Number(site.lng)} />
          </div>
          <div className="hidden lg:block"></div>
        </div>
      </section>

    </main>
  )
}
