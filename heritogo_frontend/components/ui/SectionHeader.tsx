'use client'

import React from 'react'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  kicker?: string
  title: string
  subtitle?: string
  actionHref?: string
  actionLabel?: string
  icon?: React.ElementType
  className?: string
}

export default function SectionHeader({
  kicker,
  title,
  subtitle,
  actionHref,
  actionLabel,
  icon: Icon,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 ${className}`}>
      <div className="space-y-1">
        {kicker && (
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{kicker}</span>
          </div>
        )}
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        <div className="togo-underline" />
        {subtitle && (
          <p className="mt-2 text-xs sm:text-sm font-medium text-muted-foreground max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary-dark transition-colors self-start sm:self-auto shrink-0"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
