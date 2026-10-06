'use client'

import { X, Shield } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useEffect } from 'react'
import { PRIVACY_POLICY, type PrivacyPolicyLocale } from '@/lib/privacy-policy'

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const locale = useLocale()
  const policy =
    PRIVACY_POLICY[(locale as PrivacyPolicyLocale)] || PRIVACY_POLICY.fr

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-background shadow-2xl">
        <div
          className="flex shrink-0 items-center justify-between gap-4 rounded-t-2xl border-b border-border p-5"
          style={{ background: '#3B2519' }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Shield className="h-5 w-5 shrink-0 text-white" />
            <div className="min-w-0">
              <h2 className="font-serif text-lg font-bold italic text-white">
                {policy.title}
              </h2>
              <p className="mt-0.5 text-xs text-white/70">
                {policy.updatedLabel} : {policy.lastUpdated}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-card/20"
            aria-label={policy.closeLabel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {policy.sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 text-sm font-bold text-foreground">
                {section.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 justify-end rounded-b-2xl border-t border-border bg-muted/30 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: '#3B2519' }}
          >
            {policy.understoodLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
