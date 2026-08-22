/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'
import { getSafeAuthErrorMessage } from '@/lib/utils/errors'

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const locale = formData.get('locale') as string || 'fr'
    const redirectTo = formData.get('redirect') as string | null

    if (!email || !password) {
      return { error: 'Tous les champs sont requis.' }
    }

    // Rate limiting anti brute-force
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') ||
                headersList.get('x-real-ip') ||
                'unknown'
    const rateLimitKey = `login:${ip}:${email.trim().toLowerCase()}`

    if (!checkRateLimit(rateLimitKey, 5, 60000)) {
      return { error: 'Trop de tentatives. Réessayez dans 1 minute.' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      // Retourner un message sécurisé — jamais le message brut Supabase
      return { error: getSafeAuthErrorMessage(error) }
    }

    if (!data.user) {
      return { error: 'Une erreur inconnue est survenue.' }
    }

    // Connexion réussie — réinitialiser le compteur de tentatives
    resetRateLimit(rateLimitKey)

    // Récupérer le profil pour déterminer le rôle avec fallback sécurisé
    let role = 'tourist'
    try {
      const profile = await prisma.profile.findUnique({
        where: { id: data.user.id },
        select: { role: true, is_active: true }
      })

      if (profile && !profile.is_active) {
        return { error: 'Votre compte a été désactivé. Contactez le support.' }
      }

      if (profile?.role) {
        role = profile.role
      }
    } catch (dbErr) {
      console.warn('[loginAction] DB profile fetch fallback to tourist:', dbErr)
    }

    // Utiliser le paramètre redirect s'il est fourni et valide
    if (redirectTo && redirectTo.startsWith('/')) {
      redirect(redirectTo)
    }

    // Sinon, rediriger vers le dashboard approprié selon le rôle
    const targetDashboard =
      role === 'admin' ? `/${locale}/dashboard/admin` :
      role === 'guide' ? `/${locale}/dashboard/guide` :
      `/${locale}/dashboard/tourist`

    redirect(targetDashboard)
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      'digest' in err &&
      typeof (err as Error & { digest: string }).digest === 'string' &&
      (err as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw err
    }

    const msg = err instanceof Error ? err.message : 'Erreur inattendue'
    console.error('[loginAction]', msg)
    return { error: 'Une erreur est survenue. Réessayez.' }
  }
}
