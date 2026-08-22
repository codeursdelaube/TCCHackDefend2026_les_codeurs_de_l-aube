'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, Clock3, MapPinned, Route, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

type TripStyle = 'essentiel' | 'nature' | 'culture'
const STYLES: TripStyle[] = ['essentiel', 'nature', 'culture']

export default function TravelPlanner() {
  const t = useTranslations('TravelTools.planner')
  const [style, setStyle] = useState<TripStyle>('essentiel')
  const [tripDays, setTripDays] = useState(3)
  const [completed, setCompleted] = useState<number[]>([])
  const [saved, setSaved] = useState(false)
  const itinerary = useMemo(() => [1, 2, 3].slice(0, tripDays).map(day => t(`itineraries.${style}.days.${day}`)), [style, tripDays, t])

  useEffect(() => { try { const stored = window.localStorage.getItem('heritogo-trip-progress'); if (stored) setCompleted(JSON.parse(stored) as number[]) } catch { setCompleted([]) } }, [])
  const toggleStop = (index: number) => setCompleted(current => { const next = current.includes(index) ? current.filter(item => item !== index) : [...current, index]; window.localStorage.setItem('heritogo-trip-progress', JSON.stringify(next)); return next })
  const saveTrip = () => { window.localStorage.setItem('heritogo-trip', JSON.stringify({ style, tripDays })); setSaved(true) }

  return <section className="overflow-hidden rounded-3xl border border-[#1B7E4B]/20 bg-white dark:bg-[#182B1E] shadow-sm"><div className="bg-[#1B7E4B] px-5 py-5 text-white sm:px-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#E8A923]"><Route className="h-4 w-4" /> {t('kicker')}</div><h2 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">{t('title')}</h2><p className="mb-0 mt-1 max-w-xl text-sm text-white/80">{t('description')}</p></div><Sparkles className="hidden h-8 w-8 text-[#E8A923] sm:block" /></div></div><div className="p-5 sm:p-6"><div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#767676] dark:text-[#9CA89E]">{t('styleLabel')}</p><div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">{STYLES.map(item => <button key={item} type="button" onClick={() => { setStyle(item); setCompleted([]) }} className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${style === item ? 'bg-[#1B7E4B] text-white' : 'bg-[#F5F5F0] dark:bg-[#1C2E22] text-[#3D3D3D] dark:text-[#F0F0EC] hover:bg-[#1B7E4B]/10'}`}>{t(`itineraries.${item}.label`)}</button>)}</div></div><label className="flex items-center gap-2 rounded-xl border border-[#E5E5E0] dark:border-[#243B2C] px-3 py-2 text-xs font-bold text-[#3D3D3D] dark:text-[#F0F0EC]"><CalendarDays className="h-4 w-4 text-[#1B7E4B]" /><span>{t('duration')}</span><select value={tripDays} onChange={event => setTripDays(Number(event.target.value))} className="bg-transparent font-black outline-none"><option value={1}>{t('oneDay')}</option><option value={2}>{t('twoDays')}</option><option value={3}>{t('threeDays')}</option></select></label></div><p className="mt-4 text-sm text-[#767676] dark:text-[#9CA89E]">{t(`itineraries.${style}.description`)}</p><div className="mt-4 grid gap-2">{itinerary.map((stop, index) => { const done = completed.includes(index); return <button key={stop} type="button" onClick={() => toggleStop(index)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${done ? 'border-[#1B7E4B]/30 bg-[#1B7E4B]/10' : 'border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#1C2E22] hover:border-[#1B7E4B]/40'}`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${done ? 'bg-[#1B7E4B] text-white' : 'bg-white dark:bg-[#182B1E] text-[#1B7E4B]'}`}>{done ? <Check className="h-4 w-4" /> : index + 1}</span><span className={`flex-1 text-sm font-semibold ${done ? 'text-[#1B7E4B] line-through' : 'text-[#1A1A1A] dark:text-[#F0F0EC]'}`}>{stop}</span><Clock3 className="h-4 w-4 text-[#767676] dark:text-[#9CA89E]" /></button> })}</div><div className="mt-5 flex flex-col gap-2 sm:flex-row"><button type="button" onClick={saveTrip} className="rounded-xl bg-[#C85C2D] px-4 py-2.5 text-sm font-bold text-white hover:brightness-110">{saved ? t('saved') : t('save')}</button><Link href="/lieux" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1B7E4B]/30 px-4 py-2.5 text-sm font-bold text-[#1B7E4B] hover:bg-[#1B7E4B]/10"><MapPinned className="h-4 w-4" /> {t('map')}</Link></div></div></section>
}
