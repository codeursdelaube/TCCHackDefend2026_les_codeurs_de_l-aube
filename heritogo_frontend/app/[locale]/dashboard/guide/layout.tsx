import { guardDashboard } from '@/lib/auth/dashboardGuard'

export const dynamic = 'force-dynamic'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function GuideDashboardLayout({ children, params }: Props) {
  const { locale } = await params
  await guardDashboard(locale, ['guide'])
  return children
}
