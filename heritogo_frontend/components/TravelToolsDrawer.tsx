'use client'

import { useState } from 'react'
import { BriefcaseBusiness, ChevronDown, LockKeyhole, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import ArrivalChecklist from '@/components/ArrivalChecklist'
import TravelPlanner from '@/components/TravelPlanner'
import TouristToolkit from '@/components/TouristToolkit'

export default function TravelToolsDrawer() {
  const t = useTranslations('TravelTools.drawer')
  const [open, setOpen] = useState(false)
  const { isAuthenticated, loading } = useAuth()
  const params = useParams<{ locale: string }>()
  const router = useRouter()
  const handleOpen = () => { if (!loading && !isAuthenticated) { const locale = params?.locale || 'fr'; router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(`/${locale}/accueil`)}`); return }; setOpen(true) }
  return <><motion.button type="button" onClick={handleOpen} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="fixed bottom-24 left-4 z-[65] flex h-12 w-12 items-center justify-center rounded-full bg-[#C85C2D] p-0 text-sm font-black text-white shadow-xl shadow-black/20 md:bottom-6 md:left-auto md:right-28 md:h-auto md:w-auto md:gap-2 md:px-4 md:py-3" aria-label={t('open')}><BriefcaseBusiness className="h-5 w-5" /><span className="hidden md:inline">{t('button')}</span></motion.button><AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-end bg-black/50 p-0 backdrop-blur-sm md:items-center md:justify-center md:p-6" onClick={() => setOpen(false)}><motion.section initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 330, damping: 30 }} onClick={event => event.stopPropagation()} className="tourist-tools-panel flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] bg-white dark:bg-[#0F1F16] shadow-2xl md:rounded-[28px]"><header className="flex items-center justify-between border-b border-[#E5E5E0] bg-[#F5F5F0] px-5 py-4 dark:border-[#243B2C] dark:bg-[#182B1E]"><div><p className="mb-0 text-xs font-black uppercase tracking-wider text-[#1B7E4B]">HeriTogo</p><h2 className="text-lg font-black text-[#1A1A1A] dark:text-[#F0F0EC]">{t('title')}</h2></div><button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-[#767676] hover:bg-white dark:hover:bg-[#243B2C]" aria-label={t('close')}><X className="h-5 w-5" /></button></header><div className="overflow-y-auto p-4 sm:p-6"><div className="space-y-5"><ArrivalChecklist /><TravelPlanner /><TouristToolkit /></div></div><footer className="flex items-center justify-center gap-2 border-t border-[#E5E5E0] px-4 py-3 text-xs text-[#767676] dark:border-[#243B2C] dark:text-[#9CA89E]"><LockKeyhole className="h-3.5 w-3.5" /> {t('privacy')} <ChevronDown className="h-3.5 w-3.5" /></footer></motion.section></motion.div>}</AnimatePresence></>
}
