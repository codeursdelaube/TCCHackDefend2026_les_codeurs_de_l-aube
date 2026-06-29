import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { MissionType } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le profil du touriste
    const touristProfile = await prisma.profile.findUnique({
      where: { id: user.id }
    })

    if (!touristProfile) {
      return NextResponse.json({ error: 'Profil touriste introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const {
      guide_id,
      mission_type,
      start_date,
      start_time,
      meeting_point,
      tourist_message,
      group_size,
      special_needs
    } = body

    if (!guide_id || !mission_type || !start_date) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    // Vérifier que le guide existe
    const guideProfile = await prisma.guideProfile.findUnique({
      where: { id: guide_id },
      include: { profile: true }
    })

    if (!guideProfile) {
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })
    }

    // Convertir start_date en objet Date
    const parsedStartDate = new Date(start_date)
    
    // Si start_time est fourni, on le parse ou on le gère comme une date/heure
    let parsedStartTime: Date | null = null
    if (start_time) {
      // Ex: start_time = "14:30"
      const [hours, minutes] = start_time.split(':')
      parsedStartTime = new Date()
      parsedStartTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
    }

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        tourist_id: user.id,
        guide_id: guide_id,
        status: 'quote_requested',
        mission_type: mission_type as MissionType,
        start_date: parsedStartDate,
        start_time: parsedStartTime,
        meeting_point: meeting_point || null,
        tourist_message: tourist_message || null,
        group_size: parseInt(group_size, 10) || 1,
        special_needs: special_needs || null,
        payment_status: 'pending'
      }
    })

    // Créer une notification pour le guide
    await prisma.notification.create({
      data: {
        user_id: guideProfile.user_id, // L'ID utilisateur du guide
        type: 'booking',
        title: 'Nouvelle demande de réservation',
        body: `Vous avez reçu une demande de réservation de la part de ${touristProfile.full_name || 'un touriste'}.`,
        data: {
          booking_id: booking.id
        }
      }
    })

    return NextResponse.json({ success: true, booking })
  } catch (error: unknown) {
    console.error('Erreur dans POST /api/bookings:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
