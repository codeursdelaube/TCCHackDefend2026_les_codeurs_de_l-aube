import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params

  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      redirect(`/${locale}/auth/login`)
    }

    try {
      const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { role: true },
      })

      const role = profile?.role ?? 'tourist'

      if (role === 'admin') redirect(`/${locale}/dashboard/admin`)
      if (role === 'guide') redirect(`/${locale}/dashboard/guide`)
      redirect(`/${locale}/dashboard/tourist`)
    } catch (dbError: unknown) {
      if (
        dbError instanceof Error &&
        'digest' in dbError &&
        typeof (dbError as Error & { digest: string }).digest === 'string' &&
        (dbError as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT')
      ) {
        throw dbError
      }

      console.error('[dashboard] DB error:', dbError)
      redirect(`/${locale}/dashboard/tourist`)
    }
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      'digest' in err &&
      typeof (err as Error & { digest: string }).digest === 'string' &&
      (err as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw err
    }

    console.error('[dashboard] Unexpected error:', err)
    redirect(`/${locale}/auth/login`)
  }
}