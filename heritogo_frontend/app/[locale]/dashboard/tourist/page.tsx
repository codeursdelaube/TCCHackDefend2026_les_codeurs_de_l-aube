'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { getFirstName, getInitials } from '@/lib/auth/redirect'
import { useLocale, useTranslations } from 'next-intl'
import { ClipboardList, Heart, History, User, Loader2, MapPin, ScanLine, Users, ArrowRight } from 'lucide-react'
import TouristBookingsPanel from '@/components/bookings/TouristBookingsPanel'
import type { TouristBooking } from '@/lib/bookings/types'
import { formatBookingDate, isActiveBooking } from '@/lib/bookings/status'
import GuideCard from '@/components/ui/GuideCard'
import ShareItinerary from '@/components/ShareItinerary'
import PrivacySettings from '@/components/PrivacySettings'
import EmptyState from '@/components/ui/EmptyState'
import { sanitizePhoneInput, validatePhone, validateFullName } from '@/lib/utils/validation'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { apiFetch } from '@/lib/utils/http'
import { safeJsonParse, safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils/storage'

interface UserProfile {
  id: string
  full_name: string
  phone: string | null
  preferred_lang: string | null
  email?: string
}

interface FavoriteGuide {
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
  profile: { full_name: string; avatar_url?: string | null }
}

interface ScanEntry {
  monument: string
  histoire?: string
  date?: string
  localite?: string
}

const TABS = [
  { id: 'bookings', icon: ClipboardList },
  { id: 'favorites', icon: Heart },
  { id: 'scans', icon: History },
  { id: 'profile', icon: User },
] as const
type TabId = (typeof TABS)[number]['id']

export default function TouristDashboardPage() {
  const params = useParams<{ locale: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const t = useTranslations('Dashboard')
  const tTabs = useTranslations('DashboardTourist')

  const requestedTab = searchParams.get('tab')
  const activeTab: TabId = TABS.some((tab) => tab.id === requestedTab) ? (requestedTab as TabId) : 'bookings'

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [bookings, setBookings] = useState<TouristBooking[]>([])
  const [favorites, setFavorites] = useState<FavoriteGuide[]>([])
  const [scanHistory, setScanHistory] = useState<ScanEntry[]>([])

  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formLang, setFormLang] = useState('fr')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        window.location.href = `/${params.locale}/auth/login`
        return
      }

      const [profileResult, bookingsResult] = await Promise.all([
        apiFetch<{ profile?: UserProfile }>('/api/profile'),
        apiFetch<{ bookings?: TouristBooking[] }>('/api/tourist/bookings'),
      ])

      if (profileResult.ok && profileResult.data?.profile) {
        setProfile({ ...profileResult.data.profile, email: user.email })
        setFormName(profileResult.data.profile.full_name)
        setFormPhone(profileResult.data.profile.phone || '')
        setFormLang(profileResult.data.profile.preferred_lang || 'fr')
      } else if (profileResult.error) {
        setProfileError(profileResult.error)
      }

      if (bookingsResult.ok && bookingsResult.data?.bookings) {
        setBookings(bookingsResult.data.bookings)
      }

      const favIds = safeJsonParse<string[]>(safeLocalStorageGet('heritogo_favorites'), [])
      if (favIds.length > 0) {
        const guidesResult = await apiFetch<{ guides?: FavoriteGuide[] }>('/api/guides')
        if (guidesResult.ok && guidesResult.data?.guides) {
          setFavorites(guidesResult.data.guides.filter((g) => favIds.includes(g.id)))
        }
      } else {
        setFavorites([])
      }

      setScanHistory(safeJsonParse<ScanEntry[]>(safeLocalStorageGet('heritogo_scans'), []))
    } catch (e: unknown) {
      setProfileError(getUserFriendlyError(e))
    } finally {
      setLoading(false)
    }
  }, [params.locale])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const stats = useMemo(() => ({
    active: bookings.filter((b) => isActiveBooking(b.status)).length,
    awaiting: bookings.filter((b) => b.status === 'quote_sent').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
  }), [bookings])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSuccess(false)
    setProfileError(null)

    const nameError = validateFullName(formName)
    if (nameError) return setProfileError(nameError)
    const phoneError = validatePhone(formPhone)
    if (phoneError) return setProfileError(phoneError)

    setSavingProfile(true)
    try {
      const result = await apiFetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: formName, phone: formPhone, preferred_lang: formLang }),
      })
      if (!result.ok) {
        setProfileError(result.error || t('common.error_update'))
        return
      }
      setProfileSuccess(true)
      setProfile((prev) => (prev ? { ...prev, full_name: formName, phone: formPhone, preferred_lang: formLang } : prev))
    } catch (err: unknown) {
      setProfileError(getUserFriendlyError(err))
    } finally {
      setSavingProfile(false)
    }
  }

  const removeFavorite = (guideId: string) => {
    const favIds = safeJsonParse<string[]>(safeLocalStorageGet('heritogo_favorites'), []).filter((id) => id !== guideId)
    safeLocalStorageSet('heritogo_favorites', JSON.stringify(favIds))
    setFavorites((prev) => prev.filter((g) => g.id !== guideId))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background pt-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t('common.loading_space')}</p>
      </div>
    )
  }

  const tabCounts: Partial<Record<TabId, number>> = {
    bookings: stats.active,
    favorites: favorites.length,
    scans: scanHistory.length,
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-24 text-foreground sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary font-serif text-lg font-bold text-primary-foreground">
            {profile ? getInitials(profile.full_name) : '?'}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold">
              {t('tourist.greeting', { name: profile ? getFirstName(profile.full_name) : t('common.guest_name') })}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{tTabs('subtitle')}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/scan" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-[#2A1E16] hover:bg-accent/85">
            <ScanLine className="h-4 w-4" />
            {t('tourist.new_scan')}
          </Link>
          <Link href="/guides" className="btn-outline-brand min-h-10">
            <Users className="h-4 w-4" />
            {t('tourist.find_guide')}
          </Link>
        </div>
      </header>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: tTabs('stat_active'), value: stats.active },
          { label: tTabs('stat_awaiting'), value: stats.awaiting, highlight: stats.awaiting > 0 },
          { label: tTabs('stat_completed'), value: stats.completed },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border bg-card p-4 ${s.highlight ? 'border-primary/40' : 'border-border'}`}>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</dt>
            <dd className={`mt-1 font-serif text-2xl font-bold ${s.highlight ? 'text-primary' : ''}`}>{s.value}</dd>
          </div>
        ))}
      </dl>

      <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-border" role="tablist">
        {TABS.map(({ id, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => router.push(`?tab=${id}`, { scroll: false })}
              className={`-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tTabs(`tab_${id}`)}
              {tabCounts[id] ? (
                <span className={`rounded-md px-1.5 text-[10px] ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{tabCounts[id]}</span>
              ) : null}
            </button>
          )
        })}
      </nav>

      <div className="mt-6">
        {activeTab === 'bookings' && <TouristBookingsPanel bookings={bookings} onChanged={fetchData} />}

        {activeTab === 'favorites' && (
          favorites.length === 0 ? (
            <EmptyState icon={Heart} title={t('tourist.no_favorites')} description={t('tourist.no_favorites_desc')} />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {favorites.map((guide) => (
                  <GuideCard
                    key={guide.id}
                    id={guide.id}
                    name={guide.profile.full_name}
                    avatarUrl={guide.profile.avatar_url}
                    initials={getInitials(guide.profile.full_name)}
                    zones={guide.coverage_zones || []}
                    languages={guide.languages || []}
                    specialties={guide.specialties || []}
                    rates={guide}
                    rating={Number(guide.avg_rating) || 0}
                    reviewsCount={guide.total_reviews || 0}
                    missionsCount={guide.total_missions || 0}
                    experienceYears={guide.experience_years}
                    isFavorite
                    onToggleFavorite={() => removeFavorite(guide.id)}
                  />
                ))}
              </div>
              <ShareItinerary items={favorites.map((g) => ({ name: g.profile.full_name, details: g.coverage_zones?.join(', ') }))} />
            </div>
          )
        )}

        {activeTab === 'scans' && (
          scanHistory.length === 0 ? (
            <EmptyState icon={History} title={t('tourist.no_scans')} description={t('tourist.no_scans_desc')} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scanHistory.map((scan, i) => (
                <li key={`${scan.monument}-${scan.date ?? i}`} className="flex flex-col justify-between rounded-xl border border-border bg-card">
                  <div className="p-5">
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      {scan.date ? formatBookingDate(scan.date, locale, { day: 'numeric', month: 'long', year: 'numeric' }) : t('tourist.date_unknown')}
                    </p>
                    <h3 className="mt-1 font-serif text-lg font-bold">{scan.monument}</h3>
                    {scan.histoire && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{scan.histoire}</p>}
                  </div>
                  <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {scan.localite || t('common.default_country')}
                    </span>
                    <Link href="/scan" className="inline-flex items-center gap-1 font-bold text-primary hover:underline">
                      {t('tourist.scan_again')}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}

        {activeTab === 'profile' && (
          <div className="grid gap-6 lg:grid-cols-12">
            <form onSubmit={handleProfileSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 lg:col-span-7">
              <h2 className="font-serif text-lg font-bold">{t('tourist.edit_profile')}</h2>
              <label className="block">
                <span className="field-label">{t('tourist.full_name')}</span>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} className="field" autoComplete="name" />
              </label>
              <label className="block">
                <span className="field-label">{t('tourist.email')}</span>
                <input type="email" value={profile?.email || ''} disabled className="field opacity-70" />
              </label>
              <label className="block">
                <span className="field-label">{t('tourist.phone')}</span>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(sanitizePhoneInput(e.target.value))}
                  className="field"
                  placeholder="+228 90 00 00 00"
                  autoComplete="tel"
                />
                <span className="mt-1 block text-[11px] text-muted-foreground">{tTabs('phone_hint')}</span>
                {formPhone && validatePhone(formPhone) && <span className="mt-1 block text-xs text-red-700">{validatePhone(formPhone)}</span>}
              </label>
              <label className="block">
                <span className="field-label">{t('tourist.preferred_lang')}</span>
                <select value={formLang} onChange={(e) => setFormLang(e.target.value)} className="field">
                  <option value="fr">{t('tourist.lang_fr')}</option>
                  <option value="en">{t('tourist.lang_en')}</option>
                  <option value="es">{t('tourist.lang_es')}</option>
                  <option value="zh">{t('tourist.lang_zh')}</option>
                </select>
              </label>

              {profileSuccess && <p className="rounded-lg border border-forest/30 bg-forest/10 px-3 py-2 text-xs font-semibold text-forest">{t('common.success_update')}</p>}
              {profileError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{profileError}</p>}

              <button type="submit" disabled={savingProfile} className="btn-brand">
                {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('common.save')}
              </button>
            </form>
            <div className="lg:col-span-5">
              <PrivacySettings />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
