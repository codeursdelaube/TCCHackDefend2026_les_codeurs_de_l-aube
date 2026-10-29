import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <Icon className="h-10 w-10 text-muted-foreground/50" />
      <h2 className="mt-3 font-serif text-xl font-bold">{title}</h2>
      {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && (
        <button type="button" onClick={action.onClick} className="btn-brand mt-5">
          {action.label}
        </button>
      )}
    </div>
  )
}
