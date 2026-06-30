'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getSafeAuthErrorMessage } from '@/lib/utils/errors'



export async function registerAction(
  prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  try {
    const supabase = await createClient()

    const fullName = formData.get('full_name') as string
    const email    = formData.get('email') as string
    const password = formData.get('password') as string
    const role     = (formData.get('role') as string) || 'tourist'
    const locale   = (formData.get('locale') as string) || 'fr'

    if (!fullName || !email || !password) {
      return { error: 'Tous les champs sont requis.' }
    }

    if (password.length < 8) {
      return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${siteUrl}/fr/auth/confirm`,
        data: {
          full_name:      fullName.trim(),
          role,
          preferred_lang: locale,
        },
      },
    })

    if (error) {
      console.error('[registerAction] Supabase error:', JSON.stringify(error, null, 2))
      // Message sécurisé — jamais le message brut Supabase
      return { error: getSafeAuthErrorMessage(error) }
    }

    if (!data.user) {
      return { error: 'Inscription impossible. Vérifiez vos informations.' }
    }

    console.log('[registerAction] User created:', data.user.id, '| Session:', !!data.session)

    // Créer le profil si le trigger Supabase ne l'a pas encore fait
    try {
      const existing = await prisma.profile.findUnique({
        where: { id: data.user.id },
        select: { id: true },
      })

      if (!existing) {
        await prisma.profile.create({
          data: {
            id:             data.user.id,
            full_name:      fullName.trim(),
            role:           role as 'tourist' | 'guide' | 'admin',
            preferred_lang: locale,
            is_active:      true,
          },
        })
        console.log('[registerAction] Profile created for:', data.user.id)
      }
    } catch (dbError: unknown) {
      const msg = dbError instanceof Error ? dbError.message : String(dbError)
      console.error('[registerAction] Failed to create profile:', msg)
      // Ne bloque pas l'inscription
    }

    // Créer le GuideProfile si rôle = guide
    if (role === 'guide') {
      try {
        const existingGuide = await prisma.guideProfile.findUnique({
          where: { user_id: data.user.id },
          select: { id: true },
        })

        if (!existingGuide) {
          await prisma.guideProfile.create({
            data: {
              user_id:         data.user.id,
              status:          'pending',
              experience_years: 0,
              specialties:     [],
              languages:       [],
              coverage_zones:  [],
            },
          })
          console.log('[registerAction] GuideProfile created for:', data.user.id)
        }
      } catch (dbError: unknown) {
        const msg = dbError instanceof Error ? dbError.message : String(dbError)
        console.error('[registerAction] Failed to create guide profile:', msg)
      }
    }

    // Pas de session = email de confirmation requis
    if (!data.session) {
      return {
        success: `Compte créé ! Un email de confirmation a été envoyé à ${email}. Vérifiez votre boîte de réception puis connectez-vous.`,
      }
    }

    // Session active → redirection
    redirect(`/${locale}/dashboard`)

  } catch (err: unknown) {
    // Laisser Next.js gérer ses propres redirections
    if (
      err instanceof Error &&
      'digest' in err &&
      typeof (err as Error & { digest: string }).digest === 'string' &&
      (err as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw err
    }

    const msg = err instanceof Error ? err.message : 'Erreur serveur inattendue.'
    console.error('[registerAction] Unexpected error:', err)
    return { error: msg }
  }
}