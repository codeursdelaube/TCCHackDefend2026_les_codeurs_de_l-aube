import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/session'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function TouristDashboardLayout({ children, params }: Props) {
  const { locale } = await params
  const auth = await requireUser()
  if ('error' in auth) {
    redirect(`/${locale}/auth/login`)
  }
  return children
}
