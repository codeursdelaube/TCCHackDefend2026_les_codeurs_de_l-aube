import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { DocumentType } from '@prisma/client'
import { asStringArray, clipString } from '@/lib/security/input'

const MAX_RATE = 10_000_000

/** Tarif optionnel : '' ou null → null, nombre positif borné sinon ; false si invalide. */
function parseRate(value: unknown): number | null | false {
  if (value === undefined) return false
  if (value === null || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) && n >= 0 && n <= MAX_RATE ? Math.round(n) : false
}

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

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
    }
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
      if (bio !== undefined) profileData.bio = clipString(bio, 2000)
      if (phone !== undefined) profileData.phone = clipString(phone, 30)

      await prisma.profile.update({
        where: { id: user.id },
        data: profileData
      })
    }

    // 2. Mettre à jour la table GuideProfile
    const guideData: Record<string, unknown> = {}
    if (languages !== undefined) guideData.languages = asStringArray(languages, 15, 40) ?? []
    if (coverage_zones !== undefined) guideData.coverage_zones = asStringArray(coverage_zones, 20, 60) ?? []
    if (specialties !== undefined) guideData.specialties = asStringArray(specialties, 15, 60) ?? []
    if (experience_years !== undefined) {
      const years = parseInt(String(experience_years), 10)
      guideData.experience_years = Number.isFinite(years) ? Math.min(Math.max(years, 0), 60) : 0
    }
    const rates = { hourly_rate, half_day_rate, full_day_rate, virtual_rate }
    for (const [key, value] of Object.entries(rates)) {
      if (value === undefined) continue
      const parsed = parseRate(value)
      if (parsed === false) {
        return NextResponse.json({ error: 'Un des tarifs est invalide (nombre positif en XOF).' }, { status: 400 })
      }
      guideData[key] = parsed
    }

    // 3. Ajouter un document de vérification — jamais de pièce d'identité en clair chez nous
    if (document !== undefined && (typeof document !== 'object' || document === null)) {
      return NextResponse.json({ error: 'Vérification KYC invalide.' }, { status: 400 })
    }
    if (document !== undefined) {
      const validTypes = Object.values(DocumentType)
      const kycRef = typeof document.kyc_session_id === 'string' ? document.kyc_session_id.trim() : ''
      const fileUrl = typeof document.file_url === 'string' ? document.file_url : ''
      if (fileUrl.startsWith('data:') || fileUrl.includes('base64,')) {
        return NextResponse.json(
          { error: 'Les pièces d’identité ne sont pas stockées par HeriTogo. Utilisez la vérification KYC.' },
          { status: 400 }
        )
      }
      const isValidDocument = document && validTypes.includes(document.type as DocumentType) &&
        kycRef.length > 8 && kycRef.length <= 180 &&
        typeof document.file_name === 'string' && document.file_name.length <= 160 &&
        typeof document.label === 'string' && document.label.trim().length > 0 && document.label.length <= 120
      if (!isValidDocument) return NextResponse.json({ error: 'Vérification KYC invalide.' }, { status: 400 })
    }
    let shouldSendDocEmail = false
    if (document && document.kyc_session_id && document.type) {
      await prisma.guideDocument.create({
        data: {
          guide_id: guideProfile.id,
          type: document.type as DocumentType,
          label: document.label || null,
          file_url: `kyc:${document.kyc_session_id}`,
          file_name: document.file_name || 'kyc-session',
          file_size: null
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
        documents: {
          select: {
            id: true,
            type: true,
            label: true,
            file_name: true,
            is_verified: true,
            created_at: true,
          },
        },
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
