'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import { useEffect, useState, startTransition, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { COLORS } from '@/lib/constants/colors'
import { getInitials } from '@/lib/auth/redirect'
import { 
  Briefcase, Calendar, Clock, MapPin, 
  AlertTriangle, Loader2, Star, ShieldCheck, BadgeCent, 
  FileText, UploadCloud, Edit3, User, Bell, Phone 
} from 'lucide-react'
import { sanitizePhoneInput, validatePhone, validatePositiveNumber } from '@/lib/utils/validation'
import { getUserFriendlyError } from '@/lib/utils/errors'


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
    bio?: string
    phone?: string
  }
}

const AVAILABLE_ZONES = ['Lomé', 'Kpalimé', 'Atakpamé', 'Kara', 'Dapaong', 'Aného', 'Togoville']
const AVAILABLE_LANGUAGES = ['Français', 'English', 'Espagnol', 'Deutsch', 'Éwé', 'Kabyè', 'Mina']

export default function GuideDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
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
      const response = await fetch('/api/guide/bookings')
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Erreur lors de la récupération des données')
        return
      }
      setBookings(data.bookings)
      setGuide(data.guideProfile)

      // Initialize form fields
      if (data.guideProfile) {
        const gp = data.guideProfile
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
      }
    } catch {
      setError('Impossible de communiquer avec le serveur.')
    } finally {
      setLoading(false)
    }
  }, [])

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
      setError("Les années d'expérience doivent être comprises entre 0 et 60.")
      return
    }

    const rates = [
      { val: hourlyRate, name: 'Tarif horaire' },
      { val: halfDayRate, name: 'Tarif demi-journée' },
      { val: fullDayRate, name: 'Tarif journée complète' },
      { val: virtualRate, name: 'Tarif virtuel' }
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
      const response = await fetch('/api/guide/profile', {
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

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Erreur lors de la mise à jour')
        return
      }
      setGuide(data.guide)
      alert('Profil mis à jour avec succès !')
    } catch (err: unknown) {
      setError(getUserFriendlyError(err))
    } finally {
      setActionLoading(false)
    }
  }

  // Handle document submission
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier PDF.')
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

      const response = await fetch('/api/guide/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: {
            type: docType,
            label: docLabel || 'Document de vérification',
            file_url: base64Data,
            file_name: selectedFile.name,
            file_size: selectedFile.size
          }
        })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Erreur lors de la soumission du document')
        return
      }
      setGuide(data.guide)
      setDocLabel('')
      setSelectedFile(null)
      alert('Document soumis avec succès ! Votre statut passe en examen.')
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

    const quoteErr = validatePositiveNumber(quoteAmount, 'Le montant du devis')
    if (quoteErr) {
      setError(quoteErr)
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/guide/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          action: 'send_quote',
          quoteAmount,
          quoteMessage
        })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Erreur de transmission du devis')
        return
      }

      setSelectedBooking(null)
      setQuoteAmount('')
      setQuoteMessage('')
      await loadData()
      alert('Devis envoyé avec succès au touriste !')
    } catch (err: unknown) {
      setError(getUserFriendlyError(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateBookingStatus = async (bookingId: string, action: 'start_mission' | 'complete_mission' | 'cancel', reason?: string) => {
    if (!confirm('Êtes-vous sûr de vouloir effectuer cette action ?')) return
    setActionLoading(true)
    try {
      const response = await fetch('/api/guide/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          action,
          cancellationReason: reason
        })
      })

      const data = await response.json()
      if (!response.ok) {
        alert(data.error || 'Erreur lors du changement de statut')
        return
      }
      await loadData()
    } catch {
      alert('Erreur réseau.')
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
          <p className="text-sm font-semibold text-base-content/60 font-sans">Chargement de votre espace guide...</p>
        </div>
      </div>
    )
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
        <div className="rounded-[36px] bg-base-200 border border-border p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div 
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white relative shadow-sm"
              style={{ backgroundColor: COLORS.forest }}
            >
              {getInitials(guide.profile.full_name)}
              {guide.status === 'approved' && (
                <div className="absolute -bottom-1 -right-1 bg-success text-white p-0.5 rounded-lg border-2 border-base-200">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-bold tracking-tight">Bonjour, {guide.profile.full_name}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-base-content/65 font-bold">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                  {Number(guide.avg_rating).toFixed(1)} ({guide.total_reviews} avis)
                </span>
                <span>•</span>
                <span>Statut : 
                  <span className={`ml-1 font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-lg ${
                    guide.status === 'approved' ? 'bg-success/20 text-success' :
                    guide.status === 'under_review' ? 'bg-amber-500/20 text-amber-600' :
                    guide.status === 'rejected' ? 'bg-error/20 text-error' :
                    'bg-neutral/20 text-neutral-content'
                  }`}>
                    {guide.status === 'approved' ? 'Approuvé' :
                     guide.status === 'under_review' ? 'En examen' :
                     guide.status === 'rejected' ? 'Rejeté' : 'En attente de documents'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto text-center font-semibold">
            <div className="bg-base-100 rounded-2xl p-3 border border-border/60">
              <p className="text-[10px] font-black uppercase text-base-content/40 tracking-wider">Missions</p>
              <p className="text-xl font-black text-base-content mt-0.5">{guide.total_missions}</p>
            </div>
            <div className="bg-base-100 rounded-2xl p-3 border border-border/60">
              <p className="text-[10px] font-black uppercase text-base-content/40 tracking-wider">Note globale</p>
              <p className="text-xl font-black text-base-content mt-0.5">{Number(guide.avg_rating).toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-border mb-8 overflow-x-auto gap-4">
        {[
          { id: 'bookings', label: 'Demandes & Missions', icon: Briefcase },
          { id: 'profile', label: 'Éditer mon profil public', icon: Edit3 },
          { id: 'documents', label: 'Vérification de documents', icon: FileText }
        ].map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id as any)}
              className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === t.id 
                  ? 'border-primary text-primary font-black' 
                  : 'border-transparent text-base-content/60 hover:text-base-content'
              }`}
              style={{ borderBottomColor: activeTab === t.id ? COLORS.forest : undefined, color: activeTab === t.id ? COLORS.forest : undefined }}
            >
              <Icon className="h-4.5 w-4.5" />
              {t.label}
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
                Nouvelles demandes de devis
              </h3>
              
              {bookings.filter(b => b.status === 'quote_requested').length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border bg-base-200 p-8 text-center">
                  <p className="text-sm font-semibold text-base-content/50">Aucune nouvelle demande de devis.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {bookings.filter(b => b.status === 'quote_requested').map(b => (
                    <div key={b.id} className="rounded-3xl border border-border bg-base-200 p-5 shadow-xs flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="badge badge-warning badge-sm font-bold text-white uppercase text-[8px] rounded-lg">Devis requis</span>
                            <h4 className="font-bold text-base-content text-base mt-1">{b.tourist.full_name}</h4>
                          </div>
                          <span className="text-[10px] text-base-content/40 font-bold">{new Date(b.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="space-y-1.5 text-xs text-base-content/75 font-semibold">
                          <p className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-base-content/40" /> {new Date(b.start_date).toLocaleDateString()}</p>
                          {b.start_time && <p className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-base-content/40" /> Début à {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                          {b.meeting_point && <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-base-content/40" /> RDV : {b.meeting_point}</p>}
                          <p className="flex items-center gap-1.5"><User className="h-4 w-4 text-base-content/40" /> Groupe : {b.group_size} pers.</p>
                        </div>

                        {b.tourist_message && (
                          <div className="rounded-xl bg-base-100 p-3 text-xs italic text-base-content/85 border border-border/60">
                            {b.tourist_message}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex gap-2 border-t border-border/60 pt-4">
                        <button
                          onClick={() => handleUpdateBookingStatus(b.id, 'cancel', 'Refusé par le guide')}
                          className="btn btn-outline btn-error btn-sm rounded-xl flex-1 text-xs font-bold"
                        >
                          Refuser
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(b)
                            setQuoteAmount(guide?.full_day_rate || '')
                          }}
                          className="btn btn-sm text-white rounded-xl border-none font-bold flex-1"
                          style={{ backgroundColor: COLORS.forest }}
                        >
                          Envoyer un devis
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
                Missions confirmées et en cours
              </h3>

              {bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status)).length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border bg-base-200 p-8 text-center">
                  <p className="text-sm font-semibold text-base-content/50">Aucune mission en cours ou confirmée.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status)).map(b => (
                    <div key={b.id} className="rounded-3xl border border-border bg-base-200 p-5 shadow-xs flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`badge badge-sm font-bold text-white uppercase text-[8px] rounded-lg ${b.status === 'in_progress' ? 'bg-primary' : 'bg-success'}`}>
                              {b.status === 'in_progress' ? 'En cours' : 'Confirmé'}
                            </span>
                            <h4 className="font-bold text-base-content text-base mt-1">{b.tourist.full_name}</h4>
                          </div>
                          <span className="text-[10px] text-base-content/40 font-bold">{new Date(b.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="space-y-1.5 text-xs text-base-content/75 font-semibold">
                          <p className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-base-content/40" /> Date : {new Date(b.start_date).toLocaleDateString()}</p>
                          {b.quote_amount && (
                            <p className="flex items-center gap-1.5 text-base-content font-bold">
                              <BadgeCent className="h-4 w-4 text-emerald-600" />
                              Budget : {Number(b.quote_amount).toLocaleString()} XOF
                            </p>
                          )}
                          {b.tourist.phone && (
                            <p className="flex items-center gap-1.5 text-base-content">
                              <Phone className="h-4 w-4 text-base-content/40" />
                              Contact : <span className="font-bold underline">{b.tourist.phone}</span>
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
                            Démarrer la visite guidée
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'complete_mission')}
                            className="btn btn-sm text-white rounded-xl border-none font-bold w-full bg-success hover:bg-success-content"
                          >
                            Marquer comme terminée
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
              <h3 className="font-serif text-lg font-bold mb-4">Historique des missions</h3>
              <div className="overflow-x-auto rounded-[24px] border border-border bg-base-200">
                <table className="table w-full text-xs font-semibold">
                  <thead>
                    <tr className="bg-base-300 text-left text-[10px] font-black uppercase text-base-content/60">
                      <th className="p-4 rounded-tl-[24px]">Touriste</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Montant</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 rounded-tr-[24px]">Action / Note</th>
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
                            {b.status === 'completed' ? 'Terminé' :
                             b.status === 'cancelled' ? 'Annulé' : 'Devis envoyé'}
                          </span>
                        </td>
                        <td className="p-4">
                          {b.status === 'quote_sent' && (
                            <button 
                              onClick={() => handleUpdateBookingStatus(b.id, 'cancel', 'Annulé par le guide')}
                              className="text-xs text-error hover:underline"
                            >
                              Annuler le devis
                            </button>
                          )}
                          {b.status === 'completed' && b.quote_amount && 'Mission payée'}
                          {b.status === 'cancelled' && 'Annulé'}
                        </td>
                      </tr>
                    ))}
                    {bookings.filter(b => ['completed', 'cancelled', 'quote_sent'].includes(b.status)).length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-base-content/50">Aucun historique.</td>
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
          <form onSubmit={handleUpdateProfile} className="rounded-[32px] border border-border bg-base-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold border-b border-border pb-3">Éditer votre profil public</h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="form-control w-full">
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60">Numéro de téléphone</span>
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
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60">{"Années d'expérience"}</span>
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
              <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60">Biographie publique</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Racontez votre parcours, votre amour du Togo, vos circuits préférés..."
                className="textarea textarea-bordered h-28 rounded-2xl bg-base-100 p-3 text-sm focus:border-primary focus:outline-none"
              />
            </label>

            {/* Rates Grid */}
            <div className="space-y-3">
              <span className="block text-xs font-black uppercase tracking-wider text-base-content/60">Tarification (XOF)</span>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <label className="form-control w-full">
                  <span className="label-text mb-1 text-[10px] font-bold text-base-content/60">Journée complète</span>
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
                  <span className="label-text mb-1 text-[10px] font-bold text-base-content/60">Demi-journée</span>
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
                  <span className="label-text mb-1 text-[10px] font-bold text-base-content/60">Tarif horaire</span>
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
                  <span className="label-text mb-1 text-[10px] font-bold text-base-content/65">Virtuelle (Optionnel)</span>
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
              <span className="block text-xs font-black uppercase tracking-wider text-base-content/60">Langues maîtrisées</span>
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
              <span className="block text-xs font-black uppercase tracking-wider text-base-content/60">Zones de couverture</span>
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
              <span className="block text-xs font-black uppercase tracking-wider text-base-content/60">Vos Spécialités</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Ex: Écotourisme, Randonnées forestières"
                  className="input input-bordered rounded-2xl bg-base-100 text-sm flex-1 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addSpecialty}
                  className="btn text-white rounded-2xl border-none font-bold"
                  style={{ backgroundColor: COLORS.forest }}
                >
                  Ajouter
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
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer les modifications'}
            </button>
          </form>
        )}

        {/* Tab 3: Documents */}
        {activeTab === 'documents' && (
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Upload form */}
            <form onSubmit={handleUploadDocument} className="rounded-[32px] border border-border bg-base-200 p-6 sm:p-8 shadow-sm space-y-5">
              <h3 className="font-serif text-xl font-bold border-b border-border pb-3">Soumettre un document</h3>
              
              <label className="form-control w-full">
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60">Type de document</span>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="select select-bordered w-full rounded-2xl bg-base-100 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="guide_license">Licence officielle de guide touristique</option>
                  <option value="national_id">{"Carte Nationale d'Identité ou Passeport"}</option>
                  <option value="certificate">Certification ou Diplôme (Histoire/Tourisme)</option>
                  <option value="other">Autre justificatif</option>
                </select>
              </label>

              <label className="form-control w-full">
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60">Libellé / Titre</span>
                <input
                  type="text"
                  value={docLabel}
                  onChange={(e) => setDocLabel(e.target.value)}
                  placeholder="Ex: Licence Ministère du Tourisme 2026"
                  className="input input-bordered w-full rounded-2xl bg-base-100 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </label>

              <label className="form-control w-full">
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                  <UploadCloud className="h-3.5 w-3.5" /> Fichier justificatif (PDF uniquement)
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.type !== 'application/pdf') {
                        setError('Seuls les fichiers PDF sont autorisés.')
                        setSelectedFile(null)
                        return
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        setError('Le fichier ne doit pas dépasser 5 Mo.')
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
                  📁 Veuillez uploader un fichier officiel au format PDF (max. 5 Mo). Le document sera directement accessible et téléchargeable pour validation par l'équipe d'administration.
                </p>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="btn btn-block text-white rounded-2xl border-none font-bold"
                style={{ backgroundColor: COLORS.forest }}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Soumettre pour vérification'}
              </button>
            </form>

            {/* List of submitted docs */}
            <div className="rounded-[32px] border border-border bg-base-200 p-6 sm:p-8 shadow-sm space-y-4 h-fit">
              <h3 className="font-serif text-lg font-bold">Documents soumis</h3>
              
              {(guide as any)?.documents?.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-base-100 p-6 text-center text-base-content/50">
                  Aucun document soumis pour le moment.
                </div>
              ) : (
                <div className="space-y-3">
                  {(guide as any)?.documents?.map((doc: any) => (
                    <div key={doc.id} className="rounded-2xl bg-base-100 p-4 border border-border/70 flex justify-between items-center gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-extrabold text-base-content">{doc.label}</p>
                        <p className="text-[10px] font-black uppercase text-base-content/40 tracking-wider">
                          Type : {doc.type}
                        </p>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="inline-block text-[10px] font-bold text-primary underline">
                          Ouvrir le document
                        </a>
                      </div>

                      <span className={`badge badge-sm font-extrabold uppercase text-[8px] py-2.5 px-2 rounded-lg ${
                        doc.is_verified ? 'bg-success/20 text-success' : 'bg-amber-500/20 text-amber-600'
                      }`}>
                        {doc.is_verified ? 'Vérifié' : 'En cours'}
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
          <div className="w-full max-w-md rounded-[28px] border border-border bg-base-200 p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif text-xl font-bold text-base-content">Proposer un devis</h3>
              <button onClick={() => setSelectedBooking(null)} className="btn btn-ghost btn-circle btn-xs font-extrabold">×</button>
            </div>

            <div className="space-y-4">
              <label className="form-control w-full">
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/65">Montant proposé (XOF)</span>
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
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/65">Message explicatif</span>
                <textarea
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                  placeholder="Expliquez ce qui est inclus dans le tarif (transport, repas, frais d'entrée aux sites)..."
                  className="textarea textarea-bordered h-24 rounded-2xl bg-base-100 p-3 text-sm focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="btn btn-outline flex-1 rounded-2xl text-xs font-bold"
              >
                Annuler
              </button>
              <button
                onClick={handleSendQuote}
                disabled={actionLoading || !quoteAmount}
                className="btn flex-1 rounded-2xl border-none text-xs font-bold text-white"
                style={{ backgroundColor: COLORS.forest }}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Envoyer le devis'}
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  )
}
