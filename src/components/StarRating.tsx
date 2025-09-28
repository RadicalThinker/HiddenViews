'use client'

import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value)
    }
  }

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const value = index + 1
        const isFilled = value <= (hoverRating || rating)
        
        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              'transition-colors duration-150',
              isFilled 
                ? 'fill-star-filled text-star-filled' 
                : 'fill-star-empty text-star-empty',
              interactive && 'cursor-pointer hover:scale-110 transition-transform'
            )}
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
          />
        )
      })}
    </div>
  )
}

interface StarDisplayProps {
  rating: number
  totalReviews?: number
  showCount?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StarDisplay({
  rating,
  totalReviews,
  showCount = true,
  size = 'md',
  className
}: StarDisplayProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <StarRating rating={rating} size={size} />
      <span className="text-sm text-secondary-600 dark:text-secondary-400">
        {rating.toFixed(1)}
        {showCount && totalReviews !== undefined && (
          <span className="ml-1">({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
        )}
      </span>
    </div>
  )
}
