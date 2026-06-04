'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hotel, MapPin, Star, Phone, Navigation, Map, Utensils, Compass } from 'lucide-react'

interface DecouverteData {
  id: string
  nom: string
  latitude: number
  longitude: number
  nuit_fcfa?: number | string     // Spécifique hôtel
  etoiles?: number       // Spécifique hôtel
  specialite?: string    // Spécifique resto (ex: Ayimolou, Fufu...)
  telephone?: string
  distance_km: number
  type: 'hotel' | 'restaurant'
}

interface BackendDecouverte {
  id?: string
  nom?: string
  latitude?: number | string
  longitude?: number | string
  lat?: number | string
  long?: number | string
  lng?: number | string
  nuit_fcfa?: number | string
  prix_nuit?: number | string
  telephone?: string
  etoiles?: number
  specialite?: string
  distance_km?: number | string
  type?: 'hotel' | 'restaurant'
}

interface DecouvertesProchesProps {
  monumentLat: number
  monumentLng: number
}

function DecouverteCard({ item }: { item: DecouverteData }) {
  const isHotel = item.type === 'hotel'

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      className={`card bg-base-100 shadow-md border-l-4 p-4 flex flex-col gap-2 transition-shadow hover:shadow-lg ${
        isHotel ? 'border-success' : 'border-amber-500'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider mb-0.5 ${
            isHotel ? 'text-success' : 'text-amber-600'
          }`}>
            {isHotel ? <Hotel size={10} /> : <Utensils size={10} />}
            {isHotel ? 'Hébergement' : 'Restaurant'}
          </div>
          <h3 className="font-bold text-base text-base-content m-0 leading-tight">
            {item.nom}
          </h3>
          {item.specialite && (
            <p className="text-xs text-base-content/60 m-0 mt-0.5 italic">
              Spécialité : {item.specialite}
            </p>
          )}
        </div>

        {isHotel && item.etoiles && item.etoiles > 0 && (
          <div className="flex gap-0.5 text-warning shrink-0 mt-1">
            {Array.from({ length: item.etoiles }).map((_, i) => (
              <Star key={i} size={13} fill="currentColor" />
            ))}
          </div>
        )}
      </div>

      <div className={`flex items-center gap-1 text-xs font-semibold ${
        isHotel ? 'text-success' : 'text-amber-600'
      }`}>
        <MapPin size={14} />
        <span>{item.distance_km.toFixed(2)} km de ce monument</span>
      </div>

      <div className="flex justify-between items-center mt-2 gap-2">
        {isHotel && item.nuit_fcfa ? (
          <span className="badge badge-success badge-sm font-bold p-3 text-white">
            {typeof item.nuit_fcfa === 'number' ? item.nuit_fcfa.toLocaleString() : item.nuit_fcfa} / nuit
          </span>
        ) : (
          <span className="text-[11px] font-medium text-base-content/50">
            {item.specialite ? 'Saveurs locales' : 'À découvrir'}
          </span>
        )}
        
        {item.telephone && (
          <a 
            href={`tel:${item.telephone}`} 
            className="btn btn-ghost btn-xs gap-1 text-base-content/70 font-normal normal-case hover:bg-base-200"
          >
            <Phone size={12} /> {item.telephone}
          </a>
        )}
      </div>
    </motion.div>
  )
}

export default function DecouvertesProches({ monumentLat, monumentLng }: DecouvertesProchesProps) {
  const [apiError, setApiError] = useState<string | null>(null)
  const [decouvertes, setDecouvertes] = useState<DecouverteData[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const latNum = Number(monumentLat)
  const lngNum = Number(monumentLng)
  
  const isInitialLoading = !monumentLat || !monumentLng || monumentLat === 0 || monumentLng === 0
  const hasInvalidCoords = !isInitialLoading && (isNaN(latNum) || isNaN(lngNum))

  const geoError = hasInvalidCoords ? "Format des coordonnées du monument invalide." : apiError

  useEffect(() => {
    if (isInitialLoading || hasInvalidCoords) return

    const abortController = new AbortController()

    const fetchDecouvertes = async () => {
      setLoading(true)
      setApiError(null)

      try {
        const query = new URLSearchParams({
          lat: String(latNum),
          lng: String(lngNum),
        })

        const response = await fetch(`/api/hotels?${query.toString()}`, {
          signal: abortController.signal 
        })
        
        const data = await response.json()

        if (!response.ok) {
          if (data.detail && Array.isArray(data.detail)) {
            setApiError(data.detail[0].msg || "Erreur de validation.")
          } else {
            setApiError("Impossible de scanner les environs.")
          }
          return
        }

        if (Array.isArray(data)) {
          const mappedData = data.map((item: BackendDecouverte) => ({
            id: item.id || String(Math.random()),
            nom: item.nom || 'Lieu sans nom',
            // Alignement strict avec latitude et longitude du modèle unifié
            latitude: Number(item.latitude ?? item.lat),
            longitude: Number(item.longitude ?? item.long ?? item.lng),
            nuit_fcfa: item.nuit_fcfa ?? item.prix_nuit,
            telephone: item.telephone,
            etoiles: item.etoiles,
            specialite: item.specialite,
            distance_km: Number(item.distance_km),
            type: item.type ?? 'hotel'
          }))
          setDecouvertes(mappedData)
        } else {
          setDecouvertes([])
        }

      } catch (err: unknown) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          setApiError("Erreur de connexion avec le serveur HeriTogo.")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchDecouvertes()

    return () => {
      abortController.abort()
    }
  }, [monumentLat, monumentLng, latNum, lngNum, isInitialLoading, hasInvalidCoords])

  return (
    <div className="w-full bg-base-200 rounded-2xl pb-6 text-base-content font-sans overflow-hidden border border-base-content/8">
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 text-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Compass size={20} className="text-emerald-300 animate-spin-slow" />
          <h2 className="text-lg font-black tracking-tight m-0 text-white uppercase">
            À proximité (5 km)
          </h2>
        </div>
        <p className="text-xs opacity-90 mt-1 m-0 text-emerald-100">
          Hôtels et restaurants autour du monument historique
        </p>

        <div className="mt-2 flex items-center gap-2 text-[10px]">
          {geoError ? (
            <span className="badge badge-warning font-semibold gap-1 text-[10px] p-2">
              ⚠ {geoError}
            </span>
          ) : !isInitialLoading ? (
            <span className="badge bg-white/20 border-none text-white font-medium p-2 backdrop-blur-sm gap-1">
              <Navigation size={10} className="animate-pulse" /> Radar HeriTogo actif
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-medium text-emerald-100">
              <span className="loading loading-spinner loading-xs"></span>
              Calcul des distances...
            </span>
          )}
        </div>
      </div>

      <div className="px-3 pt-4 max-w-lg mx-auto max-h-[400px] overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {isInitialLoading && !geoError ? (
            <motion.div 
              key="initial-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 text-base-content/40 flex flex-col items-center gap-2"
            >
              <Map size={36} className="animate-bounce text-success/60" />
              <p className="font-semibold text-xs">Initialisation du radar...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="content-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              {loading ? (
                <LoadingSkeletons />
              ) : decouvertes.length === 0 ? (
                <EmptyState label="Aucun hôtel ni restaurant répertorié à moins de 5 km." />
              ) : (
                decouvertes.map(item => <DecouverteCard key={item.id} item={item} />)
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function LoadingSkeletons() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton h-24 w-full rounded-xl bg-base-300/50" />
      ))}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-10 text-base-content/40 flex flex-col items-center gap-1"
    >
      <span className="text-3xl m-0">📍</span>
      <p className="text-xs font-semibold">{label}</p>
    </motion.div>
  )
}
