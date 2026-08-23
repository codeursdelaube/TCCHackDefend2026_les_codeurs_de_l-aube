'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import { useEffect, useState, startTransition, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { COLORS } from '@/lib/constants/colors'
import { getInitials } from '@/lib/auth/redirect'
import { useTranslations } from 'next-intl'
import { 
  Briefcase, Calendar, Clock, MapPin, 
  AlertTriangle, Loader2, Star, ShieldCheck, BadgeCent, 
  FileText, UploadCloud, Edit3, User, Bell, Phone 
} from 'lucide-react'
import { sanitizePhoneInput, validatePhone, validatePositiveNumber } from '@/lib/utils/validation'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { apiFetch } from '@/lib/utils/http'

interface BookingRow {
  id: string
  status: string
  mission_type: string
  start_date: string
  start_time?: string
  meeting_point?: string
  tourist_message?: string
  group_size: number
  special_needs?: string
  quote_amount?: string
  quote_message?: string
  created_at: string
  tourist: {
    full_name: string
    phone?: string
    preferred_lang?: string
  }
}

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
  
  // Tabs: 'bookings' | 'profile' | 'documents'
  const activeTab = useMemo<'bookings' | 'profile' | 'documents'>(() => {
    const tab = searchParams.get('tab')
    if (tab === 'quotes' || tab === 'missions' || tab === 'subscription' || tab === 'bookings') {
      return 'bookings'
    } else if (tab === 'profile') {
      return 'profile'
    } else if (tab === 'documents') {
      return 'documents'
    }
    return 'bookings'
  }, [searchParams])

  const handleTabChange = (tabName: 'bookings' | 'profile' | 'documents') => {
    const newTabParam = tabName === 'bookings' ? 'quotes' : tabName
    router.push(`?tab=${newTabParam}`, { scroll: false })
  }
  const [bookings, setBookings] = useState<BookingRow[]>([])
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

  // Quote Modal State
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null)
  const [quoteAmount, setQuoteAmount] = useState('')
  const [quoteMessage, setQuoteMessage] = useState('')
  
  // Action Loading
  const [actionLoading, setActionLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFetch<{ bookings?: BookingRow[]; guideProfile?: GuideProfileData }>('/api/guide/bookings')
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
      alert(t('common.success_update'))
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
      setAvatarError('Format invalide. JPG, PNG ou WEBP uniquement.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image trop lourde. Maximum 5MB.')
      return
    }

    if (file.size === 0) {
      setAvatarError('Le fichier est vide.')
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
        setAvatarError(result.error || "Erreur lors de l'envoi de la photo. Réessayez.")
        return
      }
      if (!data?.avatar_url) {
        setAvatarError('Photo envoyée, mais la réponse du serveur est incomplète.')
        return
      }
      setAvatarUrl(data.avatar_url)
      setGuide((current) => current
        ? { ...current, profile: { ...current.profile, avatar_url: data.avatar_url } }
        : current
      )
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
    if (!selectedFile) {
      setError(t('guide.error_pdf_required'))
      return
    }
    setActionLoading(true)

    try {
      // Lire le fichier en base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (err) => reject(err)
      })
      reader.readAsDataURL(selectedFile)
      const base64Data = await base64Promise

      const result = await apiFetch<{ guide?: GuideProfileData }>('/api/guide/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: {
            type: docType,
            label: docLabel || t('guide.default_doc_label'),
            file_url: base64Data,
            file_name: selectedFile.name,
            file_size: selectedFile.size
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
      alert(t('guide.success_doc_submit'))
    } catch (err: unknown) {
      setError(getUserFriendlyError(err))
    } finally {
      setActionLoading(false)
    }
  }

  // Booking action handlers (quotes, mission state)
  const handleSendQuote = async () => {
    if (!selectedBooking || !quoteAmount) return
    setError(null)

    const quoteErr = validatePositiveNumber(quoteAmount, t('guide.proposed_amount'))
    if (quoteErr) {
      setError(quoteErr)
      return
    }

    setActionLoading(true)
    try {
      const result = await apiFetch('/api/guide/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          action: 'send_quote',
          quoteAmount,
          quoteMessage
        })
      })

      if (!result.ok) {
        setError(result.error || t('guide.error_quote_send'))
        return
      }

      setSelectedBooking(null)
      setQuoteAmount('')
      setQuoteMessage('')
      await loadData()
      alert(t('guide.success_quote_send'))
    } catch (err: unknown) {
      setError(getUserFriendlyError(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateBookingStatus = async (bookingId: string, action: 'start_mission' | 'complete_mission' | 'cancel', reason?: string) => {
    if (!confirm(t('guide.confirm_action'))) return
    setActionLoading(true)
    try {
      const result = await apiFetch('/api/guide/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          action,
          cancellationReason: reason
        })
      })

      if (!result.ok) {
        alert(result.error || t('guide.error_status_change'))
        return
      }
      await loadData()
    } catch {
      alert(t('common.error_network'))
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" style={{ color: COLORS.forest }} />
          <p className="text-sm font-semibold text-base-content/60 font-sans">{t('common.loading_guide')}</p>
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
    <main className="mx-auto w-full max-w-7xl px-4 pb-32 pt-24 text-base-content sm:px-6 lg:px-8 bg-base-100">
      
      {/* Error Alert */}
      {error && (
        <div className="alert alert-error rounded-2xl mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* Guide Info Banner */}
      {guide && (
        <div className="rounded-xl bg-base-200 border border-border p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div 
              className="h-20 w-20 shrink-0 rounded-2xl relative shadow-sm overflow-visible"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={guide.profile.full_name}
                  className="h-full w-full object-cover rounded-2xl border border-border"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center rounded-2xl text-xl font-black text-white"
                  style={{ backgroundColor: COLORS.forest }}
                >
                  {getInitials(guide.profile.full_name)}
                </div>
              )}
              {guide.status === 'approved' && (
                <div className="absolute -bottom-1 -right-1 bg-success text-white p-0.5 rounded-lg border-2 border-base-200 z-10">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-bold tracking-tight">{t('guide.greeting', { name: guide.profile.full_name })}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-base-content/65 font-bold">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                  {Number(guide.avg_rating).toFixed(1)} ({guide.total_reviews} {t('guide.review_count_label')})
                </span>
                <span>•</span>
                <span>{t('common.status')} : 
                  <span className={`ml-1 font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-lg ${
                    guide.status === 'approved' ? 'bg-success/20 text-success' :
                    guide.status === 'under_review' ? 'bg-amber-500/20 text-amber-600' :
                    guide.status === 'rejected' ? 'bg-error/20 text-error' :
                    'bg-neutral/20 text-neutral-content'
                  }`}>
                    {getGuideStatusText(guide.status)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto text-center font-semibold">
            <div className="bg-base-100 rounded-2xl p-3 border border-border/60">
              <p className="text-[10px] font-black uppercase text-base-content/40 tracking-wider">{t('guide.missions_stat')}</p>
              <p className="text-xl font-black text-base-content mt-0.5">{guide.total_missions}</p>
            </div>
            <div className="bg-base-100 rounded-2xl p-3 border border-border/60">
              <p className="text-[10px] font-black uppercase text-base-content/40 tracking-wider">{t('guide.rating_stat')}</p>
              <p className="text-xl font-black text-base-content mt-0.5">{Number(guide.avg_rating).toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-border mb-8 overflow-x-auto gap-4">
        {[
          { id: 'bookings', label: t('guide.tab_bookings'), icon: Briefcase },
          { id: 'profile', label: t('guide.tab_profile'), icon: Edit3 },
          { id: 'documents', label: t('guide.tab_documents'), icon: FileText }
        ].map((tabItem) => {
          const Icon = tabItem.icon
          return (
            <button
              key={tabItem.id}
              onClick={() => handleTabChange(tabItem.id as any)}
              className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tabItem.id 
                  ? 'border-primary text-primary font-black' 
                  : 'border-transparent text-base-content/60 hover:text-base-content'
              }`}
              style={{ borderBottomColor: activeTab === tabItem.id ? COLORS.forest : undefined, color: activeTab === tabItem.id ? COLORS.forest : undefined }}
            >
              <Icon className="h-4.5 w-4.5" />
              {tabItem.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        
        {/* Tab 1: Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            
            {/* Pending Requests / Quote requested */}
            <div>
              <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                {t('guide.new_quotes_title')}
              </h3>
              
              {bookings.filter(b => b.status === 'quote_requested').length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-base-200 p-8 text-center">
                  <p className="text-sm font-semibold text-base-content/50">{t('guide.no_quotes')}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {bookings.filter(b => b.status === 'quote_requested').map(b => (
                    <div key={b.id} className="rounded-3xl border border-border bg-base-200 p-5 shadow-xs flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="badge badge-warning badge-sm font-bold text-white uppercase text-[8px] rounded-lg">{t('guide.status_quote_required')}</span>
                            <h4 className="font-bold text-base-content text-base mt-1">{b.tourist.full_name}</h4>
                          </div>
                          <span className="text-[10px] text-base-content/40 font-bold">{new Date(b.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="space-y-1.5 text-xs text-base-content/75 font-semibold">
                          <p className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-base-content/40" /> {new Date(b.start_date).toLocaleDateString()}</p>
                          {b.start_time && <p className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-base-content/40" /> {t('guide.start_at', { time: new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })}</p>}
                          {b.meeting_point && <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-base-content/40" /> {t('guide.meeting_point', { point: b.meeting_point })}</p>}
                          <p className="flex items-center gap-1.5"><User className="h-4 w-4 text-base-content/40" /> {t('guide.group_size', { size: b.group_size })}</p>
                        </div>

                        {b.tourist_message && (
                          <div className="rounded-xl bg-base-100 p-3 text-xs italic text-base-content/85 border border-border/60">
                            {b.tourist_message}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex gap-2 border-t border-border/60 pt-4">
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'cancel', t('guide.cancel_reason_refused'))}
                          className="btn btn-outline btn-error btn-sm rounded-xl flex-1 text-xs font-bold"
                        >
                          {t('guide.refuse')}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(b)
                            setQuoteAmount(guide?.full_day_rate || '')
                          }}
                          className="btn btn-sm text-white rounded-xl border-none font-bold flex-1"
                          style={{ backgroundColor: COLORS.forest }}
                        >
                          {t('guide.send_quote_btn')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* In Progress / Active Missions */}
            <div className="border-t border-border/55 pt-6">
              <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-600" />
                {t('guide.confirmed_missions_title')}
              </h3>

              {bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status)).length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-base-200 p-8 text-center">
                  <p className="text-sm font-semibold text-base-content/50">{t('guide.no_active_missions')}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status)).map(b => (
                    <div key={b.id} className="rounded-3xl border border-border bg-base-200 p-5 shadow-xs flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`badge badge-sm font-bold text-white uppercase text-[8px] rounded-lg ${b.status === 'in_progress' ? 'bg-primary' : 'bg-success'}`}>
                              {b.status === 'in_progress' ? t('guide.status_in_progress') : t('guide.status_confirmed')}
                            </span>
                            <h4 className="font-bold text-base-content text-base mt-1">{b.tourist.full_name}</h4>
                          </div>
                          <span className="text-[10px] text-base-content/40 font-bold">{new Date(b.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="space-y-1.5 text-xs text-base-content/75 font-semibold">
                          <p className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-base-content/40" /> {t('common.date')} : {new Date(b.start_date).toLocaleDateString()}</p>
                          {b.quote_amount && (
                            <p className="flex items-center gap-1.5 text-base-content font-bold">
                              <BadgeCent className="h-4 w-4 text-emerald-600" />
                              {t('guide.budget_label', { amount: Number(b.quote_amount).toLocaleString() })}
                            </p>
                          )}
                          {b.tourist.phone && (
                            <p className="flex items-center gap-1.5 text-base-content">
                              <Phone className="h-4 w-4 text-base-content/40" />
                              {t('guide.contact_label')}<span className="font-bold underline">{b.tourist.phone}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2 border-t border-border/60 pt-4">
                        {b.status === 'confirmed' ? (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'start_mission')}
                            className="btn btn-sm text-white rounded-xl border-none font-bold w-full"
                            style={{ backgroundColor: COLORS.rust }}
                          >
                            {t('guide.start_mission')}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'complete_mission')}
                            className="btn btn-sm text-white rounded-xl border-none font-bold w-full bg-success hover:bg-success-content"
                          >
                            {t('guide.complete_mission')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History */}
            <div className="border-t border-border/55 pt-6">
              <h3 className="font-serif text-lg font-bold mb-4">{t('guide.missions_history')}</h3>
              <div className="overflow-x-auto rounded-xl border border-border bg-base-200">
                <table className="table w-full text-xs font-semibold">
                  <thead>
                    <tr className="bg-base-300 text-left text-[10px] font-black uppercase text-base-content/60">
                      <th className="p-4 rounded-tl-[24px]">{t('guide.table_tourist')}</th>
                      <th className="p-4">{t('common.date')}</th>
                      <th className="p-4">{t('common.amount')}</th>
                      <th className="p-4">{t('guide.table_status')}</th>
                      <th className="p-4 rounded-tr-[24px]">{t('guide.table_action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.filter(b => ['completed', 'cancelled', 'quote_sent'].includes(b.status)).map(b => (
                      <tr key={b.id} className="border-b border-border/60 hover:bg-base-100/40">
                        <td className="p-4 font-bold">{b.tourist.full_name}</td>
                        <td className="p-4">{new Date(b.start_date).toLocaleDateString()}</td>
                        <td className="p-4">{b.quote_amount ? `${Number(b.quote_amount).toLocaleString()} XOF` : 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                            b.status === 'completed' ? 'bg-success/20 text-success' :
                            b.status === 'cancelled' ? 'bg-error/20 text-error' :
                            'bg-neutral/20 text-neutral-content'
                          }`}>
                            {b.status === 'completed' ? t('guide.history_completed') :
                             b.status === 'cancelled' ? t('guide.history_cancelled') : t('guide.history_quote_sent')}
                          </span>
                        </td>
                        <td className="p-4">
                          {b.status === 'quote_sent' && (
                            <button 
                              onClick={() => handleUpdateBookingStatus(b.id, 'cancel', t('guide.cancel_reason_guide'))}
                              className="text-xs text-error hover:underline"
                            >
                              {t('guide.cancel_quote')}
                            </button>
                          )}
                          {b.status === 'completed' && b.quote_amount && t('guide.mission_paid')}
                          {b.status === 'cancelled' && t('guide.history_cancelled')}
                        </td>
                      </tr>
                    ))}
                    {bookings.filter(b => ['completed', 'cancelled', 'quote_sent'].includes(b.status)).length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-base-content/50">{t('guide.no_history')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Edit Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="rounded-xl border border-border bg-base-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold border-b border-border pb-3">{t('guide.tab_profile')}</h3>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Photo de profil"
                    className="h-24 w-24 rounded-2xl object-cover border-2 border-border shadow"
                  />
                ) : (
                  <div
                    className="h-24 w-24 rounded-2xl flex items-center justify-center text-2xl font-black text-white border-2 border-border"
                    style={{ backgroundColor: COLORS.forest }}
                  >
                    {getInitials(guide?.profile?.full_name ?? '')}
                  </div>
                )}
                {/* Badge upload */}
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center cursor-pointer text-white shadow-lg border-2 border-white"
                  style={{ backgroundColor: COLORS.rust }}
                >
                  {avatarUploading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <UploadCloud className="h-3.5 w-3.5" />
                  }
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                />
              </div>
              <span className="text-xs text-muted-foreground opacity-60">JPG, PNG ou WEBP — max 5MB</span>
              {avatarError && (
                <span className="text-xs text-error font-semibold">{avatarError}</span>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="form-control w-full">
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60">{t('guide.phone_label')}</span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                  placeholder="+228 90 00 00 00"
                  className="input input-bordered w-full rounded-2xl bg-base-100 text-sm focus:border-primary focus:outline-none"
                />
                {phone && validatePhone(phone) && (
                  <span className="text-xs text-error mt-1">{validatePhone(phone)}</span>
                )}
              </label>

              <label className="form-control w-full">
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60">{t('guide.exp_label')}</span>
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
                  className="input input-bordered w-full rounded-2xl bg-base-100 text-sm focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            {/* Bio */}
            <label className="form-control w-full">
              <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60">{t('guide.bio_label')}</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t('guide.bio_placeholder')}
                className="textarea textarea-bordered h-28 rounded-2xl bg-base-100 p-3 text-sm focus:border-primary focus:outline-none"
              />
            </label>

            {/* Rates Grid */}
            <div className="space-y-3">
              <span className="block text-xs font-black uppercase tracking-wider text-base-content/60">{t('guide.rates_title')}</span>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <label className="form-control w-full">
                  <span className="label-text mb-1 text-[10px] font-bold text-base-content/60">{t('guide.rate_full')}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={fullDayRate}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '' || parseFloat(v) >= 0) {
                        setFullDayRate(v)
                      }
                    }}
                    className="input input-bordered rounded-2xl bg-base-100 text-xs focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="form-control w-full">
                  <span className="label-text mb-1 text-[10px] font-bold text-base-content/60">{t('guide.rate_half')}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={halfDayRate}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '' || parseFloat(v) >= 0) {
                        setHalfDayRate(v)
                      }
                    }}
                    className="input input-bordered rounded-2xl bg-base-100 text-xs focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="form-control w-full">
                  <span className="label-text mb-1 text-[10px] font-bold text-base-content/60">{t('guide.rate_hour')}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={hourlyRate}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '' || parseFloat(v) >= 0) {
                        setHourlyRate(v)
                      }
                    }}
                    className="input input-bordered rounded-2xl bg-base-100 text-xs focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="form-control w-full">
                  <span className="label-text mb-1 text-[10px] font-bold text-base-content/65">{t('guide.rate_virtual')}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={virtualRate}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '' || parseFloat(v) >= 0) {
                        setVirtualRate(v)
                      }
                    }}
                    className="input input-bordered rounded-2xl bg-base-100 text-xs focus:border-primary focus:outline-none"
                  />
                </label>
              </div>
            </div>

            {/* Languages Selector */}
            <div className="space-y-3">
              <span className="block text-xs font-black uppercase tracking-wider text-base-content/60">{t('guide.langs_title')}</span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_LANGUAGES.map((l) => {
                  const active = selectedLangs.includes(l)
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleLanguage(l)}
                      className={`badge py-3 px-3 rounded-lg text-xs font-bold transition-all border ${
                        active 
                          ? 'bg-primary text-white border-transparent' 
                          : 'bg-base-100 text-base-content border-border hover:border-base-content/30'
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
              <span className="block text-xs font-black uppercase tracking-wider text-base-content/60">{t('guide.zones_title')}</span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ZONES.map((z) => {
                  const active = selectedZones.includes(z)
                  return (
                    <button
                      key={z}
                      type="button"
                      onClick={() => toggleZone(z)}
                      className={`badge py-3 px-3 rounded-lg text-xs font-bold transition-all border ${
                        active 
                          ? 'bg-primary text-white border-transparent' 
                          : 'bg-base-100 text-base-content border-border hover:border-base-content/30'
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
              <span className="block text-xs font-black uppercase tracking-wider text-base-content/60">{t('guide.specs_title')}</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder={t('guide.spec_placeholder')}
                  className="input input-bordered rounded-2xl bg-base-100 text-sm flex-1 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addSpecialty}
                  className="btn text-white rounded-2xl border-none font-bold"
                  style={{ backgroundColor: COLORS.forest }}
                >
                  {t('guide.add_spec')}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {specialties.map((s) => (
                  <span key={s} className="badge bg-neutral text-neutral-content font-bold px-3.5 py-3 rounded-xl text-xs gap-1.5">
                    {s}
                    <button type="button" onClick={() => removeSpecialty(s)} className="text-neutral-content/60 hover:text-white font-extrabold text-[10px] ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="btn btn-block text-white rounded-2xl border-none font-bold mt-4"
              style={{ backgroundColor: COLORS.forest }}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.save_changes')}
            </button>
          </form>
        )}

        {/* Tab 3: Documents */}
        {activeTab === 'documents' && (
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Upload form */}
            <form onSubmit={handleUploadDocument} className="rounded-xl border border-border bg-base-200 p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="font-serif text-xl font-bold border-b border-border pb-3">{t('guide.submit_doc_title')}</h3>
              
              <label className="form-control w-full">
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60">{t('guide.doc_type')}</span>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="select select-bordered w-full rounded-2xl bg-base-100 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="guide_license">{t('guide.doc_license')}</option>
                  <option value="national_id">{t('guide.doc_id')}</option>
                  <option value="certificate">{t('guide.doc_cert')}</option>
                  <option value="other">{t('guide.doc_other')}</option>
                </select>
              </label>

              <label className="form-control w-full">
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60">{t('guide.doc_title_label')}</span>
                <input
                  type="text"
                  value={docLabel}
                  onChange={(e) => setDocLabel(e.target.value)}
                  placeholder={t('guide.doc_title_placeholder')}
                  className="input input-bordered w-full rounded-2xl bg-base-100 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </label>

              <label className="form-control w-full">
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60 flex items-center gap-1">
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
                  className="file-input file-input-bordered w-full rounded-2xl bg-base-100 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </label>

              <div className="rounded-2xl bg-base-100 p-4 border border-border/60">
                <p className="text-xs text-base-content/60 leading-5">
                  {t('guide.doc_upload_hint')}
                </p>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="btn btn-block text-white rounded-2xl border-none font-bold"
                style={{ backgroundColor: COLORS.forest }}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('guide.submit_for_verification')}
              </button>
            </form>

            {/* List of submitted docs */}
            <div className="rounded-xl border border-border bg-base-200 p-6 sm:p-8 shadow-sm space-y-4 h-fit">
              <h3 className="font-serif text-lg font-bold">{t('guide.docs_submitted_title')}</h3>
              
              {(guide as any)?.documents?.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-base-100 p-6 text-center text-base-content/50">
                  {t('guide.no_docs')}
                </div>
              ) : (
                <div className="space-y-3">
                  {(guide as any)?.documents?.map((doc: any) => (
                    <div key={doc.id} className="rounded-2xl bg-base-100 p-4 border border-border/70 flex justify-between items-center gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-extrabold text-base-content">{doc.label}</p>
                        <p className="text-[10px] font-black uppercase text-base-content/40 tracking-wider">
                          {t('common.status')} : {doc.type}
                        </p>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="inline-block text-[10px] font-bold text-primary underline">
                          {t('guide.open_doc')}
                        </a>
                      </div>

                      <span className={`badge badge-sm font-extrabold uppercase text-[8px] py-2.5 px-2 rounded-lg ${
                        doc.is_verified ? 'bg-success/20 text-success' : 'bg-amber-500/20 text-amber-600'
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

      {/* Quote Dialog Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-base-200 p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif text-xl font-bold text-base-content">{t('guide.propose_quote_title')}</h3>
              <button onClick={() => setSelectedBooking(null)} className="btn btn-ghost btn-circle btn-xs font-extrabold">×</button>
            </div>

            <div className="space-y-4">
              <label className="form-control w-full">
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/65">{t('guide.proposed_amount')}</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={quoteAmount}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === '' || parseFloat(v) >= 0) {
                      setQuoteAmount(v)
                    }
                  }}
                  className="input input-bordered w-full rounded-2xl bg-base-100 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </label>

              <label className="form-control w-full">
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/65">{t('guide.message_explan')}</span>
                <textarea
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                  placeholder={t('guide.message_placeholder')}
                  className="textarea textarea-bordered h-24 rounded-2xl bg-base-100 p-3 text-sm focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="btn btn-outline flex-1 rounded-2xl text-xs font-bold"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSendQuote}
                disabled={actionLoading || !quoteAmount}
                className="btn flex-1 rounded-2xl border-none text-xs font-bold text-white"
                style={{ backgroundColor: COLORS.forest }}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('guide.send_quote')}
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  )
}
