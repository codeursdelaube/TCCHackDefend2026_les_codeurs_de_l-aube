'use client'

import { useEffect, useState } from 'react'
import { Check, CircleAlert, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

const ITEM_IDS = ['documents', 'entry', 'offline', 'money'] as const

export default function ArrivalChecklist() {
  const t = useTranslations('TravelTools.checklist')
  const [done, setDone] = useState<string[]>([])
  const items = ITEM_IDS.map(id => ({ id, title: t(`items.${id}.title`), detail: t(`items.${id}.detail`) }))

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('heritogo-arrival-checklist')
      if (saved) setDone(JSON.parse(saved) as string[])
    } catch { setDone([]) }
  }, [])

  const toggle = (id: string) => setDone(current => {
    const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    window.localStorage.setItem('heritogo-arrival-checklist', JSON.stringify(next))
    return next
  })

  return <section className="rounded-3xl border border-[#E5E5E0] dark:border-[#243B2C] bg-white dark:bg-[#182B1E] p-5 shadow-sm sm:p-6">
    <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1B7E4B]"><ClipboardCheck className="h-4 w-4" /> {t('kicker')}</div><h2 className="mt-1 text-xl font-black text-[#1A1A1A] dark:text-[#F0F0EC] sm:text-2xl">{t('title')}</h2><p className="mb-0 mt-1 text-sm text-[#767676] dark:text-[#9CA89E]">{t('description')}</p></div><span className="rounded-full bg-[#1B7E4B]/10 px-3 py-1 text-xs font-black text-[#1B7E4B]">{t('progress', { done: done.length, total: items.length })}</span></div>
    <div className="mt-5 grid gap-2 sm:grid-cols-2">{items.map(item => { const completed = done.includes(item.id); return <button key={item.id} type="button" onClick={() => toggle(item.id)} className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors ${completed ? 'border-[#1B7E4B]/30 bg-[#1B7E4B]/10' : 'border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#1C2E22] hover:border-[#1B7E4B]/40'}`}><span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${completed ? 'bg-[#1B7E4B] text-white' : 'bg-white dark:bg-[#182B1E] text-[#C85C2D]'}`}>{completed ? <Check className="h-4 w-4" /> : item.id === 'entry' ? <CircleAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}</span><span><strong className={`block text-sm ${completed ? 'text-[#1B7E4B] line-through' : 'text-[#1A1A1A] dark:text-[#F0F0EC]'}`}>{item.title}</strong><span className="mt-0.5 block text-xs leading-relaxed text-[#767676] dark:text-[#9CA89E]">{item.detail}</span></span></button> })}</div>
  </section>
}
