'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import {
  ElementType, useEffect, useState,
} from 'react'
import {
  BookOpenText, Calendar, Compass, Heart, History, Home,
  LogOut, Map, Menu, Moon, ScanLine, Settings, Sun, User, UtensilsCrossed, X,
} from 'lucide-react'
import Image from 'next/image'
import { useTheme } from '@/hooks/useTheme'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { getInitials } from '@/lib/auth/redirect'
import { COLORS } from '@/lib/constants/colors'

interface NavLinkItem {
  href: string
  label: string
  icon: ElementType
}

interface ProfileRow {
  full_name: string
  role: 'tourist' | 'guide' | 'admin'
}

const languages = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'zh', label: 'ZH' },
]

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password']

function profileFromUser(user: SupabaseUser): ProfileRow {
  const metadata = user.user_metadata as { full_name?: string; role?: string }
  const role = metadata.role === 'admin' || metadata.role === 'guide' || metadata.role === 'tourist'
    ? metadata.role
    : 'tourist'

  return {
    full_name: metadata.full_name || user.email?.split('@')[0] || 'Compte Heritogo',
    role,
  }
}

export default function Navbar() {
  const pathname = usePathname()
  const locale = useLocale()
  const params = useParams<{ locale: string }>()
  const router = useRouter()
  const t = useTranslations('Navbar')
  const { setTheme, isDark, mounted } = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bottomNavOpen, setBottomNavOpen] = useState(false)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p))

  useEffect(() => {
    const supabase = createClient()

    const loadProfile = async () => {
      let authUser: SupabaseUser | null = null

      try {
        const { data: { user } } = await supabase.auth.getUser()
        authUser = user
        if (!user) {
          setIsAuthenticated(false)
          setProfile(null)
          setAuthLoading(false)
          return
        }

        setIsAuthenticated(true)
        const { data } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .maybeSingle()
        setProfile(data ? data as ProfileRow : profileFromUser(user))
      } catch {
        if (authUser) {
          setIsAuthenticated(true)
          setProfile(profileFromUser(authUser))
        } else {
          setIsAuthenticated(false)
          setProfile(null)
        }
      } finally {
        setAuthLoading(false)
      }
    }

    loadProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false)
          setProfile(null)
          setAuthLoading(false)
          // Force le refresh pour mettre à jour tous les composants qui dépendent de l'auth
          router.refresh()
        }
        if (event === 'SIGNED_IN' && session) {
          loadProfile()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    setBottomNavOpen(false)
    setDrawerOpen(false)
    setSettingsOpen(false)
  }, [pathname])

  const publicLinks: NavLinkItem[] = [
    { href: '/lieux', label: t('lieux'), icon: Map },
    { href: '/regions', label: 'Régions', icon: Compass },
    { href: '/cuisine', label: t('cuisine'), icon: UtensilsCrossed },
    { href: '/guides', label: t('guides'), icon: User },
    { href: '/scan', label: t('scan'), icon: ScanLine },
  ]

  const bottomLinks: NavLinkItem[] = [
    { href: '/accueil', label: t('accueil'), icon: Home },
    { href: '/lieux', label: t('lieux'), icon: Map },
    { href: '/regions', label: 'Régions', icon: Compass },
    { href: '/scan', label: t('scan'), icon: ScanLine },
    { href: '/cuisine', label: t('cuisine'), icon: UtensilsCrossed },
  ]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setDrawerOpen(false)
    window.location.href = `/${params.locale}`
  }

  const drawerLinks = () => {
    if (!profile) return []
    if (profile.role === 'admin') {
      return [
        { href: '/dashboard/admin', label: 'Dashboard', icon: User },
        { href: '/dashboard/admin?tab=guides', label: 'Gérer les guides', icon: User },
        { href: '/dashboard/admin?tab=reports', label: 'Signalements', icon: User },
        { href: '/dashboard/admin?tab=reviews', label: 'Avis', icon: User },
        { href: '/dashboard/admin?tab=bans', label: 'Bannissements', icon: User },
      ]
    }
    if (profile.role === 'guide') {
      return [
        { href: '/dashboard/guide', label: 'Mon profil public', icon: User },
        { href: '/dashboard/guide?tab=quotes', label: 'Demandes reçues', icon: Calendar },
        { href: '/dashboard/guide?tab=missions', label: 'Mes missions', icon: Compass },
        { href: '/dashboard/guide?tab=subscription', label: 'Mon abonnement', icon: Settings },
      ]
    }
    return [
      { href: '/dashboard/tourist', label: 'Mon profil', icon: User },
      { href: '/dashboard/tourist?tab=bookings', label: 'Mes réservations', icon: Calendar },
      { href: '/dashboard/tourist?tab=favorites', label: 'Mes favoris', icon: Heart },
      { href: '/dashboard/tourist?tab=scans', label: 'Historique scans', icon: History },
    ]
  }

  if (isAuthPage) return null

  const isActive = (path: string): boolean => {
    if (path === '/accueil') {
      return pathname === '/' || pathname === '/accueil'
    }
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border border-border bg-card/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/accueil" className="group flex items-center gap-3 transition-opacity hover:opacity-90">
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

          {(!pathname.startsWith('/auth') && (profile || pathname !== '/')) && (
            <nav className="hidden items-center gap-1 lg:flex">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-2xl px-4 py-2 text-sm font-bold transition-all ${
                    isActive(link.href)
                      ? 'bg-primary text-primary-content'
                      : 'text-base-content/70 hover:bg-base-200'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            {!authLoading && !isAuthenticated && (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-2xl border border-border px-4 py-2 text-sm font-bold text-base-content hover:bg-base-200 inline-flex"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-2xl px-4 py-2 text-sm font-bold text-white inline-flex"
                  style={{ backgroundColor: COLORS.forest }}
                >
                  {t('register')}
                </Link>
              </>
            )}

            {!authLoading && isAuthenticated && profile && (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 rounded-2xl border border-border bg-base-200 px-3 py-2 transition-all hover:border-primary/40"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white"
                  style={{ backgroundColor: COLORS.forest }}
                >
                  {getInitials(profile.full_name)}
                </span>
                <span className="hidden max-w-24 truncate text-sm font-bold sm:block">{profile.full_name.split(' ')[0]}</span>
                <Menu className="h-4 w-4 text-base-content/60" />
              </button>
            )}

            {isAuthenticated && profile && (
              <Link
                href="/scan"
                className="hidden items-center gap-2 rounded-2xl bg-secondary px-4 py-2 text-xs font-black uppercase tracking-wide text-secondary-content shadow-sm transition-all hover:-translate-y-0.5 sm:inline-flex"
              >
                <ScanLine className="h-4 w-4" />
                {t('scan_button')}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all ${
                settingsOpen ? 'border-secondary bg-secondary text-secondary-content' : 'border-border bg-base-200'
              }`}
              aria-label={t('settings')}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {settingsOpen && (
          <div className="absolute right-4 top-full mt-3 w-[min(21rem,calc(100vw-2rem))] rounded-xl border border-border bg-base-200 p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-black uppercase tracking-wider">{t('settings')}</span>
              <button type="button" onClick={() => setSettingsOpen(false)} className="rounded-xl p-1 hover:bg-base-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {languages.map((lang) => (
                <Link
                  key={lang.code}
                  href={pathname}
                  locale={lang.code}
                  onClick={() => setSettingsOpen(false)}
                  className={`rounded-2xl border px-3 py-3 text-center text-xs font-black ${
                    locale === lang.code ? 'border-primary bg-primary text-primary-content' : 'border-border bg-base-100'
                  }`}
                >
                  {lang.label}
                </Link>
              ))}
            </div>
            {mounted && (
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-base-100 p-1.5">
                <button type="button" onClick={() => setTheme('light')} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold ${!isDark ? 'bg-primary text-primary-content' : 'text-base-content/60'}`}><Sun className="h-4 w-4" />{t('light')}</button>
                <button type="button" onClick={() => setTheme('dark')} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold ${isDark ? 'bg-primary text-primary-content' : 'text-base-content/60'}`}><Moon className="h-4 w-4" />{t('dark')}</button>
              </div>
            )}
          </div>
        )}
      </header>

      <AnimatePresence>
        {drawerOpen && profile && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
              aria-label={t('close_settings')}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 z-[71] flex h-full w-[min(20rem,85vw)] flex-col bg-base-100 shadow-2xl"
            >
              <div className="border-b border-border p-5">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black text-white"
                    style={{ backgroundColor: COLORS.forest }}
                  >
                    {getInitials(profile.full_name)}
                  </span>
                  <div>
                    <p className="font-bold text-base-content">{profile.full_name}</p>
                    <p className="text-xs capitalize text-base-content/50">{profile.role}</p>
                  </div>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                  {drawerLinks().map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setDrawerOpen(false)}
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-base-content hover:bg-base-200"
                        >
                          <ItemIcon className="h-4 w-4 text-secondary" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
              <div className="border-t border-border p-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm font-bold text-error cursor-pointer hover:bg-error/20 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t('logout')}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom Bar (Mobile always visible, Desktop via floating button) ── */}

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-base-100/92 backdrop-blur-xl md:hidden">
        <div className="mx-auto max-w-md px-3 pb-2 pt-2">
          <div className="grid grid-cols-5 gap-1 rounded-xl bg-base-200 p-1.5">
            {(isAuthenticated && profile ? bottomLinks : [
              { href: '/accueil', label: t('accueil'), icon: Home },
              { href: '/lieux', label: t('lieux'), icon: Map },
              { href: '/regions', label: 'Régions', icon: Compass },
              { href: '/cuisine', label: t('cuisine'), icon: UtensilsCrossed },
              { href: '/scan', label: t('scan'), icon: ScanLine },
            ]).map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[9px] font-bold sm:text-[10px] ${
                    active ? 'text-primary-content dark:text-secondary-content' : 'text-base-content/55'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="activeBottomNav"
                      className="absolute inset-0 rounded-xl bg-primary dark:bg-secondary"
                    />
                  )}
                  <Icon className="relative h-5 w-5" />
                  <span className="relative truncate">{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Desktop: floating "Découvrir" button */}
      <div className="hidden" aria-hidden="true">
        <AnimatePresence>
          {bottomNavOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60]"
                onClick={() => setBottomNavOpen(false)}
              />
              {/* Bottom nav panel sliding up */}
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                className="fixed bottom-0 left-1/2 z-[61] w-full max-w-xl -translate-x-1/2 rounded-t-[32px] border border-border/60 bg-base-100/95 px-4 pb-6 pt-4 shadow-2xl backdrop-blur-xl"
              >
                {/* Drag handle */}
                <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-base-content/20" />
                <div className="grid grid-cols-5 gap-2 rounded-xl bg-base-200 p-2">
                  {(isAuthenticated && profile ? bottomLinks : [
                    { href: '/accueil', label: t('accueil'), icon: Home },
                    { href: '/lieux', label: t('lieux'), icon: Map },
                    { href: '/regions', label: 'Régions', icon: Compass },
                    { href: '/cuisine', label: t('cuisine'), icon: UtensilsCrossed },
                    { href: '/scan', label: t('scan'), icon: ScanLine },
                  ]).map((link) => {
                    const Icon = link.icon
                    const active = isActive(link.href)
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setBottomNavOpen(false)}
                        className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-[10px] font-bold transition-colors ${
                          active ? 'text-primary-content dark:text-secondary-content' : 'text-base-content/60 hover:text-base-content'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="activeBottomNavDesktop"
                            className="absolute inset-0 rounded-xl bg-primary dark:bg-secondary"
                          />
                        )}
                        <Icon className="relative h-5 w-5" />
                        <span className="relative truncate">{link.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Floating trigger button */}
        <motion.button
          type="button"
          onClick={() => setBottomNavOpen((v) => !v)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[65] flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/20 transition-shadow hover:shadow-xl cursor-pointer"
          style={{ backgroundColor: COLORS.forest }}
        >
          <Compass className="h-5 w-5" />
          {t('discover')}
        </motion.button>
      </div>
    </>
  )
}
