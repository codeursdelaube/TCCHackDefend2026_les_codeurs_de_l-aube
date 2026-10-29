'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState, useCallback } from 'react'
import { getInitials } from '@/lib/auth/redirect'
import { UserCheck, AlertCircle, Loader2, Search, ShieldCheck, FileText, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { apiFetchCached } from '@/lib/utils/http'
import { safeJsonParse, safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils/storage'
import { toast } from 'sonner'
import GuideCard from '@/components/ui/GuideCard'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { useRequireAuth } from '@/hooks/useRequireAuth'

interface GuideRow {
  id: string
  experience_years: number
  specialties: string[]
  languages: string[]
  coverage_zones: string[]
  full_day_rate: string | null
  half_day_rate: string | null
  hourly_rate: string | null
  virtual_rate: string | null
  avg_rating: string
  total_reviews: number
  total_missions: number
  profile: {
    full_name: string
    avatar_url?: string | null
    bio?: string | null
  }
}

type SortKey = 'rating' | 'missions' | 'price'

const asArray = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [])

export default function GuidesPage() {
  const { isAuthenticated, loading: authLoading } = useRequireAuth()
  const t = useTranslations('GuidesPage')
  const [guides, setGuides] = useState<GuideRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedZone, setSelectedZone] = useState('')
  const [selectedLang, setSelectedLang] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('rating')

  const [favIds, setFavIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    return safeJsonParse<string[]>(safeLocalStorageGet('heritogo_favorites'), [])
  })

  const fetchGuides = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFetchCached<{ guides?: GuideRow[] }>('/api/guides', {
        cacheKey: 'public-guides',
        ttlMs: 5 * 60 * 1000,
      })
      if (!result.ok || !result.data) {
        setError(result.error || t('error_loading'))
        return
      }
      setGuides(result.data.guides || [])
    } catch (err: unknown) {
      setError(getUserFriendlyError(err))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    fetchGuides()
  }, [fetchGuides, authLoading, isAuthenticated])

  // Les filtres proposés reflètent les zones et langues réellement couvertes par les guides publiés.
  const zoneOptions = useMemo(() => Array.from(new Set(guides.flatMap((g) => asArray(g.coverage_zones)))).sort(), [guides])
  const langOptions = useMemo(() => Array.from(new Set(guides.flatMap((g) => asArray(g.languages)))).sort(), [guides])

  const toggleFavorite = (guideId: string) => {
    const updated = favIds.includes(guideId) ? favIds.filter((id) => id !== guideId) : [...favIds, guideId]
    if (updated.length < favIds.length) toast.info(t('fav_removed'))
    else toast.success(t('fav_added'))
    setFavIds(updated)
    safeLocalStorageSet('heritogo_favorites', JSON.stringify(updated))
  }

  const resetFilters = () => {
    setSelectedZone('')
    setSelectedLang('')
    setSearchQuery('')
  }

  const filteredGuides = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const list = guides.filter((guide) => {
      const name = guide.profile?.full_name?.toLowerCase() || ''
      const bio = guide.profile?.bio?.toLowerCase() || ''
      const specialties = asArray(guide.specialties)
      const matchesSearch = !q || name.includes(q) || bio.includes(q) || specialties.some((s) => s.toLowerCase().includes(q))
      const matchesZone = !selectedZone || asArray(guide.coverage_zones).includes(selectedZone)
      const matchesLang = !selectedLang || asArray(guide.languages).includes(selectedLang)
      return matchesSearch && matchesZone && matchesLang
    })
    const price = (g: GuideRow) => Number(g.full_day_rate || g.half_day_rate) || Number.POSITIVE_INFINITY
    return [...list].sort((a, b) => {
      if (sortBy === 'missions') return b.total_missions - a.total_missions
      if (sortBy === 'price') return price(a) - price(b)
      return Number(b.avg_rating) - Number(a.avg_rating) || b.total_reviews - a.total_reviews
    })
  }, [guides, searchQuery, selectedZone, selectedLang, sortBy])

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const hasFilters = Boolean(selectedZone || selectedLang || searchQuery)

  return (
    <main className="min-h-screen bg-background pb-32 pt-24 text-foreground">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHeader kicker={t('tag')} kickerIcon={UserCheck} title={t('title')} subtitle={t('subtitle')} />

        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, text: t('promise_verified') },
            { icon: FileText, text: t('promise_quote') },
            { icon: Star, text: t('promise_reviews') },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm">
              <Icon className="h-5 w-5 shrink-0 text-forest" />
              {text}
            </li>
          ))}
        </ul>

        <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
          <label className="relative flex items-center">
            <span className="sr-only">{t('search_placeholder')}</span>
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field pl-9"
            />
          </label>
          <label>
            <span className="sr-only">{t('zone_label')}</span>
            <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className="field lg:w-48">
              <option value="">{t('all_zones')}</option>
              {zoneOptions.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">{t('lang_label')}</span>
            <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)} className="field lg:w-48">
              <option value="">{t('all_langs')}</option>
              {langOptions.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">{t('sort_label')}</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="field lg:w-48">
              <option value="rating">{t('sort_rating')}</option>
              <option value="missions">{t('sort_missions')}</option>
              <option value="price">{t('sort_price')}</option>
            </select>
          </label>
        </section>

        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">{t('results_count', { count: filteredGuides.length })}</p>
          {hasFilters && (
            <button type="button" onClick={resetFilters} className="text-xs font-bold text-primary hover:underline">
              {t('reset')}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center rounded-xl border border-border bg-card px-6 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-primary" />
            <p className="mt-3 text-sm font-semibold">{error}</p>
            <button type="button" onClick={fetchGuides} className="btn-brand mt-4">{t('retry')}</button>
          </div>
        ) : filteredGuides.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title={t('empty_title')}
            description={t('empty_desc')}
            action={hasFilters ? { label: t('reset'), onClick: resetFilters } : undefined}
          />
        ) : (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredGuides.map((guide) => {
              const guideName = guide.profile?.full_name || t('default_name')
              return (
                <GuideCard
                  key={guide.id}
                  id={guide.id}
                  name={guideName}
                  avatarUrl={guide.profile?.avatar_url}
                  initials={getInitials(guideName)}
                  zones={asArray(guide.coverage_zones)}
                  languages={asArray(guide.languages)}
                  specialties={asArray(guide.specialties)}
                  rates={guide}
                  rating={Number(guide.avg_rating) || 0}
                  reviewsCount={guide.total_reviews || 0}
                  missionsCount={guide.total_missions || 0}
                  experienceYears={guide.experience_years}
                  isFavorite={favIds.includes(guide.id)}
                  onToggleFavorite={() => toggleFavorite(guide.id)}
                />
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}
