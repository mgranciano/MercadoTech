import { Star } from "lucide-react"

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: number
  className?: string
  showCount?: boolean
  count?: number
  onChange?: (value: number) => void
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 16,
  className = "",
  showCount = false,
  count,
  onChange,
}: RatingStarsProps) {
  const interactive = !!onChange
  const clampedRating = Math.min(Math.max(rating, 0), maxRating)
  const fullStars = Math.floor(clampedRating)
  const hasHalf = clampedRating % 1 !== 0

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onChange) return
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      onChange(Math.min(maxRating, Math.round(clampedRating) + 1))
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      onChange(Math.max(1, Math.round(clampedRating) - 1))
    }
  }

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role={interactive ? "radiogroup" : undefined}
      aria-label={interactive ? "Calificación" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <div className="flex gap-0.5">
        {Array.from({ length: maxRating }).map((_, i) => {
          const starValue = i + 1
          const isFull = i < fullStars
          const isHalf = i === fullStars && hasHalf

          const star = (
            <div className="relative">
              <Star size={size} className="text-gray-300" fill="currentColor" />
              {(isFull || isHalf) && (
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: isFull ? "100%" : "50%" }}
                >
                  <Star size={size} className="text-yellow-400" fill="currentColor" />
                </div>
              )}
            </div>
          )

          if (!interactive) {
            return <div key={i}>{star}</div>
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(starValue)}
              aria-label={`${starValue} estrella${starValue === 1 ? "" : "s"}`}
              aria-pressed={starValue <= Math.round(clampedRating)}
              className="rounded-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {star}
            </button>
          )
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-muted-foreground">
          ({count})
        </span>
      )}
    </div>
  )
}
