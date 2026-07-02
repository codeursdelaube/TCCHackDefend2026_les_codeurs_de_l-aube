'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react/no-unescaped-entities */

import { useEffect, useState, startTransition, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { getFirstName, getInitials } from '@/lib/auth/redirect'
import { COLORS } from '@/lib/constants/colors'
import { useTranslations } from 'next-intl'
import { 
  Calendar, Heart, History, User, Loader2, Star, CheckCircle, Clock, AlertCircle, ChevronRight, MessageSquare 
} from 'lucide-react'
import ReviewModal from '@/components/ReviewModal'
import ShareItinerary from '@/components/ShareItinerary'
import { sanitizePhoneInput, validatePhone, validateFullName } from '@/lib/utils/validation'
import { getUserFriendlyError } from '@/lib/utils/errors'

interface BookingRow {
  id: string
  status: 'quote_requested' | 'quote_sent' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
  mission_type: 'full_day' | 'half_day' | 'hourly' | 'virtual'
  start_date: string
  end_date?: string
  quote_amount?: string
  quote_message?: string
  guide: {
    id: string
    profile: {
      full_name: string
      avatar_url?: string
    }
  }
  review?: {
    id: string
    rating_overall: number
  }
}

interface UserProfile {
  id: string
  full_name: string
  phone: string | null
  preferred_lang: string | null
  email?: string
}

export default function TouristDashboardPage() {
  const params = useParams<{ locale: string }>()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'profile'
  const t = useTranslations('Dashboard')

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  
  // LocalStorage states
  const [favorites, setFavorites] = useState<any[]>([])
  const [scanHistory, setScanHistory] = useState<any[]>([])

  // Profile Form state
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formLang, setFormLang] = useState('fr')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Booking details & review modal state
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  
  // Alert for success messages (e.g., booking created)
  const [alertMessage, setAlertMessage] = useState<string>('')

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = `/${params.locale}/auth/login`
        return
      }

      // Profile query
      const profileRes = await fetch('/api/profile')
      const profileData = await profileRes.json()
      if (profileData.profile) {
        setProfile({ ...profileData.profile, email: user.email })
        setFormName(profileData.profile.full_name)
        setFormPhone(profileData.profile.phone || '')
        setFormLang(profileData.profile.preferred_lang || 'fr')
      }
      

      // Bookings query
      const bookingsRes = await fetch('/api/tourist/bookings')
      const bookingsData = await bookingsRes.json()
      if (bookingsData.bookings) {
        setBookings(bookingsData.bookings)
      }

      // Favorites from localStorage
      const favIdsRaw = localStorage.getItem('heritogo_favorites')
      const favIds = favIdsRaw ? JSON.parse(favIdsRaw) : []
      if (favIds.length > 0) {
        // Fetch guide info for favorites
        const guidesRes = await fetch('/api/guides')
        const guidesData = await guidesRes.json()
        if (guidesData.guides) {
          const filteredFavs = guidesData.guides.filter((g: any) => favIds.includes(g.id))
          setFavorites(filteredFavs)
        }
      } else {
        setFavorites([])
      }

      // Scans from localStorage
      const scansRaw = localStorage.getItem('heritogo_scans')
      const scans = scansRaw ? JSON.parse(scansRaw) : []
      setScanHistory(scans)

    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [params.locale])

  useEffect(() => {
    // Check search params for alerts
    const bookingCreated = searchParams.get('booking_created')
    if (bookingCreated) {
      setAlertMessage(t('common.success_booking_sent'))
    }
  }, [searchParams, t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileSuccess(false)
    setProfileError(null)

    // Validations côté client
    const nameError = validateFullName(formName)
    if (nameError) {
      setProfileError(nameError)
      setSavingProfile(false)
      return
    }

    const phoneError = validatePhone(formPhone)
    if (phoneError) {
      setProfileError(phoneError)
      setSavingProfile(false)
      return
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formName,
          phone: formPhone,
          preferred_lang: formLang
        })
      })
      const data = await response.json()
      if (!response.ok) {
        setProfileError(data.error || t('common.error_update'))
        return
      }

      setProfileSuccess(true)
      if (profile) {
        setProfile({
          ...profile,
          full_name: formName,
          phone: formPhone,
          preferred_lang: formLang
        })
      }
    } catch (err: unknown) {
      console.error(err)
      setProfileError(getUserFriendlyError(err))
    } finally {
      setSavingProfile(false)
    }
  }

  const handleOpenReview = (bookingId: string) => {
    setSelectedBookingId(bookingId)
    setIsReviewOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'quote_requested':
        return <span className="badge badge-warning text-xs font-bold gap-1 rounded-lg py-3 px-3"><Clock className="h-3.5 w-3.5" /> {t('tourist.status_quote_requested')}</span>
      case 'quote_sent':
        return <span className="badge badge-info text-xs font-bold gap-1 rounded-lg py-3 px-3"><MessageSquare className="h-3.5 w-3.5" /> {t('tourist.status_quote_sent')}</span>
      case 'confirmed':
        return <span className="badge badge-success text-white text-xs font-bold gap-1 rounded-lg py-3 px-3"><CheckCircle className="h-3.5 w-3.5" /> {t('tourist.status_confirmed')}</span>
      case 'in_progress':
        return <span className="badge badge-primary text-white text-xs font-bold gap-1 rounded-lg py-3 px-3"><Clock className="h-3.5 w-3.5" /> {t('tourist.status_in_progress')}</span>
      case 'completed':
        return <span className="badge bg-neutral text-neutral-content text-xs font-bold gap-1 rounded-lg py-3 px-3 border-none"><CheckCircle className="h-3.5 w-3.5" /> {t('tourist.status_completed')}</span>
      case 'cancelled':
        return <span className="badge badge-error text-white text-xs font-bold gap-1 rounded-lg py-3 px-3"><AlertCircle className="h-3.5 w-3.5" /> {t('tourist.status_cancelled')}</span>
      default:
        return <span className="badge badge-ghost text-xs font-bold gap-1 rounded-lg py-3 px-3">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 pt-24 bg-base-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-base-content/60">{t('common.loading_space')}</p>
      </div>
    )
  }

  const handleTabClick = (tabName: string) => {
    startTransition(() => {
      window.history.pushState(null, '', `?tab=${tabName}`)
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-24 text-base-content">
      {/* Header Profile Section */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between rounded-[32px] border border-border bg-base-200 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div 
            className="flex h-16 w-16 items-center justify-center rounded-3xl text-xl font-black text-white"
            style={{ backgroundColor: COLORS.forest }}
          >
            {profile ? getInitials(profile.full_name) : '?'}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold">
              {t('tourist.greeting', { name: profile ? getFirstName(profile.full_name) : t('common.guest_name') })}
            </h1>
            <p className="text-xs text-base-content/50 mt-1">{t('tourist.subtitle')}</p>
          </div>
        </div>

        <div className="flex gap-2 self-start sm:self-center">
          <Link
            href="/scan"
            className="btn btn-sm rounded-xl text-white font-bold border-none"
            style={{ backgroundColor: COLORS.rust }}
          >
            {t('tourist.new_scan')}
          </Link>
          <Link
            href="/guides"
            className="btn btn-sm btn-outline rounded-xl font-bold"
          >
            {t('tourist.find_guide')}
          </Link>
        </div>
      </div>

      {alertMessage && (
        <div className="alert alert-success mb-6 rounded-2xl p-4 text-sm font-bold text-white flex items-start gap-3 border-none bg-emerald-600">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <div>{alertMessage}</div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-3">
        {[
          { id: 'profile', label: t('tourist.tab_profile'), icon: User },
          { id: 'bookings', label: t('tourist.tab_bookings'), icon: Calendar },
          { id: 'favorites', label: t('tourist.tab_favorites'), icon: Heart },
          { id: 'scans', label: t('tourist.tab_scans'), icon: History }
        ].map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                active 
                  ? 'text-white' 
                  : 'text-base-content/70 hover:bg-base-200'
              }`}
              style={active ? { backgroundColor: COLORS.forest } : undefined}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Contents */}
      <div>
        {/* 1. PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="grid gap-6 md:grid-cols-[1fr_1.8fr]">
            <div className="rounded-[28px] border border-border bg-base-200 p-6">
              <h3 className="font-serif text-lg font-bold mb-4">{t('tourist.info_title')}</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="block text-xs font-semibold text-base-content/50 uppercase">{t('tourist.full_name')}</span>
                  <span className="font-bold text-base-content">{profile?.full_name}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-base-content/50 uppercase">{t('tourist.email')}</span>
                  <span className="font-bold text-base-content">{profile?.email}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-base-content/50 uppercase">{t('tourist.phone')}</span>
                  <span className="font-bold text-base-content">{profile?.phone || t('common.not_specified')}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-base-content/50 uppercase">{t('tourist.preferred_lang')}</span>
                  <span className="font-bold text-base-content uppercase">{profile?.preferred_lang || 'fr'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-base-200 p-6">
              <h3 className="font-serif text-lg font-bold mb-4">{t('tourist.edit_profile')}</h3>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <label className="form-control w-full">
                  <span className="label-text mb-1 text-sm font-semibold">{t('tourist.full_name')}</span>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="input input-bordered w-full rounded-2xl bg-base-100"
                  />
                </label>

                <label className="form-control w-full">
                  <span className="label-text mb-1 text-sm font-semibold">{t('tourist.phone')}</span>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(sanitizePhoneInput(e.target.value))}
                    className="input input-bordered w-full rounded-2xl bg-base-100"
                    placeholder="+228 90 00 00 00"
                  />
                  {formPhone && validatePhone(formPhone) && (
                    <span className="text-xs text-error mt-1">{validatePhone(formPhone)}</span>
                  )}
                </label>

                <label className="form-control w-full">
                  <span className="label-text mb-1 text-sm font-semibold">{t('tourist.preferred_lang')}</span>
                  <select
                    value={formLang}
                    onChange={(e) => setFormLang(e.target.value)}
                    className="select select-bordered w-full rounded-2xl bg-base-100"
                  >
                    <option value="fr">{t('tourist.lang_fr')}</option>
                    <option value="en">{t('tourist.lang_en')}</option>
                    <option value="es">{t('tourist.lang_es')}</option>
                    <option value="zh">{t('tourist.lang_zh')}</option>
                  </select>
                </label>

                {profileSuccess && (
                  <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-xs font-bold text-success">
                    {t('common.success_update')}
                  </div>
                )}

                {profileError && (
                  <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-2 text-xs font-bold text-error">
                    {profileError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn text-white rounded-2xl px-6 border-none"
                  style={{ backgroundColor: COLORS.forest }}
                >
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.save')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 2. BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-border bg-base-200 p-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-base-content/30 mb-3" />
                <h4 className="font-serif text-lg font-bold">{t('tourist.no_bookings')}</h4>
                <p className="text-sm text-base-content/60 mt-1 max-w-sm mx-auto">
                  {t('tourist.no_bookings_desc')}
                </p>
                <Link
                  href="/guides"
                  className="btn btn-sm rounded-xl text-white font-bold border-none mt-4"
                  style={{ backgroundColor: COLORS.forest }}
                >
                  {t('tourist.explore_guides')}
                </Link>
              </div>
            ) : (
              bookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="rounded-[28px] border border-border bg-base-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:border-primary/20"
                >
                  <div className="flex gap-4">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-xs font-black text-white shrink-0"
                      style={{ backgroundColor: COLORS.gold }}
                    >
                      {getInitials(booking.guide.profile.full_name)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base-content">{booking.guide.profile.full_name}</span>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-xs text-base-content/60 mt-1.5 flex items-center gap-3">
                        <span>🗓️ {new Date(booking.start_date).toLocaleDateString()}</span>
                        <span>{t('tourist.booking_type', { type: booking.mission_type.replace('_', ' ') })}</span>
                      </p>
                      
                      {booking.quote_amount && (
                        <p className="text-xs font-bold text-base-content mt-2">
                          {t('tourist.offer_label', { amount: Number(booking.quote_amount).toLocaleString() })}
                        </p>
                      )}

                      {booking.quote_message && (
                        <div className="mt-2 text-xs italic bg-base-100 p-2.5 rounded-xl border border-border max-w-md">
                          " {booking.quote_message} "
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 self-end md:self-center shrink-0">
                    <Link
                      href={`/guides/${booking.guide.id}`}
                      className="btn btn-sm btn-ghost rounded-xl text-xs font-bold"
                    >
                      {t('tourist.view_guide')}
                    </Link>

                    {booking.status === 'completed' && !booking.review && (
                      <button
                        type="button"
                        onClick={() => handleOpenReview(booking.id)}
                        className="btn btn-sm rounded-xl text-white font-bold border-none"
                        style={{ backgroundColor: COLORS.forest }}
                      >
                        {t('tourist.leave_review')}
                      </button>
                    )}

                    {booking.status === 'completed' && booking.review && (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <Star className="h-3.5 w-3.5 fill-current" /> {t('tourist.review_left', { rating: booking.review.rating_overall })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. FAVORITES TAB */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {favorites.length === 0 ? (
                <div className="col-span-full rounded-[28px] border border-dashed border-border bg-base-200 p-8 text-center">
                  <Heart className="mx-auto h-12 w-12 text-base-content/30 mb-3" />
                  <h4 className="font-serif text-lg font-bold">{t('tourist.no_favorites')}</h4>
                  <p className="text-sm text-base-content/60 mt-1 max-w-sm mx-auto">
                    {t('tourist.no_favorites_desc')}
                  </p>
                  <Link
                    href="/guides"
                    className="btn btn-sm rounded-xl text-white font-bold border-none mt-4"
                    style={{ backgroundColor: COLORS.forest }}
                  >
                    {t('tourist.view_guides')}
                  </Link>
                </div>
              ) : (
                favorites.map((guide) => (
                  <div 
                    key={guide.id}
                    className="rounded-[28px] border border-border bg-base-200 p-5 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black text-white"
                          style={{ backgroundColor: COLORS.forest }}
                        >
                          {getInitials(guide.profile.full_name)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-base-content">{guide.profile.full_name}</h4>
                          <div className="flex items-center gap-1 mt-0.5 text-xs">
                            <Star className="h-3 w-3 fill-current text-amber-500" />
                            <span className="font-bold">{Number(guide.avg_rating).toFixed(1)}</span>
                            <span className="text-base-content/40">({guide.total_reviews})</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-1.5 text-xs text-base-content/70">
                        <p>🗣️ <span className="font-semibold">{t('tourist.lang_label')}</span> {guide.languages?.join(', ') || t('common.not_available')}</p>
                        <p>📍 <span className="font-semibold">{t('tourist.zones_label')}</span> {guide.coverage_zones?.join(', ') || t('common.not_available')}</p>
                        <p className="font-bold text-base-content mt-3">
                          {t('tourist.rate_label')} {Number(guide.full_day_rate).toLocaleString()} XOF/jour
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <Link
                        href={`/guides/${guide.id}`}
                        className="btn btn-xs btn-outline rounded-lg flex-1"
                      >
                        {t('tourist.details')}
                      </Link>
                      <Link
                        href={`/booking/${guide.id}`}
                        className="btn btn-xs text-white rounded-lg flex-1 border-none"
                        style={{ backgroundColor: COLORS.forest }}
                      >
                        {t('tourist.book')}
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
            {favorites.length > 0 && (
              <ShareItinerary
                items={favorites.map(g => ({
                  name: g.profile.full_name,
                  details: g.coverage_zones?.join(', ')
                }))}
              />
            )}
          </div>
        )}

        {/* 4. SCANS TAB */}
        {activeTab === 'scans' && (
          <div className="space-y-4">
            {scanHistory.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-border bg-base-200 p-8 text-center">
                <History className="mx-auto h-12 w-12 text-base-content/30 mb-3" />
                <h4 className="font-serif text-lg font-bold">{t('tourist.no_scans')}</h4>
                <p className="text-sm text-base-content/60 mt-1 max-w-sm mx-auto">
                  {t('tourist.no_scans_desc')}
                </p>
                <Link
                  href="/scan"
                  className="btn btn-sm rounded-xl text-white font-bold border-none mt-4"
                  style={{ backgroundColor: COLORS.rust }}
                >
                  {t('tourist.open_scanner')}
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scanHistory.map((scan, i) => (
                  <div 
                    key={i}
                    className="rounded-[28px] border border-border bg-base-200 overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="p-5">
                      <span className="text-[10px] text-base-content/50 font-bold">
                        {scan.date ? new Date(scan.date).toLocaleDateString() : t('tourist.date_unknown')}
                      </span>
                      <h4 className="font-serif text-lg font-bold text-base-content mt-1">{scan.monument}</h4>
                      <p className="text-xs text-base-content/70 mt-2 line-clamp-3 leading-5">
                        {scan.histoire}
                      </p>
                    </div>

                    <div className="border-t border-border/60 p-4 bg-base-300/30 flex justify-between items-center">
                      <span className="text-xs font-semibold text-base-content/60">
                        📍 {scan.localite || t('common.default_country')}
                      </span>
                      <Link 
                        href="/scan"
                        className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                        style={{ color: COLORS.forest }}
                      >
                        {t('tourist.scan_again')} <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedBookingId && (
        <ReviewModal
          bookingId={selectedBookingId}
          isOpen={isReviewOpen}
          onClose={() => {
            setIsReviewOpen(false)
            setSelectedBookingId(null)
          }}
          onSuccess={fetchData}
        />
      )}
    </main>
  )
}
