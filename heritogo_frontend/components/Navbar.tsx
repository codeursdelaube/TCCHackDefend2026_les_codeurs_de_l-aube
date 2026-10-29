'use client'

import { Link, usePathname } from '@/i18n/navigation'
import AuthGuardLink from '@/components/AuthGuardLink'
import { useLocale, useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { ElementType, useEffect, useRef, useState } from 'react'
import {
  Archive, Calendar, ClipboardList, Compass, FileText, Flag, Heart, History, Home,
  Inbox, LayoutDashboard, LogOut, Map, Moon, ScanLine, Settings, ShieldBan, Star,
  Sun, User, UtensilsCrossed, X, ChevronDown, Landmark,
} from 'lucide-react'
import Image from 'next/image'
import { useTheme } from '@/hooks/useTheme'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { getInitials } from '@/lib/auth/redirect'

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
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文' },
]

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password']

function profileFromUser(user: SupabaseUser): ProfileRow {
  const metadata = user.user_metadata as { full_name?: string; role?: string }
  const role = metadata.role === 'admin' || metadata.role === 'guide' || metadata.role === 'tourist'
    ? metadata.role
    : 'tourist'

  return {
    full_name: metadata.full_name || user.email?.split('@')[0] || 'HeriTogo',
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
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const settingsRef = useRef<HTMLDivElement>(null)

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

  // Referme les menus lors d'une navigation.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen(false)
    setSettingsOpen(false)
  }, [pathname])

  // Ferme le menu de préférences au clic extérieur ou sur Échap.
  useEffect(() => {
    if (!settingsOpen) return
    const onClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSettingsOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [settingsOpen])

  const publicLinks: NavLinkItem[] = [
    { href: '/lieux', label: t('lieux'), icon: Map },
    { href: '/regions', label: t('regions'), icon: Compass },
    { href: '/cuisine', label: t('cuisine'), icon: UtensilsCrossed },
    { href: '/loisirs', label: t('loisirs'), icon: Landmark },
    { href: '/guides', label: t('guides'), icon: User },
  ]

  const bottomLinks: NavLinkItem[] = [
    { href: '/accueil', label: t('accueil'), icon: Home },
    { href: '/lieux', label: t('lieux'), icon: Map },
    { href: '/scan', label: t('scan'), icon: ScanLine },
    { href: '/cuisine', label: t('cuisine'), icon: UtensilsCrossed },
    { href: '/guides', label: t('guides'), icon: User },
  ]

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setDrawerOpen(false)
    window.location.href = `/${params.locale}`
  }

  const drawerLinks = (): NavLinkItem[] => {
    if (!profile) return []
    if (profile.role === 'admin') {
      return [
        { href: '/dashboard/admin', label: t('dashboard_admin'), icon: LayoutDashboard },
        { href: '/dashboard/admin?tab=places', label: t('admin_places'), icon: Landmark },
        { href: '/dashboard/admin?tab=dishes', label: t('admin_dishes'), icon: UtensilsCrossed },
        { href: '/dashboard/admin?tab=guides', label: t('admin_guides'), icon: User },
        { href: '/dashboard/admin?tab=reports', label: t('admin_reports'), icon: Flag },
        { href: '/dashboard/admin?tab=reviews', label: t('admin_reviews'), icon: Star },
        { href: '/dashboard/admin?tab=bans', label: t('admin_bans'), icon: ShieldBan },
      ]
    }
    if (profile.role === 'guide') {
      return [
        { href: '/dashboard/guide?tab=quotes', label: t('guide_quotes'), icon: Inbox },
        { href: '/dashboard/guide?tab=missions', label: t('guide_missions'), icon: Calendar },
        { href: '/dashboard/guide?tab=history', label: t('guide_history'), icon: Archive },
        { href: '/dashboard/guide?tab=profile', label: t('guide_profile'), icon: User },
        { href: '/dashboard/guide?tab=documents', label: t('guide_documents'), icon: FileText },
      ]
    }
    return [
      { href: '/dashboard/tourist?tab=bookings', label: t('tourist_bookings'), icon: ClipboardList },
      { href: '/dashboard/tourist?tab=favorites', label: t('tourist_favorites'), icon: Heart },
      { href: '/dashboard/tourist?tab=scans', label: t('tourist_scans'), icon: History },
      { href: '/dashboard/tourist?tab=profile', label: t('tourist_profile'), icon: User },
    ]
  }

  if (isAuthPage) return null

  const isActive = (path: string): boolean => {
    if (path === '/accueil') {
      return pathname === '/' || pathname === '/accueil'
    }
    return pathname === path || pathname.startsWith(path + '/')
  }

  const navLinkClass = (href: string) =>
    `relative px-3 py-2 text-sm font-semibold transition-colors ${
      isActive(href) ? 'text-primary' : 'text-foreground/70 hover:text-foreground'
    }`

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/accueil" aria-label="HeriTogo" className="flex shrink-0 items-center gap-2.5">
            <Image src="/icons/icon-192x192.png" alt="" width={36} height={36} className="h-9 w-9 rounded-lg object-contain" />
            <span className="hidden leading-none sm:block">
              <span className="block font-serif text-lg font-bold text-foreground">HeriTogo</span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t('tagline')}
              </span>
            </span>
          </Link>

          <nav aria-label={t('main_nav')} className="hidden items-center lg:flex">
            {publicLinks.map((link) => {
              const content = (
                <>
                  {link.label}
                  {isActive(link.href) && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-primary" />}
                </>
              )
              return link.href === '/guides' ? (
                <AuthGuardLink key={link.href} href={link.href} className={navLinkClass(link.href)}>
                  {content}
                </AuthGuardLink>
              ) : (
                <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                  {content}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/scan"
              className="hidden items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-xs font-bold text-[#2A1E16] transition-colors hover:bg-accent/85 md:inline-flex"
            >
              <ScanLine className="h-4 w-4" />
              {t('scan_button')}
            </Link>

            {!authLoading && !isAuthenticated && (
              <>
                <Link href="/auth/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted sm:inline-flex">
                  {t('login')}
                </Link>
                <Link href="/auth/register" className="btn-brand min-h-9 px-3.5 text-xs">
                  {t('register')}
                </Link>
              </>
            )}

            {!authLoading && isAuthenticated && profile && (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={drawerOpen}
                className="flex items-center gap-2 rounded-lg border border-border bg-card py-1 pl-1 pr-2.5 transition-colors hover:border-primary/40"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                  {getInitials(profile.full_name)}
                </span>
                <span className="hidden max-w-24 truncate text-sm font-semibold sm:block">{profile.full_name.split(' ')[0]}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            )}

            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                aria-expanded={settingsOpen}
                aria-label={t('settings')}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                  settingsOpen ? 'border-primary text-primary' : 'border-border text-foreground/70 hover:text-foreground'
                }`}
              >
                <Settings className="h-4 w-4" />
              </button>

              {settingsOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card p-3 shadow-xl">
                  <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t('language')}</p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {languages.map((lang) => (
                      <Link
                        key={lang.code}
                        href={pathname}
                        locale={lang.code}
                        onClick={() => setSettingsOpen(false)}
                        className={`rounded-lg border px-3 py-2 text-center text-xs font-semibold transition-colors ${
                          locale === lang.code ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {lang.label}
                      </Link>
                    ))}
                  </div>
                  {mounted && (
                    <>
                      <p className="mt-4 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t('theme')}</p>
                      <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-border p-1">
                        <button type="button" onClick={() => setTheme('light')} className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold ${!isDark ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                          <Sun className="h-3.5 w-3.5" />{t('light')}
                        </button>
                        <button type="button" onClick={() => setTheme('dark')} className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold ${isDark ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                          <Moon className="h-3.5 w-3.5" />{t('dark')}
                        </button>
                      </div>
                    </>
                  )}
                  {!isAuthenticated && !authLoading && (
                    <Link href="/auth/login" className="mt-3 block rounded-lg px-3 py-2 text-center text-xs font-semibold text-foreground hover:bg-muted sm:hidden">
                      {t('login')}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {drawerOpen && profile && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-70 bg-black/40"
              onClick={() => setDrawerOpen(false)}
              aria-label={t('close_menu')}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={t('account_menu')}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 z-71 flex h-full w-[min(20rem,85vw)] flex-col border-l border-border bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                    {getInitials(profile.full_name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{profile.full_name}</p>
                    <p className="text-xs text-muted-foreground">{t(`role_${profile.role}`)}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setDrawerOpen(false)} aria-label={t('close_menu')} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-3">
                <ul className="space-y-0.5">
                  {drawerLinks().map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setDrawerOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                        >
                          <ItemIcon className="h-4 w-4 text-primary" />
                          {item.label}
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
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-red-300 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  {t('logout')}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Navigation mobile */}
      <nav aria-label={t('main_nav')} className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {bottomLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            const isScan = link.href === '/scan'
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isScan ? 'bg-accent text-[#2A1E16]' : active ? 'bg-primary/10' : ''}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="truncate">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
