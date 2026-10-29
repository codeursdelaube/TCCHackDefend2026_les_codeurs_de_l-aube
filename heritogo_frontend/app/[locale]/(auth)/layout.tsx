import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { ShieldCheck, ScanLine, Landmark } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('AuthLayout')

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="relative isolate hidden overflow-hidden bg-[#171009] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Image src="/Sites/koutamakou.jpg" alt="" fill priority sizes="50vw" className="-z-10 object-cover opacity-55" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-[#171009] via-[#171009]/50 to-[#171009]/30" />

        <Link href="/" className="flex items-center gap-2.5 text-[#FBF6EF]">
          <Image src="/icons/icon-192x192.png" alt="" width={36} height={36} className="h-9 w-9 rounded-lg" />
          <span className="font-serif text-xl font-bold">HeriTogo</span>
        </Link>

        <div className="max-w-md text-[#FBF6EF]">
          <h2 className="font-serif text-3xl font-bold leading-tight text-[#FBF6EF]">{t('title')}</h2>
          <ul className="mt-6 space-y-3 text-sm text-[#FBF6EF]/85">
            <li className="flex items-center gap-3"><Landmark className="h-4 w-4 text-accent" />{t('point_1')}</li>
            <li className="flex items-center gap-3"><ScanLine className="h-4 w-4 text-accent" />{t('point_2')}</li>
            <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-accent" />{t('point_3')}</li>
          </ul>
          <p className="mt-10 text-xs text-[#FBF6EF]/60">{t('caption')}</p>
        </div>
      </aside>

      <main className="flex flex-col items-center justify-start px-4 py-10 sm:justify-center sm:py-12">
        <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
          <Image src="/icons/icon-192x192.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg" />
          <span className="font-serif text-lg font-bold text-foreground">HeriTogo</span>
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
