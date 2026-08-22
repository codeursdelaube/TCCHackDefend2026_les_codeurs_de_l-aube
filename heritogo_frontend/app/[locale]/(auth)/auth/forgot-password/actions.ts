'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rate-limit'
import { getSafeAuthErrorMessage } from '@/lib/utils/errors'

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const locale = (formData.get('locale') as string) || 'fr'

    if (!email || !email.trim()) {
      return { error: 'Veuillez saisir votre adresse email.' }
    }

    // Rate limit anti-abus
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const rateLimitKey = `forgot:${ip}:${email.trim().toLowerCase()}`

    if (!checkRateLimit(rateLimitKey, 3, 60000)) {
      return { error: 'Trop de tentatives. Veuillez patienter 1 minute.' }
    }

    const supabase = await createClient()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = headersList.get('x-forwarded-proto') || 'http'
    const origin = `${protocol}://${host}`
    const redirectTo = `${origin}/api/auth/callback?next=/${locale}/auth/login`

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    })

    if (error) {
      const msg = error.message.toLowerCase()
      console.warn('[forgotPasswordAction] Supabase notice:', error.message)

      if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('over_email_send_rate_limit') || msg.includes('60 seconds')) {
        return { error: 'Trop d\'emails demandés récemment. Veuillez patienter 1 minute avant de réessayer.' }
      }
      
      // En sécurité OWASP, on ne révèle pas si l'email existe ou non
      return {
        success: 'Si un compte est associé à cet email, un lien de réinitialisation vous a été envoyé.',
      }
    }

    return {
      success: 'Si un compte est associé à cet email, un lien de réinitialisation vous a été envoyé.',
    }
  } catch (err: unknown) {
    console.error('[forgotPasswordAction] Unexpected error:', err)
    return {
      success: 'Si un compte est associé à cet email, un lien de réinitialisation vous a été envoyé.',
    }
  }
}
