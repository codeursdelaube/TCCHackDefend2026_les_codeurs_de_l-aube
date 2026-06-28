'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const locale = formData.get('locale') as string || 'fr'

    if (!email || !password) {
      return { error: 'Tous les champs sont requis.' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      return { error: error.message }
    }

    if (!data.user) {
      return { error: 'Une erreur inconnue est survenue.' }
    }

    // Récupérer le profil pour déterminer le rôle
    const profile = await prisma.profile.findUnique({
      where: { id: data.user.id },
      select: { role: true }
    })

    const role = profile?.role || 'tourist'

    // Rediriger vers le dashboard approprié
    const targetDashboard = 
      role === 'admin' ? `/${locale}/dashboard/admin` :
      role === 'guide' ? `/${locale}/dashboard/guide` :
      `/${locale}/dashboard/tourist`

    redirect(targetDashboard)
  } catch (error: any) {
    if (error.digest && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error // Re-jeter la redirection Next.js pour qu'elle fonctionne
    }
    return { error: error.message || 'Erreur serveur.' }
  }
}
