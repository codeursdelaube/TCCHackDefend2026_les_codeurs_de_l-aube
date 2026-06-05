'use client'

import { useState, useMemo } from 'react'
import { Award, Lock, CheckCircle, MapPin, Compass, ArrowLeft, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

// Liste officielle des badges configurée pour le Togo
const CONFIG_BADGES = [
  {
    id: 'badge_maritime',
    nom: 'Explorateur Maritime',
    description: "Débloqué en scannant au moins un monument dans la Région Maritime (ex: Monument de l'Indépendance).",
    region: 'Maritime',
    icon: '🌊',
    couleur: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'badge_plateaux',
    nom: 'Gardien des Plateaux',
    description: 'Débloqué en explorant le patrimoine de la Région des Plateaux (ex: Château Vial).',
    region: 'Plateaux',
    icon: '⛰️',
    couleur: 'from-green-500 to-emerald-600'
  },
  {
    id: 'badge_kara',
    nom: 'Chasseur de la Kara',
    description: 'Débloqué en scannant les architectures traditionnelles de la Région de la Kara (ex: Koutamakou).',
    region: 'Kara',
    icon: '🛡️',
    couleur: 'from-amber-500 to-red-500'
  },
  {
    id: 'badge_togo_master',
    nom: 'Grand Ambassadeur',
    description: 'Badge Ultime ! Décerné aux voyageurs ayant validé au moins 3 monuments uniques à travers le Togo.',
    conditionSpecial: 3,
    icon: '🇹🇬',
    couleur: 'from-red-600 via-yellow-500 to-green-600'
  }
]

interface ScannedMonument {
  id: string
  nom: string
  region: string
  localite: string
  date: string
}

export default function PasseportBadgesPage() {
  // ✅ INITIALISATION SÉCURISÉE : Plus aucun useEffect, le localStorage est lu une seule fois au montage client
  const [monumentsScannes, setMonumentsScannes] = useState<ScannedMonument[]>(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('heritogo_scanned_monuments')
      if (localData) {
        try {
          return JSON.parse(localData)
        } catch (e) {
          console.error("Erreur de lecture initiale du passeport", e)
        }
      }
    }
    return [] // Valeur par défaut initiale
  })

  // ✅ ÉTAT DÉRIVÉ : Calculé proprement à la volée grâce à useMemo, sans déclencher de second render
  const regionsVisitees = useMemo(() => {
    return Array.from(
      new Set(monumentsScannes.map(m => m.region.replace('Région ', '').trim()))
    )
  }, [monumentsScannes])

  // Vérification dynamique du statut d'un badge
  const estBadgeDebloque = (badge: typeof CONFIG_BADGES[0]) => {
    if (badge.conditionSpecial) {
      return monumentsScannes.length >= badge.conditionSpecial
    }
    return regionsVisitees.includes(badge.region || '')
  }

  const totalDebloque = CONFIG_BADGES.filter(b => estBadgeDebloque(b)).length
  const pourcentageProgression = Math.round((totalDebloque / CONFIG_BADGES.length) * 100)

  return (
    <main className="min-h-screen w-full bg-base-100 text-base-content py-10 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      
      {/* Effets visuels de fond */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-500/5 blur-[110px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* En-tête de navigation */}
        <div className="flex items-center justify-between">
          <Link href="/lieux">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-200 border border-base-content/10 text-xs font-semibold hover:bg-base-300 transition-all cursor-pointer">
              <ArrowLeft size={14} />
              {"Retour à l'exploration"}
            </div>
          </Link>
          <div className="text-[10px] font-mono tracking-widest bg-success/10 text-success border border-success/20 px-3 py-1 rounded-full uppercase font-bold">
            HeriToGo POC v1.0
          </div>
        </div>

        {/* Carte de score principale */}
        <div className="bg-base-200 rounded-3xl p-6 md:p-8 border border-base-content/10 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <Trophy size={20} />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">
                Mon Passeport Culturel
              </h1>
            </div>
            <p className="text-sm text-base-content/60 max-w-md">
              Explorez le Togo, scannez ses monuments historiques uniques avec notre IA et collectionnez vos insignes de mérite.
            </p>
          </div>

          <div className="bg-base-300/60 border border-base-content/5 rounded-2xl p-4 flex items-center gap-4 w-full md:w-auto shrink-0">
            <div className="radial-progress text-success font-black text-sm" style={{ "--value": pourcentageProgression, "--size": "3.5rem", "--thickness": "6px" } as any} role="progressbar">
              {pourcentageProgression}%
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-base-content/40">Statut Collection</span>
              <span className="text-base font-black text-success">{totalDebloque} / {CONFIG_BADGES.length} Badges</span>
            </div>
          </div>
        </div>

        {/* Section de la liste des badges */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-base-content/40 uppercase tracking-widest flex items-center gap-2 px-1">
            <Award size={14} className="text-green-500" />
            Mes Badges Récompenses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONFIG_BADGES.map((badge, index) => {
              const debloque = estBadgeDebloque(badge)

              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={debloque ? { y: -2 } : {}}
                  className={`relative flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300
                    ${debloque 
                      ? 'bg-base-200 border-base-content/15 shadow-md' 
                      : 'bg-base-200/40 border-base-content/5 opacity-50 select-none'
                    }`}
                >
                  {/* Conteneur de l'icône du Badge */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-inner shrink-0 relative transition-transform duration-500 ${debloque ? 'hover:rotate-12' : ''}
                    ${debloque ? `bg-gradient-to-br ${badge.couleur} text-white` : 'bg-base-300 text-base-content/30 border border-base-content/10'}`}
                  >
                    {badge.icon}
                    {debloque && (
                      <span className="absolute -top-1.5 -right-1.5 bg-base-100 text-success rounded-full p-0.5 shadow-md">
                        <CheckCircle size={14} fill="currentColor" className="text-base-200" />
                      </span>
                    )}
                  </div>

                  {/* Descriptions */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h3 className={`text-sm font-black tracking-tight uppercase truncate ${debloque ? 'text-base-content' : 'text-base-content/40'}`}>
                      {badge.nom}
                    </h3>
                    <p className="text-xs text-base-content/50 leading-relaxed line-clamp-2">
                      {badge.description}
                    </p>
                  </div>

                  {/* Affichage du cadenas si verrouillé */}
                  {!debloque && (
                    <div className="text-base-content/20 pr-1">
                      <Lock size={16} />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Section Historique / Journal de bord */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-base-content/40 uppercase tracking-widest flex items-center gap-2 px-1">
            <Compass size={14} className="text-amber-500" />
            Journal des Découvertes ({monumentsScannes.length})
          </h3>

          {monumentsScannes.length === 0 ? (
            <div className="bg-base-200/50 rounded-2xl border border-dashed border-base-content/10 p-8 text-center">
              <MapPin className="mx-auto text-base-content/20 mb-2" size={28} />
              <p className="text-sm font-semibold text-base-content/40">{"Aucun tampon pour l'instant."}</p>
              <p className="text-xs text-base-content/30 mt-0.5">{"Rendez-vous sur l'appareil photo pour scanner votre premier monument du Togo."}</p>
            </div>
          ) : (
            <div className="bg-base-200 rounded-2xl border border-base-content/8 divide-y divide-base-content/5 overflow-hidden">
              {monumentsScannes.map((monument) => (
                <div key={monument.id} className="flex items-center justify-between gap-4 p-4 hover:bg-base-300/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center font-bold text-xs">
                      TG
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-base-content leading-tight">{monument.nom}</h4>
                      <p className="text-xs text-base-content/40 mt-0.5">
                        {monument.localite} · <span className="text-amber-500 font-medium">Région {monument.region}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-base-content/30 block">Validé le</span>
                    <span className="text-xs font-semibold text-base-content/50">{monument.date || 'Récemment'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}