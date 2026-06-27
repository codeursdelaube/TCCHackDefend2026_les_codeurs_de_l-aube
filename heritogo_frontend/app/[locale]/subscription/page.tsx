'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Shield, Zap, ArrowRight, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { COLORS } from '@/lib/constants/colors'
import { useRouter } from 'next/navigation'

export default function SubscriptionPage() {
  const t = useTranslations('Subscription') // Assurez-vous d'ajouter ces traductions ou utilisez du texte brut temporaire
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = () => {
    setIsLoading(true)
    // Simulation d'une redirection vers une API de paiement (ex: FedaPay, Paystack)
    setTimeout(() => {
      localStorage.setItem('heritogo_premium', 'true')
      setIsLoading(false)
      router.push('/dashboard/tourist')
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-base-100 px-4 pb-28 pt-24 text-base-content sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 inline-flex items-center gap-2 rounded-2xl bg-secondary/10 px-4 py-2 text-sm font-black uppercase tracking-wider text-secondary"
        >
          <Sparkles className="h-4 w-4" />
          Heritogo Premium
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl"
        >
          Débloquez l'expérience complète
        </motion.h1>

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
          className="flex flex-col rounded-[32px] border border-border bg-base-200 p-8 shadow-sm"
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
              <Check className="h-5 w-5 text-secondary" /> 3 scans de monuments gratuits
            </li>
            <li className="flex items-center gap-3 text-sm font-semibold text-base-content/80">
              <Check className="h-5 w-5 text-secondary" /> Consultation basique des lieux
            </li>
            <li className="flex items-center gap-3 text-sm font-semibold text-base-content/40">
              <Check className="h-5 w-5 opacity-50" /> Pas d'audio-guides complets
            </li>
            <li className="flex items-center gap-3 text-sm font-semibold text-base-content/40">
              <Check className="h-5 w-5 opacity-50" /> Impossible de réserver un guide
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
          className="relative flex flex-col rounded-[32px] border-2 p-8 shadow-xl"
          style={{ borderColor: COLORS.forest, backgroundColor: '#004D4008' }}
        >
          <div className="absolute -top-4 right-8 rounded-full bg-secondary px-4 py-1 text-xs font-black uppercase tracking-wider text-secondary-content shadow-lg">
            Recommandé
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              Premium
            </h2>
            <p className="mt-2 text-sm font-medium text-base-content/60">Pour les passionnés d'histoire.</p>
          </div>
          <div className="mb-8">
            <span className="text-5xl font-black">2 500 FCFA</span>
            <span className="text-base-content/60 font-semibold"> / mois</span>
          </div>

          <ul className="mb-8 flex-1 space-y-4">
            <li className="flex items-center gap-3 text-sm font-bold text-base-content">
              <Shield className="h-5 w-5 text-emerald-600" /> Scans IA en illimité
            </li>
            <li className="flex items-center gap-3 text-sm font-bold text-base-content">
              <Zap className="h-5 w-5 text-amber-500" /> Audio-guides multilingues complets
            </li>
            <li className="flex items-center gap-3 text-sm font-bold text-base-content">
              <Star className="h-5 w-5 text-secondary" /> Réservation de guides certifiés
            </li>
            <li className="flex items-center gap-3 text-sm font-bold text-base-content">
              <Shield className="h-5 w-5 text-emerald-600" /> Support client prioritaire 24/7
            </li>
          </ul>

          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="btn border-none rounded-2xl w-full text-white font-black text-lg transition-transform hover:scale-105"
            style={{ backgroundColor: COLORS.forest }}
          >
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>
                S'abonner maintenant <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </main>
  )
}
