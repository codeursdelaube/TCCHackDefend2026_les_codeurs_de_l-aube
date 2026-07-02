'use client'

/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { COLORS } from '@/lib/constants/colors'
import { getInitials } from '@/lib/auth/redirect'
import { 
  ArrowLeft, Calendar, Clock, MapPin, Users, MessageSquare, 
  Sparkles, Loader2, AlertCircle, CheckCircle, ShieldCheck, Star 
} from 'lucide-react'
import { getUserFriendlyError } from '@/lib/utils/errors'

interface GuideInfo {
  id: string
  experience_years: number
  specialties: string[]
  languages: string[]
  full_day_rate?: string
  half_day_rate?: string
  hourly_rate?: string
  virtual_rate?: string
  avg_rating: string
  profile: {
    full_name: string
    avatar_url?: string
    bio?: string
  }
}

export default function BookingPage() {
  const params = useParams<{ locale: string; guideId: string }>()
  const guideId = params?.guideId

  const [guide, setGuide] = useState<GuideInfo | null>(null)
  const [loadingGuide, setLoadingGuide] = useState(true)
  const [guideError, setGuideError] = useState<string | null>(null)

  // Form State
  const [missionType, setMissionType] = useState('full_day')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [meetingPoint, setMeetingPoint] = useState('')
  const [groupSize, setGroupSize] = useState(1)
  const [touristMessage, setTouristMessage] = useState('')
  const [specialNeeds, setSpecialNeeds] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!guideId) return

    const fetchGuide = async () => {
      setLoadingGuide(true)
      try {
        const response = await fetch(`/api/guides/${guideId}`)
        const data = await response.json()
        if (!response.ok) {
          setGuideError(data.error || 'Erreur de récupération des infos du guide')
          return
        }
        setGuide(data.guide)
      } catch {
        setGuideError('Impossible de charger les données du guide')
      } finally {
        setLoadingGuide(false)
      }
    }

    fetchGuide()
  }, [guideId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guideId) return

    if (!startDate) {
      setSubmitError('Veuillez sélectionner une date de début.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guide_id: guideId,
          mission_type: missionType,
          start_date: startDate,
          start_time: startTime,
          meeting_point: meetingPoint,
          tourist_message: touristMessage,
          group_size: groupSize,
          special_needs: specialNeeds
        })
      })

      const data = await response.json()
      if (!response.ok) {
        setSubmitError(data.error || 'Une erreur est survenue lors de la réservation.')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = `/${params.locale}/dashboard/tourist?booking_created=true`
      }, 2000)
    } catch (err: unknown) {
      console.error(err)
      setSubmitError(getUserFriendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingGuide) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" style={{ color: COLORS.forest }} />
          <p className="text-sm font-semibold text-base-content/60">Chargement du formulaire...</p>
        </div>
      </div>
    )
  }

  if (guideError || !guide) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center bg-base-100">
        <AlertCircle className="mx-auto h-12 w-12 text-error mb-4" />
        <h2 className="font-serif text-2xl font-bold mb-2">Guide introuvable</h2>
        <p className="text-sm text-base-content/60 mb-6">{guideError || 'Ce guide n\'est pas disponible pour la réservation.'}</p>
        <Link 
          href="/guides"
          className="btn rounded-2xl text-white border-none font-bold"
          style={{ backgroundColor: COLORS.forest }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour à l'annuaire
        </Link>
      </div>
    )
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-32 pt-24 text-base-content sm:px-6 lg:px-8 bg-base-100">
      {/* Back button */}
      <div className="mb-6">
        <Link 
          href={`/guides/${guide.id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-base-content/60 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au profil du guide
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[5fr_3fr]">
        
        {/* Booking Form Card */}
        <div className="rounded-[32px] border border-border bg-base-200 p-6 sm:p-8 shadow-sm">
          <div className="mb-6 border-b border-border pb-4">
            <h1 className="font-serif text-2xl font-bold sm:text-3xl text-base-content">
              Demande de réservation
            </h1>
            <p className="text-xs text-base-content/60 mt-1">
              Remplissez ce formulaire pour envoyer une demande de devis à {guide.profile.full_name}.
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="rounded-full bg-success/15 p-4 text-success animate-bounce">
                <CheckCircle className="h-12 w-12" />
              </div>
              <h3 className="font-serif text-2xl font-bold">Demande envoyée !</h3>
              <p className="text-sm text-base-content/65 max-w-sm">
                Votre demande de réservation a été transmise avec succès. Redirection vers votre tableau de bord...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Type de mission */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-base-content/60 mb-2">Type de visite / mission</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 'full_day', label: 'Journée', desc: 'Complète' },
                    { value: 'half_day', label: 'Demi-Journée', desc: 'Matin/Aprem' },
                    { value: 'hourly', label: 'Horaire', desc: 'Par heure' },
                    { value: 'virtual', label: 'Virtuelle', desc: 'En visioconférence' }
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setMissionType(t.value)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                        missionType === t.value 
                          ? 'border-primary bg-primary/5 shadow-xs scale-98' 
                          : 'border-border bg-base-100 hover:border-base-content/25'
                      }`}
                    >
                      <span className="text-xs font-bold text-base-content">{t.label}</span>
                      <span className="text-[10px] text-base-content/50 mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Heure */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-control w-full">
                  <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Date prévue
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input input-bordered w-full rounded-2xl bg-base-100 text-sm focus:border-primary focus:outline-none"
                    required
                  />
                </label>

                <label className="form-control w-full">
                  <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Heure de début
                  </span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input input-bordered w-full rounded-2xl bg-base-100 text-sm focus:border-primary focus:outline-none"
                    required
                  />
                </label>
              </div>

              {/* Lieu de rencontre & Taille de groupe */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-control w-full">
                  <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Point de rendez-vous
                  </span>
                  <input
                    type="text"
                    value={meetingPoint}
                    onChange={(e) => setMeetingPoint(e.target.value)}
                    placeholder="Ex: Hall de l'Hôtel du 2 Février, Lomé"
                    className="input input-bordered w-full rounded-2xl bg-base-100 text-sm focus:border-primary focus:outline-none"
                  />
                </label>

                <label className="form-control w-full">
                  <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> Nombre de personnes (1 - 50)
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={groupSize}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '') {
                        setGroupSize(1)
                      } else {
                        const val = parseInt(v, 10)
                        if (val >= 1 && val <= 50) {
                          setGroupSize(val)
                        }
                      }
                    }}
                    className="input input-bordered w-full rounded-2xl bg-base-100 text-sm focus:border-primary focus:outline-none"
                    required
                  />
                </label>
              </div>

              {/* Message */}
              <label className="form-control w-full">
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" /> Détails de votre itinéraire / Message
                </span>
                <textarea
                  value={touristMessage}
                  onChange={(e) => setTouristMessage(e.target.value)}
                  placeholder="Décrivez brièvement ce que vous souhaitez visiter, vos centres d'intérêt (histoire, gastronomie, nature)..."
                  className="textarea textarea-bordered h-24 rounded-2xl bg-base-100 p-3 text-sm focus:border-primary focus:outline-none"
                />
              </label>

              {/* Besoins spécifiques */}
              <label className="form-control w-full">
                <span className="label-text mb-1 text-xs font-black uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Besoins ou contraintes spécifiques (Optionnel)
                </span>
                <input
                  type="text"
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                  placeholder="Ex: Mobilité réduite, allergies alimentaires, enfants en bas âge..."
                  className="input input-bordered w-full rounded-2xl bg-base-100 text-sm focus:border-primary focus:outline-none"
                />
              </label>

              {submitError && (
                <div className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-xs font-bold text-error flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-block text-white rounded-2xl border-none font-bold"
                style={{ backgroundColor: COLORS.forest }}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Envoyer la demande de réservation'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Sidebar Summary Info */}
        <div className="space-y-6">
          {/* Guide Card Mini */}
          <div className="rounded-[28px] border border-border bg-base-200 p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-black uppercase tracking-wider text-base-content/50">Votre Guide</h3>
            <div className="flex items-center gap-3">
              <div 
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xs font-black text-white"
                style={{ backgroundColor: COLORS.forest }}
              >
                {guide.profile.avatar_url ? (
                  <img src={guide.profile.avatar_url} alt={guide.profile.full_name} className="h-full w-full object-cover rounded-2xl" />
                ) : (
                  getInitials(guide.profile.full_name)
                )}
              </div>
              <div>
                <h4 className="font-bold text-base-content text-sm">{guide.profile.full_name}</h4>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-base-content/60">
                  <ShieldCheck className="h-3 w-3 text-success shrink-0" />
                  <span>Certifié</span>
                  <span className="text-base-content/30">•</span>
                  <Star className="h-3 w-3 fill-current text-amber-500 shrink-0" />
                  <span className="font-bold text-base-content">{Number(guide.avg_rating).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="rounded-[28px] border border-border bg-base-200 p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-black uppercase tracking-wider text-base-content/50">Tarifs indicatifs</h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-base-content/65">Journée complète :</span>
                <span>{guide.full_day_rate ? `${Number(guide.full_day_rate).toLocaleString()} XOF` : 'N/A'}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-base-content/65">Demi-journée :</span>
                <span>{guide.half_day_rate ? `${Number(guide.half_day_rate).toLocaleString()} XOF` : 'N/A'}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-base-content/65">Horaire :</span>
                <span>{guide.hourly_rate ? `${Number(guide.hourly_rate).toLocaleString()} XOF` : 'N/A'}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-base-content/65">Visite virtuelle :</span>
                <span>{guide.virtual_rate ? `${Number(guide.virtual_rate).toLocaleString()} XOF` : 'N/A'}</span>
              </div>
            </div>
            
            <div className="border-t border-border/55 pt-3">
              <p className="text-[10px] text-base-content/50 leading-4">
                ⚠️ Après validation de ce formulaire, le guide analysera votre demande et vous enverra un devis personnalisé. Vous serez invité à payer uniquement après votre acceptation du devis.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
