'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, ScanLine, Compass, UtensilsCrossed, Home, Sparkles, type LucideIcon, Moon, Sun } from 'lucide-react'

interface NavLinkItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export default function Navbar() {
  const pathname = usePathname()

  const navLinks: NavLinkItem[] = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/scan', label: 'Scanner', icon: ScanLine },
    { href: '/lieux', label: 'Lieux', icon: Compass },
    { href: '/cuisine', label: 'Cuisine', icon: UtensilsCrossed },
    // AJOUT : Lien vers la page Parc d'attraction et Zoo
    { href: '/loisirs', label: 'Parcs & Zoos', icon: Sparkles },
  ]

  const isActive = (path: string): boolean => pathname === path

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 text-white backdrop-blur-md transition-all duration-300">
      <div className="navbar mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* PARTIE GAUCHE : Menu Mobile & Logo */}
        <div className="navbar-start">
          {/* Dropdown Mobile */}
          <div className="dropdown">
            <button 
              tabIndex={0} 
              className="btn btn-ghost lg:hidden" 
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <ul 
              tabIndex={0} 
              className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow-2xl bg-black/95 rounded-box w-56 border border-white/10 gap-1"
            >
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                        isActive(link.href) 
                          ? 'bg-green-600 text-white font-semibold' 
                          : 'hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Logo Heritogo */}
          <Link href="/" className="flex items-center font-black text-xl tracking-wider hover:opacity-90 transition-opacity ml-2 lg:ml-0">
            <span className="text-green-500">Heri</span>
            <span className="text-yellow-300">togo</span>
          </Link>
        </div>

        {/* PARTIE CENTRALE : Liens Desktop */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium ${
                      isActive(link.href)
                        ? 'bg-white text-black font-semibold shadow-md'
                        : 'text-gray-200 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* PARTIE DROITE : Theme Toggle + Bouton Scan */}
        <div className="navbar-end gap-2 md:gap-4">

          {/* Toggle Dark/Light */}
          <label className="flex cursor-pointer items-center gap-1.5">
            {/* Icône Soleil */}
            <Sun className="h-4 w-4 text-amber-400" />

            <input
              type="checkbox"
              value="night"
              className="toggle toggle-sm theme-controller"
            />

            {/* Icône Lune */}
            <Moon className="h-4 w-4 text-slate-300" />
          </label>

          {/* Bouton Scan */}
          <Link href="/scan">
            <button className="btn btn-primary btn-sm md:btn-md rounded-full shadow-lg border-none bg-linear-to-r from-green-500 to-emerald-600 text-white hover:scale-105 transition-transform gap-2">
              <ScanLine className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
              <span className="hidden sm:inline">Scanner un monument</span>
            </button>
          </Link>

        </div>

      </div>
    </header>
  )
}