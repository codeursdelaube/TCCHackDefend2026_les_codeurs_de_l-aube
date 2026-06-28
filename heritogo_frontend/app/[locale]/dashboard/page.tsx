import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect(`/${locale}/auth/login`)
  }

  // user est garanti non-null ici
  const profile = await prisma.profile.findUnique({
    where: { id: user!.id },
    select: { role: true },
  })

  const role = profile?.role ?? 'tourist'

  if (role === 'admin') redirect(`/${locale}/dashboard/admin`)
  if (role === 'guide') redirect(`/${locale}/dashboard/guide`)
  redirect(`/${locale}/dashboard/tourist`)
}