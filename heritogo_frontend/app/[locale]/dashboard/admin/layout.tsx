import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/session'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function AdminDashboardLayout({ children, params }: Props) {
  const { locale } = await params
  const auth = await requireRole(['admin'])
  if ('error' in auth) {
    if (auth.status === 401) redirect(`/${locale}/auth/login`)
    redirect(`/${locale}/dashboard`)
  }
  return children
}
