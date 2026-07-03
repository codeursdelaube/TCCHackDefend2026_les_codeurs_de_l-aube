'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback } from 'react'
import { Link } from '@/i18n/navigation'
import { getInitials } from '@/lib/auth/redirect'
import { COLORS } from '@/lib/constants/colors'
import {
  Star, Compass, Languages, MapPin, Search, SlidersHorizontal,
  UserCheck, ShieldCheck, Heart, AlertCircle, Loader2
} from 'lucide-react'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { apiFetch } from '@/lib/utils/http'
import { safeJsonParse, safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils/storage'


interface GuideRow {
  id: string
  user_id: string
  experience_years: number
  specialties: string[]
  languages: string[]
  coverage_zones: string[]
  full_day_rate: string | null
  avg_rating: string
  total_reviews: number
  profile: {
    full_name: string
    avatar_url?: string
    bio?: string
  }
}

const ZONES = ['Lomé', 'Kpalimé', 'Atakpamé', 'Kara', 'Dapaong', 'Aného', 'Togoville']
const LANGUAGES = ['Français', 'English', 'Espagnol', 'Deutsch', 'Éwé', 'Kabyè', 'Mina']

export default function GuidesPage() {
  const [guides, setGuides] = useState<GuideRow[]>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters State
  const [selectedZone, setSelectedZone] = useState('')
  const [selectedLang, setSelectedLang] = useState('')
  const [maxPrice, setMaxPrice] = useState('100000')
  const [searchQuery, setSearchQuery] = useState('')

  // Favorites State (Stored in localStorage)
  const [favIds, setFavIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    return safeJsonParse<string[]>(safeLocalStorageGet('heritogo_favorites'), [])
  })

  const fetchGuides = useCallback(async () => {
    setLoading(true)
    try {
      setError(null)
      const url = new URL('/api/guides', window.location.origin)
      if (selectedZone) url.searchParams.append('zone', selectedZone)
      if (selectedLang) url.searchParams.append('lang', selectedLang)
      if (maxPrice !== '100000') url.searchParams.append('price', maxPrice)

      const result = await apiFetch<{ guides?: GuideRow[] }>(url.toString())
      if (!result.ok || !result.data) {
        setError(result.error || 'Erreur lors de la récupération des guides')
        return
      }

      setGuides(result.data.guides || [])
    } catch (err: unknown) {
      console.error(err)
      setError(getUserFriendlyError(err))
    } finally {
      setLoading(false)
    }
  }, [selectedZone, selectedLang, maxPrice])

  useEffect(() => {
    fetchGuides()
  }, [fetchGuides])

  const toggleFavorite = (guideId: string) => {
    let updatedFavs = [...favIds]
    if (favIds.includes(guideId)) {
      updatedFavs = updatedFavs.filter(id => id !== guideId)
    } else {
      updatedFavs.push(guideId)
    }
    setFavIds(updatedFavs)
    safeLocalStorageSet('heritogo_favorites', JSON.stringify(updatedFavs))
  }

  // Client side search filter
  const filteredGuides = guides?.filter(guide =>
    guide.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (guide.profile.bio && guide.profile.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
    guide.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-32 pt-24 text-base-content sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-8 text-center sm:text-left">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider text-white"
          style={{ backgroundColor: COLORS.forest }}
        >
          <UserCheck className="h-3.5 w-3.5" />
          Guides certifiés
        </span>
        <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl text-base-content">
          Trouvez le guide local parfait
        </h1>
        <p className="mt-2 text-sm text-base-content/65 leading-6 max-w-2xl">
          Explorez le Togo en toute sécurité accompagnés de professionnels passionnés. Histoire, culture, cuisine, nature : choisissez votre expert.
        </p>
      </div>

      {/* Filter and Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_3fr]">

        {/* Filters Sidebar */}
        <div className="rounded-[28px] border border-border bg-base-200 p-5 h-fit shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="flex items-center gap-2 text-sm font-black uppercase tracking-wider">
              <SlidersHorizontal className="h-4 w-4 text-primary" style={{ color: COLORS.forest }} />
              Filtres
            </span>
            {(selectedZone || selectedLang || maxPrice !== '100000') && (
              <button
                onClick={() => {
                  setSelectedZone('')
                  setSelectedLang('')
                  setMaxPrice('100000')
                }}
                className="text-xs font-bold text-error hover:underline"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full rounded-2xl bg-base-100 pl-10 text-sm focus:border-primary focus:outline-none"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-base-content/40" />
          </div>

          {/* Zone Filter */}
          <div>
            <span className="block text-xs font-black uppercase tracking-wider text-base-content/60 mb-2">Zone de couverture</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="select select-bordered w-full rounded-2xl bg-base-100 focus:outline-none focus:border-primary text-sm"
            >
              <option value="">Toutes les zones</option>
              {ZONES.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <span className="block text-xs font-black uppercase tracking-wider text-base-content/60 mb-2">Langue parlée</span>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="select select-bordered w-full rounded-2xl bg-base-100 focus:outline-none focus:border-primary text-sm"
            >
              <option value="">Toutes les langues</option>
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="block text-xs font-black uppercase tracking-wider text-base-content/60">Prix Max / Jour</span>
              <span className="text-xs font-bold text-base-content/80">{Number(maxPrice).toLocaleString()} XOF</span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="range range-xs range-primary"
            />
          </div>
        </div>

        {/* Guides List */}
        <div>
          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="alert alert-error rounded-2xl p-4 font-bold text-white flex items-center gap-2 border-none">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          ) : filteredGuides?.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-border bg-base-200 p-12 text-center">
              <Compass className="mx-auto h-12 w-12 text-base-content/30 mb-3" />
              <h3 className="font-serif text-xl font-bold">Aucun guide trouvé</h3>
              <p className="text-sm text-base-content/60 mt-1 max-w-sm mx-auto">
                Modifiez vos filtres ou élargissez votre recherche pour trouver des guides locaux.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredGuides?.map((guide) => (
                <div
                  key={guide.id}
                  className="group relative flex flex-col justify-between rounded-[32px] border border-border bg-base-200 p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
                >
                  {/* Top Header Card */}
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        {guide.profile.avatar_url ? (
                          <img
                            src={guide.profile.avatar_url}
                            alt={guide.profile.full_name}
                            className="h-14 w-14 rounded-2xl object-cover shrink-0"
                          />
                        ) : (
                          <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white"
                            style={{ backgroundColor: COLORS.forest }}
                          >
                            {getInitials(guide.profile.full_name)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-base-content text-base leading-tight group-hover:text-primary transition-colors">
                              {guide.profile.full_name}
                            </h4>
                            <span
                              className="badge badge-success badge-sm text-[9px] text-white font-extrabold uppercase py-2.5 px-2 rounded-lg gap-0.5"
                            >
                              <ShieldCheck className="h-3 w-3 shrink-0" />
                              Certifié
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs">
                            <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                            <span className="font-bold text-base-content">{Number(guide.avg_rating).toFixed(1)}</span>
                            <span className="text-base-content/40">({guide.total_reviews} avis)</span>
                          </div>
                        </div>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(guide.id)}
                        className="rounded-full p-2 bg-base-100 hover:bg-base-300 transition-colors text-base-content/60 active:scale-95"
                      >
                        <Heart
                          className={`h-4.5 w-4.5 transition-colors ${favIds.includes(guide.id)
                              ? 'fill-red-500 stroke-red-500'
                              : 'hover:text-red-500'
                            }`}
                        />
                      </button>
                    </div>

                    <p className="mt-4 text-xs text-base-content/70 line-clamp-3 leading-5">
                      {guide.profile.bio || 'Guide professionnel certifié engagé à faire découvrir la richesse du patrimoine togolais.'}
                    </p>

                    <div className="mt-5 space-y-2 border-t border-border/55 pt-4">
                      <div className="flex items-center gap-2 text-xs text-base-content/75">
                        <Languages className="h-4 w-4 text-base-content/40 shrink-0" />
                        <span className="font-semibold text-[10px] uppercase text-base-content/50 w-16">Langues :</span>
                        <span className="truncate">{guide.languages?.join(', ') || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-base-content/75">
                        <MapPin className="h-4 w-4 text-base-content/40 shrink-0" />
                        <span className="font-semibold text-[10px] uppercase text-base-content/50 w-16">Zones :</span>
                        <span className="truncate">{guide.coverage_zones?.join(', ') || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Actions */}
                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-border/55 pt-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">Tarif Journalier</p>
                      <p className="text-lg font-black text-base-content">
                        {guide.full_day_rate ? Number(guide.full_day_rate).toLocaleString() : 'N/A'} <span className="text-xs font-bold text-base-content/60">{guide.full_day_rate ? 'XOF/jour' : ''}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/guides/${guide.id}`}
                        className="btn btn-sm btn-ghost rounded-xl text-xs font-bold"
                      >
                        Voir profil
                      </Link>
                      <Link
                        href={`/booking/${guide.id}`}
                        className="btn btn-sm text-white rounded-xl border-none font-bold shadow-sm hover:shadow active:scale-95"
                        style={{ backgroundColor: COLORS.forest }}
                      >
                        Réserver
                      </Link>
                    </div>
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
