'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function registerAction(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient()

    const fullName = formData.get('full_name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string
    const locale = formData.get('locale') as string || 'fr'

    if (!fullName || !email || !password) {
      return { error: 'Tous les champs sont requis.' }
    }

    if (password.length < 6) {
      return { error: 'Le mot de passe doit contenir au moins 6 caractères.' }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/confirm`,
        data: {
          full_name: fullName.trim(),
          role: role || 'tourist',
          preferred_lang: locale
        },
      },
    })

    if (error) {
      console.error('[registerAction] Supabase auth error full object:', JSON.stringify(error, null, 2))
      console.error('[registerAction] error.message:', error.message)
      console.error('[registerAction] error.cause:', (error as any).cause)
      console.error('[registerAction] error.name:', error.name)
      console.error('[registerAction] error.status:', (error as any).status)

      // Extraire un message lisible même pour AuthRetryableFetchError
      const errMsg =
        error.message && error.message !== '{}' && error.message !== '{}'
          ? error.message
          : (error as any).cause?.message
            ? `Erreur réseau : ${(error as any).cause.message}`
            : error.name === 'AuthRetryableFetchError'
              ? 'Impossible de contacter le serveur Supabase. Le projet est peut-être en pause. Allez sur supabase.com pour le réactiver.'
              : `Erreur Supabase (${error.name}) : ${JSON.stringify(error)}`

      return { error: errMsg }
    }

    if (!data.user) {
      return { error: 'Inscription impossible. Vérifiez vos informations.' }
    }

    console.log('[registerAction] User created:', data.user.id, '| Session:', !!data.session)

    // Créer le Profile en base si pas encore créé par trigger Supabase
    try {
      const existingProfile = await prisma.profile.findUnique({
        where: { id: data.user.id }
      })

      if (!existingProfile) {
        await prisma.profile.create({
          data: {
            id: data.user.id,
            full_name: fullName.trim(),
            role: (role as 'tourist' | 'guide' | 'admin') || 'tourist',
            preferred_lang: locale,
            is_active: true,
          }
        })
        console.log('[registerAction] Profile created in DB for user:', data.user.id)
      }
    } catch (dbError: any) {
      console.error('[registerAction] Failed to create profile:', dbError.message)
      // Ne pas bloquer l'inscription si la DB échoue
    }

    // Si le rôle est "guide", créer le GuideProfile
    if (role === 'guide') {
      try {
        const existingGuide = await prisma.guideProfile.findUnique({
          where: { user_id: data.user.id }
        })
        if (!existingGuide) {
          await prisma.guideProfile.create({
            data: {
              user_id: data.user.id,
              status: 'pending',
              experience_years: 0,
              specialties: [],
              languages: [],
              coverage_zones: []
            }
          })
          console.log('[registerAction] GuideProfile created for user:', data.user.id)
        }
      } catch (dbError: any) {
        console.error('[registerAction] Failed to create guide profile:', dbError.message)
      }
    }

    // Pas de session = confirmation email requise
    if (!data.session) {
      return { 
        success: `Compte créé ! Un email de confirmation a été envoyé à ${email}. Vérifiez votre boîte de réception puis connectez-vous.` 
      }
    }

    // Session active = rediriger vers l'accueil
    redirect(`/${locale}`)

  } catch (err: any) {
    // Laisser Next.js gérer ses propres redirections
    if (err.digest?.startsWith('NEXT_REDIRECT')) throw err
    console.error('[registerAction] Unexpected error:', err)
    return { error: err.message || 'Erreur serveur inattendue.' }
  }
}
