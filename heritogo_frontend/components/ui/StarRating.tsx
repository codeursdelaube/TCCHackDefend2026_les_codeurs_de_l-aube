'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
}

export default function StarRating({
  rating,
  count,
  size = 'sm',
  showCount = true,
  className = '',
}: StarRatingProps) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5

  const starSizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const starClass = starSizeClasses[size] || starSizeClasses.sm

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => {
          const isFilled = i <= full
          const isHalf = i === full + 1 && half

          return (
            <Star
              key={i}
              className={`${starClass} transition-colors`}
              style={{
                fill: isFilled || isHalf ? '#D9A441' : 'transparent',
                color: isFilled || isHalf ? '#D9A441' : '#E8DCCF',
              }}
            />
          )
        })}
      </div>
      {showCount && (
        <span className="text-xs font-semibold text-muted-foreground">
          <span className="font-bold text-foreground">{rating.toFixed(1)}</span>
          {count !== undefined && count > 0 && <span> ({count})</span>}
        </span>
      )}
    </div>
  )
}
