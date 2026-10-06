'use client'

import { useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

export default function TTSButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false)
  const locale = useLocale()
  const t = useTranslations('Common')

  const langCode = locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : locale === 'zh' ? 'zh-CN' : 'fr-FR'

  const toggle = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = langCode
    utterance.rate = 0.95
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm ${
        speaking
          ? 'bg-primary text-white'
          : 'bg-primary text-white hover:brightness-110'
      }`}
    >
      {speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      <span>{speaking ? t('stop') : t('listen')}</span>
    </button>
  )
}
