'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, MapPin, Compass, Navigation,
  Volume2, VolumeX, Share2, Check,
  Camera, ChevronRight, BedDouble,
  Phone, Star, Banknote, ShieldCheck
} from 'lucide-react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

import { monuments } from '@/app/LieuxT/site'
import hotels from '@/app/nearbyhotels/hotels'

type MonumentWithRegionAlias = { region?: string }

// ─────────────────────────────────────────────────────────────
// Utilitaires de distance
// ─────────────────────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

// ─────────────────────────────────────────────────────────────
// Carte (SSR désactivé)
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// TTS Button
// ─────────────────────────────────────────────────────────────
function TTSButton({ text, label }: { text: string; label: string }) {
  const [speaking, setSpeaking] = useState(false)
  const toggle = () => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'fr-FR'
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
    setSpeaking(true)
  }
  return (
    <button onClick={toggle}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold
                  border transition-all duration-200
                  ${speaking
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-base-300 border-base-content/10 text-base-content/50 hover:text-base-content hover:border-base-content/20'}`}>
      {speaking ? <><VolumeX size={13} className="animate-pulse" /> Arrêter</> : <><Volume2 size={13} /> {label}</>}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// Share Button
// ─────────────────────────────────────────────────────────────
function ShareButton({ nom }: { nom: string; lat: number; lng: number }) {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: nom, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <button onClick={share}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold
                 bg-base-300 border border-base-content/10 text-base-content/50
                 hover:text-base-content hover:border-base-content/20 transition-all duration-200">
      {copied ? <><Check size={13} className="text-green-500" /> Copié !</> : <><Share2 size={13} /> Partager</>}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────────────────────────
export default function SiteDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const site = monuments.find((m) => m.id === resolvedParams.id)
  if (!site) notFound()

  const siteRegion = site.région || (site as MonumentWithRegionAlias).region
  const siteLat = Number(site.lat)
  const siteLng = Number(site.lng)

  // Monuments voisins (même région)
  const voisins = monuments
    .filter((m) => (m.région === siteRegion || (m as MonumentWithRegionAlias).region === siteRegion) && m.id !== site.id)
    .slice(0, 3)

  // ----- HÔTELS : d'abord ceux à ≤ 5 km, puis fallback -----
  const allHotelsWithDist = hotels.map((h) => ({
    ...h,
    distance_km: haversine(siteLat, siteLng, h.lat, h.lng)
  }))

  const hotelsProches = allHotelsWithDist
    .filter((h) => h.distance_km <= 5)
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, 6)

  // Fallback : si aucun hôtel à ≤5 km, on prend les 6 plus proches (sans limite)
  const hotelsFallback = hotelsProches.length === 0
    ? [...allHotelsWithDist].sort((a, b) => a.distance_km - b.distance_km).slice(0, 6)
    : []

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${siteLat},${siteLng}`

  return (
    <main className="relative min-h-screen w-full bg-base-100 text-base-content overflow-x-hidden">

      {/* ================= HERO ================= */}
      <section className="relative h-[55vh] min-h-[360px] w-full overflow-hidden">
        <Image src={site.image} alt={site.nom} fill priority sizes="100vw"
          className="object-cover object-center scale-[1.02] hover:scale-100 transition-transform duration-[2s]" />
        <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-black/30 to-black/20" />

        <div className="absolute top-0 left-0 right-0 z-20 pt-6 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/lieux">
            <motion.div whileHover={{ x: -3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                         bg-black/30 backdrop-blur-md border border-white/15
                         text-white/80 text-xs font-semibold hover:bg-black/45 transition-all cursor-pointer">
              <ArrowLeft size={14} /> Retour aux sites
            </motion.div>
          </Link>
          <div className="px-3 py-1.5 rounded-full bg-green-600/80 backdrop-blur-sm
                          border border-green-500/40 text-white text-[10px] font-bold uppercase tracking-widest">
            Région {siteRegion}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-8 lg:px-16 pb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={13} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-semibold tracking-wide">{site.localite} · Togo</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight
                           text-white uppercase leading-none drop-shadow-xl">{site.nom}</h1>
          </motion.div>
        </div>
      </section>

      {/* ================= CONTENU PRINCIPAL ================= */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/4 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/4 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* COLONNE PRINCIPALE (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Actions rapides */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="flex flex-wrap items-center gap-2">
              <TTSButton text={`${site.nom}. ${site.description}. ${site.histoire}`} label="Écouter l'histoire" />
              <ShareButton nom={site.nom} lat={siteLat} lng={siteLng} />
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                   text-xs font-bold border-none text-white
                                   bg-gradient-to-r from-emerald-500 to-green-600
                                   hover:scale-105 active:scale-95
                                   shadow-md shadow-green-500/20 transition-all duration-200">
                  <Navigation size={13} /> {"S'y rendre"}
                </button>
              </a>
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-base-200 rounded-2xl p-6 border border-base-content/8">
              <p className="text-base-content/65 text-sm sm:text-base leading-relaxed italic">{site.description}</p>
            </motion.div>

            {/* Histoire */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
              className="space-y-4">
              <h2 className="flex items-center gap-2.5 text-base font-black text-green-500 uppercase tracking-widest">
                <Compass size={16} className="animate-pulse" /> Histoire &amp; Patrimoine
              </h2>
              <p className="text-base-content/70 leading-relaxed text-sm md:text-base whitespace-pre-line text-justify">
                {site.histoire}
              </p>
            </motion.div>

            {/* GPS */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="flex items-center gap-3 py-4 border-t border-base-content/8">
              <MapPin size={14} className="text-base-content/25 shrink-0" />
              <span className="text-xs text-base-content/40">Coordonnées GPS :</span>
              <code className="text-xs font-mono bg-base-200 border border-base-content/10
                               text-base-content/60 px-2.5 py-1 rounded-lg">
                {siteLat.toFixed(5)}, {siteLng.toFixed(5)}
              </code>
            </motion.div>

            {/* Sites voisins */}
            {voisins.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-base-content/40 uppercase tracking-widest flex items-center gap-2">
                  <Camera size={12} /> Autres sites dans la région {siteRegion}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {voisins.map((v) => (
                    <Link key={v.id} href={`/lieux/${v.id}`}>
                      <motion.div whileHover={{ y: -2 }}
                        className="group relative rounded-xl overflow-hidden border border-base-content/8
                                   bg-base-200 hover:border-base-content/20 transition-all duration-200 cursor-pointer">
                        <div className="relative h-24 w-full overflow-hidden">
                          <Image src={v.image} alt={v.nom} fill sizes="200px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <p className="text-xs font-bold text-base-content group-hover:text-green-500
                                        transition-colors line-clamp-1">{v.nom}</p>
                          <ChevronRight size={12} className="text-base-content/30 group-hover:text-green-500 shrink-0" />
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* SIDEBAR STICKY (1/3) */}
          <aside className="space-y-5 lg:sticky lg:top-24 self-start">

            {/* Carte */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="rounded-2xl overflow-hidden border border-base-content/8 bg-base-200 p-3 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-base-content/35
                             mb-2.5 px-1 flex items-center gap-1.5">
                <MapPin size={10} className="text-success" /> Emplacement géographique
              </h3>
              <MapNoSSR monumentsList={[site]} />
            </motion.div>

            {/* Fiche récap */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.38 }}
              className="rounded-2xl border border-base-content/8 bg-base-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-base-content/8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-base-content/35">Fiche du site</h3>
              </div>
              <div className="divide-y divide-base-content/5">
                {[
                  { label: 'Nom', value: site.nom },
                  { label: 'Localité', value: site.localite },
                  { label: 'Région', value: `Région ${siteRegion}` },
                  { label: 'Latitude', value: siteLat.toFixed(5) },
                  { label: 'Longitude', value: siteLng.toFixed(5) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4 px-5 py-3">
                    <span className="text-xs text-base-content/40 shrink-0">{label}</span>
                    <span className="text-xs font-semibold text-base-content/80 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Compteur hôtels (proches si existent, sinon fallback) */}
            {(hotelsProches.length > 0 || hotelsFallback.length > 0) && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 }}
                className="rounded-2xl border border-base-content/8 bg-base-200 p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/35 mb-3">
                  Hébergements {hotelsProches.length > 0 ? 'proches' : 'les plus proches'}
                </p>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-black text-emerald-500">
                    {hotelsProches.length > 0 ? hotelsProches.length : hotelsFallback.length}
                  </span>
                  <span className="text-xs text-base-content/50 mb-1">
                    hôtel{hotelsProches.length > 1 || hotelsFallback.length > 1 ? 's' : ''} trouvé{hotelsProches.length > 1 || hotelsFallback.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {(hotelsProches.length > 0 ? hotelsProches : hotelsFallback).slice(0, 3).map((h) => (
                    <div key={h.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-[11px] text-base-content/50 truncate">{h.nom}</span>
                      </div>
                      <span className="text-[10px] font-mono text-base-content/35 shrink-0">
                        {formatDistance(h.distance_km)}
                      </span>
                    </div>
                  ))}
                  {((hotelsProches.length > 0 ? hotelsProches : hotelsFallback).length > 3) && (
                    <p className="text-[10px] text-base-content/30 pl-3">
                      + {(hotelsProches.length > 0 ? hotelsProches : hotelsFallback).length - 3} autre{((hotelsProches.length > 0 ? hotelsProches : hotelsFallback).length - 3) > 1 ? 's' : ''}…
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* CTA GPS */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.44 }}>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="block">
                <button className="w-full btn rounded-2xl border-none text-white font-bold
                                   bg-gradient-to-r from-emerald-500 via-green-600 to-teal-500
                                   hover:scale-[1.02] active:scale-[0.98]
                                   shadow-xl shadow-green-500/20 transition-all duration-200
                                   flex items-center justify-center gap-2 py-4">
                  <Navigation size={16} /> {"S'y rendre"} (Google Maps)
                </button>
              </a>
            </motion.div>
          </aside>
        </div>
      </section>

      {/* ================= SECTION HÔTELS PROCHES / FALLBACK ================= */}
      {(hotelsProches.length > 0 || hotelsFallback.length > 0) && (
        <section id="hotels" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 mt-2 scroll-mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2.5 text-base font-black text-base-content uppercase tracking-widest">
                  <BedDouble size={16} className="text-emerald-500" />
                  {hotelsProches.length > 0 ? 'Hébergements à proximité (≤ 5 km)' : 'Hébergements les plus proches'}
                </h2>
                <span className="text-xs font-mono text-base-content/35 bg-base-200
                                 border border-base-content/8 px-2.5 py-1 rounded-lg">
                  {(hotelsProches.length > 0 ? hotelsProches : hotelsFallback).length} hôtel{(hotelsProches.length > 0 ? hotelsProches : hotelsFallback).length > 1 ? 's' : ''}
                </span>
              </div>

              {hotelsProches.length === 0 && hotelsFallback.length > 0 && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                  <p className="text-sm text-amber-500">Aucun hôtel à moins de 5 km.</p>
                  <p className="text-xs text-base-content/50 mt-1">Voici les hébergements les plus proches de la région :</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(hotelsProches.length > 0 ? hotelsProches : hotelsFallback).map((hotel, i) => (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group rounded-2xl border border-base-content/8 bg-base-200
                               hover:border-emerald-500/25 transition-all duration-200 overflow-hidden"
                  >
                    {/* En-tête carte */}
                    <div className="px-5 pt-5 pb-3 border-b border-base-content/5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-base-content
                                         group-hover:text-emerald-500 transition-colors
                                         leading-tight truncate">
                            {hotel.nom}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <MapPin size={11} className="text-emerald-500 shrink-0" />
                            <span className="text-[11px] text-base-content/50 truncate">
                              {hotel.quartier}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: hotel.etoiles }).map((_, j) => (
                              <Star key={j} size={9} className="text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10
                                           border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                            {formatDistance(hotel.distance_km)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Infos */}
                    <div className="px-5 py-4 space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <MapPin size={12} className="text-base-content/25 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-base-content/55 leading-relaxed">{hotel.adresse}</p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Phone size={12} className="text-base-content/25 shrink-0" />
                        <a href={`tel:${hotel.telephone}`}
                           className="text-[11px] font-mono text-emerald-500 hover:text-emerald-400 transition-colors">
                          {hotel.telephone}
                        </a>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Banknote size={12} className="text-base-content/25 shrink-0" />
                        <span className="text-[11px] text-base-content/50">
                          {hotel.nuit_fcfa_min.toLocaleString('fr-FR')} – {hotel.nuit_fcfa_max.toLocaleString('fr-FR')} FCFA / nuit
                        </span>
                      </div>

                      {hotel.note_booking && (
                        <div className="flex items-center gap-2.5">
                          <Star size={12} className="text-base-content/25 shrink-0" />
                          <span className="text-[11px] text-base-content/50">
                            Note Booking : <span className="font-bold text-amber-400">{hotel.note_booking}/10</span>
                          </span>
                        </div>
                      )}

                      {hotel.gps_fiable && (
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck size={11} className="text-emerald-500" />
                          <span className="text-[10px] text-emerald-500/70">Position GPS vérifiée</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1 pt-1">
                        {hotel.services.slice(0, 3).map((s) => (
                          <span key={s}
                            className="text-[10px] bg-base-300 border border-base-content/8
                                       text-base-content/40 px-2 py-0.5 rounded-md">
                            {s}
                          </span>
                        ))}
                        {hotel.services.length > 3 && (
                          <span className="text-[10px] text-base-content/30 px-1 py-0.5">
                            +{hotel.services.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-5 pb-4">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${hotel.lat},${hotel.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                                   text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/20
                                   text-emerald-400 hover:bg-emerald-500/20 transition-all duration-200"
                      >
                        <Navigation size={12} /> {"S'y rendre"}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block" />
          </div>
        </section>
      )}
    </main>
  )
}