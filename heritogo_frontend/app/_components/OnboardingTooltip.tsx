'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { X, ChevronRight, ScanLine, Globe } from 'lucide-react'

export default function OnboardingTooltip() {
  const t = useTranslations('Onboarding')
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  const steps = [
    {
      target: 'scan-button',
      tooltip: t('scan_tooltip'),
      icon: <ScanLine size={20} className="text-orange-500" />
    },
    {
      target: 'settings-button',
      tooltip: t('lang_tooltip'),
      icon: <Globe size={20} className="text-orange-500" />
    }
  ]

  useEffect(() => {
    // Check if onboarding has been completed
    const hasCompletedOnboarding = localStorage.getItem('heritogo_onboarding_completed')
    if (!hasCompletedOnboarding) {
      // Delay slightly to ensure DOM is ready
      setTimeout(() => {
        setIsVisible(true)
        updateTooltipPosition(0)
      }, 1000)
    }
  }, [])

  const updateTooltipPosition = (stepIndex: number) => {
    const targetElement = document.querySelector(`[data-onboarding="${steps[stepIndex].target}"]`)
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect()
      setPosition({
        top: rect.top - 80,
        left: rect.left + rect.width / 2 - 100
      })
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      updateTooltipPosition(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsVisible(false)
    localStorage.setItem('heritogo_onboarding_completed', 'true')
  }

  if (!isVisible) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[100] pointer-events-none" />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[101] bg-white rounded-2xl shadow-2xl p-4 w-64 border border-orange-200"
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
                index <= currentStep ? 'bg-orange-500' : 'bg-base-content/20'
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
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors"
          >
            {currentStep === steps.length - 1 ? t('finish') : t('next')}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </>
  )
}
