import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/session'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function AdminDashboardLayout({ children, params }: Props) {
  const { locale } = await params

  try {
    const auth = await requireRole(['admin'])
    if ('error' in auth) {
      if (auth.status === 401) redirect(`/${locale}/auth/login`)
      redirect(`/${locale}/dashboard`)
    }
  } catch (err: unknown) {
    // Laisse passer les redirections Next.js (NEXT_REDIRECT)
    if (
      err instanceof Error &&
      'digest' in err &&
      typeof (err as Error & { digest: string }).digest === 'string' &&
      (err as Error & { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw err
    }
    // Erreur Prisma / Supabase / réseau → rediriger vers login plutôt qu'afficher l'error boundary
    console.error('[AdminLayout] Auth error:', err)
    redirect(`/${locale}/auth/login`)
  }

  return children
}
