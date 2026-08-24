'use client'

import React from 'react'

export type BadgeVariant = 'unesco' | 'primary' | 'accent' | 'forest' | 'neutral' | 'outline'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  icon?: React.ElementType
  className?: string
}

export default function Badge({
  children,
  variant = 'neutral',
  icon: Icon,
  className = '',
}: BadgeProps) {
  const variantClasses = {
    unesco: 'unesco-badge font-bold uppercase tracking-wider',
    primary: 'bg-primary text-white font-bold',
    accent: 'bg-accent/20 text-[#8A3A20] dark:text-amber-200 border border-accent/40 font-bold',
    forest: 'bg-forest/15 text-forest dark:text-emerald-300 border border-forest/30 font-bold',
    neutral: 'bg-black/40 text-white/95 backdrop-blur-md border border-white/15 font-semibold',
    outline: 'border border-border bg-card text-foreground font-semibold',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] leading-tight transition-colors ${
        variantClasses[variant] || variantClasses.neutral
      } ${className}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  )
}
