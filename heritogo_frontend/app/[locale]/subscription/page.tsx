'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Shield, Zap, ArrowRight, Star, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { safeLocalStorageSet } from '@/lib/utils/storage'
import { toast } from 'sonner'
import Badge from '@/components/ui/Badge'

export default function SubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = () => {
    setIsLoading(true)
    setTimeout(() => {
      safeLocalStorageSet('heritogo_premium', 'true')
      setIsLoading(false)
      toast.success('Abonnement Premium activé avec succès !')
      router.push('/dashboard/tourist')
    }, 1200)
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-28 pt-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-12">
        
        {/* Title Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3.5 py-1 text-xs font-bold text-[#8A3A20] dark:text-amber-200">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Formules & Tarifs</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Débloquez l’expérience complète HeriTogo
          </h1>

          <div className="togo-underline mx-auto" />

          <p className="mx-auto max-w-2xl text-sm sm:text-base font-medium text-muted-foreground pt-1">
            Profitez de scans illimités par vision artificielle, d’audio-guides multilingues immersifs et d’un contact direct avec nos meilleurs guides locaux.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
          {/* Plan Gratuit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="app-card flex flex-col justify-between p-8 space-y-6"
          >
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Formule Découverte</h2>
                <p className="text-xs text-muted-foreground mt-1">Idéal pour explorer les monuments de base.</p>
              </div>

              <div className="pt-2">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-foreground">0 FCFA</span>
                <span className="text-xs font-semibold text-muted-foreground"> / mois</span>
              </div>

              <ul className="space-y-3.5 pt-4 border-t border-border text-xs sm:text-sm font-medium text-muted-foreground">
                <li className="flex items-center gap-3 text-foreground font-semibold">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>3 scans de monuments IA gratuits / mois</span>
                </li>
                <li className="flex items-center gap-3 text-foreground font-semibold">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Consultation des 29 sites patrimoniaux et 31 plats</span>
                </li>
                <li className="flex items-center gap-3 text-foreground font-semibold">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Demande de réservation de guides locaux certifiés</span>
                </li>
                <li className="flex items-center gap-3 opacity-40">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>Scans illimités non inclus</span>
                </li>
              </ul>
            </div>

            <button
              disabled
              className="rounded-full border border-border bg-muted/40 py-3 text-xs font-bold text-muted-foreground w-full cursor-not-allowed"
            >
              Formule actuelle
            </button>
          </motion.div>

          {/* Plan Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="app-card relative flex flex-col justify-between p-8 space-y-6 border-primary bg-gradient-to-br from-card via-card to-primary/10 shadow-xl"
          >
            <div className="absolute -top-3.5 right-6">
              <span className="unesco-badge rounded-full px-4 py-1 text-xs uppercase tracking-wider">
                ✦ Recommandé
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent fill-accent" />
                  <span>HeriTogo Premium</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Pour les passionnés de culture et les voyageurs au Togo.</p>
              </div>

              <div className="pt-2">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-primary">2 000 FCFA</span>
                <span className="text-xs font-semibold text-muted-foreground"> / mois</span>
              </div>

              <ul className="space-y-3.5 pt-4 border-t border-border text-xs sm:text-sm font-medium text-foreground">
                <li className="flex items-center gap-3 font-semibold">
                  <Shield className="h-4 w-4 text-primary shrink-0" />
                  <span>Scans de monuments IA illimités</span>
                </li>
                <li className="flex items-center gap-3 font-semibold">
                  <Zap className="h-4 w-4 text-accent shrink-0" />
                  <span>Audio-guides multilingues complets (TTS haute qualité)</span>
                </li>
                <li className="flex items-center gap-3 font-semibold">
                  <Star className="h-4 w-4 text-accent fill-accent shrink-0" />
                  <span>Réservation prioritaire de guides vérifiés</span>
                </li>
                <li className="flex items-center gap-3 font-semibold">
                  <Shield className="h-4 w-4 text-primary shrink-0" />
                  <span>Historique des scans et navigation hors-ligne</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent/15 py-1.5 px-3 text-[11px] font-bold text-[#8A3A20] dark:text-amber-200">
                <Zap className="h-3.5 w-3.5 text-accent" />
                <span>Activation instantanée en mode démo</span>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-white shadow-lg hover:bg-primary-dark transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <span>Activer l’accès Premium</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </main>
  )
}
