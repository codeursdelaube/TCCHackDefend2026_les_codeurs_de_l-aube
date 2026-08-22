'use client'

import { useState } from 'react'
import {
  AlertCircle, ArrowRight, Bus, Calculator, Check, ChevronRight,
  Compass, DollarSign, HeartHandshake, HelpCircle, Info,
  Languages, MapPin, Phone, PhoneCall, ShieldAlert, Sparkles, X, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@/i18n/navigation'

const EMERGENCY_CONTACTS = [
  { name: 'Police Nationale', number: '117', desc: 'Secours & assistance sécurité 24/7' },
  { name: 'Sapeurs-Pompiers', number: '118', desc: 'Incendies, secours d’urgence & sauvetage' },
  { name: 'Gendarmerie Nationale', number: '172', desc: 'Sécurité routière & zones interurbaines' },
  { name: 'SAMU / Urgences CHU Sylvanus Olympio', number: '+228 22 21 25 01', desc: 'Urgences médicales Lomé' },
  { name: 'Assistance Tourisme Togo', number: '+228 22 21 43 13', desc: 'Direction Générale du Tourisme' },
]

const SURVIVAL_VOCABULARY = [
  { fr: 'Bienvenue', ewe: 'Wôézo', kabye: 'Kazaou', tip: 'À dire et entendre partout' },
  { fr: 'Bonjour (matin)', ewe: 'Ndi na wò', kabye: 'Ŋgɔnɔɔ', tip: 'Salutation matinale' },
  { fr: 'Comment ça va ?', ewe: 'Efɔa ?', kabye: 'Ɛzɩmwaa ?', tip: 'Réponse : Efɔ nyuie (Je vais bien)' },
  { fr: 'Merci beaucoup', ewe: 'Akpé kaaka', kabye: 'Esɔ sɛ', tip: 'Politesse très appréciée' },
  { fr: 'Combien ça coûte ?', ewe: 'Nényé wònye ?', kabye: 'Pɩkɛ ɛzɩmta ?', tip: 'Indispensable au marché' },
  { fr: 'C’est trop cher !', ewe: 'Ega la sɔgbɔ !', kabye: 'Pɩlɩɩ kpem !', tip: 'Pour négocier avec le sourire' },
  { fr: 'Au revoir', ewe: 'Mia dogo', kabye: 'Dɩkaatɩ', tip: 'À bientôt' },
]

const TRANSPORT_TIPS = [
  {
    mode: 'Zémidjan (Zem)',
    icon: '🛵',
    desc: 'Moto-taxi avec gilet jaune ou numéroté.',
    price: '200 à 600 FCFA',
    tip: 'Négociez le prix avant de monter en indiquant clairement votre destination.'
  },
  {
    mode: 'Taxi collectif de ville',
    icon: '🚕',
    desc: 'Taxis jaunes urbains à Lomé.',
    price: '300 à 500 FCFA / course',
    tip: 'Idéal pour les longs trajets sur les grands axes.'
  },
  {
    mode: 'Bus & Minibus Interurbains',
    icon: '🚌',
    desc: 'Gares routières d’Agbalépédogan, Kpalimé, Sokodé.',
    price: '2 500 à 10 000 FCFA',
    tip: 'Privilégiez les départs matinaux (6h-8h) pour voyager au frais.'
  }
]

export default function TouristToolkit() {
  const [activeTab, setActiveTab] = useState<'convertisseur' | 'lexique' | 'transport' | 'urgence'>('convertisseur')
  const [eurAmount, setEurAmount] = useState<string>('10')
  const [fcfaAmount, setFcfaAmount] = useState<string>('6500')

  // Taux officiel : 1 EUR = 655.957 XOF / FCFA
  const RATE_EUR_FCFA = 655.957

  const handleEurChange = (val: string) => {
    setEurAmount(val)
    const num = parseFloat(val)
    if (!isNaN(num)) {
      setFcfaAmount(Math.round(num * RATE_EUR_FCFA).toString())
    } else {
      setFcfaAmount('')
    }
  }

  const handleFcfaChange = (val: string) => {
    setFcfaAmount(val)
    const num = parseFloat(val)
    if (!isNaN(num)) {
      setEurAmount((num / RATE_EUR_FCFA).toFixed(2))
    } else {
      setEurAmount('')
    }
  }

  return (
    <section className="rounded-3xl border border-[#E5E5E0] dark:border-[#243B2C] bg-white dark:bg-[#182B1E] p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-[#E5E5E0] dark:border-[#243B2C] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1B7E4B]">
            <Compass className="h-4 w-4" />
            <span>Boîte à outils du voyageur</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A] dark:text-[#F0F0EC] mt-1">
            Facilitez votre séjour au Togo
          </h2>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('convertisseur')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'convertisseur'
                ? 'bg-[#1B7E4B] text-white shadow-xs'
                : 'bg-[#F5F5F0] dark:bg-[#1C2E22] text-[#767676] dark:text-[#9CA89E] hover:text-[#1A1A1A] dark:text-[#F0F0EC]'
            }`}
          >
            💶 Devises FCFA
          </button>
          <button
            onClick={() => setActiveTab('lexique')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'lexique'
                ? 'bg-[#1B7E4B] text-white shadow-xs'
                : 'bg-[#F5F5F0] dark:bg-[#1C2E22] text-[#767676] dark:text-[#9CA89E] hover:text-[#1A1A1A] dark:text-[#F0F0EC]'
            }`}
          >
            🗣️ Parler local
          </button>
          <button
            onClick={() => setActiveTab('transport')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'transport'
                ? 'bg-[#1B7E4B] text-white shadow-xs'
                : 'bg-[#F5F5F0] dark:bg-[#1C2E22] text-[#767676] dark:text-[#9CA89E] hover:text-[#1A1A1A] dark:text-[#F0F0EC]'
            }`}
          >
            🛵 Transports
          </button>
          <button
            onClick={() => setActiveTab('urgence')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'urgence'
                ? 'bg-[#C85C2D] text-white shadow-xs'
                : 'bg-[#F5F5F0] dark:bg-[#1C2E22] text-[#767676] dark:text-[#9CA89E] hover:text-[#1A1A1A] dark:text-[#F0F0EC]'
            }`}
          >
            📞 Urgences
          </button>
        </div>
      </div>

      {/* ── Onglet CONVERTISSEUR DEVISES ── */}
      {activeTab === 'convertisseur' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#1C2E22] p-4 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#767676] dark:text-[#9CA89E]">Montant en Euros (€)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={eurAmount}
                  onChange={(e) => handleEurChange(e.target.value)}
                  className="w-full bg-white dark:bg-[#182B1E] rounded-xl border border-[#E5E5E0] dark:border-[#243B2C] px-3.5 py-2.5 text-lg font-black text-[#1A1A1A] dark:text-[#F0F0EC] outline-none focus:border-[#1B7E4B]"
                  placeholder="0.00"
                />
                <span className="font-bold text-sm text-[#767676] dark:text-[#9CA89E]">EUR</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#1C2E22] p-4 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#767676] dark:text-[#9CA89E]">Équivalent en Francs CFA (FCFA)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={fcfaAmount}
                  onChange={(e) => handleFcfaChange(e.target.value)}
                  className="w-full bg-white dark:bg-[#182B1E] rounded-xl border border-[#E5E5E0] dark:border-[#243B2C] px-3.5 py-2.5 text-lg font-black text-[#1B7E4B] outline-none focus:border-[#1B7E4B]"
                  placeholder="0"
                />
                <span className="font-bold text-sm text-[#767676] dark:text-[#9CA89E]">XOF</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#1B7E4B]/10 border border-[#1B7E4B]/20 p-3.5 flex items-center justify-between text-xs text-[#1A1A1A] dark:text-[#F0F0EC]">
            <span>💡 <strong>Repère rapide :</strong> 1 000 FCFA ≈ 1,52 € · 5 000 FCFA ≈ 7,62 € · 10 000 FCFA ≈ 15,24 €</span>
            <span className="font-bold text-[#1B7E4B] shrink-0 ml-2">Taux fixe BCEAO</span>
          </div>
        </div>
      )}

      {/* ── Onglet PARLER LOCAL (LEXIQUE ÉWÉ / KABYÈ) ── */}
      {activeTab === 'lexique' && (
        <div className="space-y-3">
          <p className="text-xs text-[#767676] dark:text-[#9CA89E]">
            Les Togolais adorent quand les visiteurs saluent dans les langues locales. Voici les expressions clés :
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SURVIVAL_VOCABULARY.map((item, i) => (
              <div key={i} className="rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#1C2E22] p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F0F0EC]">{item.fr}</span>
                  <span className="text-[10px] text-[#767676] dark:text-[#9CA89E] italic">{item.tip}</span>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-[#E5E5E0] dark:border-[#243B2C] text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#1B7E4B]">Éwé (Sud) : </span>
                    <strong className="text-[#1A1A1A] dark:text-[#F0F0EC]">{item.ewe}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#C85C2D]">Kabyè (Nord) : </span>
                    <strong className="text-[#1A1A1A] dark:text-[#F0F0EC]">{item.kabye}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Onglet TRANSPORTS ── */}
      {activeTab === 'transport' && (
        <div className="grid gap-3 sm:grid-cols-3">
          {TRANSPORT_TIPS.map((tr, i) => (
            <div key={i} className="rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#1C2E22] p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-1">{tr.icon}</div>
                <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-[#F0F0EC]">{tr.mode}</h3>
                <p className="text-xs text-[#767676] dark:text-[#9CA89E] mt-1 leading-relaxed">{tr.desc}</p>
              </div>
              <div className="pt-2 border-t border-[#E5E5E0] dark:border-[#243B2C] space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#767676] dark:text-[#9CA89E]">Tarif moyen :</span>
                  <strong className="text-[#1B7E4B]">{tr.price}</strong>
                </div>
                <p className="text-[10px] text-[#3D3D3D] dark:text-[#F0F0EC] italic bg-white dark:bg-[#182B1E] p-2 rounded-lg border border-[#E5E5E0] dark:border-[#243B2C]">
                  💡 {tr.tip}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Onglet URGENCES ── */}
      {activeTab === 'urgence' && (
        <div className="space-y-3">
          <p className="text-xs text-[#767676] dark:text-[#9CA89E]">
            Numéros officiels d’assistance et de secours au Togo, accessibles gratuitement 24h/24 :
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {EMERGENCY_CONTACTS.map((c, i) => (
              <a
                key={i}
                href={`tel:${c.number.replace(/\s+/g, '')}`}
                className="flex items-center justify-between rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#1C2E22] p-3.5 hover:border-[#C85C2D] hover:bg-white dark:bg-[#182B1E] transition-all group"
              >
                <div>
                  <p className="font-bold text-xs text-[#1A1A1A] dark:text-[#F0F0EC]">{c.name}</p>
                  <p className="text-[10px] text-[#767676] dark:text-[#9CA89E]">{c.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-[#C85C2D] px-3 py-1.5 text-xs font-black text-white shrink-0 group-hover:scale-105 transition-transform">
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>{c.number}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
