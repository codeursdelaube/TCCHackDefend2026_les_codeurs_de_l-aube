import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { DocumentType } from '@prisma/client'

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
    const {
      bio,
      phone,
      languages,
      coverage_zones,
      specialties,
      experience_years,
      hourly_rate,
      half_day_rate,
      full_day_rate,
      virtual_rate,
      document // Object: { type, file_url, file_name, file_size }
    } = body

    // 1. Mettre à jour la table Profile (bio, phone)
    if (bio !== undefined || phone !== undefined) {
      const profileData: Record<string, unknown> = {}
      if (bio !== undefined) profileData.bio = bio
      if (phone !== undefined) profileData.phone = phone

      await prisma.profile.update({
        where: { id: user.id },
        data: profileData
      })
    }

    // 2. Mettre à jour la table GuideProfile
    const guideData: Record<string, unknown> = {}
    if (languages !== undefined) guideData.languages = languages
    if (coverage_zones !== undefined) guideData.coverage_zones = coverage_zones
    if (specialties !== undefined) guideData.specialties = specialties
    if (experience_years !== undefined) guideData.experience_years = parseInt(experience_years, 10) || 0
    if (hourly_rate !== undefined) guideData.hourly_rate = hourly_rate ? parseFloat(hourly_rate) : null
    if (half_day_rate !== undefined) guideData.half_day_rate = half_day_rate ? parseFloat(half_day_rate) : null
    if (full_day_rate !== undefined) guideData.full_day_rate = full_day_rate ? parseFloat(full_day_rate) : null
    if (virtual_rate !== undefined) guideData.virtual_rate = virtual_rate ? parseFloat(virtual_rate) : null

    // 3. Ajouter un document de vérification
    let shouldSendDocEmail = false
    if (document && document.file_url && document.type) {
      await prisma.guideDocument.create({
        data: {
          guide_id: guideProfile.id,
          type: document.type as DocumentType,
          label: document.label || null,
          file_url: document.file_url,
          file_name: document.file_name || 'document',
          file_size: document.file_size ? parseInt(document.file_size, 10) : null
        }
      })

      // Passer le statut du guide à "under_review" s'il était pending
      if (guideProfile.status === 'pending' || guideProfile.status === 'rejected') {
        guideData.status = 'under_review'
        guideData.submitted_at = new Date()
        shouldSendDocEmail = true
      }
    }

    const updatedGuide = await prisma.guideProfile.update({
      where: { id: guideProfile.id },
      data: guideData,
      include: {
        profile: true,
        documents: true
      }
    })

    // Envoi de l'email si le statut passe en examen/traitement
    if (shouldSendDocEmail && user.email) {
      const { sendEmail } = await import('@/lib/utils/email')
      await sendEmail({
        to: user.email,
        subject: 'HériTogo — Documents de vérification bien reçus',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
            <h2 style="color: #D9A441; font-family: serif;">Bonjour ${updatedGuide.profile.full_name},</h2>
            <p>Nous vous informons que vos documents justificatifs ont bien été soumis sur votre espace Guide HériTogo.</p>
            <p><strong>Statut actuel :</strong> En cours de traitement par notre équipe de modération.</p>
            <p>Nous vérifions vos pièces d'identité et accréditations professionnelles afin de garantir la sécurité de notre communauté. Cette validation prend généralement moins de 48 heures.</p>
            <p>Dès approbation, vous recevrez un email de confirmation et votre profil deviendra visible publiquement dans notre annuaire.</p>
            <br />
            <p style="font-size: 12px; color: #6b7280;">L'équipe HériTogo.</p>
          </div>
        `
      })
    }

    return NextResponse.json({ success: true, guide: updatedGuide })
  } catch (error: unknown) {
    console.error('[POST /api/guide/profile]', error)
    const message = error instanceof Error && error.message.includes('P1001')
      ? 'Erreur de chargement. Vérifiez votre connexion.'
      : 'Une erreur est survenue. Veuillez réessayer.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
