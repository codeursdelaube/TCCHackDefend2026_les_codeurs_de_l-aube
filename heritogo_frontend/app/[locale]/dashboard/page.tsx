'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { dashboardPath, type UserRole } from '@/lib/auth/redirect'
import { Loader2 } from 'lucide-react'

export default function DashboardRedirectPage() {
  const params = useParams<{ locale: string }>()
  const locale = params.locale
  const t = useTranslations('Auth')

  useEffect(() => {
    const redirect = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          window.location.href = `/${locale}/auth/login`
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = (profile?.role ?? 'tourist') as UserRole
        window.location.href = dashboardPath(locale, role)
      } catch {
        window.location.href = `/${locale}/auth/login`
      }
    }

    redirect()
  }, [locale])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 pt-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-base-content/60">{t('loading')}</p>
    </div>
  )
}
