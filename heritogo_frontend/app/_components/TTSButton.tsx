'use client'

import { useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useLocale } from 'next-intl'

export default function TTSButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false)
  const locale = useLocale()

  const playLabel = locale === 'en' ? "Listen to the story" 
                  : locale === 'es' ? "Escuchar la historia" 
                  : locale === 'zh' ? "收听历史故事" 
                  : "Écouter l'histoire"

  const stopLabel = locale === 'en' ? "Stop" 
                  : locale === 'es' ? "Detener" 
                  : locale === 'zh' ? "停止" 
                  : "Arrêter"

  const langCode = locale === 'en' ? 'en-US' 
                 : locale === 'es' ? 'es-ES' 
                 : locale === 'zh' ? 'zh-CN' 
                 : 'fr-FR'

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
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full
                  text-xs font-bold border transition-all duration-200
                  ${speaking
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-base-200 border-base-content/10 text-base-content/50 hover:text-base-content hover:border-base-content/20'
                  }`}
    >
      {speaking
        ? <><VolumeX size={13} className="animate-pulse" /> {stopLabel}</>
        : <><Volume2 size={13} /> {playLabel}</>
      }
    </button>
  )
}