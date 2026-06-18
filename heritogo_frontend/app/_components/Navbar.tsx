'use client'

/**
 * Navbar Component
 * Barre de navigation principale avec :
 * - Logo de l'application
 * - Sélecteur de langue
 * - Toggle thème (light/night)
 * - Navigation inférieure
 */
import { Link, usePathname } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { ScanLine, Map, UtensilsCrossed, Home, Moon, Sun, Globe, ChevronDown, X, Settings } from 'lucide-react'
import Image from 'next/image'

interface NavLinkItem {
  href: string;
  label: string;
  icon: any;
}

export default function Navbar() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('Navbar')
  const [theme, setTheme] = useState<string>('light')
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Initialiser le thème depuis le DOM
  useEffect(() => {
    const activeTheme = document.documentElement.getAttribute('data-theme') || 'light'
    setTheme(activeTheme)
  }, [])

  // Gérer le changement de thème (light/night)
  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTheme = e.target.checked ? 'night' : 'light'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    document.cookie = `theme=${nextTheme}; path=/; max-age=31536000; SameSite=Lax`
    localStorage.setItem('theme', nextTheme)
  }

  // Liens de navigation
  const navLinks: NavLinkItem[] = [
    { href: '/', label: t('accueil'), icon: Home },
    { href: '/lieux', label: 'Carte', icon: Map },
    { href: '/scan', label: t('scan'), icon: ScanLine },
    { href: '/cuisine', label: t('cuisine'), icon: UtensilsCrossed },
  ]

  // Vérifier si le lien est actif
  const isActive = (path: string): boolean => pathname === path

  return (
    <>
      {/* Top bar with logo and settings */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur-sm border-b border-base-content/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image src="/icons/icon-192x192.png" alt="HeriTogo" width={32} height={32} className="w-8 h-8" />
            <span className="font-black text-xl tracking-wider">
              <span className="text-green-600">Heri</span>
              <span className="text-orange-500">togo</span>
            </span>
          </Link>

          {/* Settings button */}
          <button 
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-2 rounded-full hover:bg-base-content/5 transition-colors"
            aria-label="Settings"
            data-onboarding="settings-button"
          >
            <Settings className="h-5 w-5 text-base-content/70" />
          </button>
        </div>

        {/* Settings panel */}
        {settingsOpen && (
          <div className="absolute top-full right-4 mt-2 bg-base-100 border border-base-content/10 rounded-2xl shadow-xl p-4 z-50 w-64">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-base-content">{t('settings')}</span>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="p-1 hover:bg-base-content/5 rounded-full"
              >
                <X className="h-4 w-4 text-base-content/50" />
              </button>
            </div>

            {/* Language Dropdown */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-base-content/60 mb-2 block">{t('language')}</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { code: 'fr', label: 'Français' },
                  { code: 'en', label: 'English' },
                  { code: 'es', label: 'Español' },
                  { code: 'zh', label: '中文' }
                ].map((lang) => (
                  <Link
                    key={lang.code}
                    href={pathname}
                    locale={lang.code}
                    onClick={() => setSettingsOpen(false)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-colors ${
                      locale === lang.code
                        ? 'bg-orange-500 text-white'
                        : 'bg-base-200 text-base-content/70 hover:bg-base-content/10'
                    }`}
                  >
                    <span>{lang.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <div>
              <label className="text-xs font-semibold text-base-content/60 mb-2 block">{t('theme')}</label>
              <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-base-200 hover:bg-base-content/5 transition-colors">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-medium text-base-content/70">{t('light')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={theme === 'night'}
                  onChange={handleThemeChange}
                  className="toggle toggle-sm toggle-orange"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-base-content/70">{t('dark')}</span>
                  <Moon className="h-4 w-4 text-slate-400" />
                </div>
              </label>
            </div>
          </div>
        )}
      </header>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-content/10 rounded-t-3xl shadow-lg">
        <div className="max-w-7xl mx-auto px-2 py-2">
          <div className="flex items-center justify-around">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 active:scale-95 ${
                    active
                      ? 'bg-orange-500 text-white'
                      : 'text-base-content/50 hover:text-base-content/70 hover:bg-base-content/5'
                  }`}
                  {...(link.href === '/scan' ? { 'data-onboarding': 'scan-button' } : {})}
                >
                  <Icon className={`h-6 w-6 ${active ? 'text-white' : ''}`} />
                  <span className="text-[10px] font-medium">{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}