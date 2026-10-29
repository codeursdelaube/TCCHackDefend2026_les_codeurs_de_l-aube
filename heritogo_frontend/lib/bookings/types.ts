import type { BookingStatusValue, MissionTypeValue } from './status'

/** Champs communs renvoyés par /api/tourist/bookings et /api/guide/bookings. */
export interface BookingBase {
  id: string
  reference: string
  status: BookingStatusValue
  mission_type: MissionTypeValue
  start_date: string
  start_time?: string | null
  duration_hours?: string | null
  meeting_point?: string | null
  destination?: string | null
  tourist_message?: string | null
  group_size: number
  special_needs?: string | null
  quote_amount?: string | null
  quote_message?: string | null
  quote_sent_at?: string | null
  confirmed_at?: string | null
  started_at?: string | null
  completed_at?: string | null
  cancelled_at?: string | null
  cancellation_reason?: string | null
  cancelled_by_me?: boolean
  created_at: string
  review?: { id: string; rating_overall: number } | null
}

export interface TouristBooking extends BookingBase {
  guide: {
    id: string
    avg_rating: string
    total_reviews: number
    languages: string[]
    profile: { full_name: string; avatar_url?: string | null; phone?: string | null }
  }
}

export interface GuideBooking extends BookingBase {
  tourist: {
    id: string
    full_name: string
    avatar_url?: string | null
    phone?: string | null
    preferred_lang?: string | null
    nationality?: string | null
  }
}
