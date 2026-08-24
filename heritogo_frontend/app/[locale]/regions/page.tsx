'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ChefHat, Compass, Landmark, MapPin, Sparkles, TreePine, Waves, Globe2
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import Badge from '@/components/ui/Badge'
import SectionHeader from '@/components/ui/SectionHeader'
import { monuments } from '@/app/LieuxT/site'
import SiteCard from '@/components/ui/SiteCard'

/* ─── Types ─────────────────────────────────────────── */
interface RegionSpecialty {
  nom: string
  type: 'plat' | 'site' | 'activite'
}

interface TogoRegion {
  id: string
  nom: string
  regionKey: 'Maritime' | 'Plateaux' | 'Centrale' | 'Kara' | 'Savanes'
  capitale: string
  description: string
  tagline: string
  image: string
  sites: string[]
  plats: string[]
  activites: string[]
  stat: { value: string; label: string }[]
  highlights: RegionSpecialty[]
}

const regionsData: TogoRegion[] = [
  {
    id: 'maritime',
    nom: 'Région Maritime',
    regionKey: 'Maritime',
    capitale: 'Lomé',
    tagline: 'La porte atlantique & l’effervescence côtière',
    description:
      'La Région Maritime est le cœur économique et culturel du Togo. Lomé, sa capitale, est l’une des rares capitales africaines situées directement sur la côte atlantique. Elle concentre palais coloniaux, marchés animés (Assigamé), cathédrales historiques et une gastronomie de bord de mer incomparable.',
    image: '/Sites/palais_de_lome.webp',
    sites: ['Grand Marché d’Assigamé', 'Cathédrale de Lomé', 'Palais de Lomé', 'Monument de l’Indépendance', 'Maison des Esclaves (Agbodrafo)'],
    plats: ['Soupe de poisson frais', 'Ayimolou royal', 'Brochettes de mérou', 'Ablo & Akpan', 'Jus de baobab'],
    activites: ['Visite du Grand Marché', 'Promenade sur la plage de Lomé', 'Tour du Palais de Lomé', 'Artisanat au Village Artisanal'],
    stat: [
      { value: '12', label: 'Monuments majeurs' },
      { value: '2M+', label: 'Habitants' },
      { value: '50 km', label: 'Côte atlantique' },
    ],
    highlights: [
      { nom: 'Palais de Lomé', type: 'site' },
      { nom: 'Grand Marché d’Assigamé', type: 'site' },
      { nom: 'Ayimolou', type: 'plat' },
      { nom: 'Plage & Lac Togo', type: 'activite' },
    ],
  },
  {
    id: 'plateaux',
    nom: 'Région des Plateaux',
    regionKey: 'Plateaux',
    capitale: 'Atakpamé',
    tagline: 'Cascades, montagnes & plantations de café',
    description:
      'La Région des Plateaux est réputée pour ses paysages montagneux luxuriants, ses cascades spectaculaires et ses plantations de café et de cacao. Le Mont Agou (986 m), point culminant du Togo, y trône majestueusement au-dessus de Kpalimé et de ses galeries d’artisanat d’art.',
    image: '/Sites/kpalimé.jpg',
    sites: ['Mont Agou (986 m)', 'Cascades de Kpimé', 'Cascade d’Aklowa', 'Château Vial', 'Muraille de Notsè'],
    plats: ['Fufu traditionnel à la sauce graine', 'Café artisanal du Kloto', 'Djenkoumé', 'Bananes plantains frites (Aloco)'],
    activites: ['Randonnée au Mont Agou', 'Baignade aux cascades', 'Dégustation de café équitable', 'Observation des papillons tropicaux'],
    stat: [
      { value: '6', label: 'Sites naturels' },
      { value: '986 m', label: 'Point culminant' },
      { value: '60+', label: 'Cascades & cours d’eau' },
    ],
    highlights: [
      { nom: 'Cascade de Kpimé', type: 'site' },
      { nom: 'Château Vial', type: 'site' },
      { nom: 'Fufu Sauce Graine', type: 'plat' },
      { nom: 'Randonnée du Kloto', type: 'activite' },
    ],
  },
  {
    id: 'centrale',
    nom: 'Région Centrale',
    regionKey: 'Centrale',
    capitale: 'Sokodé',
    tagline: 'Le sanctuaire sauvage & la culture Kotokoli',
    description:
      'La Région Centrale abrite le Parc National de Fazao-Malfakassa, l’un des plus vastes parcs protégés d’Afrique de l’Ouest. Elle est le berceau de la culture Kotokoli, des danses des couteaux lors de la fête Gadao-Adossa et des traditions de pêche paisible du lac Nangbéto.',
    image: '/Sites/fazao_malfakassa.jpg',
    sites: ['Parc National Fazao-Malfakassa', 'Lac Nangbéto & Barrage', 'Sokodé Historique', 'Forêt classée d’Alédjo'],
    plats: ['Tô de sorgho', 'Soupe de baobab & gombo', 'Viande braisée au beurre de karité', 'Beignets Botokoin'],
    activites: ['Safari faune sauvage', 'Pêche traditionnelle au lac', 'Festival équestre Gadao-Adossa', 'Observation des éléphants'],
    stat: [
      { value: '192k ha', label: 'Parc protégé' },
      { value: '300+', label: 'Espèces animales' },
      { value: '5', label: 'Cités historiques' },
    ],
    highlights: [
      { nom: 'Fazao-Malfakassa', type: 'site' },
      { nom: 'Lac Nangbéto', type: 'site' },
      { nom: 'Tô de sorgho', type: 'plat' },
      { nom: 'Festival Gadao-Adossa', type: 'activite' },
    ],
  },
  {
    id: 'kara',
    nom: 'Région de la Kara',
    regionKey: 'Kara',
    capitale: 'Kara',
    tagline: 'Patrimoine mondial UNESCO & forteresses Tata Somba',
    description:
      'La Région de la Kara est dominée par les impressionnants châteaux-tours du Koutammakou, inscrits au Patrimoine Mondial de l’UNESCO. Ce territoire habité par le peuple Batammariba témoigne d’une harmonie unique entre architecture en terre (Takienta), forgerons ancestraux et rites traditionnels.',
    image: '/Sites/koutamakou.jpg',
    sites: ['Koutammakou (UNESCO)', 'Faille d’Alédjo', 'Réserve de faune de Sarakawa', 'Forgerons de Tcharè'],
    plats: ['Wagasi frit (fromage local)', 'Djenkoumé doré', 'Pâte de mil blanc', 'Tchoukoutou traditionnel'],
    activites: ['Exploration des Tata Somba', 'Rencontre des forgerons de Tcharè', 'Passage de la faille d’Alédjo', 'Lutte traditionnelle Evala'],
    stat: [
      { value: 'UNESCO', label: 'Patrimoine mondial' },
      { value: '36k ha', label: 'Zone classée' },
      { value: '4', label: 'Monuments signatures' },
    ],
    highlights: [
      { nom: 'Koutammakou (UNESCO)', type: 'site' },
      { nom: 'Faille d’Alédjo', type: 'site' },
      { nom: 'Wagasi & Tchoukoutou', type: 'plat' },
      { nom: 'Luttes Evala', type: 'activite' },
    ],
  },
  {
    id: 'savanes',
    nom: 'Région des Savanes',
    regionKey: 'Savanes',
    capitale: 'Dapaong',
    tagline: 'L’extrême nord, grottes rupestres & réserves sahéliennes',
    description:
      'La Région des Savanes, aux portes du Sahel, séduit par ses paysages infinis parsemés de baobabs géants. Les célèbres grottes et greniers suspendus de Nok, datant des temps de résistance, et les peintures rupestres de Namoundjoga constituent des trésors archéologiques inestimables.',
    image: '/Sites/grottes_nok.jpg',
    sites: ['Grottes & Greniers de Nok', 'Réserve Oti-Mandouri', 'Peintures de Namoundjoga', 'Marché artisanal de Dapaong'],
    plats: ['Gboma aux épinards locaux', 'Soupe onctueuse d’arachide', 'Tô de mil blanc', 'Wagasi grillé'],
    activites: ['Exploration des falaises de Nok', 'Safari à Oti-Mandouri', 'Découverte de l’art rupestre', 'Marché traditionnel de Dapaong'],
    stat: [
      { value: '147k ha', label: 'Réserve naturelle' },
      { value: '100+', label: 'Greniers de Nok' },
      { value: '4', label: 'Sites archéologiques' },
    ],
    highlights: [
      { nom: 'Grottes de Nok', type: 'site' },
      { nom: 'Réserve Oti-Mandouri', type: 'site' },
      { nom: 'Peintures Namoundjoga', type: 'site' },
      { nom: 'Marché de Dapaong', type: 'activite' },
    ],
  },
]

function TypeBadge({ type }: { type: RegionSpecialty['type'] }) {
  const cfg = {
    site: { label: 'Site', icon: Landmark },
    plat: { label: 'Saveur', icon: ChefHat },
    activite: { label: 'Activité', icon: Compass },
  }[type]
  const Ic = cfg.icon
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase text-white shadow-xs">
      <Ic className="h-2.5 w-2.5" />
      {cfg.label}
    </span>
  )
}

export default function RegionsPage() {
  const tMonuments = useTranslations('Monuments')
  const [selectedRegion, setSelectedRegion] = useState<string>(regionsData[0].id)
  const region = regionsData.find((r) => r.id === selectedRegion) ?? regionsData[0]

  const regionMonuments = monuments.filter((m) => m.région === region.regionKey)

  return (
    <main className="min-h-screen bg-background pb-28 pt-20 text-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* ── HERO BANDEAU ── */}
        <section className="relative isolate min-h-[340px] sm:min-h-[380px] overflow-hidden rounded-3xl border border-border bg-[#171009] shadow-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={region.id}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={region.image}
                alt={region.nom}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover brightness-[0.85]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171009] via-[#171009]/55 to-transparent" />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 flex min-h-[340px] sm:min-h-[380px] flex-col justify-end p-6 sm:p-10 text-white">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <Globe2 className="h-3.5 w-3.5" />
                <span>5 Régions, 5 Univers</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FBF6EF]">
                {region.nom}
              </h1>
              <p className="text-sm sm:text-base font-medium text-amber-200">
                {region.tagline}
              </p>
            </div>
          </div>
        </section>

        {/* ── ONGLETS RÉGIONS ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none sticky top-16 bg-background/95 backdrop-blur-md z-20 pt-2 border-b border-border">
          {regionsData.map((r) => {
            const active = selectedRegion === r.id
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRegion(r.id)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {r.nom.replace('Région ', '').replace('de la ', '').replace('des ', '')}
              </button>
            )
          })}
        </div>

        {/* ── CONTENU DE LA RÉGION ACTIVE ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={region.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="space-y-10"
          >
            {/* Présentation & Stats */}
            <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
              <div className="app-card p-6 sm:p-8 lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Chef-lieu : {region.capitale}</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                  L’esprit de la {region.nom}
                </h2>
                <div className="togo-underline" />
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-medium pt-2">
                  {region.description}
                </p>
              </div>

              {/* Stats Chiffres Clés */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:col-span-4">
                {region.stat.map((s) => (
                  <div
                    key={s.label}
                    className="app-card flex flex-col items-center justify-center p-5 text-center"
                  >
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-primary leading-none">
                      {s.value}
                    </span>
                    <span className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Incontournables Highlights */}
            <section className="space-y-4">
              <SectionHeader
                kicker="Sélection"
                title="À ne pas manquer dans la région"
                icon={Sparkles}
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {region.highlights.map((h) => (
                  <div
                    key={h.nom}
                    className="app-card flex flex-col items-center justify-between p-4 text-center space-y-2 hover:shadow-md transition-shadow"
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                      {h.type === 'site' ? (
                        <Landmark className="h-6 w-6" />
                      ) : h.type === 'plat' ? (
                        <ChefHat className="h-6 w-6" />
                      ) : (
                        <Compass className="h-6 w-6" />
                      )}
                    </div>
                    <TypeBadge type={h.type} />
                    <p className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                      {h.nom}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Grille 3 Colonnes : Sites / Spécialités / Que faire */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="app-card p-5 space-y-3">
                <h3 className="flex items-center gap-2 font-serif text-base font-bold text-foreground">
                  <Landmark className="h-4 w-4 text-primary" />
                  <span>Sites emblématiques</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  {region.sites.map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span className="font-medium text-foreground">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="app-card p-5 space-y-3">
                <h3 className="flex items-center gap-2 font-serif text-base font-bold text-foreground">
                  <ChefHat className="h-4 w-4 text-primary" />
                  <span>Spécialités culinaires</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  {region.plats.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span className="font-medium text-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="app-card p-5 space-y-3">
                <h3 className="flex items-center gap-2 font-serif text-base font-bold text-foreground">
                  <Compass className="h-4 w-4 text-primary" />
                  <span>Que faire sur place ?</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  {region.activites.map((a) => (
                    <li key={a} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span className="font-medium text-foreground">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sites réels de cette région */}
            {regionMonuments.length > 0 && (
              <section className="space-y-5">
                <SectionHeader
                  kicker="Monuments & Trésors"
                  title={`Monuments de la ${region.nom}`}
                  subtitle={`Explorez les fiches détaillées des ${regionMonuments.length} sites recensés dans cette région.`}
                  actionHref="/lieux"
                  actionLabel="Voir tous les 29 lieux"
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {regionMonuments.map((m) => (
                    <SiteCard
                      key={m.id}
                      id={m.id}
                      nom={tMonuments(`${m.id}.nom`)}
                      region={m.région}
                      localite={m.localite}
                      description={tMonuments(`${m.id}.description`)}
                      image={m.image}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* CTA Bas de page */}
            <div className="app-card p-6 sm:p-8 bg-gradient-to-r from-primary/10 via-card to-accent/10 flex flex-col sm:flex-row items-center justify-between gap-4 border-primary/20">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-serif text-xl font-bold text-foreground">Préparez votre séjour en {region.nom}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Trouvez un guide local certifié pour une immersion authentique.</p>
              </div>
              <Link
                href="/guides"
                className="shrink-0 rounded-full bg-primary px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-primary-dark transition-all"
              >
                Réserver un guide local →
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </main>
  )
}