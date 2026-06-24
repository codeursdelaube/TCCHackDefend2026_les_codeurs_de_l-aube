'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { X, ChevronRight, ScanLine, Globe } from 'lucide-react'
import { useOnboarding } from '@/hooks/useOnboarding'

export default function OnboardingTooltip() {
  const t = useTranslations('Onboarding')
  const { showTooltips, dismiss } = useOnboarding()
  const [currentStep, setCurrentStep] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  const steps = [
    {
      target: 'scan-button',
      tooltip: t('scan_tooltip'),
      icon: <ScanLine size={20} className="text-primary" />
    },
    {
      target: 'settings-button',
      tooltip: t('lang_tooltip'),
      icon: <Globe size={20} className="text-primary" />
    }
  ]

  useEffect(() => {
    if (showTooltips) {
      updateTooltipPosition(currentStep)
    }
  }, [showTooltips, currentStep])

  const updateTooltipPosition = (stepIndex: number) => {
    const targetElement = document.querySelector(`[data-onboarding="${steps[stepIndex].target}"]`)
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect()
      const tooltipWidth = 256 // w-64 = 256px
      const tooltipHeight = 200 // hauteur approximative du tooltip
      
      let top = rect.top - 80
      let left = rect.left + rect.width / 2 - tooltipWidth / 2
      
      // S'assurer que le tooltip ne dépasse pas à gauche
      if (left < 10) {
        left = 10
      }
      
      // S'assurer que le tooltip ne dépasse pas à droite
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10
      }
      
      // S'assurer que le tooltip ne dépasse pas en haut
      if (top < 10) {
        top = rect.bottom + 10
      }
      
      // S'assurer que le tooltip ne dépasse pas en bas
      if (top + tooltipHeight > window.innerHeight - 10) {
        top = window.innerHeight - tooltipHeight - 10
      }
      
      setPosition({ top, left })
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      dismiss()
    }
  }

  const handleSkip = () => {
    dismiss()
  }

  if (!showTooltips) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[100] pointer-events-none" />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[101] bg-base-200 rounded-2xl shadow-2xl p-4 w-64 border border-border"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {steps[currentStep].icon}
            <span className="text-sm font-bold text-base-content">{t('welcome')}</span>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 hover:bg-base-content/10 rounded-full transition-colors"
          >
            <X size={16} className="text-base-content/50" />
          </button>
        </div>

        {/* Content */}
        <p className="text-sm text-base-content/70 mb-4">
          {steps[currentStep].tooltip}
        </p>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full flex-1 ${
                index <= currentStep ? 'bg-primary' : 'bg-base-content/20'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-xs text-base-content/50 hover:text-base-content transition-colors"
          >
            {t('skip')}
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-content text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
          >
            {currentStep === steps.length - 1 ? t('finish') : t('next')}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </>
  )
}
