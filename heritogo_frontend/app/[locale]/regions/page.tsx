'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ChefHat, Compass, Landmark, MapPin, Star, TreePine, Waves
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

/* ─── Types ─────────────────────────────────────────── */
interface RegionSpecialty {
  nom: string
  type: 'plat' | 'site' | 'activite'
  emoji: string
}

interface TogoRegion {
  id: string
  nom: string
  capitale: string
  description: string
  tagline: string
  image: string          // image principale
  coverColor: string     // gradient fallback
  accent: string         // couleur de badge
  sites: string[]        // noms de sites emblématiques (statiques)
  plats: string[]        // spécialités culinaires
  activites: string[]    // choses à faire
  stat: { value: string; label: string }[]
  highlights: RegionSpecialty[]
  siteIds: string[]      // IDs dans /lieux/[id] pour les liens
}

/* ─── Données Régions ────────────────────────────────── */
const regionsData: TogoRegion[] = [
  {
    id: 'maritime',
    nom: 'Région Maritime',
    capitale: 'Lomé',
    tagline: 'La porte de l\'Afrique de l\'Ouest',
    description:
      'La Région Maritime est le cœur économique et culturel du Togo. Lomé, sa capitale, est l\'une des rares capitales africaines situées directement sur la frontière d\'un pays — entre plage et avenue. Elle concentre palais coloniaux, marchés animés, cathédrales historiques et une gastronomie de bord de mer incomparable.',
    image: '/Sites/palais_de_lome.webp',
    coverColor: 'from-[#1B7E4B] to-[#0d4d2a]',
    accent: '#1B7E4B',
    sites: ['Grand Marché d\'Assigamé', 'Cathédrale de Lomé', 'Palais de Lomé', 'Monument du Centenaire', 'Maison des Esclaves'],
    plats: ['Soupe de poisson', 'Riz gras', 'Brochettes de viande', 'Agbeli', 'Akpan (bière de mil)'],
    activites: ['Visite du Grand Marché', 'Promenade sur la plage de Lomé', 'Tour de la Corniche', 'Shopping village artisanal'],
    stat: [
      { value: '5', label: 'Sites majeurs' },
      { value: '2M+', label: 'Habitants' },
      { value: '50 km', label: 'De côte' },
    ],
    highlights: [
      { nom: 'Grand Marché d\'Assigamé', type: 'site', emoji: '🏛️' },
      { nom: 'Palais de Lomé', type: 'site', emoji: '🏰' },
      { nom: 'Soupe de poisson', type: 'plat', emoji: '🐟' },
      { nom: 'Plage de Lomé', type: 'activite', emoji: '🏖️' },
    ],
    siteIds: ['grand_marche_lome', 'cathedrale_lome', 'palais_de_lome', 'marche_fetiches_akodessewa', 'togoville_sanctuaire', 'aneho_cite_coloniale', 'plage_de_lome'],
  },
  {
    id: 'plateaux',
    nom: 'Région des Plateaux',
    capitale: 'Atakpamé',
    tagline: 'La Suisse de l\'Afrique de l\'Ouest',
    description:
      'La Région des Plateaux est réputée pour ses paysages montagneux, ses cascades spectaculaires et ses plantations de café et de cacao. Le Mont Agou (986 m), point culminant du Togo, y trône majestueusement. Kpalimé, ville principale, est entourée d\'une forêt tropicale dense traversée par des sentiers de randonnée.',
    image: '/Sites/kpalimé.jpg',
    coverColor: 'from-[#2d7d52] to-[#1a4d32]',
    accent: '#2d7d52',
    sites: ['Mont Agou (986 m)', 'Cascades de Kpimé', 'Cascade d\'Aklowa', 'Château Viale', 'Muraille de Notsè'],
    plats: ['Fufu de montagne', 'Café du Kloto', 'Igname pilée', 'Haricot rouge', 'Mangue sauvage'],
    activites: ['Randonnée au Mont Agou', 'Visite des cascades', 'Dégustation café artisanal', 'Observation des papillons'],
    stat: [
      { value: '6', label: 'Sites majeurs' },
      { value: '986 m', label: 'Mont Agou' },
      { value: '60+', label: 'Espèces papillons' },
    ],
    highlights: [
      { nom: 'Mont Agou', type: 'site', emoji: '⛰️' },
      { nom: 'Cascades de Kpimé', type: 'site', emoji: '💧' },
      { nom: 'Café du Kloto', type: 'plat', emoji: '☕' },
      { nom: 'Randonnée forêt', type: 'activite', emoji: '🌿' },
    ],
    siteIds: ['kpalime', 'chateau_vial', 'cascade_yikpa', 'cascade_kpime', 'cascade_aklowa', 'notse_agbogbo'],
  },
  {
    id: 'centrale',
    nom: 'Région Centrale',
    capitale: 'Sokodé',
    tagline: 'Le cœur sauvage du Togo',
    description:
      'La Région Centrale abrite le Parc National de Fazao-Malfakassa, l\'un des plus grands parcs protégés d\'Afrique de l\'Ouest. Elle est le berceau de la culture Kotokoli et des traditions de pêche du lac Nangbéto. Une région pour les amoureux de nature sauvage, d\'éléphants et de traditions ancestrales.',
    image: '/Sites/fazao_malfakassa.jpg',
    coverColor: 'from-[#C85C2D] to-[#8B3A1A]',
    accent: '#C85C2D',
    sites: ['Parc de Fazao-Malfakassa', 'Lac Nangbéto & Barrage', 'Sokodé Historique', 'Fête Gadao-Adossa'],
    plats: ['Tô de sorgho', 'Soupe de baobab', 'Beurre de karité', 'Viande de gibier'],
    activites: ['Safari faune', 'Pêche traditionnelle au lac', 'Rencontre peuple Kotokoli', 'Observation éléphants'],
    stat: [
      { value: '192k ha', label: 'Parc protégé' },
      { value: '300+', label: 'Espèces animales' },
      { value: '5', label: 'Ethnies' },
    ],
    highlights: [
      { nom: 'Parc de Fazao', type: 'site', emoji: '🦁' },
      { nom: 'Lac Nangbéto', type: 'site', emoji: '🎣' },
      { nom: 'Tô de sorgho', type: 'plat', emoji: '🌾' },
      { nom: 'Safari faune', type: 'activite', emoji: '🐘' },
    ],
    siteIds: ['parc_fazao_malfakassa', 'lac_de_nangbeto', 'sokode_centre'],
  },
  {
    id: 'kara',
    nom: 'Région de la Kara',
    capitale: 'Kara',
    tagline: 'Patrimoine UNESCO & magie Tamberma',
    description:
      'La Région de la Kara est dominée par les impressionnantes tours-châteaux de Koutamakou, inscrites au patrimoine mondial de l\'UNESCO. Ce territoire habité par le peuple Batammariba est un monde à part entière, avec ses châteaux-tours de terre (takienta), ses forgerons ancestraux et ses rites initiatiques.',
    image: '/Sites/koutamakou.jpg',
    coverColor: 'from-[#E8A923] to-[#B07A10]',
    accent: '#B07A10',
    sites: ['Koutamakou (UNESCO)', 'Faille d\'Alédjo', 'Réserve de Sarakawa', 'Forgerons de Tcharè'],
    plats: ['Djenkoumé', 'Pâte de mil blanc', 'Viande de mouton', 'Bière locale (tchoukoutou)', 'Wagasi'],
    activites: ['Visite villages Tamberma', 'Rencontre forgerons Tcharè', 'Traversée Faille d\'Alédjo', 'Découverte rites initiatiques'],
    stat: [
      { value: 'UNESCO', label: 'Patrimoine mondial' },
      { value: '36k ha', label: 'Zone protégée' },
      { value: '20k', label: 'Batammariba' },
    ],
    highlights: [
      { nom: 'Koutamakou UNESCO', type: 'site', emoji: '🏛️' },
      { nom: 'Faille d\'Alédjo', type: 'site', emoji: '⛰️' },
      { nom: 'Tchoukoutou', type: 'plat', emoji: '🍺' },
      { nom: 'Forgerons Tcharè', type: 'activite', emoji: '🔨' },
    ],
    siteIds: ['koutamakou', 'faille_aledjo', 'reserve_sarakawa', 'forgerons_tchare'],
  },
  {
    id: 'savanes',
    nom: 'Région des Savanes',
    capitale: 'Dapaong',
    tagline: 'L\'extrême nord, terre de résilience',
    description:
      'La Région des Savanes, à la frontière du Burkina Faso, est la région la plus septentrionale du Togo. Ses immenses étendues de savane, ses termitières géantes, ses peintures rupestres préhistoriques et ses greniers suspendus de Nok en font une destination authentique hors des sentiers battus.',
    image: '/Sites/oti_mandouri.jpg',
    coverColor: 'from-[#8B6914] to-[#5a420c]',
    accent: '#8B6914',
    sites: ['Réserve Oti-Mandouri', 'Grottes et Greniers de Nok', 'Peintures de Namoundjoga', 'Marché de Dapaong'],
    plats: ['Gboma (épinards)', 'Soupe d\'arachide', 'Tô blanc de mil', 'Wagasi frit', 'Piment séché'],
    activites: ['Observation faune sauvage', 'Exploration grottes de Nok', 'Découverte art rupestre', 'Marché artisanal Dapaong'],
    stat: [
      { value: '147k ha', label: 'Réserve naturelle' },
      { value: '100+', label: 'Greniers de Nok' },
      { value: '15+', label: 'Ethnies locales' },
    ],
    highlights: [
      { nom: 'Réserve Oti-Mandouri', type: 'site', emoji: '🦛' },
      { nom: 'Grottes de Nok', type: 'site', emoji: '🏺' },
      { nom: 'Art Rupestre', type: 'site', emoji: '🎨' },
      { nom: 'Dapaong', type: 'activite', emoji: '🌍' },
    ],
    siteIds: ['reserve_oti_mandouri', 'peintures_namoundjoga', 'grottes_de_nok', 'dapaong_marche'],
  },
]

/* ─── Helpers ────────────────────────────────────────── */
function TypeBadge({ type }: { type: RegionSpecialty['type'] }) {
  const cfg = {
    site:     { label: 'Site',       bg: '#1B7E4B', icon: Landmark },
    plat:     { label: 'Spécialité', bg: '#C85C2D', icon: ChefHat },
    activite: { label: 'Activité',   bg: '#2d7d52', icon: Compass  },
  }[type]
  const Ic = cfg.icon
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase text-white"
      style={{ background: cfg.bg }}
    >
      <Ic className="h-2.5 w-2.5" />
      {cfg.label}
    </span>
  )
}

/* ─── Page Principale ────────────────────────────────── */
export default function RegionsPage() {
  const tMonuments = useTranslations('Monuments')
  const [selectedRegion, setSelectedRegion] = useState<string>(regionsData[0].id)
  const region = regionsData.find(r => r.id === selectedRegion) ?? regionsData[0]

  return (
    <main className="min-h-screen bg-white pb-28 pt-16 text-[#1A1A1A]">

      {/* ── HERO RÉGIONS ── */}
      <section className="relative h-72 w-full overflow-hidden sm:h-80">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={region.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image src={region.image} alt={region.nom} fill priority sizes="100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8A923]">
            Explorer le Togo
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-white sm:text-5xl">
            5 Régions, 5 Univers
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/80">
            Des savanes du nord aux plages du sud, chaque région du Togo a sa propre âme.
          </p>
        </div>
      </section>

      {/* ── ONGLETS RÉGIONS ── */}
      <div className="sticky top-14 z-30 border-b border-[#E5E5E0] bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-5xl gap-0 overflow-x-auto px-4 scrollbar-none">
          {regionsData.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRegion(r.id)}
              className={`shrink-0 border-b-2 px-4 py-3.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedRegion === r.id
                  ? 'border-[#1B7E4B] text-[#1B7E4B]'
                  : 'border-transparent text-[#767676] hover:text-[#1A1A1A]'
              }`}
            >
              {r.nom.replace('Région ', '').replace('de la ', '').replace('des ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENU DE LA RÉGION ACTIVE ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={region.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6"
        >

          {/* ── HEADER RÉGION ── */}
          <section className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <div>
              <span
                className="inline-flex items-center gap-2 rounded-xl px-3 py-1 text-xs font-bold uppercase text-white"
                style={{ background: region.accent }}
              >
                <MapPin className="h-3.5 w-3.5" />
                Capitale : {region.capitale}
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold text-[#1A1A1A] sm:text-4xl">{region.nom}</h2>
              <p className="mt-1 text-sm font-semibold italic text-[#767676]">{region.tagline}</p>
              <div className="togo-underline" />
              <p className="mt-4 text-sm leading-relaxed text-[#3D3D3D]">{region.description}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-2">
              {region.stat.map(s => (
                <div
                  key={s.label}
                  className="flex flex-col items-center justify-center rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] p-3 text-center"
                >
                  <p className="text-xl font-black text-[#1B7E4B] leading-none">{s.value}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#767676]">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── HIGHLIGHTS ── */}
          <section>
            <h3 className="mb-3 text-lg font-black text-[#1A1A1A]">À ne pas manquer</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {region.highlights.map(h => (
                <div
                  key={h.nom}
                  className="rounded-2xl border border-[#E5E5E0] bg-white p-4 text-center shadow-xs hover:shadow-md transition-all"
                >
                  <div className="text-3xl">{h.emoji}</div>
                  <TypeBadge type={h.type} />
                  <p className="mt-1.5 text-xs font-bold text-[#1A1A1A] leading-tight">{h.nom}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── GRILLE 3 COLONNES (Sites / Plats / Activités) ── */}
          <section className="grid gap-4 sm:grid-cols-3">
            
            {/* Sites */}
            <div className="rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#1A1A1A]">
                <Landmark className="h-4 w-4 text-[#1B7E4B]" />
                Sites emblématiques
              </h3>
              <ul className="space-y-2">
                {region.sites.map(s => (
                  <li key={s} className="flex items-center gap-2 text-xs text-[#3D3D3D]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B7E4B]" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Plats */}
            <div className="rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#1A1A1A]">
                <ChefHat className="h-4 w-4 text-[#C85C2D]" />
                Spécialités culinaires
              </h3>
              <ul className="space-y-2">
                {region.plats.map(p => (
                  <li key={p} className="flex items-center gap-2 text-xs text-[#3D3D3D]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C85C2D]" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Activités */}
            <div className="rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#1A1A1A]">
                <Compass className="h-4 w-4 text-[#E8A923]" />
                Que faire ici ?
              </h3>
              <ul className="space-y-2">
                {region.activites.map(a => (
                  <li key={a} className="flex items-center gap-2 text-xs text-[#3D3D3D]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8A923]" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── CTA VOIR SITES DE LA RÉGION ── */}
          <section className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/lieux?region=${region.id.charAt(0).toUpperCase() + region.id.slice(1)}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
              style={{ background: region.accent }}
            >
              <Landmark className="h-4 w-4" />
              Voir tous les sites de la {region.nom.replace('Région ', '')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/cuisine"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#E5E5E0] bg-[#F5F5F0] py-3.5 text-sm font-bold text-[#1A1A1A] transition-all hover:bg-[#E5E5E0] active:scale-95"
            >
              <ChefHat className="h-4 w-4 text-[#C85C2D]" />
              Explorer la gastronomie
            </Link>
          </section>

          {/* ── SITES RAPIDES LIÉS (si ids disponibles) ── */}
          {region.siteIds.length > 0 && (
            <section>
              <h3 className="mb-3 text-lg font-black text-[#1A1A1A]">
                Sites à visiter dans cette région
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {region.siteIds.map((sid) => (
                  <Link
                    key={sid}
                    href={`/lieux/${sid}`}
                    className="group flex shrink-0 items-center gap-2 rounded-xl border border-[#E5E5E0] bg-[#F5F5F0] px-4 py-2.5 text-xs font-bold text-[#1A1A1A] transition-all hover:border-[#1B7E4B]/50 hover:bg-white hover:shadow-sm"
                  >
                    <MapPin className="h-3.5 w-3.5 text-[#1B7E4B] shrink-0" />
                    <span className="whitespace-nowrap">{tMonuments(`${sid}.nom`)}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#767676] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </section>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ── NAVIGATION ENTRE RÉGIONS ── */}
      <div className="mx-auto max-w-5xl border-t border-[#E5E5E0] px-4 pt-8 pb-4 sm:px-6">
        <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-[#767676]">Toutes les régions</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {regionsData.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => { setSelectedRegion(r.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className={`group relative flex h-32 flex-col justify-end overflow-hidden rounded-2xl border text-left transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer ${
                selectedRegion === r.id ? 'border-[#1B7E4B] ring-2 ring-[#1B7E4B]/30' : 'border-[#E5E5E0]'
              }`}
            >
              <Image src={r.image} alt={r.nom} fill sizes="200px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 p-2">
                <p className="truncate text-[10px] font-black uppercase text-white leading-tight">
                  {r.nom.replace('Région ', '').replace('de la ', '').replace('des ', '')}
                </p>
                <p className="text-[9px] text-white/70">{r.capitale}</p>
              </div>
              {selectedRegion === r.id && (
                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#1B7E4B]">
                  <span className="text-[8px] font-black text-white">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
