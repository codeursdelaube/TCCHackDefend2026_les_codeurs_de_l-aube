'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ElementType, useState } from 'react'
import { BookOpenText, Compass, Home, Languages, Map, Moon, ScanLine, Settings, Sun, UtensilsCrossed, X } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from '@/hooks/useTheme'
import { motion } from 'framer-motion'

interface NavLinkItem {
  href: string
  label: string
  icon: ElementType
}

const languages = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'zh', label: 'ZH' },
]

export default function Navbar() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('Navbar')
  const { toggle, isDark, mounted } = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const navLinks: NavLinkItem[] = [
    { href: '/', label: t('accueil'), icon: Home },
    { href: '/lieux', label: t('lieux'), icon: Map },
    { href: '/histoire', label: t('histoire'), icon: BookOpenText },
    { href: '/scan', label: t('scan'), icon: ScanLine },
    { href: '/cuisine', label: t('cuisine'), icon: UtensilsCrossed },
  ]

  const isActive = (path: string): boolean => pathname === path

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/80 bg-base-100/92 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-border bg-base-200 shadow-sm">
              <Image src="/icons/icon-192x192.png" alt="HeriTogo" width={32} height={32} className="h-8 w-8 object-contain" />
            </div>
            <div className="leading-none">
              <span className="block text-lg font-black text-base-content">HeriTogo</span>
              <span className="mt-1 hidden text-[10px] font-bold uppercase tracking-wider text-base-content/50 sm:block">
                {t('tagline')}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/scan"
              className="hidden items-center gap-2 rounded-2xl bg-secondary px-4 py-2 text-xs font-black uppercase tracking-wide text-secondary-content shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95 sm:inline-flex"
              data-onboarding="scan-button"
            >
              <ScanLine className="h-4 w-4" />
              {t('scan_button')}
            </Link>
            <button
              type="button"
              onClick={() => setSettingsOpen((value) => !value)}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all active:scale-95 ${
                settingsOpen
                  ? 'border-secondary bg-secondary text-secondary-content shadow-md'
                  : 'border-border bg-base-200 text-base-content hover:border-primary/40'
              }`}
              aria-label={t('settings')}
              data-onboarding="settings-button"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {settingsOpen && (
          <div className="absolute right-4 top-full mt-3 w-[min(21rem,calc(100vw-2rem))] rounded-[28px] border border-border bg-base-200 p-4 text-base-content shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-secondary" />
                <span className="text-xs font-black uppercase tracking-wider">{t('settings')}</span>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-base-content/60 transition-colors hover:bg-base-300 hover:text-base-content"
                aria-label={t('close_settings')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-base-content/50">
                  <Languages className="h-3.5 w-3.5 text-secondary" />
                  {t('language')}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {languages.map((lang) => (
                    <Link
                      key={lang.code}
                      href={pathname}
                      locale={lang.code}
                      onClick={() => setSettingsOpen(false)}
                      className={`rounded-2xl border px-3 py-3 text-center text-xs font-black transition-all active:scale-95 ${
                        locale === lang.code
                          ? 'border-primary bg-primary text-primary-content dark:border-secondary dark:bg-secondary dark:text-secondary-content'
                          : 'border-border bg-base-100 text-base-content/70 hover:border-secondary/50'
                      }`}
                    >
                      {lang.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[11px] font-black uppercase tracking-wider text-base-content/50">{t('theme')}</div>
                {!mounted ? (
                  <div className="h-12 rounded-2xl bg-base-100" />
                ) : (
                  <button
                    type="button"
                    onClick={toggle}
                    className="flex w-full items-center justify-between rounded-2xl border border-border bg-base-100 p-2 text-sm font-bold transition-all hover:border-secondary/50 active:scale-[0.99]"
                  >
                    <span className="flex items-center gap-2 rounded-xl px-3 py-2 text-base-content/70">
                      <Sun className="h-4 w-4 text-secondary" />
                      {t('light')}
                    </span>
                    <span className={`relative h-6 w-11 rounded-full transition-colors ${isDark ? 'bg-secondary' : 'bg-primary'}`}>
                      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
                    </span>
                    <span className="flex items-center gap-2 rounded-xl px-3 py-2 text-base-content/70">
                      {t('dark')}
                      <Moon className="h-4 w-4 text-base-content/60" />
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-base-100/92 shadow-[0_-10px_30px_rgba(18,18,18,0.08)] backdrop-blur-xl">
        <div className="mx-auto max-w-md px-3 pb-2 pt-2">
          <div className="grid grid-cols-5 gap-1 rounded-[28px] bg-base-200 p-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-[22px] px-1 py-2 text-[9px] sm:text-[10px] font-bold transition-all active:scale-95 ${
                    active ? 'text-primary-content dark:text-secondary-content' : 'text-base-content/55 hover:text-base-content'
                  }`}
                  {...(link.href === '/scan' ? { 'data-onboarding': 'scan-button' } : {})}
                >
                  {active && (
                    <motion.span
                      layoutId="activeBottomNav"
                      className="absolute inset-0 rounded-[22px] bg-primary dark:bg-secondary"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <Icon className="relative h-5 w-5" />
                  <span className="relative max-w-full truncate">{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}

