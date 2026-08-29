interface LoadingStateProps {
  className?: string
  variant?: "card" | "list" | "grid"
  count?: number
}

function SkeletonCard() {
  return (
    <div className="space-y-3 p-4">
      <div className="h-48 rounded-lg bg-muted animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex justify-between pt-2">
        <div className="h-6 w-20 bg-muted animate-pulse rounded" />
        <div className="h-6 w-20 bg-muted animate-pulse rounded" />
      </div>
    </div>
  )
}

function SkeletonListItem() {
  return (
    <div className="flex gap-4 p-4 border-b">
      <div className="h-16 w-16 rounded bg-muted animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
      </div>
    </div>
  )
}

export function LoadingState({
  className = "",
  variant = "card",
  count = 3,
}: LoadingStateProps) {
  if (variant === "list") {
    return (
      <div className={`divide-y ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    )
  }

  if (variant === "grid") {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
