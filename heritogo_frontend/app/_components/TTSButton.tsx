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
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = langCode
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
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[20px] px-5 text-sm font-black transition-all active:scale-95 ${
        speaking ? 'bg-secondary text-secondary-content' : 'bg-primary text-primary-content dark:bg-secondary dark:text-secondary-content'
      }`}
    >
      {speaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      {speaking ? t('stop') : t('listen')}
    </button>
  )
}
