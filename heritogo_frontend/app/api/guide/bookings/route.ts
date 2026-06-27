import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { BookingStatus } from '@prisma/client'

// GET: Fetch bookings for the logged-in guide
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le GuideProfile
    const guideProfile = await prisma.guideProfile.findUnique({
      where: { user_id: user.id }
    })

    if (!guideProfile) {
      return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 })
    }

    // Récupérer les bookings
    const bookings = await prisma.booking.findMany({
      where: { guide_id: guideProfile.id },
      include: {
        tourist: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
            phone: true,
            preferred_lang: true
          }
        },
        review: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({ success: true, bookings, guideProfile })
  } catch (error: any) {
    console.error('Erreur dans GET /api/guide/bookings:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}

// POST: Actions on bookings (send_quote, start_mission, complete_mission, cancel)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const guideProfile = await prisma.guideProfile.findUnique({
      where: { user_id: user.id }
    })

    if (!guideProfile) {
      return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 })
    }

    const body = await request.json()
    const { bookingId, action, quoteAmount, quoteMessage, cancellationReason } = body

    if (!bookingId || !action) {
      return NextResponse.json({ error: 'bookingId et action sont requis' }, { status: 400 })
    }

    // Récupérer le booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking || booking.guide_id !== guideProfile.id) {
      return NextResponse.json({ error: 'Réservation introuvable ou non autorisée' }, { status: 404 })
    }

    let updatedStatus: BookingStatus = booking.status
    let updateData: any = {}
    let notifTitle = ''
    let notifBody = ''

    if (action === 'send_quote') {
      if (!quoteAmount) {
        return NextResponse.json({ error: 'Le montant du devis est requis' }, { status: 400 })
      }
      updatedStatus = 'quote_sent'
      updateData = {
        status: updatedStatus,
        quote_amount: parseFloat(quoteAmount),
        quote_message: quoteMessage || null,
        quote_sent_at: new Date()
      }
      notifTitle = 'Nouveau devis reçu'
      notifBody = `Le guide ${guideProfile.profile?.full_name || ''} vous a envoyé un devis de ${quoteAmount} XOF.`
    } else if (action === 'start_mission') {
      updatedStatus = 'in_progress'
      updateData = {
        status: updatedStatus,
        started_at: new Date()
      }
      notifTitle = 'Mission commencée'
      notifBody = `Votre visite guidée avec ${guideProfile.profile?.full_name || ''} a commencé.`
    } else if (action === 'complete_mission') {
      updatedStatus = 'completed'
      updateData = {
        status: updatedStatus,
        completed_at: new Date()
      }
      // Incrémenter les missions du guide
      await prisma.guideProfile.update({
        where: { id: guideProfile.id },
        data: { total_missions: { increment: 1 } }
      })
      notifTitle = 'Mission terminée'
      notifBody = `La visite guidée est marquée comme terminée. N'hésitez pas à laisser un avis.`
    } else if (action === 'cancel') {
      updatedStatus = 'cancelled'
      updateData = {
        status: updatedStatus,
        cancelled_at: new Date(),
        cancelled_by: user.id,
        cancellation_reason: cancellationReason || 'Annulé par le guide'
      }
      notifTitle = 'Réservation annulée'
      notifBody = `Le guide a annulé votre demande de réservation : "${cancellationReason || 'Aucun motif fourni'}"`
    } else {
      return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData
    })

    // Créer une notification pour le touriste
    await prisma.notification.create({
      data: {
        user_id: booking.tourist_id,
        type: 'booking',
        title: notifTitle,
        body: notifBody,
        data: {
          booking_id: booking.id
        }
      }
    })

    return NextResponse.json({ success: true, booking: updatedBooking })
  } catch (error: any) {
    console.error('Erreur dans POST /api/guide/bookings:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
