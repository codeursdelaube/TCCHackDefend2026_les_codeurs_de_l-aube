'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Shield, Zap, ArrowRight, Star } from 'lucide-react'
import { COLORS } from '@/lib/constants/colors'
import { useRouter } from 'next/navigation'
import { safeLocalStorageSet } from '@/lib/utils/storage'
import { toast } from 'sonner'

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = () => {
    setIsLoading(true)
    // Simulation d'une redirection vers une API de paiement (ex: FedaPay, Paystack)
    setTimeout(() => {
      safeLocalStorageSet('heritogo_premium', 'true')
      setIsLoading(false)
      toast.success('Abonnement Premium activé avec succès !')
      router.push('/dashboard/tourist')
    }, 1200)
  }

  return (
    <main className="min-h-screen bg-base-100 px-4 pb-28 pt-24 text-base-content sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 inline-flex items-center gap-2 rounded-2xl bg-secondary/10 px-4 py-2 text-sm font-black uppercase tracking-wider text-secondary"
        >
          <Star className="h-4 w-4" />
          Heritogo Premium
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl"
        >
          {"Débloquez l'expérience complète"}
        </motion.h1>

        <span className="togo-underline mx-auto mb-6" />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mb-16 max-w-2xl text-lg font-medium text-base-content/65"
        >
          Passez au niveau supérieur. Obtenez des scans illimités de monuments, un accès complet aux histoires audio, et contactez nos meilleurs guides certifiés sans restriction.
        </motion.p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
        {/* Plan Gratuit */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col rounded-xl border border-border bg-base-200 p-8 shadow-sm"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-black">Découverte</h2>
            <p className="mt-2 text-sm font-medium text-base-content/60">Idéal pour explorer les bases.</p>
          </div>
          <div className="mb-8">
            <span className="text-5xl font-black">0 FCFA</span>
            <span className="text-base-content/60 font-semibold"> / mois</span>
          </div>

          <ul className="mb-8 flex-1 space-y-4">
            <li className="flex items-center gap-3 text-sm font-semibold text-base-content/80">
              <Check className="h-5 w-5 text-secondary" /> 3 scans de monuments gratuits / mois
            </li>
            <li className="flex items-center gap-3 text-sm font-semibold text-base-content/80">
              <Check className="h-5 w-5 text-secondary" /> Consultation de tous les lieux et plats
            </li>
            <li className="flex items-center gap-3 text-sm font-semibold text-base-content/80">
              <Check className="h-5 w-5 text-secondary" /> Demande de réservation de guides locaux
            </li>
            <li className="flex items-center gap-3 text-sm font-semibold text-base-content/40">
              <Check className="h-5 w-5 opacity-50" /> {"Scans illimités non inclus"}
            </li>
          </ul>

          <button
            disabled
            className="btn btn-outline rounded-2xl w-full font-bold opacity-50"
          >
            Plan actuel
          </button>
        </motion.div>

        {/* Plan Premium */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="relative flex flex-col rounded-xl border-2 p-8 shadow-xl"
          style={{ borderColor: COLORS.forest, backgroundColor: 'var(--secondary)' }}
        >
          <div className="absolute -top-4 right-8 rounded-full bg-secondary px-4 py-1 text-xs font-black uppercase tracking-wider text-secondary-content shadow-lg">
            Recommandé
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              Premium
            </h2>
            <p className="mt-2 text-sm font-medium text-base-content/60">{"Pour les passionnés d'histoire et de culture."}</p>
          </div>
          <div className="mb-8">
            <span className="text-5xl font-black">2 000 FCFA</span>
            <span className="text-base-content/60 font-semibold"> / mois</span>
          </div>

          <ul className="mb-8 flex-1 space-y-4">
            <li className="flex items-center gap-3 text-sm font-bold text-base-content">
              <Shield className="h-5 w-5 text-emerald-600" /> Scans de monuments en illimité
            </li>
            <li className="flex items-center gap-3 text-sm font-bold text-base-content">
              <Zap className="h-5 w-5 text-amber-500" /> Audio-guides multilingues complets (TTS)
            </li>
            <li className="flex items-center gap-3 text-sm font-bold text-base-content">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500 shrink-0" /> Réservation prioritaire de guides certifiés
            </li>
            <li className="flex items-center gap-3 text-sm font-bold text-base-content">
              <Shield className="h-5 w-5 text-emerald-600" /> Historique illimité et mode hors-ligne
            </li>
          </ul>

          <div className="mb-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 py-1.5 px-3 text-[11px] font-bold text-amber-700 dark:text-amber-400">
            <Zap className="h-3.5 w-3.5" />
            <span>Mode démo actif — Activation instantanée sans débit réel</span>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="btn border-none rounded-2xl w-full text-white font-black text-lg transition-transform hover:scale-105 cursor-pointer"
            style={{ backgroundColor: COLORS.forest }}
          >
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>
                {"Activer l'accès Premium"} <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </main>
  )
}
