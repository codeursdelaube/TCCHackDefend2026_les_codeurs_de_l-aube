'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback } from 'react'
import { getInitials } from '@/lib/auth/redirect'
import {
  SlidersHorizontal,
  UserCheck, AlertCircle, Loader2, Sparkles, Search
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { apiFetchCached } from '@/lib/utils/http'
import { safeJsonParse, safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils/storage'
import { toast } from 'sonner'
import GuideCard from '@/components/ui/GuideCard'
import SectionHeader from '@/components/ui/SectionHeader'

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
  const t = useTranslations('GuidesPage')
  const [guides, setGuides] = useState<GuideRow[]>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters State
  const [selectedZone, setSelectedZone] = useState('')
  const [selectedLang, setSelectedLang] = useState('')
  const [maxPrice, setMaxPrice] = useState('100000')
  const [searchQuery, setSearchQuery] = useState('')

  // Favorites State
  const [favIds, setFavIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    return safeJsonParse<string[]>(safeLocalStorageGet('heritogo_favorites'), [])
  })


  const fetchGuides = useCallback(async () => {
    setLoading(true)
    try {
      setError(null)
      // Fetch ALL guides — filtering is done client-side on the cached set
      const url = new URL('/api/guides', window.location.origin)

      const result = await apiFetchCached<{ guides?: GuideRow[] }>(url.toString(), {
        cacheKey: 'public-guides',
        ttlMs: 5 * 60 * 1000,
      })
      if (!result.ok || !result.data) {
        setError(result.error || t('error_loading'))
        return
      }

      const freshGuides = result.data.guides || []
      setGuides(freshGuides)
    } catch (err: unknown) {
      console.error(err)
      setError(getUserFriendlyError(err))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchGuides()
  }, [fetchGuides])


  const toggleFavorite = (guideId: string) => {
    let updatedFavs = [...favIds]
    if (favIds.includes(guideId)) {
      updatedFavs = updatedFavs.filter(id => id !== guideId)
      toast.info('Guide retiré des favoris')
    } else {
      updatedFavs.push(guideId)
      toast.success('Guide ajouté aux favoris')
    }
    setFavIds(updatedFavs)
    safeLocalStorageSet('heritogo_favorites', JSON.stringify(updatedFavs))
  }

  // Full client-side filtering on the cached dataset
  const filteredGuides = guides?.filter(guide => {
    const q = searchQuery.toLowerCase()
    const name = guide.profile?.full_name?.toLowerCase() || ''
    const bio = guide.profile?.bio?.toLowerCase() || ''
    const specialties = Array.isArray(guide.specialties) ? guide.specialties : []
    const zones = Array.isArray(guide.coverage_zones) ? guide.coverage_zones : []
    const langs = Array.isArray(guide.languages) ? guide.languages : []
    const price = parseFloat(guide.full_day_rate || '0')

    const matchesSearch = !q || name.includes(q) || bio.includes(q) || specialties.some(s => s?.toLowerCase().includes(q))
    const matchesZone = !selectedZone || zones.some(z => z.toLowerCase().includes(selectedZone.toLowerCase()))
    const matchesLang = !selectedLang || langs.some(l => l.toLowerCase().includes(selectedLang.toLowerCase()))
    const matchesPrice = maxPrice === '100000' || price === 0 || price <= parseInt(maxPrice)

    return matchesSearch && matchesZone && matchesLang && matchesPrice
  })

  return (
    <main className="min-h-screen bg-background pb-28 pt-20 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title Header */}
        <section className="app-card relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-card via-card to-primary/5">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <UserCheck className="h-4 w-4" />
              <span>{t('tag')}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {t('title')}
            </h1>
            <div className="togo-underline" />
            <p className="text-sm sm:text-base font-medium leading-relaxed text-muted-foreground pt-1">
              {t('subtitle')}
            </p>
          </div>
        </section>

        {/* Filter and Content Grid */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          
          {/* Filters Sidebar */}
          <aside className="app-card p-6 lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <SlidersHorizontal className="h-4 w-4" />
                <span>{t('filters')}</span>
              </span>
              {(selectedZone || selectedLang || maxPrice !== '100000' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedZone('')
                    setSelectedLang('')
                    setMaxPrice('100000')
                    setSearchQuery('')
                  }}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  {t('reset')}
                </button>
              )}
            </div>

            {/* Search bar */}
            <div className="relative flex items-center rounded-2xl border border-border bg-card px-3.5 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="search"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-h-11 w-full bg-transparent px-3 text-sm font-medium outline-none placeholder:text-muted-foreground"
              />
            </div>

            {/* Zone Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('zone_label')}
              </label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card p-3 text-xs font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{t('all_zones')}</option>
                {ZONES.map((zone) => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>

            {/* Languages Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('lang_label')}
              </label>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card p-3 text-xs font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{t('all_langs')}</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{t('price_label')} :</span>
                <span className="font-bold text-primary">{parseInt(maxPrice).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </aside>

          {/* Guides Results */}
          <div className="lg:col-span-8 space-y-6">
            {loading ? (
              <div className="app-card flex flex-col items-center justify-center p-16 text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-semibold text-muted-foreground">{t('loading')}</p>
              </div>
            ) : error ? (
              <div className="app-card flex flex-col items-center justify-center p-12 text-center space-y-3 border-red-300">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <p className="text-sm font-bold text-red-600">{error}</p>
                <button
                  onClick={fetchGuides}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white"
                >
                  Réessayer
                </button>
              </div>
            ) : filteredGuides && filteredGuides.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {filteredGuides.map((guide) => {
                  const guideName = guide.profile?.full_name || 'Guide Local'
                  return (
                    <GuideCard
                      key={guide.id}
                      id={guide.id}
                      name={guideName}
                      avatarUrl={guide.profile?.avatar_url}
                      initials={getInitials(guideName)}
                      zone={Array.isArray(guide.coverage_zones) && guide.coverage_zones.length > 0 ? guide.coverage_zones.join(', ') : 'Togo'}
                      languages={Array.isArray(guide.languages) && guide.languages.length > 0 ? guide.languages : ['Français']}
                      dailyRate={guide.full_day_rate}
                      rating={parseFloat(guide.avg_rating) || 4.8}
                      reviewsCount={guide.total_reviews || 12}
                      experienceYears={guide.experience_years}
                      isFavorite={favIds.includes(guide.id)}
                      onToggleFavorite={() => toggleFavorite(guide.id)}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="app-card flex flex-col items-center justify-center p-12 text-center space-y-3">
                <UserCheck className="h-10 w-10 text-primary opacity-60" />
                <h3 className="font-serif text-xl font-bold">{t('empty_title')}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                  {t('empty_desc')}
                </p>
                <button
                  onClick={() => {
                    setSelectedZone('')
                    setSelectedLang('')
                    setMaxPrice('100000')
                    setSearchQuery('')
                  }}
                  className="mt-2 rounded-full bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-dark"
                >
                  {t('reset')}
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  )
}
