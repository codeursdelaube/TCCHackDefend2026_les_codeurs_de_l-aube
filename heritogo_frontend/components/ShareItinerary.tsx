'use client'

import { useState } from 'react'
import { Share2, Copy, Check, MessageSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { COLORS } from '@/lib/constants/colors'

interface ShareItineraryProps {
  items: { name: string; details?: string }[]
}

export default function ShareItinerary({ items }: ShareItineraryProps) {
  const t = useTranslations('Dashboard')
  const [copied, setCopied] = useState(false)

  const getShareText = () => {
    const intro = t('share.text_intro')
    const itemStrings = items.map((item, index) => `${index + 1}. ${item.name}${item.details ? ` (${item.details})` : ''}`).join('\n')
    const appLink = typeof window !== 'undefined' ? window.location.origin : 'https://heritogo.com'
    return `${intro}\n\n${itemStrings}\n\n${t('share.discover_app')} ${appLink}`
  }

  const handleShare = async () => {
    const text = getShareText()
    const url = typeof window !== 'undefined' ? window.location.href : ''
    
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: t('share.title'),
          text: text,
          url: url
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
      return
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying text:', err)
    }
  }

  const handleWhatsAppShare = () => {
    const text = getShareText()
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const fullText = encodeURIComponent(`${text}\n${url}`)
    window.open(`https://wa.me/?text=${fullText}`, '_blank')
  }

  if (items.length === 0) {
    return (
      <div className="text-xs text-base-content/50 italic">
        {t('share.no_items')}
      </div>
    )
  }

  const isShareSupported = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-base-100 p-4 border border-border">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
          <Share2 className="h-4 w-4 text-primary" style={{ color: COLORS.forest }} />
          {t('share.title')}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="btn btn-xs sm:btn-sm rounded-xl font-bold flex items-center gap-1 text-white border-none"
          style={{ backgroundColor: COLORS.forest }}
        >
          {isShareSupported ? (
            <>
              <Share2 className="h-3.5 w-3.5" />
              {t('share.share_btn')}
            </>
          ) : copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-success" />
              {t('share.copied')}
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              {t('share.copy_link')}
            </>
          )}
        </button>

        {!isShareSupported && (
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="btn btn-xs sm:btn-sm btn-outline rounded-xl font-bold flex items-center gap-1"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            {t('share.whatsapp')}
          </button>
        )}
      </div>
    </div>
  )
}
