'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getInitials } from '@/lib/auth/redirect'
import { useTranslations } from 'next-intl'
import { Briefcase, Loader2, Star, ShieldCheck, FileText, UploadCloud, Edit3, X, ExternalLink, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from '@/i18n/navigation'
import { sanitizePhoneInput, validatePhone, validatePositiveNumber } from '@/lib/utils/validation'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { apiFetch, clearClientCache } from '@/lib/utils/http'
import PrivacySettings from '@/components/PrivacySettings'
import GuideBookingsPanel, { type GuideBookingsView } from '@/components/bookings/GuideBookingsPanel'
import type { GuideBooking } from '@/lib/bookings/types'

interface GuideProfileData {
  id: string
  status: string
  experience_years: number
  specialties: string[];
  languages: string[];
  coverage_zones: string[];
  hourly_rate?: string
  half_day_rate?: string
  full_day_rate?: string
  virtual_rate?: string
  avg_rating: string
  total_reviews: number
  total_missions: number
  profile: {
    full_name: string
    avatar_url?: string
    bio?: string
    phone?: string
  }
}

const AVAILABLE_ZONES = ['Lomé', 'Kpalimé', 'Atakpamé', 'Kara', 'Dapaong', 'Aného', 'Togoville']
const AVAILABLE_LANGUAGES = ['Français', 'English', 'Espagnol', 'Deutsch', 'Éwé', 'Kabyè', 'Mina']

export default function GuideDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('Dashboard')
  const tg = useTranslations('DashboardGuide')
  
  // Tabs: 'bookings' | 'profile' | 'documents'
  const activeTab = useMemo<'bookings' | 'profile' | 'documents'>(() => {
    const tab = searchParams.get('tab')
    if (tab === 'quotes' || tab === 'missions' || tab === 'history' || tab === 'subscription' || tab === 'bookings') {
      return 'bookings'
    } else if (tab === 'profile') {
      return 'profile'
    } else if (tab === 'documents') {
      return 'documents'
    }
    return 'bookings'
  }, [searchParams])

  const bookingsView = useMemo<GuideBookingsView>(() => {
    const tab = searchParams.get('tab')
    if (tab === 'missions') return 'missions'
    if (tab === 'history') return 'history'
    return 'requests'
  }, [searchParams])

  const handleTabChange = (tabName: 'bookings' | 'profile' | 'documents') => {
    const newTabParam = tabName === 'bookings' ? 'quotes' : tabName
    router.push(`?tab=${newTabParam}`, { scroll: false })
  }
  const [bookings, setBookings] = useState<GuideBooking[]>([])
  const [guide, setGuide] = useState<GuideProfileData | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Profile Edit fields
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [experienceYears, setExperienceYears] = useState(0)
  const [selectedLangs, setSelectedLangs] = useState<string[]>([])
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [newSpecialty, setNewSpecialty] = useState('')
  
  // Rates
  const [hourlyRate, setHourlyRate] = useState('')
  const [halfDayRate, setHalfDayRate] = useState('')
  const [fullDayRate, setFullDayRate] = useState('')
  const [virtualRate, setVirtualRate] = useState('')

  // Avatar upload
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  // Document Upload fields
  const [docType, setDocType] = useState('guide_license')
  const [docLabel, setDocLabel] = useState('')
  const [docUrl, setDocUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  
  // Action Loading
  const [actionLoading, setActionLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFetch<{ bookings?: GuideBooking[]; guideProfile?: GuideProfileData }>('/api/guide/bookings')
      if (!result.ok || !result.data) {
        setError(result.error || t('guide.error_load_data'))
        return
      }
      setBookings(result.data.bookings || [])
      setGuide(result.data.guideProfile || null)

      // Initialize form fields
      if (result.data.guideProfile) {
        const gp = result.data.guideProfile
        setBio(gp.profile.bio || '')
        setPhone(gp.profile.phone || '')
        setExperienceYears(gp.experience_years || 0)
        setSelectedLangs(gp.languages || [])
        setSelectedZones(gp.coverage_zones || [])
        setSpecialties(gp.specialties || [])
        setHourlyRate(gp.hourly_rate || '')
        setHalfDayRate(gp.half_day_rate || '')
        setFullDayRate(gp.full_day_rate || '')
        setVirtualRate(gp.virtual_rate || '')
        setAvatarUrl(gp.profile?.avatar_url || '')
      }
    } catch {
      setError(t('common.error_server'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Update profile handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validations côté client
    const phoneErr = validatePhone(phone)
    if (phoneErr) {
      setError(phoneErr)
      return
    }

    if (experienceYears < 0 || experienceYears > 60) {
      setError(t('guide.error_exp_bounds'))
      return
    }

    const rates = [
      { val: hourlyRate, name: t('guide.rate_hour') },
      { val: halfDayRate, name: t('guide.rate_half') },
      { val: fullDayRate, name: t('guide.rate_full') },
      { val: virtualRate, name: t('guide.rate_virtual') }
    ]

    for (const r of rates) {
      const err = validatePositiveNumber(r.val, r.name)
      if (err) {
        setError(err)
        return
      }
    }

    setActionLoading(true)
    try {
      const result = await apiFetch<{ guide?: GuideProfileData }>('/api/guide/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          phone,
          languages: selectedLangs,
          coverage_zones: selectedZones,
          specialties,
          experience_years: experienceYears,
          hourly_rate: hourlyRate || null,
          half_day_rate: halfDayRate || null,
          full_day_rate: fullDayRate || null,
          virtual_rate: virtualRate || null
        })
      })

      if (!result.ok || !result.data) {
        setError(result.error || t('common.error_update'))
        return
      }
      if (result.data.guide) setGuide(result.data.guide)
      toast.success(t('common.success_update'))
    } catch (err: unknown) {
      setError(getUserFriendlyError(err))
    } finally {
      setActionLoading(false)
    }
  }

  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError(tg('avatar_format'))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(tg('avatar_size'))
      return
    }

    if (file.size === 0) {
      setAvatarError(tg('avatar_empty'))
      return
    }

    setAvatarError(null)
    setAvatarUploading(true)

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const result = await apiFetch<{ avatar_url?: string }>('/api/upload/avatar', {
        method: 'POST',
        body: formData,
        timeoutMs: 45000,
      })
      const data = result.data
      if (!result.ok) {
        setAvatarError(result.error || tg('avatar_error'))
        return
      }
      if (!data?.avatar_url) {
        setAvatarError(tg('avatar_incomplete'))
        return
      }
      setAvatarUrl(data.avatar_url)
      setGuide((current) => current
        ? { ...current, profile: { ...current.profile, avatar_url: data.avatar_url } }
        : current
      )
      clearClientCache('public-guide')
      clearClientCache('public-guides')
    } catch (err: unknown) {
      setAvatarError(getUserFriendlyError(err))
    } finally {
      setAvatarUploading(false)
    }
  }

  // Handle document submission
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setActionLoading(true)

    try {
      const kyc = await apiFetch<{ sessionId?: string; hostedUrl?: string | null }>('/api/kyc/session', {
        method: 'POST',
      })
      if (!kyc.ok || !kyc.data?.sessionId) {
        setError(kyc.error || t('guide.error_doc_submit'))
        return
      }

      const result = await apiFetch<{ guide?: GuideProfileData }>('/api/guide/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: {
            type: docType,
            label: docLabel || t('guide.default_doc_label'),
            kyc_session_id: kyc.data.sessionId,
            file_name: selectedFile?.name || 'kyc-session',
          }
        })
      })

      if (!result.ok || !result.data) {
        setError(result.error || t('guide.error_doc_submit'))
        return
      }
      if (result.data.guide) setGuide(result.data.guide)
      setDocLabel('')
      setSelectedFile(null)
      if (kyc.data.hostedUrl) {
        window.location.href = kyc.data.hostedUrl
        return
      }
      toast.success(t('guide.success_doc_submit'))
    } catch (err: unknown) {
      setError(getUserFriendlyError(err))
    } finally {
      setActionLoading(false)
    }
  }

  const toggleLanguage = (lang: string) => {
    if (selectedLangs.includes(lang)) {
      setSelectedLangs(selectedLangs.filter(l => l !== lang))
    } else {
      setSelectedLangs([...selectedLangs, lang])
    }
  }

  const toggleZone = (zone: string) => {
    if (selectedZones.includes(zone)) {
      setSelectedZones(selectedZones.filter(z => z !== zone))
    } else {
      setSelectedZones([...selectedZones, zone])
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()])
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (spec: string) => {
    setSpecialties(specialties.filter(s => s !== spec))
  }

  if (loading && !guide) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">{t('common.loading_guide')}</p>
        </div>
      </div>
    )
  }

  const getGuideStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return t('guide.status_approved')
      case 'under_review':
        return t('guide.status_under_review')
      case 'rejected':
        return t('guide.status_rejected')
      default:
        return t('guide.status_waiting')
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-32 pt-24 text-foreground sm:px-6 lg:px-8">
      {error && (
        <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label={tg('dismiss')}><X className="h-4 w-4" /></button>
        </div>
      )}

      {guide && (
        <header className="mb-8 flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <label htmlFor="avatar-upload" title={tg('avatar_change')} className="group relative h-20 w-20 shrink-0 cursor-pointer">
              {avatarUrl ? (
                <img src={avatarUrl} alt={guide.profile.full_name} className="h-full w-full rounded-xl border border-border object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-primary font-serif text-xl font-bold text-primary-foreground">
                  {getInitials(guide.profile.full_name)}
                </div>
              )}
              <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
                {avatarUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              </span>
              {guide.status === 'approved' && (
                <span className="absolute -bottom-1.5 -right-1.5 rounded-md border-2 border-card bg-forest p-0.5 text-white">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
              )}
            </label>
            {/* Champ fichier unique, partagé par l'en-tête et l'onglet profil */}
            <input
              id="avatar-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleAvatarChange}
              disabled={avatarUploading}
            />
            <div>
              <h1 className="font-serif text-2xl font-bold">{t('guide.greeting', { name: guide.profile.full_name })}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                  guide.status === 'approved' ? 'bg-forest/10 text-forest dark:text-emerald-300' :
                  guide.status === 'rejected' || guide.status === 'suspended' ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300' :
                  'bg-accent/15 text-foreground'
                }`}>
                  {getGuideStatusText(guide.status)}
                </span>
                {guide.total_reviews > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    <strong className="text-foreground">{Number(guide.avg_rating).toFixed(1)}</strong>
                    ({guide.total_reviews} {t('guide.review_count_label')})
                  </span>
                ) : (
                  <span>{tg('no_reviews_yet')}</span>
                )}
              </div>
              <label htmlFor="avatar-upload" className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                {avatarUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                {avatarUploading ? tg('avatar_uploading') : avatarUrl ? tg('avatar_change') : tg('avatar_add')}
              </label>
              {avatarError && <p className="mt-1 text-xs font-semibold text-red-700">{avatarError}</p>}
            </div>
          </div>
          {guide.status === 'approved' && (
            <Link href={`/guides/${guide.id}`} className="btn-outline-brand self-start md:self-center">
              <ExternalLink className="h-4 w-4" />
              {tg('view_public_profile')}
            </Link>
          )}
        </header>
      )}

      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-border" role="tablist">
        {([
          { id: 'bookings', label: tg('tab_bookings'), icon: Briefcase },
          { id: 'profile', label: tg('tab_profile'), icon: Edit3 },
          { id: 'documents', label: tg('tab_documents'), icon: FileText },
        ] as const).map((tabItem) => {
          const Icon = tabItem.icon
          const active = activeTab === tabItem.id
          return (
            <button
              key={tabItem.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleTabChange(tabItem.id)}
              className={`-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tabItem.label}
            </button>
          )
        })}
      </nav>

      {/* Tab Content */}
      <div className="space-y-6">
        
        {/* Tab 1: Bookings */}
        {activeTab === 'bookings' && guide && (
          <GuideBookingsPanel
            bookings={bookings}
            rates={guide}
            approved={guide.status === 'approved'}
            view={bookingsView}
            onViewChange={(view) => router.push(`?tab=${view === 'requests' ? 'quotes' : view}`, { scroll: false })}
            onChanged={loadData}
          />
        )}

        {/* Tab 2: Edit Profile */}
        {activeTab === 'profile' && (
          <>
          <form onSubmit={handleUpdateProfile} className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-6">
            <h3 className="font-serif text-xl font-bold border-b border-border pb-3">{t('guide.tab_profile')}</h3>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={tg('avatar_alt')}
                    className="h-24 w-24 rounded-xl object-cover border border-border"
                  />
                ) : (
                  <div
                    className="h-24 w-24 rounded-xl flex items-center justify-center bg-primary font-serif text-2xl font-bold text-primary-foreground"
                  >
                    {getInitials(guide?.profile?.full_name ?? '')}
                  </div>
                )}
              </div>
              <label htmlFor="avatar-upload" className="btn-outline-brand min-h-9 cursor-pointer px-3 text-xs">
                {avatarUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                {avatarUploading ? tg('avatar_uploading') : avatarUrl ? tg('avatar_change') : tg('avatar_add')}
              </label>
              <span className="text-xs text-muted-foreground">{tg('avatar_hint')}</span>
              {avatarError && (
                <span className="text-xs font-semibold text-red-700">{avatarError}</span>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">{t('guide.phone_label')}</span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                  placeholder="+228 90 00 00 00"
                  className="field"
                />
                {phone && validatePhone(phone) && (
                  <span className="text-xs text-error mt-1">{validatePhone(phone)}</span>
                )}
              </label>

              <label className="block">
                <span className="field-label">{t('guide.exp_label')}</span>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={experienceYears}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === '') {
                      setExperienceYears(0)
                    } else {
                      const val = parseInt(v, 10)
                      if (val >= 0 && val <= 60) {
                        setExperienceYears(val)
                      }
                    }
                  }}
                  className="field"
                />
              </label>
            </div>

            {/* Bio */}
            <label className="block">
              <span className="field-label">{t('guide.bio_label')}</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t('guide.bio_placeholder')}
                className="field min-h-28 resize-y"
              />
            </label>

            {/* Rates Grid */}
            <div className="space-y-3">
              <span className="field-label">{t('guide.rates_title')}</span>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <label className="block">
                  <span className="field-label">{t('guide.rate_full')}</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={fullDayRate}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '' || parseFloat(v) >= 0) {
                        setFullDayRate(v)
                      }
                    }}
                    className="field"
                  />
                </label>
                <label className="block">
                  <span className="field-label">{t('guide.rate_half')}</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={halfDayRate}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '' || parseFloat(v) >= 0) {
                        setHalfDayRate(v)
                      }
                    }}
                    className="field"
                  />
                </label>
                <label className="block">
                  <span className="field-label">{t('guide.rate_hour')}</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={hourlyRate}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '' || parseFloat(v) >= 0) {
                        setHourlyRate(v)
                      }
                    }}
                    className="field"
                  />
                </label>
                <label className="block">
                  <span className="field-label">{t('guide.rate_virtual')}</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={virtualRate}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '' || parseFloat(v) >= 0) {
                        setVirtualRate(v)
                      }
                    }}
                    className="field"
                  />
                </label>
              </div>
            </div>

            {/* Languages Selector */}
            <div className="space-y-3">
              <span className="field-label">{t('guide.langs_title')}</span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_LANGUAGES.map((l) => {
                  const active = selectedLangs.includes(l)
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleLanguage(l)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors border ${
                        active 
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {l}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Zones Selector */}
            <div className="space-y-3">
              <span className="field-label">{t('guide.zones_title')}</span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ZONES.map((z) => {
                  const active = selectedZones.includes(z)
                  return (
                    <button
                      key={z}
                      type="button"
                      onClick={() => toggleZone(z)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors border ${
                        active 
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {z}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Specialties Manager */}
            <div className="space-y-3">
              <span className="field-label">{t('guide.specs_title')}</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder={t('guide.spec_placeholder')}
                  className="field flex-1"
                />
                <button
                  type="button"
                  onClick={addSpecialty}
                  className="btn-outline-brand"
                >
                  {t('guide.add_spec')}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {specialties.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {s}
                    <button type="button" onClick={() => removeSpecialty(s)} aria-label={tg('remove')} className="hover:text-primary-dark"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="btn-brand w-full mt-4"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.save_changes')}
            </button>
          </form>
          <div className="mt-6"><PrivacySettings /></div>
          </>
        )}

        {/* Tab 3: Documents */}
        {activeTab === 'documents' && (
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Upload form */}
            <form onSubmit={handleUploadDocument} className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-5">
              <h3 className="font-serif text-xl font-bold border-b border-border pb-3">{t('guide.submit_doc_title')}</h3>
              
              <label className="block">
                <span className="field-label">{t('guide.doc_type')}</span>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="field"
                >
                  <option value="guide_license">{t('guide.doc_license')}</option>
                  <option value="national_id">{t('guide.doc_id')}</option>
                  <option value="certificate">{t('guide.doc_cert')}</option>
                  <option value="other">{t('guide.doc_other')}</option>
                </select>
              </label>

              <label className="block">
                <span className="field-label">{t('guide.doc_title_label')}</span>
                <input
                  type="text"
                  value={docLabel}
                  onChange={(e) => setDocLabel(e.target.value)}
                  placeholder={t('guide.doc_title_placeholder')}
                  className="field"
                  required
                />
              </label>

              <label className="block">
                <span className="field-label flex items-center gap-1">
                  <UploadCloud className="h-3.5 w-3.5" /> {t('guide.doc_file_label')}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.type !== 'application/pdf') {
                        setError(t('guide.pdf_only'))
                        setSelectedFile(null)
                        return
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        setError(t('guide.pdf_too_large'))
                        setSelectedFile(null)
                        return
                      }
                      setError(null)
                      setSelectedFile(file)
                    }
                  }}
                  className="field file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs file:font-semibold"
                />
              </label>

              <div className="rounded-lg bg-muted/60 p-4">
                <p className="text-xs text-muted-foreground leading-5">
                  {t('guide.doc_upload_hint')}
                </p>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="btn-brand w-full"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('guide.submit_for_verification')}
              </button>
            </form>

            {/* List of submitted docs */}
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8 space-y-4 h-fit">
              <h3 className="font-serif text-lg font-bold">{t('guide.docs_submitted_title')}</h3>
              
              {(guide as any)?.documents?.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  {t('guide.no_docs')}
                </div>
              ) : (
                <div className="space-y-3">
                  {(guide as any)?.documents?.map((doc: any) => (
                    <div key={doc.id} className="rounded-lg p-4 border border-border flex justify-between items-center gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{doc.label}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {t('common.status')} : {doc.type}
                        </p>
                        <p className="text-[10px] font-bold text-primary">
                          {tg('doc_kyc_pending')}
                        </p>
                      </div>

                      <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        doc.is_verified ? 'bg-forest/10 text-forest dark:text-emerald-300' : 'bg-accent/15 text-foreground'
                      }`}>
                        {doc.is_verified ? t('guide.doc_verified') : t('guide.doc_pending')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </main>
  )
}
