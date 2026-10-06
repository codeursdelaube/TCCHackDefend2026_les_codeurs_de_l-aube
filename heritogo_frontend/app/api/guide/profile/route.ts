import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DocumentType } from '@prisma/client'
import { requireRole } from '@/lib/auth/session'
import { checkRateLimit } from '@/lib/rate-limit'
import { asStringArray, clipString, isSafeHttpsUrl, parseBoundedNumber } from '@/lib/security/input'
import { sanitizePhoneInput, validatePhone } from '@/lib/utils/validation'

export async function POST(request: Request) {
  try {
    const auth = await requireRole(['guide'])
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    if (!checkRateLimit(`guide-profile:${auth.user.id}`, 20, 60000)) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 })
    }

    const guideProfile = await prisma.guideProfile.findUnique({
      where: { user_id: auth.user.id }
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
      document
    } = body

    if (bio !== undefined || phone !== undefined) {
      const profileData: Record<string, unknown> = {}
      if (bio !== undefined) profileData.bio = typeof bio === 'string' ? bio.trim().slice(0, 500) : null
      if (phone !== undefined && phone !== null && phone !== '') {
        const phoneRaw = sanitizePhoneInput(String(phone))
        const phoneError = validatePhone(phoneRaw)
        if (phoneError) {
          return NextResponse.json({ error: phoneError }, { status: 400 })
        }
        profileData.phone = phoneRaw
      }

      await prisma.profile.update({
        where: { id: auth.user.id },
        data: profileData
      })
    }

    const guideData: Record<string, unknown> = {}
    if (languages !== undefined) guideData.languages = asStringArray(languages) ?? []
    if (coverage_zones !== undefined) guideData.coverage_zones = asStringArray(coverage_zones) ?? []
    if (specialties !== undefined) guideData.specialties = asStringArray(specialties) ?? []
    if (experience_years !== undefined) {
      guideData.experience_years = parseBoundedNumber(experience_years, 0, 50) ?? 0
    }
    if (hourly_rate !== undefined) guideData.hourly_rate = parseBoundedNumber(hourly_rate, 0, 10_000_000)
    if (half_day_rate !== undefined) guideData.half_day_rate = parseBoundedNumber(half_day_rate, 0, 10_000_000)
    if (full_day_rate !== undefined) guideData.full_day_rate = parseBoundedNumber(full_day_rate, 0, 10_000_000)
    if (virtual_rate !== undefined) guideData.virtual_rate = parseBoundedNumber(virtual_rate, 0, 10_000_000)

    let shouldSendDocEmail = false
    if (document && document.file_url && document.type) {
      if (!isSafeHttpsUrl(document.file_url) || !Object.values(DocumentType).includes(document.type)) {
        return NextResponse.json({ error: 'Document invalide' }, { status: 400 })
      }
      const fileName = clipString(document.file_name, 120) || 'document'
      const fileSize = parseBoundedNumber(document.file_size, 1, 15 * 1024 * 1024)

      await prisma.guideDocument.create({
        data: {
          guide_id: guideProfile.id,
          type: document.type as DocumentType,
          label: clipString(document.label, 80),
          file_url: document.file_url,
          file_name: fileName,
          file_size: fileSize
        }
      })

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
    if (shouldSendDocEmail && auth.user.email) {
      const { sendEmail } = await import('@/lib/utils/email')
      const safeName = updatedGuide.profile.full_name.replace(/[<>]/g, '')
      await sendEmail({
        to: auth.user.email,
        subject: 'HériTogo — Documents de vérification bien reçus',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
            <h2 style="color: #004D40; font-family: serif;">Bonjour ${safeName},</h2>
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
