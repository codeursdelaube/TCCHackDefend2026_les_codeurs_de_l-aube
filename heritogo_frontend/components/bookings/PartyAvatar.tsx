/* eslint-disable @next/next/no-img-element */
import { getInitials } from '@/lib/auth/redirect'

export default function PartyAvatar({ name, url, size = 'md' }: { name: string; url?: string | null; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-10 w-10 text-xs' : 'h-12 w-12 text-sm'
  if (url) {
    return <img src={url} alt={name} className={`${dim} shrink-0 rounded-lg border border-border object-cover`} />
  }
  return (
    <div className={`${dim} flex shrink-0 items-center justify-center rounded-lg bg-primary font-serif font-bold text-primary-foreground`}>
      {getInitials(name)}
    </div>
  )
}
