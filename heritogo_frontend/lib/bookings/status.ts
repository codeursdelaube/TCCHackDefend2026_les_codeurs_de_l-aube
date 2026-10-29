/**
 * Règles métier partagées (client + serveur) du parcours de mise en relation
 * guide ↔ touriste. Toute transition de statut doit passer par ces constantes
 * afin que l'API et l'interface restent cohérentes.
 */

export const BOOKING_STATUSES = [
  'quote_requested',
  'quote_sent',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'disputed',
] as const
export type BookingStatusValue = (typeof BOOKING_STATUSES)[number]

export const MISSION_TYPES = ['full_day', 'half_day', 'hourly', 'virtual'] as const
export type MissionTypeValue = (typeof MISSION_TYPES)[number]

/** Étapes affichées dans la frise de suivi d'une réservation. */
export const BOOKING_STEPS = ['quote_requested', 'quote_sent', 'confirmed', 'in_progress', 'completed'] as const

export const MAX_GROUP_SIZE = 30
export const MAX_BOOKING_TEXT = 2_000
export const MAX_REASON_TEXT = 500
export const MAX_QUOTE_AMOUNT = 10_000_000
/** Délai maximal de réservation à l'avance. */
export const MAX_BOOKING_HORIZON_DAYS = 365

/** Réservations encore « vivantes » (bloquent un doublon pour le même guide et la même date). */
export const ACTIVE_STATUSES: BookingStatusValue[] = ['quote_requested', 'quote_sent', 'confirmed', 'in_progress']

/** Statuts pour lesquels les coordonnées des deux parties sont partagées. */
export const CONTACT_SHARED_STATUSES: BookingStatusValue[] = ['confirmed', 'in_progress', 'completed']

export const TOURIST_CANCELLABLE: BookingStatusValue[] = ['quote_requested', 'quote_sent', 'confirmed']
export const GUIDE_CANCELLABLE: BookingStatusValue[] = ['quote_requested', 'quote_sent', 'confirmed']

export function isContactShared(status: string) {
  return CONTACT_SHARED_STATUSES.includes(status as BookingStatusValue)
}

export function isActiveBooking(status: string) {
  return ACTIVE_STATUSES.includes(status as BookingStatusValue)
}

/** Référence lisible communiquée aux deux parties (ex. HT-3F9A2C). */
export function bookingReference(id: string) {
  return `HT-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`
}

export type GuideRates = {
  full_day_rate?: string | number | null
  half_day_rate?: string | number | null
  hourly_rate?: string | number | null
  virtual_rate?: string | number | null
}

/** Tarif indicatif du guide pour un type de mission, ou null s'il n'en a pas publié. */
export function rateForMission(guide: GuideRates, mission: string): number | null {
  const raw =
    mission === 'full_day' ? guide.full_day_rate
      : mission === 'half_day' ? guide.half_day_rate
        : mission === 'hourly' ? guide.hourly_rate
          : mission === 'virtual' ? guide.virtual_rate
            : null
  const value = raw === null || raw === undefined || raw === '' ? NaN : Number(raw)
  return Number.isFinite(value) && value > 0 ? value : null
}

/** Estimation indicative : tarif × durée (horaire) ; le devis du guide fait foi. */
export function estimateBookingAmount(guide: GuideRates, mission: string, durationHours = 1): number | null {
  const rate = rateForMission(guide, mission)
  if (rate === null) return null
  return mission === 'hourly' ? rate * Math.max(1, durationHours) : rate
}

export function formatXof(amount: number | string | null | undefined, locale = 'fr') {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '—'
  return `${value.toLocaleString(locale === 'zh' ? 'zh-CN' : locale)} XOF`
}

/** Date (YYYY-MM-DD) au format local sans décalage de fuseau. */
export function formatBookingDate(value: string | Date, locale = 'fr', options?: Intl.DateTimeFormatOptions) {
  const date = typeof value === 'string' ? new Date(value.length === 10 ? `${value}T00:00:00` : value) : value
  return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale, options ?? { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}

/** Heure stockée en `Time` Postgres (sérialisée en 1970-01-01THH:mm:00Z). */
export function formatBookingTime(value: string | null | undefined) {
  if (!value) return null
  const match = /T(\d{2}):(\d{2})/.exec(value)
  return match ? `${match[1]}:${match[2]}` : null
}
