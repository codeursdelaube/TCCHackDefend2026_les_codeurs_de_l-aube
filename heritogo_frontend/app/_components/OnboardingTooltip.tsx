'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronRight, Globe, ScanLine, X } from 'lucide-react'
import { useOnboarding } from '@/hooks/useOnboarding'

export default function OnboardingTooltip() {
  const t = useTranslations('Onboarding')
  const { showTooltips, dismiss } = useOnboarding()
  const [currentStep, setCurrentStep] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  const steps = useMemo(() => [
    { target: 'scan-button', tooltip: t('scan_tooltip'), icon: <ScanLine size={20} className="text-secondary" /> },
    { target: 'settings-button', tooltip: t('lang_tooltip'), icon: <Globe size={20} className="text-secondary" /> },
  ], [t])

  const updateTooltipPosition = useCallback((stepIndex: number) => {
    const targetElement = document.querySelector(`[data-onboarding="${steps[stepIndex].target}"]`)
    if (!targetElement) return

    const rect = targetElement.getBoundingClientRect()
    const tooltipWidth = 256
    const tooltipHeight = 200
    let top = rect.top - 80
    let left = rect.left + rect.width / 2 - tooltipWidth / 2

    if (left < 10) left = 10
    if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10
    if (top < 10) top = rect.bottom + 10
    if (top + tooltipHeight > window.innerHeight - 10) top = window.innerHeight - tooltipHeight - 10

    setPosition({ top, left })
  }, [steps])

  useEffect(() => {
    if (!showTooltips) return
    const timer = window.setTimeout(() => updateTooltipPosition(currentStep), 0)
    return () => window.clearTimeout(timer)
  }, [showTooltips, currentStep, updateTooltipPosition])

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((step) => step + 1)
    else dismiss()
  }

  if (!showTooltips) return null

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[100] bg-black/50" />
      <div ref={tooltipRef} className="fixed z-[101] w-64 rounded-xl border border-border bg-base-200 p-4 text-base-content shadow-2xl" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {steps[currentStep].icon}
            <span className="text-sm font-black">{t('welcome')}</span>
          </div>
          <button type="button" onClick={dismiss} className="rounded-xl p-1 text-base-content/50 transition-colors hover:bg-base-100 hover:text-base-content" aria-label={t('skip')}>
            <X size={16} />
          </button>
        </div>

        <p className="mb-4 text-sm font-medium leading-6 text-base-content/70">{steps[currentStep].tooltip}</p>

        <div className="mb-4 flex items-center gap-1">
          {steps.map((step, index) => (
            <div key={step.target} className={`h-1 flex-1 rounded-full ${index <= currentStep ? 'bg-secondary' : 'bg-base-content/20'}`} />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button type="button" onClick={dismiss} className="text-xs font-bold text-base-content/50 transition-colors hover:text-base-content">
            {t('skip')}
          </button>
          <button type="button" onClick={handleNext} className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2 text-xs font-black text-secondary-content transition-all active:scale-95">
            {currentStep === steps.length - 1 ? t('finish') : t('next')}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </>
  )
}
