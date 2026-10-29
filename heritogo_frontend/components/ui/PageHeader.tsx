import type { ReactNode } from 'react'
import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  kicker: string
  kickerIcon?: LucideIcon
  title: string
  subtitle?: string
  /** Photo réelle du dossier public/ : affichée en bandeau avec voile sombre. */
  image?: string
  actions?: ReactNode
  children?: ReactNode
}

/** En-tête commun aux pages de contenu (lieux, cuisine, régions, guides…). */
export default function PageHeader({ kicker, kickerIcon: Icon, title, subtitle, image, actions, children }: PageHeaderProps) {
  if (image) {
    return (
      <header className="relative isolate overflow-hidden rounded-xl border border-border bg-[#171009]">
        <Image src={image} alt="" fill priority sizes="(max-width: 1280px) 100vw, 1280px" className="-z-10 object-cover opacity-60" />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-[#171009] via-[#171009]/70 to-[#171009]/20" />
        <div className="px-6 pb-8 pt-20 sm:px-10 sm:pb-10 sm:pt-28">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
            {Icon && <Icon className="h-4 w-4" />}
            {kicker}
          </p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl font-bold tracking-tight text-[#FBF6EF] sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#FBF6EF]/80 sm:text-base">{subtitle}</p>}
          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </header>
    )
  }

  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          {Icon && <Icon className="h-4 w-4" />}
          {kicker}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{subtitle}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
