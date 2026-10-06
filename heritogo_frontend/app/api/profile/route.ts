import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth/session'
import { checkRateLimit } from '@/lib/rate-limit'
import { clipString, parseLocale } from '@/lib/security/input'
import { sanitizePhoneInput, validatePhone } from '@/lib/utils/validation'

export async function GET() {
  try {
    const auth = await requireUser()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const profile = await prisma.profile.findUnique({
      where: { id: auth.user.id },
      include: { guide_profile: true },
    })

    return NextResponse.json({ profile })
  } catch (error: unknown) {
    console.error('[GET /api/profile]', error)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireUser()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    if (!checkRateLimit(`profile:${auth.user.id}`, 20, 60000)) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 })
    }

    const body = await request.json()
    const full_name = clipString(body.full_name, 80)
    const bio = typeof body.bio === 'string' ? body.bio.trim().slice(0, 500) : undefined
    const preferred_lang = body.preferred_lang !== undefined ? parseLocale(body.preferred_lang, auth.profile.preferred_lang || 'fr') : undefined

    let phone: string | number | null | undefined = undefined
    if (body.phone !== undefined && body.phone !== null && body.phone !== '') {
      const phoneRaw = sanitizePhoneInput(String(body.phone))
      const phoneError = validatePhone(phoneRaw)
      if (phoneError) {
        return NextResponse.json({ error: phoneError }, { status: 400 })
      }
      phone = phoneRaw
    } else if (body.phone === null || body.phone === '') {
      phone = null
    }

    if (body.full_name !== undefined && !full_name) {
      return NextResponse.json({ error: 'Nom invalide' }, { status: 400 })
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: auth.user.id },
      data: {
        ...(full_name ? { full_name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(preferred_lang ? { preferred_lang } : {}),
        ...(bio !== undefined ? { bio } : {}),
      },
    })

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (error: unknown) {
    console.error('[POST /api/profile]', error)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}
