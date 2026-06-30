import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { booking_id, rating_overall, comment } = await request.json()

    if (!booking_id || !rating_overall) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Trouver le booking et vérifier son statut
    const booking = await prisma.booking.findUnique({
      where: { id: booking_id }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    if (booking.tourist_id !== user.id) {
      return NextResponse.json({ error: 'Action non autorisée' }, { status: 403 })
    }

    if (booking.status !== 'completed') {
      return NextResponse.json({ error: 'La réservation doit être terminée pour laisser un avis' }, { status: 400 })
    }

    // Créer la review
    const review = await prisma.review.create({
      data: {
        booking_id,
        reviewer_id: user.id,
        guide_id: booking.guide_id,
        rating_overall: Number(rating_overall),
        comment: comment || '',
        is_visible_public: false // Caché au public par défaut
      }
    })

    // Recalculer l'avg_rating et total_reviews du guide
    const allReviews = await prisma.review.findMany({
      where: { guide_id: booking.guide_id }
    })

    const total = allReviews.length
    const sum = allReviews.reduce((acc, r) => acc + r.rating_overall, 0)
    const avg = total > 0 ? sum / total : 0

    await prisma.guideProfile.update({
      where: { id: booking.guide_id },
      data: {
        avg_rating: avg,
        total_reviews: total
      }
    })

    return NextResponse.json({ success: true, review })
  } catch (error: unknown) {
    console.error('[POST /api/reviews]', error)
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'P2002') {
      return NextResponse.json({ error: 'Vous avez déjà laissé un avis pour cette réservation' }, { status: 400 })
    }
    const message = error instanceof Error && error.message.includes('P1001')
      ? 'Erreur de chargement. Vérifiez votre connexion.'
      : 'Une erreur est survenue. Veuillez réessayer.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
