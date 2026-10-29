import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'

interface LegalSection {
  title: string
  content: string
}

interface LegalDocumentProps {
  kicker: string
  kickerIcon: LucideIcon
  title: string
  updatedLabel: string
  lastUpdated: string
  intro?: string
  sections: readonly LegalSection[]
  backLabel: string
  contentsLabel: string
  highlights?: ReactNode
}

function sectionAnchor(index: number) {
  return `section-${index + 1}`
}

export default function LegalDocument({
  kicker,
  kickerIcon: KickerIcon,
  title,
  updatedLabel,
  lastUpdated,
  intro,
  sections,
  backLabel,
  contentsLabel,
  highlights,
}: LegalDocumentProps) {
  return (
    <main className="min-h-screen bg-background pb-32 pt-24 text-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <header className="mt-6 max-w-3xl space-y-4">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <KickerIcon className="h-4 w-4" />
            {kicker}
          </p>
          <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="text-xs font-semibold text-muted-foreground">
            {updatedLabel} : {lastUpdated}
          </p>
          {intro && <p className="text-base leading-relaxed text-muted-foreground">{intro}</p>}
        </header>

        {highlights && <div className="mt-8">{highlights}</div>}

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <nav aria-label={contentsLabel} className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24 rounded-lg border border-border bg-card p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{contentsLabel}</p>
              <ol className="space-y-2 text-sm">
                {sections.map((section, idx) => (
                  <li key={section.title}>
                    <a
                      href={`#${sectionAnchor(idx)}`}
                      className="block leading-snug text-foreground/75 transition-colors hover:text-primary"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="space-y-4 lg:col-span-8">
            {sections.map((section, idx) => (
              <article
                key={section.title}
                id={sectionAnchor(idx)}
                className="scroll-mt-24 rounded-lg border border-border bg-card p-6 sm:p-8"
              >
                <h2 className="font-serif text-xl font-bold sm:text-2xl">{section.title}</h2>
                <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {section.content}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
